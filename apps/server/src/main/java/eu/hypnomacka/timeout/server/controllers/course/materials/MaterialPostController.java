package eu.hypnomacka.timeout.server.controllers.course.materials;

import eu.hypnomacka.timeout.server.controllers.Controller;
import eu.hypnomacka.timeout.server.controllers.feed.CourseFeedService;
import eu.hypnomacka.timeout.server.core.Course;
import eu.hypnomacka.timeout.server.core.Event;
import eu.hypnomacka.timeout.server.core.FileAttachment;
import eu.hypnomacka.timeout.server.core.UrlAttachment;
import eu.hypnomacka.timeout.server.core.query.QCourse;
import eu.hypnomacka.timeout.server.storage.FileStorageService;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/courses/{courseId}/materials")
public class MaterialPostController extends Controller {

  private final FileStorageService fileStorageService;
  private final CourseFeedService feedService;

  public MaterialPostController(FileStorageService fileStorageService, CourseFeedService feedService) {
    this.fileStorageService = fileStorageService;
    this.feedService = feedService;
  }

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
      @PathVariable String courseId, @RequestBody Map<String, String> request) {

    Course course = new QCourse().uuid.eq(UUID.fromString(courseId)).findOne();

    if (course == null) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("status", "bad", "message", "course not found"));
    }

    String name = request.get("name");
    String url = request.get("url");
    String type = request.get("type");
    String description = request.get("description");

    if (name == null
        || name.isEmpty()
        || url == null
        || url.isEmpty()
        || type == null
        || type.isEmpty()) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("status", "bad", "message", "bad request"));
    }

    if (description == null) {
      description = "";
    }

    UrlAttachment attachment =
        new UrlAttachment(
            course,
            name,
            url,
            description,
            UrlAttachment.Type.url,
            "https://icons.duckduckgo.com/ip2/"
                + url.replace("https://", "").split("/")[0]
                + ".ico");
    attachment.save();

    Event event = new Event();
    event.setUuid(java.util.UUID.randomUUID());
    event.setCourse(course);
    event.setType(Event.Type.SYSTEM);
    event.setMessage("New material added: " + name);
    event.setEdited(false);
    event.save();

    feedService.broadcastEvent(event);

    return ResponseEntity.status(HttpStatus.CREATED).body(attachment);
  }

  @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<?> uploadMaterial(
      @PathVariable String courseId,
      @RequestPart(value = "file") MultipartFile file,
      @RequestPart("type") String type,
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

    Course course = new QCourse().uuid.eq(UUID.fromString(courseId)).findOne();
    if (course == null) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("status", "bad", "message", "course not found"));
    }

    String fileUrl;
    try {
      fileUrl = fileStorageService.store(course.getUuid(), file.getOriginalFilename(), file.getBytes());
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("status", "bad", "message", "file storage failed: " + e.getMessage()));
    }

    long sizeBytes = file.getSize();

    if (description == null) {
      description = "";
    }

    FileAttachment attachment =
        new FileAttachment(
            course, name, description, FileAttachment.Type.file, sizeBytes, mimeType, fileUrl);
    attachment.save();

    Event event = new Event();
    event.setUuid(java.util.UUID.randomUUID());
    event.setCourse(course);
    event.setType(Event.Type.SYSTEM);
    event.setMessage("New material added: " + name);
    event.setEdited(false);
    event.save();

    feedService.broadcastEvent(event);

    return ResponseEntity.status(HttpStatus.CREATED).body(attachment);
  }
}