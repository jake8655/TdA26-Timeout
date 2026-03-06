package eu.hypnomacka.timeout.server.controllers.feed;

import eu.hypnomacka.timeout.server.controllers.Controller;
import eu.hypnomacka.timeout.server.core.Course;
import eu.hypnomacka.timeout.server.core.Event;
import eu.hypnomacka.timeout.server.core.query.QEvent;
import io.ebean.DB;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.io.IOException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.Data;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/courses")
public class CourseFeedController extends Controller {

  private final CourseFeedService feedService;

  public CourseFeedController(CourseFeedService feedService) {
    this.feedService = feedService;
  }

  @GetMapping(value = "/{UUID}/feed", produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<?> getFeed(@PathVariable("UUID") String uuidStr) {
    UUID uuid = parseUuid(uuidStr);
    if (uuid == null) {
      return invalidUuidResponse();
    }

    Course course = DB.find(Course.class, uuid);
    if (course == null) {
      return courseNotFoundResponse();
    }

    if (course.getStatus() != Course.Status.LIVE) {
      return ResponseEntity.status(HttpStatus.FORBIDDEN)
          .body(Map.of("status", "bad", "message", "course not live"));
    }

    return ResponseEntity.ok(buildFeedResponse(uuid));
  }

  @GetMapping(value = "/lecturer/{UUID}/feed", produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<?> getLecturerFeed(
      @PathVariable("UUID") String uuidStr,
      @CookieValue(value = "SESSION_ID", required = false) String sessionId) {
    if (!isLecturerSession(sessionId)) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(Map.of("status", "bad", "message", "unauthorized"));
    }

    UUID uuid = parseUuid(uuidStr);
    if (uuid == null) {
      return invalidUuidResponse();
    }

    Course course = DB.find(Course.class, uuid);
    if (course == null) {
      return courseNotFoundResponse();
    }

    return ResponseEntity.ok(buildFeedResponse(uuid));
  }

  @PostMapping(value = "/{UUID}/feed", produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<?> createPost(
      @PathVariable("UUID") String uuidStr,
      @CookieValue(value = "SESSION_ID", required = false) String sessionId,
      @Valid @RequestBody CreatePostRequest request) {
    UUID uuid = parseUuid(uuidStr);
    if (uuid == null) {
      return invalidUuidResponse();
    }

    Course course = DB.find(Course.class, uuid);
    if (course == null) {
      return courseNotFoundResponse();
    }

    if (!isLecturerSession(sessionId) || course.getStatus() != Course.Status.LIVE) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("status", "bad", "message", "course not editable"));
    }

    Event event = new Event();
    event.setUuid(UUID.randomUUID());
    event.setCourse(course);
    event.setType(Event.Type.MANUAL);
    event.setMessage(request.getMessage());
    event.setEdited(false);
    event.save();

    return ResponseEntity.status(HttpStatus.CREATED).body(buildEventResponse(event));
  }

