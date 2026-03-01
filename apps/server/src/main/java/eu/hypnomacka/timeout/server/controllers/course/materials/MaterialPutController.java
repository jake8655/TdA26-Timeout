package eu.hypnomacka.timeout.server.controllers.course.materials;

import eu.hypnomacka.timeout.server.controllers.Controller;
import eu.hypnomacka.timeout.server.core.Course;
import eu.hypnomacka.timeout.server.core.FileAttachment;
import eu.hypnomacka.timeout.server.core.Module;
import eu.hypnomacka.timeout.server.core.UrlAttachment;
import eu.hypnomacka.timeout.server.storage.FileStorageService;
import io.ebean.DB;
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
@RequestMapping("/courses/{courseId}/modules/{moduleId}/materials")
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
      @PathVariable String moduleId,
      @PathVariable String materialId,
      @CookieValue(value = "SESSION_ID", required = false) String sessionId,
      @RequestBody Map<String, String> request) {

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

    UrlAttachment urlAttachment = DB.find(UrlAttachment.class, materialUuid);
    if (urlAttachment != null && urlAttachment.getModule().getUuid().equals(module.getUuid())) {
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

    FileAttachment fileAttachment = DB.find(FileAttachment.class, materialUuid);
    if (fileAttachment != null && fileAttachment.getModule().getUuid().equals(module.getUuid())) {
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
      @PathVariable String moduleId,
      @PathVariable String materialId,
      @CookieValue(value = "SESSION_ID", required = false) String sessionId,
      @RequestPart(value = "file", required = false) MultipartFile file,
      @RequestPart(value = "name", required = false) String name,
      @RequestPart(value = "description", required = false) String description) {

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

    FileAttachment fileAttachment = DB.find(FileAttachment.class, materialUuid);
    if (fileAttachment == null || !fileAttachment.getModule().getUuid().equals(module.getUuid())) {
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
      } catch (IOException | IllegalArgumentException e) {
        System.err.println("Warning: Failed to delete old file: " + e.getMessage());
      }

      String newFileUrl;
      try {
        newFileUrl =
            fileStorageService.store(course.getUuid(), file.getOriginalFilename(), file.getBytes());
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
