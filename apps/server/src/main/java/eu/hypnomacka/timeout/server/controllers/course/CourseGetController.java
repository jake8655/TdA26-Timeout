package eu.hypnomacka.timeout.server.controllers.course;

import eu.hypnomacka.timeout.server.controllers.Controller;
import eu.hypnomacka.timeout.server.core.Course;
import eu.hypnomacka.timeout.server.core.CourseJoin;
import eu.hypnomacka.timeout.server.core.Event;
import eu.hypnomacka.timeout.server.core.FileAttachment;
import eu.hypnomacka.timeout.server.core.Quiz;
import eu.hypnomacka.timeout.server.core.UrlAttachment;
import eu.hypnomacka.timeout.server.core.query.QCourse;
import eu.hypnomacka.timeout.server.core.query.QCourseJoin;
import eu.hypnomacka.timeout.server.core.query.QEvent;
import java.time.Instant;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/courses")
public class CourseGetController extends Controller {

  @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
  public List<Map<String, Object>> root(
      @CookieValue(value = "SESSION_ID", required = false) String sessionId) {
    boolean isLecturer = isLecturerSession(sessionId);

    List<Course> courses =
        isLecturer
            ? new QCourse().orderBy().updatedAt.desc().findList()
            : new QCourse()
                .status.in(Course.Status.SCHEDULED, Course.Status.LIVE, Course.Status.PAUSED)
                .orderBy()
                .updatedAt.desc()
                .findList();
    List<Map<String, Object>> result = new ArrayList<>();
    for (Course course : courses) {
      result.add(buildCourseResponse(course));
    }
    return result;
  }

  @GetMapping(value = "/{UUID}", produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<?> byUUID(
      @PathVariable("UUID") String uuidStr,
      @CookieValue(value = "SESSION_ID", required = false) String sessionId) {
    UUID uuid;
    try {
      uuid = UUID.fromString(uuidStr);
    } catch (IllegalArgumentException e) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("status", "bad", "message", "invalid UUID format"));
    }

    Course course = new QCourse().uuid.eq(uuid).findOne();
    if (course == null) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND)
          .body(Map.of("status", "bad", "message", "course not found"));
    }

    boolean isLecturer = isLecturerSession(sessionId);

    if (!isLecturer
        && (course.getStatus() == Course.Status.DRAFT
            || course.getStatus() == Course.Status.ARCHIVED)) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND)
          .body(Map.of("status", "bad", "message", "course not found"));
    }

    if (!isLecturer
        && (course.getStatus() == Course.Status.SCHEDULED
            || course.getStatus() == Course.Status.PAUSED)) {
      return ResponseEntity.status(HttpStatus.OK)
          .body(buildLimitedCourseResponse(course, sessionId));
    }

    List<Object> materials = new ArrayList<>();
    materials.addAll(course.getFileAttachments());
    materials.addAll(course.getUrlAttachments());

    materials.sort(
        (a, b) -> {
          Instant dateA =
              a instanceof FileAttachment
                  ? ((FileAttachment) a).getUpdatedAt()
                  : ((UrlAttachment) a).getUpdatedAt();
          Instant dateB =
              b instanceof FileAttachment
                  ? ((FileAttachment) b).getUpdatedAt()
                  : ((UrlAttachment) b).getUpdatedAt();
          return dateB.compareTo(dateA);
        });

    List<Quiz> quizzes = new ArrayList<>(course.getQuizzes());
    quizzes.sort(Comparator.comparing(Quiz::getUpdatedAt).reversed());

    List<Event> events = new QEvent().course.eq(course).orderBy().createdAt.desc().findList();

    List<Map<String, Object>> feed = new ArrayList<>();
    for (Event event : events) {
      Map<String, Object> eventMap = new LinkedHashMap<>();
      eventMap.put("uuid", event.getUuid());
      eventMap.put("type", event.getType().name().toLowerCase());
      eventMap.put("message", event.getMessage());
      eventMap.put("edited", event.getEdited());
      eventMap.put("createdAt", event.getCreatedAt());
      eventMap.put("updatedAt", event.getUpdatedAt());
      feed.add(eventMap);
    }

    Map<String, Object> response = new LinkedHashMap<>();
    response.put("uuid", course.getUuid());
    response.put("name", course.getName());
    response.put("description", course.getDescription());
    response.put("createdAt", course.getCreatedAt());
    response.put("updatedAt", course.getUpdatedAt());
    response.put("materials", materials);
    response.put("quizzes", quizzes);
    response.put("feed", feed);
    response.put("status", course.getStatus().name().toLowerCase());
    response.put("scheduledStartAt", course.getScheduledStartAt());
    response.put("scheduledEndAt", course.getScheduledEndAt());
    response.put("pausedAt", course.getPausedAt());
    response.put("archivedAt", course.getArchivedAt());
    response.put("joined", isJoined(course, sessionId));

    return ResponseEntity.status(HttpStatus.OK).body(response);
  }

  private Map<String, Object> buildCourseResponse(Course course) {
    List<Object> materials = new ArrayList<>();
    materials.addAll(course.getFileAttachments());
    materials.addAll(course.getUrlAttachments());

    materials.sort(
        (a, b) -> {
          Instant dateA =
              a instanceof FileAttachment
                  ? ((FileAttachment) a).getUpdatedAt()
                  : ((UrlAttachment) a).getUpdatedAt();
          Instant dateB =
              b instanceof FileAttachment
                  ? ((FileAttachment) b).getUpdatedAt()
                  : ((UrlAttachment) b).getUpdatedAt();
          return dateB.compareTo(dateA);
        });

    List<Quiz> quizzes = new ArrayList<>(course.getQuizzes());
    quizzes.sort(Comparator.comparing(Quiz::getCreatedAt).reversed());

    Map<String, Object> response = new LinkedHashMap<>();
    response.put("uuid", course.getUuid());
    response.put("name", course.getName());
    response.put("description", course.getDescription());
    response.put("createdAt", course.getCreatedAt());
    response.put("updatedAt", course.getUpdatedAt());
    response.put("materials", materials);
    response.put("quizzes", quizzes);
    response.put("status", course.getStatus().name().toLowerCase());
    response.put("scheduledStartAt", course.getScheduledStartAt());
    response.put("scheduledEndAt", course.getScheduledEndAt());

    return response;
  }

  private Map<String, Object> buildLimitedCourseResponse(Course course, String sessionId) {
    Map<String, Object> response = new LinkedHashMap<>();
    response.put("uuid", course.getUuid());
    response.put("name", course.getName());
    response.put("description", course.getDescription());
    response.put("createdAt", course.getCreatedAt());
    response.put("updatedAt", course.getUpdatedAt());
    response.put("status", course.getStatus().name().toLowerCase());
    response.put("scheduledStartAt", course.getScheduledStartAt());
    response.put("scheduledEndAt", course.getScheduledEndAt());
    response.put("pausedAt", course.getPausedAt());
    response.put("archivedAt", course.getArchivedAt());
    response.put("joined", isJoined(course, sessionId));
    return response;
  }

  private boolean isJoined(Course course, String sessionId) {
    if (sessionId == null || sessionId.isBlank()) {
      return false;
    }
    CourseJoin join =
        new QCourseJoin().course.eq(course).sessionToken.eq(sessionId).findOne();
    return join != null && Boolean.TRUE.equals(join.getActive());
  }
}