  @GetMapping(value = "/{UUID}/feed/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
  public ResponseEntity<SseEmitter> streamFeed(@PathVariable("UUID") String uuidStr) {
    UUID uuid = parseUuid(uuidStr);
    if (uuid == null) {
      return ResponseEntity.badRequest().build();
    }

    Course course = DB.find(Course.class, uuid);
    if (course == null) {
      return ResponseEntity.notFound().build();
    }

    if (course.getStatus() != Course.Status.LIVE) {
      return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    return createFeedStream(uuid);
  }

  @GetMapping(value = "/lecturer/{UUID}/feed/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
  public ResponseEntity<SseEmitter> streamLecturerFeed(
      @PathVariable("UUID") String uuidStr,
      @CookieValue(value = "SESSION_ID", required = false) String sessionId) {
    if (!isLecturerSession(sessionId)) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    UUID uuid = parseUuid(uuidStr);
    if (uuid == null) {
      return ResponseEntity.badRequest().build();
    }

    Course course = DB.find(Course.class, uuid);
    if (course == null) {
      return ResponseEntity.notFound().build();
    }

    return createFeedStream(uuid);
  }

  @PutMapping(value = "/{UUID}/feed/{postUUID}", produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<?> updatePost(
      @PathVariable("UUID") String uuidStr,
      @PathVariable("postUUID") String postUuidStr,
      @CookieValue(value = "SESSION_ID", required = false) String sessionId,
      @Valid @RequestBody UpdatePostRequest request) {
    UUID uuid = parseUuid(uuidStr);
    UUID postUuid = parseUuid(postUuidStr);
    if (uuid == null || postUuid == null) {
      return invalidUuidResponse();
    }

    Course course = DB.find(Course.class, uuid);
    if (course == null) {
      return courseNotFoundResponse();
    }

    if (!isLecturerSession(sessionId) || course.getStatus() != Course.Status.LIVE) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("status", "bad", "message", "course not editable"));
    }

    Event event = DB.find(Event.class, postUuid);
    if (event == null) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND)
          .body(Map.of("status", "bad", "message", "post not found"));
    }

    if (!event.getCourse().getUuid().equals(uuid)) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("status", "bad", "message", "post does not belong to this course"));
    }
    if (event.getType() != Event.Type.MANUAL) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("status", "bad", "message", "system posts cannot be edited"));
    }

    event.setMessage(request.getMessage());
    event.setEdited(request.getEdited());
    event.save();

    return ResponseEntity.ok(buildEventResponse(event));
  }

  @DeleteMapping(value = "/{UUID}/feed/{postUUID}")
  public ResponseEntity<?> deletePost(
      @PathVariable("UUID") String uuidStr,
      @PathVariable("postUUID") String postUuidStr,
      @CookieValue(value = "SESSION_ID", required = false) String sessionId) {
    UUID uuid = parseUuid(uuidStr);
    UUID postUuid = parseUuid(postUuidStr);
    if (uuid == null || postUuid == null) {
      return invalidUuidResponse();
    }

    Course course = DB.find(Course.class, uuid);
    if (course == null) {
      return courseNotFoundResponse();
    }

    if (!isLecturerSession(sessionId) || course.getStatus() != Course.Status.LIVE) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("status", "bad", "message", "course not editable"));
    }

    Event event = DB.find(Event.class, postUuid);
    if (event == null) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND)
          .body(Map.of("status", "bad", "message", "post not found"));
    }

    if (!event.getCourse().getUuid().equals(uuid)) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("status", "bad", "message", "post does not belong to this course"));
    }
    if (event.getType() != Event.Type.MANUAL) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("status", "bad", "message", "system posts cannot be deleted"));
    }

    event.delete();

    return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
  }

  private UUID parseUuid(String uuidStr) {
    try {
      return UUID.fromString(uuidStr);
    } catch (IllegalArgumentException e) {
      return null;
    }
  }

  private ResponseEntity<Map<String, String>> invalidUuidResponse() {
    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
        .body(Map.of("status", "bad", "message", "invalid UUID format"));
  }

  private ResponseEntity<Map<String, String>> courseNotFoundResponse() {
    return ResponseEntity.status(HttpStatus.NOT_FOUND)
        .body(Map.of("status", "bad", "message", "course not found"));
  }

  private List<Map<String, Object>> buildFeedResponse(UUID courseId) {
    List<Event> events =
        new QEvent()
            .course.uuid.eq(courseId).orderBy().createdAt.desc().findList().stream()
                .filter(this::isVisibleFeedEvent)
                .toList();

    List<Map<String, Object>> response = new ArrayList<>();
    for (Event event : events) {
      response.add(buildEventResponse(event));
    }
    return response;
  }

  private Map<String, Object> buildEventResponse(Event event) {
    Map<String, Object> eventMap = new LinkedHashMap<>();
    eventMap.put("uuid", event.getUuid());
    eventMap.put("type", event.getType().name().toLowerCase());
    eventMap.put("message", event.getMessage());
    eventMap.put("edited", event.getEdited());
    eventMap.put("createdAt", event.getCreatedAt());
    eventMap.put("updatedAt", event.getUpdatedAt());
    return eventMap;
  }

  private ResponseEntity<SseEmitter> createFeedStream(UUID courseId) {
    SseEmitter emitter = new SseEmitter(1800000L);

    feedService.addEmitter(courseId, emitter);

    emitter.onCompletion(() -> feedService.removeEmitter(courseId, emitter));
    emitter.onTimeout(() -> feedService.removeEmitter(courseId, emitter));
    emitter.onError((ex) -> feedService.removeEmitter(courseId, emitter));

    try {
      emitter.send(
          SseEmitter.event().name("connected").data("{\"message\":\"Connected to course feed\"}"));
    } catch (IOException e) {
      feedService.removeEmitter(courseId, emitter);
      return ResponseEntity.internalServerError().build();
    }

    return ResponseEntity.ok().header("Content-Type", "text/event-stream").body(emitter);
  }

  private boolean isVisibleFeedEvent(Event event) {
    if (event.getType() == Event.Type.MANUAL) {
      return true;
    }

    String message = event.getMessage();
    if (message == null) {
      return false;
    }

    return message.startsWith("Module revealed:") || message.startsWith("Module hidden:");
  }

  @Data
  public static class CreatePostRequest {
    @NotBlank(message = "Message is required")
    private String message;
  }

  @Data
  public static class UpdatePostRequest {
    @NotBlank(message = "Message is required")
    private String message;

    private Boolean edited;
  }
}
