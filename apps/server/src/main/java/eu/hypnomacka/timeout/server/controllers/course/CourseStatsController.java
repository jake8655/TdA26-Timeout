package eu.hypnomacka.timeout.server.controllers.course;

import eu.hypnomacka.timeout.server.controllers.Controller;
import eu.hypnomacka.timeout.server.core.Course;
import eu.hypnomacka.timeout.server.core.CourseStats;
import eu.hypnomacka.timeout.server.services.CourseStatsService;
import eu.hypnomacka.timeout.server.services.CourseStatsSseService;
import io.ebean.DB;
import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/courses/{courseId}/stats")
@RequiredArgsConstructor
public class CourseStatsController extends Controller {

  private final CourseStatsService statsService;
  private final CourseStatsSseService statsSseService;

  @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<?> getStats(
      @PathVariable String courseId,
      @CookieValue(value = "SESSION_ID", required = false) String sessionId) {

    if (!isLecturerSession(sessionId)) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(Map.of("status", "bad", "message", "unauthorized"));
    }

    Course course = findCourse(courseId);
    if (course == null) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND)
          .body(Map.of("status", "bad", "message", "course not found"));
    }

    CourseStats stats = statsService.getOrCreate(course);
    return ResponseEntity.ok(buildStatsResponse(stats));
  }

  @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
  public ResponseEntity<SseEmitter> streamStats(
      @PathVariable String courseId,
      @CookieValue(value = "SESSION_ID", required = false) String sessionId) {

    if (!isLecturerSession(sessionId)) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    UUID uuid;
    try {
      uuid = UUID.fromString(courseId);
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().build();
    }

    Course course = DB.find(Course.class, uuid);
    if (course == null) {
      return ResponseEntity.notFound().build();
    }

    SseEmitter emitter = new SseEmitter(1800000L);

    statsSseService.addEmitter(uuid, emitter);

    emitter.onCompletion(() -> statsSseService.removeEmitter(uuid, emitter));
    emitter.onTimeout(() -> statsSseService.removeEmitter(uuid, emitter));
    emitter.onError((ex) -> statsSseService.removeEmitter(uuid, emitter));

    try {
      emitter.send(
          SseEmitter.event().name("connected").data("{\"message\":\"Connected to course stats\"}"));
    } catch (IOException e) {
      statsSseService.removeEmitter(uuid, emitter);
      return ResponseEntity.internalServerError().build();
    }

    return ResponseEntity.ok().header("Content-Type", "text/event-stream").body(emitter);
  }

  private Map<String, Object> buildStatsResponse(CourseStats stats) {
    Map<String, Object> response = new LinkedHashMap<>();
    response.put("totalSubmissions", stats.getTotalSubmissions());
    response.put(
        "avgScore",
        stats.getTotalSubmissions() > 0
            ? stats.getTotalScoreSum() / stats.getTotalSubmissions()
            : 0.0);
    response.put(
        "avgMaxScore",
        stats.getTotalSubmissions() > 0
            ? stats.getTotalMaxScoreSum() / stats.getTotalSubmissions()
            : 0.0);
    response.put(
        "avgPercentage",
        stats.getTotalSubmissions() > 0
            ? stats.getTotalPercentageSum() / stats.getTotalSubmissions()
            : 0.0);
    response.put("downloads", stats.getDownloads());
    response.put("siteVisits", stats.getSiteVisits());
    response.put("updatedAt", stats.getUpdatedAt());
    return response;
  }

  private Course findCourse(String courseId) {
    try {
      return DB.find(Course.class, UUID.fromString(courseId));
    } catch (IllegalArgumentException e) {
      return null;
    }
  }
}
