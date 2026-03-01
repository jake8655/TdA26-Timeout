package eu.hypnomacka.timeout.server.controllers.course.materials;

import eu.hypnomacka.timeout.server.controllers.Controller;
import eu.hypnomacka.timeout.server.core.Course;
import eu.hypnomacka.timeout.server.core.FileAttachment;
import eu.hypnomacka.timeout.server.core.Module;
import eu.hypnomacka.timeout.server.core.UrlAttachment;
import io.ebean.DB;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/courses/{courseId}/modules/{moduleId}/materials")
public class MaterialGetController extends Controller {

  @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<?> listMaterials(
      @PathVariable("courseId") String courseIdStr,
      @PathVariable("moduleId") String moduleIdStr,
      @CookieValue(value = "SESSION_ID", required = false) String sessionId) {
    UUID courseId;
    UUID moduleId;
    try {
      courseId = UUID.fromString(courseIdStr);
      moduleId = UUID.fromString(moduleIdStr);
    } catch (IllegalArgumentException e) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("status", "bad", "message", "invalid UUID format"));
    }

    Course course = DB.find(Course.class, courseId);
    if (course == null) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND)
          .body(Map.of("status", "bad", "message", "course not found"));
    }

    Module module = DB.find(Module.class, moduleId);
    if (module == null || !module.getCourse().getUuid().equals(course.getUuid())) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND)
          .body(Map.of("status", "bad", "message", "module not found"));
    }

    boolean isLecturer = isLecturerSession(sessionId);
    if (!isLecturer
        && (course.getStatus() != Course.Status.LIVE
            || !Boolean.TRUE.equals(module.getVisible()))) {
      return ResponseEntity.status(HttpStatus.FORBIDDEN)
          .body(Map.of("status", "bad", "message", "module not visible"));
    }

    List<Object> materials = new ArrayList<>();
    materials.addAll(module.getFileAttachments());
    materials.addAll(module.getUrlAttachments());

    materials.sort(
        (a, b) -> {
          Instant dateA =
              a instanceof FileAttachment
                  ? ((FileAttachment) a).getUpdatedAt()
                  : ((UrlAttachment) a).getUpdatedAt();
          Instant dateB =
              b instanceof FileAttachment
                  ? ((FileAttachment) b).getUpdatedAt()
                  : ((UrlAttachment) b).getUpdatedAt();
          return dateB.compareTo(dateA);
        });

    return ResponseEntity.ok(materials);
  }
}
