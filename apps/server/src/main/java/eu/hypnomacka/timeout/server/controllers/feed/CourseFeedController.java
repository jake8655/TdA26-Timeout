package eu.hypnomacka.timeout.server.controllers.feed;

import eu.hypnomacka.timeout.server.controllers.Controller;
import eu.hypnomacka.timeout.server.core.Course;
import eu.hypnomacka.timeout.server.core.Event;
import io.ebean.DB;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.*;

@RestController
@RequestMapping("/courses")
public class CourseFeedController extends Controller {

  private final CourseFeedService feedService;

  public CourseFeedController(CourseFeedService feedService) {
    this.feedService = feedService;
  }

  @GetMapping(value = "/{UUID}/feed", produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<?> getFeed(@PathVariable("UUID") String uuidStr) {
    UUID uuid;
    try {
      uuid = UUID.fromString(uuidStr);
    } catch (IllegalArgumentException e) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("status", "bad", "message", "invalid UUID format"));
    }

    Course course = DB.find(Course.class, uuid);
    if (course == null) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND)
          .body(Map.of("status", "bad", "message", "course not found"));
    }

    List<Event> events =
        DB.find(Event.class)
            .where()
            .eq("course.uuid", uuid)
            .orderBy()
            .desc("createdAt")
            .findList();

    List<Map<String, Object>> response = new ArrayList<>();
    for (Event event : events) {
      Map<String, Object> eventMap = new LinkedHashMap<>();
      eventMap.put("uuid", event.getUuid());
      eventMap.put("type", event.getType().name().toLowerCase());
      eventMap.put("message", event.getMessage());
      eventMap.put("edited", event.getEdited());
      eventMap.put("createdAt", event.getCreatedAt());
      eventMap.put("updatedAt", event.getUpdatedAt());
      response.add(eventMap);
    }

    return ResponseEntity.status(HttpStatus.OK).body(response);
  }

  @PostMapping(value = "/{UUID}/feed", produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<?> createPost(
      @PathVariable("UUID") String uuidStr, @Valid @RequestBody CreatePostRequest request) {

    UUID uuid;
    try {
      uuid = UUID.fromString(uuidStr);
    } catch (IllegalArgumentException e) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("status", "bad", "message", "invalid UUID format"));
    }

    Course course = DB.find(Course.class, uuid);
    if (course == null) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND)
          .body(Map.of("status", "bad", "message", "course not found"));
    }

    Event event = new Event();
    event.setUuid(UUID.randomUUID());
    event.setCourse(course);
    event.setType(Event.Type.MANUAL);
    event.setMessage(request.getMessage());
    event.setEdited(false);
    event.save();

    feedService.broadcastEvent(event);

    Map<String, Object> eventMap = new LinkedHashMap<>();
    eventMap.put("uuid", event.getUuid());
    eventMap.put("type", event.getType().name().toLowerCase());
    eventMap.put("message", event.getMessage());
    eventMap.put("edited", event.getEdited());
    eventMap.put("createdAt", event.getCreatedAt());
    eventMap.put("updatedAt", event.getUpdatedAt());

    return ResponseEntity.status(HttpStatus.CREATED).body(eventMap);
  }

  @GetMapping(value = "/{UUID}/feed/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
  public ResponseEntity<SseEmitter> streamFeed(@PathVariable("UUID") String uuidStr) {
    UUID uuid;
    try {
      uuid = UUID.fromString(uuidStr);
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().build();
    }

    Course course = DB.find(Course.class, uuid);
    if (course == null) {
      return ResponseEntity.notFound().build();
    }

    SseEmitter emitter = new SseEmitter(1800000L);

    feedService.addEmitter(uuid, emitter);

    emitter.onCompletion(() -> feedService.removeEmitter(uuid, emitter));
    emitter.onTimeout(() -> feedService.removeEmitter(uuid, emitter));
    emitter.onError((ex) -> feedService.removeEmitter(uuid, emitter));

    try {
      emitter.send(
          SseEmitter.event().name("connected").data("{\"message\":\"Connected to course feed\"}"));
    } catch (IOException e) {
      feedService.removeEmitter(uuid, emitter);
      return ResponseEntity.internalServerError().build();
    }

    return ResponseEntity.ok().header("Content-Type", "text/event-stream").body(emitter);
  }

  @PutMapping(value = "/{UUID}/feed/{postUUID}", produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<?> updatePost(
      @PathVariable("UUID") String uuidStr,
      @PathVariable("postUUID") String postUuidStr,
      @Valid @RequestBody UpdatePostRequest request) {

    UUID uuid;
    UUID postUuid;
    try {
      uuid = UUID.fromString(uuidStr);
      postUuid = UUID.fromString(postUuidStr);
    } catch (IllegalArgumentException e) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("status", "bad", "message", "invalid UUID format"));
    }

    Course course = DB.find(Course.class, uuid);
    if (course == null) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND)
          .body(Map.of("status", "bad", "message", "course not found"));
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

    event.setMessage(request.getMessage());
    event.setEdited(request.getEdited());
    event.save();

    feedService.broadcastEvent(event);

    Map<String, Object> eventMap = new LinkedHashMap<>();
    eventMap.put("uuid", event.getUuid());
    eventMap.put("type", event.getType().name().toLowerCase());
    eventMap.put("message", event.getMessage());
    eventMap.put("edited", event.getEdited());
    eventMap.put("createdAt", event.getCreatedAt());
    eventMap.put("updatedAt", event.getUpdatedAt());

    return ResponseEntity.status(HttpStatus.OK).body(eventMap);
  }

  @DeleteMapping(value = "/{UUID}/feed/{postUUID}")
  public ResponseEntity<?> deletePost(
      @PathVariable("UUID") String uuidStr, @PathVariable("postUUID") String postUuidStr) {

    UUID uuid;
    UUID postUuid;
    try {
      uuid = UUID.fromString(uuidStr);
      postUuid = UUID.fromString(postUuidStr);
    } catch (IllegalArgumentException e) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("status", "bad", "message", "invalid UUID format"));
    }

    Course course = DB.find(Course.class, uuid);
    if (course == null) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND)
          .body(Map.of("status", "bad", "message", "course not found"));
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

    event.delete();

    return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
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