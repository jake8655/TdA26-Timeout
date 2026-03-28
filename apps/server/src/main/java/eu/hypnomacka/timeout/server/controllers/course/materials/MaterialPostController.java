package eu.hypnomacka.timeout.server.controllers.course.materials;

import eu.hypnomacka.timeout.server.controllers.Controller;
import eu.hypnomacka.timeout.server.core.Account;
import eu.hypnomacka.timeout.server.core.Course;
import eu.hypnomacka.timeout.server.core.FileAsset;
import eu.hypnomacka.timeout.server.core.FileAttachment;
import eu.hypnomacka.timeout.server.core.Module;
import eu.hypnomacka.timeout.server.core.Session;
import eu.hypnomacka.timeout.server.core.UrlAttachment;
import eu.hypnomacka.timeout.server.services.CourseVersionService;
import eu.hypnomacka.timeout.server.storage.FileStorageService;
import io.ebean.DB;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.extern.slf4j.Slf4j;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/courses/{courseId}/modules/{moduleId}/materials")
@RequiredArgsConstructor
@Slf4j
public class MaterialPostController extends Controller {

  private final FileStorageService fileStorageService;
  private final CourseVersionService courseVersionService;

  private static final List<String> SUPPORTED_MIME_TYPES =
      Arrays.asList(
          "application/pdf",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "text/plain",
          "image/png",
          "image/jpg",
          "image/jpeg",
          "image/gif",
          "video/mp4",
          "audio/mpeg",
          "audio/mp3");

  @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<?> uploadMaterialJson(
      @PathVariable String courseId,
      @PathVariable String moduleId,
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

    Session session = getValidSession(sessionId);
    if (session == null || !isLecturerSession(sessionId) || course.getStatus() != Course.Status.DRAFT) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("status", "bad", "message", "course not editable"));
    }

    if (!canAccessCourse(session, course)) {
      return ResponseEntity.status(HttpStatus.FORBIDDEN)
          .body(Map.of("status", "bad", "message", "forbidden"));
    }

    String name = request.get("name");
    String url = request.get("url");
    String description = request.get("description");

    if (name == null || name.isEmpty() || url == null || url.isEmpty()) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("status", "bad", "message", "bad request"));
    }

    if (description == null) {
      description = "";
    }

    UrlAttachment attachment =
        new UrlAttachment(
            module,
            name,
            url,
            description,
            UrlAttachment.Type.url,
            "https://icons.duckduckgo.com/ip2/"
                + url.replace("https://", "").replace("http://", "").split("/")[0]
                + ".ico");
    attachment.save();

    Account actor = resolveAccount(session);
    if (actor != null) {
      courseVersionService.createSnapshot(course, actor, "URL material added");
    }

    return ResponseEntity.status(HttpStatus.CREATED).body(attachment);
  }

  @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<?> uploadMaterial(
      @PathVariable String courseId,
      @PathVariable String moduleId,
      @CookieValue(value = "SESSION_ID", required = false) String sessionId,
      @RequestPart(value = "file") MultipartFile file,
      @RequestPart("name") String name,
      @RequestPart(value = "description", required = false) String description) {

    String mimeType = file.getContentType();
    if (mimeType == null || !SUPPORTED_MIME_TYPES.contains(mimeType)) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(
              Map.of(
                  "status",
                  "bad",
                  "message",
                  "Unsupported file type. Allowed types: "
                      + String.join(", ", SUPPORTED_MIME_TYPES)));
    }

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

    Session session = getValidSession(sessionId);
    if (session == null || !isLecturerSession(sessionId) || course.getStatus() != Course.Status.DRAFT) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("status", "bad", "message", "course not editable"));
    }

    if (!canAccessCourse(session, course)) {
      return ResponseEntity.status(HttpStatus.FORBIDDEN)
          .body(Map.of("status", "bad", "message", "forbidden"));
    }

    String fileUrl;
    try {
      fileUrl =
          fileStorageService.store(course.getUuid(), file.getOriginalFilename(), file.getBytes());
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("status", "bad", "message", "file storage failed: " + e.getMessage()));
    }

    if (description == null) {
      description = "";
    }

    FileAttachment attachment =
        new FileAttachment(
            module, name, description, FileAttachment.Type.file, file.getSize(), mimeType, fileUrl);
    FileAsset asset =
        new FileAsset(
            fileUrl,
            UUID.randomUUID().toString().replace("-", ""),
            mimeType,
            file.getSize());
    asset.setRetentionState(FileAsset.RetentionState.PROTECTED);
    asset.save();
    attachment.setAsset(asset);
    attachment.save();

    Account actor = resolveAccount(session);
    if (actor != null) {
      courseVersionService.createSnapshot(course, actor, "File material added");
    }

    return ResponseEntity.status(HttpStatus.CREATED).body(attachment);
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
