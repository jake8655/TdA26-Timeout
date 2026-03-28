package eu.hypnomacka.timeout.server.controllers.course;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import eu.hypnomacka.timeout.server.controllers.Controller;
import eu.hypnomacka.timeout.server.core.Course;
import eu.hypnomacka.timeout.server.core.CourseVersion;
import eu.hypnomacka.timeout.server.core.query.QCourse;
import io.ebean.DB;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/courses/{courseId}/versions")
public class CourseVersionController extends Controller {

  private final ObjectMapper objectMapper = new ObjectMapper();

  @GetMapping
  public ResponseEntity<?> listVersions(
      @PathVariable String courseId,
      @CookieValue(value = "SESSION_ID", required = false) String sessionId) {
    var session = getValidSession(sessionId);
    if (session == null || !isLecturerSession(sessionId)) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(Map.of("status", "bad", "message", "unauthorized"));
    }

    Course course = findCourse(courseId);
    if (course == null) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND)
          .body(Map.of("status", "bad", "message", "course not found"));
    }

    if (!canAccessCourse(session, course)) {
      return ResponseEntity.status(HttpStatus.FORBIDDEN)
          .body(Map.of("status", "bad", "message", "forbidden"));
    }

    List<CourseVersion> versions =
        DB.find(CourseVersion.class)
            .where()
            .eq("course.uuid", course.getUuid())
            .orderBy("versionNo desc")
            .findList();

    List<Map<String, Object>> payload =
        versions.stream()
            .map(
                version -> {
                  Map<String, Object> item = new LinkedHashMap<>();
                  item.put("versionNo", version.getVersionNo());
                  item.put("reason", version.getReason());
                  item.put("source", version.getSource());
                  item.put("createdAt", version.getCreatedAt());
                  item.put("createdBy", version.getCreatedByAccount().getUsername());
                  return item;
                })
            .toList();

    return ResponseEntity.ok(payload);
  }

  @GetMapping("/{versionNo}")
  public ResponseEntity<?> getVersion(
      @PathVariable String courseId,
      @PathVariable Integer versionNo,
      @CookieValue(value = "SESSION_ID", required = false) String sessionId) {
    var session = getValidSession(sessionId);
    if (session == null || !isLecturerSession(sessionId)) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(Map.of("status", "bad", "message", "unauthorized"));
    }

    Course course = findCourse(courseId);
    if (course == null) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND)
          .body(Map.of("status", "bad", "message", "course not found"));
    }

    if (!canAccessCourse(session, course)) {
      return ResponseEntity.status(HttpStatus.FORBIDDEN)
          .body(Map.of("status", "bad", "message", "forbidden"));
    }

    CourseVersion version =
        DB.find(CourseVersion.class)
            .where()
            .eq("course.uuid", course.getUuid())
            .eq("versionNo", versionNo)
            .findOne();
    if (version == null) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND)
          .body(Map.of("status", "bad", "message", "version not found"));
    }

    try {
      Map<String, Object> payload =
          objectMapper.readValue(version.getSnapshotJson(), new TypeReference<>() {});
      return ResponseEntity.ok(
          Map.of(
              "versionNo", version.getVersionNo(),
              "reason", version.getReason(),
              "source", version.getSource(),
              "createdAt", version.getCreatedAt(),
              "snapshot", payload));
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("status", "bad", "message", "invalid version payload"));
    }
  }

  private Course findCourse(String courseId) {
    try {
      UUID uuid = UUID.fromString(courseId);
      return new QCourse().uuid.eq(uuid).findOne();
    } catch (IllegalArgumentException e) {
      return null;
    }
  }
}
