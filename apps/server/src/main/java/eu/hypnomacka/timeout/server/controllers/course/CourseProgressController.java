package eu.hypnomacka.timeout.server.controllers.course;

import eu.hypnomacka.timeout.server.controllers.Controller;
import eu.hypnomacka.timeout.server.core.Course;
import eu.hypnomacka.timeout.server.core.CourseJoin;
import eu.hypnomacka.timeout.server.core.query.QCourse;
import eu.hypnomacka.timeout.server.core.query.QCourseJoin;
import eu.hypnomacka.timeout.server.services.CourseProgressService;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/courses/{courseId}/progress")
@RequiredArgsConstructor
public class CourseProgressController extends Controller {

  private final CourseProgressService courseProgressService;

  @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<?> getProgress(
      @PathVariable("courseId") String courseIdStr,
      @CookieValue(value = "STUDENT_SESSION_ID", required = false) String studentSessionId) {
    UUID courseId;
    try {
      courseId = UUID.fromString(courseIdStr);
    } catch (IllegalArgumentException e) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("status", "bad", "message", "invalid UUID format"));
    }

    Course course = new QCourse().uuid.eq(courseId).findOne();
    if (course == null) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND)
          .body(Map.of("status", "bad", "message", "course not found"));
    }

    if (studentSessionId == null || studentSessionId.isBlank()) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(Map.of("status", "bad", "message", "student session missing"));
    }

    CourseJoin join =
        new QCourseJoin().course.eq(course).sessionToken.eq(studentSessionId).setMaxRows(1).findOne();
    if (join == null) {
      return ResponseEntity.status(HttpStatus.FORBIDDEN)
          .body(Map.of("status", "bad", "message", "course session not found"));
    }

    CourseProgressService.Progress progress = courseProgressService.calculate(studentSessionId, course);
    Map<String, Object> response = new LinkedHashMap<>();
    response.put("status", "ok");
    response.put("username", join.getUsername());
    response.put("points", progress.getPoints());
    response.put("threshold", progress.getThreshold());
    response.put("eligible", progress.isEligible());
    response.put("bestAttemptsCount", progress.getBestAttemptsCount());
    return ResponseEntity.ok(response);
  }
}
