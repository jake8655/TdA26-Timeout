package eu.hypnomacka.timeout.server.controllers.course.materials;

import eu.hypnomacka.timeout.server.controllers.Controller;
import eu.hypnomacka.timeout.server.core.Course;
import eu.hypnomacka.timeout.server.core.FileAttachment;
import eu.hypnomacka.timeout.server.core.UrlAttachment;
import eu.hypnomacka.timeout.server.core.query.QCourse;
import eu.hypnomacka.timeout.server.core.query.QFileAttachment;
import eu.hypnomacka.timeout.server.core.query.QUrlAttachment;
import eu.hypnomacka.timeout.server.storage.FileStorageService;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/courses/{courseId}/materials")
@RequiredArgsConstructor
public class MaterialDeleteController extends Controller {

  private final FileStorageService fileStorageService;

  @DeleteMapping("/{materialId}")
  public ResponseEntity<?> deleteMaterial(
      @PathVariable String courseId,
      @PathVariable String materialId,
      @CookieValue(value = "SESSION_ID", required = false) String sessionId) {

    UUID uuid;

    try {
      uuid = UUID.fromString(materialId);
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("status", "error", "message", "Failed to parse uuid from materialId"));
    }

    UUID courseUuid;
    try {
      courseUuid = UUID.fromString(courseId);
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("status", "error", "message", "Failed to parse uuid from courseId"));
    }

    Course course = new QCourse().uuid.eq(courseUuid).findOne();
    if (course == null) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND)
          .body(Map.of("status", "bad", "message", "course not found"));
    }

    if (!isLecturerSession(sessionId) || course.getStatus() != Course.Status.DRAFT) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("status", "bad", "message", "course not editable"));
    }

    FileAttachment file = new QFileAttachment().uuid.eq(uuid).findOne();
    UrlAttachment urlFile = new QUrlAttachment().uuid.eq(uuid).findOne();

    if (file != null) {
      String fileUrl = file.getFileUrl();
      try {
        fileStorageService.delete(fileUrl);
      } catch (Exception e) {
        System.err.println("Error deleting file from disk: " + e.getMessage());
      }

      if (file.delete()) {
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
      } else {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(Map.of("status", "bad", "message", "Failed to delete from database"));
      }
    }

    if (urlFile != null) {
      if (urlFile.delete()) {
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
      } else {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(Map.of("status", "bad", "message", "Failed to delete from database"));
      }
    }

    return ResponseEntity.status(HttpStatus.NOT_FOUND)
        .body(Map.of("status", "bad", "message", "material not found"));
  }
}
