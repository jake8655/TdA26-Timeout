package eu.hypnomacka.timeout.server.controllers.course.materials;

import eu.hypnomacka.timeout.server.controllers.Controller;
import eu.hypnomacka.timeout.server.core.Course;
import eu.hypnomacka.timeout.server.core.FileAttachment;
import eu.hypnomacka.timeout.server.core.UrlAttachment;
import eu.hypnomacka.timeout.server.core.query.QCourse;
import eu.hypnomacka.timeout.server.core.query.QFileAttachment;
import eu.hypnomacka.timeout.server.core.query.QUrlAttachment;
import eu.hypnomacka.timeout.server.storage.FileStorageService;
import java.io.IOException;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/courses/{courseId}/materials")
@RequiredArgsConstructor
public class MaterialPutController extends Controller {

  private final FileStorageService fileStorageService;

  private String normalizeMimeType(String mimeType) {
    if (mimeType == null) {
      return null;
    }
    int semicolonIndex = mimeType.indexOf(';');
    if (semicolonIndex != -1) {
      return mimeType.substring(0, semicolonIndex).trim();
    }
    return mimeType.trim();
  }

  @PutMapping(value = "/{materialId}", consumes = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<?> updateMaterialJson(
      @PathVariable String courseId,
      @PathVariable String materialId,
      @RequestBody Map<String, String> request) {

    UUID courseUuid;
    UUID materialUuid;
    try {
      courseUuid = UUID.fromString(courseId);
      materialUuid = UUID.fromString(materialId);
    } catch (IllegalArgumentException e) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("status", "bad", "message", "invalid UUID format"));
    }

    Course course = new QCourse().uuid.eq(courseUuid).findOne();
    if (course == null) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND)
          .body(Map.of("status", "bad", "message", "course not found"));
    }

    UrlAttachment urlAttachment = new QUrlAttachment().uuid.eq(materialUuid).findOne();
    if (urlAttachment != null) {
      String name = request.get("name");
      String url = request.get("url");
      String description = request.get("description");

      if (name != null && !name.isEmpty()) {
        urlAttachment.setName(name);
      }
      if (url != null && !url.isEmpty()) {
        urlAttachment.setUrl(url);
        urlAttachment.setFaviconUrl(
            "https://icons.duckduckgo.com/ip2/"
                + url.replace("https://", "").replace("http://", "").split("/")[0]
                + ".ico");
      }
      if (description != null) {
        urlAttachment.setDescription(description);
      }
      urlAttachment.save();

      return ResponseEntity.ok(urlAttachment);
    }

    FileAttachment fileAttachment = new QFileAttachment().uuid.eq(materialUuid).findOne();
    if (fileAttachment != null) {
      String name = request.get("name");
      String description = request.get("description");

      if (name != null && !name.isEmpty()) {
        fileAttachment.setName(name);
      }
      if (description != null) {
        fileAttachment.setDescription(description);
      }
      fileAttachment.save();

      return ResponseEntity.ok(fileAttachment);
    }

    return ResponseEntity.status(HttpStatus.NOT_FOUND)
        .body(Map.of("status", "bad", "message", "material not found"));
  }

  @PutMapping(value = "/{materialId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<?> updateMaterialFile(
      @PathVariable String courseId,
      @PathVariable String materialId,
      @RequestPart(value = "file", required = false) MultipartFile file,
      @RequestPart(value = "name", required = false) String name,
      @RequestPart(value = "description", required = false) String description) {

    UUID courseUuid;
    UUID materialUuid;
    try {
      courseUuid = UUID.fromString(courseId);
      materialUuid = UUID.fromString(materialId);
    } catch (IllegalArgumentException e) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("status", "bad", "message", "invalid UUID format"));
    }

    Course course = new QCourse().uuid.eq(courseUuid).findOne();
    if (course == null) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND)
          .body(Map.of("status", "bad", "message", "course not found"));
    }

    FileAttachment fileAttachment = new QFileAttachment().uuid.eq(materialUuid).findOne();
    if (fileAttachment == null) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND)
          .body(Map.of("status", "bad", "message", "material not found"));
    }

    if (name != null && !name.isEmpty()) {
      fileAttachment.setName(name);
    }
    if (description != null) {
      fileAttachment.setDescription(description);
    }

    if (file != null && !file.isEmpty()) {
      String oldUrl = fileAttachment.getFileUrl();
      try {
        fileStorageService.delete(oldUrl);
      } catch (IOException e) {
        System.err.println("Warning: Failed to delete old file: " + e.getMessage());
      } catch (IllegalArgumentException e) {
        System.err.println("Warning: " + e.getMessage());
      }

      String newFileUrl;
      try {
        newFileUrl = fileStorageService.store(courseUuid, file.getOriginalFilename(), file.getBytes());
      } catch (IOException e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(Map.of("status", "bad", "message", "failed to store file: " + e.getMessage()));
      } catch (IllegalArgumentException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(Map.of("status", "bad", "message", e.getMessage()));
      }

      String mimeType = normalizeMimeType(file.getContentType());

      fileAttachment.setFileUrl(newFileUrl);
      fileAttachment.setSizeBytes(file.getSize());
      fileAttachment.setMimeType(mimeType);
    }

    fileAttachment.save();

    return ResponseEntity.ok(fileAttachment);
  }
}
