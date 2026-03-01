package eu.hypnomacka.timeout.server.controllers.course.materials;

import eu.hypnomacka.timeout.server.controllers.Controller;
import eu.hypnomacka.timeout.server.core.Course;
import eu.hypnomacka.timeout.server.core.FileAttachment;
import eu.hypnomacka.timeout.server.core.Module;
import eu.hypnomacka.timeout.server.core.UrlAttachment;
import eu.hypnomacka.timeout.server.storage.FileStorageService;
import io.ebean.DB;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/courses/{courseId}/modules/{moduleId}/materials")
@RequiredArgsConstructor
public class MaterialDeleteController extends Controller {

  private final FileStorageService fileStorageService;

  @DeleteMapping("/{materialId}")
  public ResponseEntity<?> deleteMaterial(
      @PathVariable String courseId,
      @PathVariable String moduleId,
      @PathVariable String materialId,
      @CookieValue(value = "SESSION_ID", required = false) String sessionId) {

    Course course = findCourse(courseId);
    if (course == null) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND)
          .body(Map.of("status", "bad", "message", "course not found"));
    }

    Module module = findModule(moduleId, course);
    if (module == null) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND)
          .body(Map.of("status", "bad", "message", "module not found"));
    }

    if (!isLecturerSession(sessionId) || course.getStatus() != Course.Status.DRAFT) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("status", "bad", "message", "course not editable"));
    }

    UUID materialUuid;
    try {
      materialUuid = UUID.fromString(materialId);
    } catch (IllegalArgumentException e) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("status", "bad", "message", "invalid UUID format"));
    }

    int moduleItemCount =
        module.getFileAttachments().size()
            + module.getUrlAttachments().size()
            + module.getQuizzes().size();
    if (moduleItemCount <= 1) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(
              Map.of(
                  "status", "bad", "message", "module must contain at least one material or quiz"));
    }

    FileAttachment file = DB.find(FileAttachment.class, materialUuid);
    if (file != null && file.getModule().getUuid().equals(module.getUuid())) {
      String fileUrl = file.getFileUrl();
      try {
        fileStorageService.delete(fileUrl);
      } catch (Exception e) {
        System.err.println("Error deleting file from disk: " + e.getMessage());
      }

      if (file.delete()) {
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
      }

      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("status", "bad", "message", "failed to delete from database"));
    }

    UrlAttachment urlFile = DB.find(UrlAttachment.class, materialUuid);
    if (urlFile != null && urlFile.getModule().getUuid().equals(module.getUuid())) {
      if (urlFile.delete()) {
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
      }

      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("status", "bad", "message", "failed to delete from database"));
    }

    return ResponseEntity.status(HttpStatus.NOT_FOUND)
        .body(Map.of("status", "bad", "message", "material not found"));
  }

  private Course findCourse(String courseId) {
    try {
      return DB.find(Course.class, UUID.fromString(courseId));
    } catch (IllegalArgumentException e) {
      return null;
    }
  }

  private Module findModule(String moduleId, Course course) {
    try {
      Module module = DB.find(Module.class, UUID.fromString(moduleId));
      if (module == null || !module.getCourse().getUuid().equals(course.getUuid())) {
        return null;
      }
      return module;
    } catch (IllegalArgumentException e) {
      return null;
    }
  }
}
