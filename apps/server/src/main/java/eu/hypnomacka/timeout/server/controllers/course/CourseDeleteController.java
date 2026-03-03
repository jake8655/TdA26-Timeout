package eu.hypnomacka.timeout.server.controllers.course;

import eu.hypnomacka.timeout.server.controllers.Controller;
import eu.hypnomacka.timeout.server.controllers.feed.CourseFeedService;
import eu.hypnomacka.timeout.server.core.Course;
import eu.hypnomacka.timeout.server.core.CourseStats;
import eu.hypnomacka.timeout.server.core.query.QCourse;
import io.ebean.DB;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/courses")
public class CourseDeleteController extends Controller {

  private final CourseFeedService feedService;

  public CourseDeleteController(CourseFeedService feedService) {
    this.feedService = feedService;
  }

  @DeleteMapping(value = "/{UUID}", produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<?> delete(
      @PathVariable("UUID") String uuidStr,
      @CookieValue(value = "SESSION_ID", required = false) String sessionId) {
    if (!isLecturerSession(sessionId)) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(Map.of("status", "bad", "message", "unauthorized"));
    }

    UUID uuid;
    try {
      uuid = UUID.fromString(uuidStr);
    } catch (IllegalArgumentException e) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("status", "bad", "message", "Invalid UUID format"));
    }

    Course course = new QCourse().uuid.eq(uuid).findOne();
    if (course == null) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND)
          .body("The requested resource was not found.");
    }

    feedService.broadcastMessage(
        course.getUuid(),
        "course_kick",
        String.format(
            "{\"reason\":\"Course deleted by"
                + " lecturer\",\"status\":\"DELETED\",\"effectiveAt\":\"%s\"}",
            Instant.now()));

    CourseStats stats =
        DB.find(CourseStats.class).where().eq("course.uuid", course.getUuid()).findOne();
    if (stats != null) {
      stats.delete();
    }

    if (course.delete()) {
      return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body(Map.of("status", "error", "message", "Failed to delete course"));
  }
}
