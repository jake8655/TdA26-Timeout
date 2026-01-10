package eu.hypnomacka.timeout.server.controllers.course;

import eu.hypnomacka.timeout.server.controllers.Controller;
import eu.hypnomacka.timeout.server.core.Course;
import eu.hypnomacka.timeout.server.core.FileAttachment;
import eu.hypnomacka.timeout.server.core.Quiz;
import eu.hypnomacka.timeout.server.core.UrlAttachment;
import eu.hypnomacka.timeout.server.core.query.QCourse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/courses")
public class CourseGetController extends Controller {

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public List<Map<String, Object>> root() {
        List<Course> courses = new QCourse().orderBy().updatedAt.desc().findList();
        List<Map<String, Object>> result = new ArrayList<>();
        for (Course course : courses) {
            result.add(buildCourseResponse(course));
        }
        return result;
    }

    @GetMapping(value = "/{UUID}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> byUUID(@PathVariable("UUID") String uuidStr, @CookieValue(value = "SESSION_ID", required = false) String sessionId) {
        UUID uuid;
        try {
            uuid = UUID.fromString(uuidStr);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                Map.of("status", "bad", "message", "invalid UUID format")
            );
        }

        Course course = new QCourse().uuid.eq(uuid).findOne();
        if (course == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                Map.of("status", "bad", "message", "course not found")
            );
        }

        List<Object> materials = new ArrayList<>();
        materials.addAll(course.getFileAttachments());
        materials.addAll(course.getUrlAttachments());

        materials.sort((a, b) -> {
            Instant dateA = a instanceof FileAttachment
                ?  ((FileAttachment) a).getUpdatedAt()
                : ((UrlAttachment) a).getUpdatedAt();
            Instant dateB = b instanceof FileAttachment
                ? ((FileAttachment) b).getUpdatedAt()
                : ((UrlAttachment) b).getUpdatedAt();
            return dateB.compareTo(dateA);
        });

        List<Quiz> quizzes = new ArrayList<>(course.getQuizzes());
        quizzes.sort(Comparator.comparing(Quiz::getUpdatedAt).reversed());

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("uuid", course.getUuid());
        response.put("name", course.getName());
        response.put("description", course.getDescription());
        response.put("createdAt", course.getCreatedAt());
        response.put("updatedAt", course.getUpdatedAt());
        response.put("materials", materials);
        response.put("quizzes", quizzes);

        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    private Map<String, Object> buildCourseResponse(Course course) {
        List<Object> materials = new ArrayList<>();
        materials.addAll(course.getFileAttachments());
        materials.addAll(course.getUrlAttachments());

        materials.sort((a, b) -> {
            Instant dateA = a instanceof FileAttachment
                ? ((FileAttachment) a).getUpdatedAt()
                : ((UrlAttachment) a).getUpdatedAt();
            Instant dateB = b instanceof FileAttachment
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

        return response;
    }

}