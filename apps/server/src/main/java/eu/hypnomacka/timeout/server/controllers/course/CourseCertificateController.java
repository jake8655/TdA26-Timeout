package eu.hypnomacka.timeout.server.controllers.course;

import eu.hypnomacka.timeout.server.controllers.Controller;
import eu.hypnomacka.timeout.server.core.Course;
import eu.hypnomacka.timeout.server.core.CourseJoin;
import eu.hypnomacka.timeout.server.core.query.QCourse;
import eu.hypnomacka.timeout.server.core.query.QCourseJoin;
import eu.hypnomacka.timeout.server.services.CertificatePdfService;
import eu.hypnomacka.timeout.server.services.CourseProgressService;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/courses/{courseId}/certificate")
@RequiredArgsConstructor
public class CourseCertificateController extends Controller {

  private final CourseProgressService courseProgressService;
  private final CertificatePdfService certificatePdfService;

  @GetMapping(produces = MediaType.APPLICATION_PDF_VALUE)
  public ResponseEntity<?> downloadCertificate(
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

    if (join.getUsername() == null || join.getUsername().isBlank()) {
      return ResponseEntity.status(HttpStatus.FORBIDDEN)
          .body(Map.of("status", "bad", "message", "username required"));
    }

    CourseProgressService.Progress progress = courseProgressService.calculate(studentSessionId, course);
    if (!progress.isEligible()) {
      return ResponseEntity.status(HttpStatus.FORBIDDEN)
          .body(Map.of("status", "bad", "message", "not enough points"));
    }

    byte[] pdf = certificatePdfService.generate(join.getUsername(), course.getName(), Instant.now());
    String safeCourseName =
        course.getName() == null
            ? "course"
            : course.getName().trim().replaceAll("[^a-zA-Z0-9\\-_]+", "-").toLowerCase();

    return ResponseEntity.ok()
        .contentType(MediaType.APPLICATION_PDF)
        .header(
            HttpHeaders.CONTENT_DISPOSITION,
            "attachment; filename=certificate-" + safeCourseName + ".pdf")
        .body(pdf);
  }
}
