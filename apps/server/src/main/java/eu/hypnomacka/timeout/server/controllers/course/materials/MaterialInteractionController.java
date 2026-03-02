package eu.hypnomacka.timeout.server.controllers.course.materials;

import eu.hypnomacka.timeout.server.controllers.Controller;
import eu.hypnomacka.timeout.server.core.Course;
import eu.hypnomacka.timeout.server.core.FileAttachment;
import eu.hypnomacka.timeout.server.core.Module;
import eu.hypnomacka.timeout.server.core.UrlAttachment;
import eu.hypnomacka.timeout.server.services.CourseStatsService;
import io.ebean.DB;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/courses/{courseId}/materials/{materialId}")
@RequiredArgsConstructor
public class MaterialInteractionController extends Controller {

  private final CourseStatsService statsService;

  @PostMapping(value = "/interactions", produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<?> recordInteraction(
      @PathVariable String courseId,
      @PathVariable String materialId,
      @CookieValue(value = "STUDENT_SESSION_ID", required = false) String studentSessionId) {

    Course course = findCourse(courseId);
    if (course == null) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND)
          .body(Map.of("status", "bad", "message", "course not found"));
    }

    if (course.getStatus() != Course.Status.LIVE) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("status", "bad", "message", "course not live"));
    }

    UUID matUuid;
    try {
      matUuid = UUID.fromString(materialId);
    } catch (IllegalArgumentException e) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("status", "bad", "message", "invalid material UUID"));
    }

    boolean found = false;
    for (Module module : course.getModules()) {
      if (!Boolean.TRUE.equals(module.getVisible())) {
        continue;
      }
      for (FileAttachment fa : module.getFileAttachments()) {
        if (fa.getUuid().equals(matUuid)) {
          found = true;
          break;
        }
      }
      if (!found) {
        for (UrlAttachment ua : module.getUrlAttachments()) {
          if (ua.getUuid().equals(matUuid)) {
            found = true;
            break;
          }
        }
      }
      if (found) break;
    }

    if (!found) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND)
          .body(Map.of("status", "bad", "message", "material not found in visible modules"));
    }

    statsService.recordMaterialInteraction(course);

    return ResponseEntity.ok(Map.of("status", "ok"));
  }

  private Course findCourse(String courseId) {
    try {
      return DB.find(Course.class, UUID.fromString(courseId));
    } catch (IllegalArgumentException e) {
      return null;
    }
  }
}
