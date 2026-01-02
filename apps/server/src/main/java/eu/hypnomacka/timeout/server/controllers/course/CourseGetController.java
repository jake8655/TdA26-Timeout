package eu.hypnomacka.timeout.server.controllers.course;

import eu.hypnomacka.timeout.server.controllers.Controller;
import eu.hypnomacka.timeout.server.core.Course;
import eu.hypnomacka.timeout.server.core.query.QCourse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/courses")
public class CourseGetController extends Controller {

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public List<Course> root() {
        return new QCourse().orderBy().updatedAt.desc().findList();
    }

    @GetMapping(value = "/{UUID}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> byUUID(@PathVariable("UUID") String uuidStr, @CookieValue(value = "SESSION_ID", required = false) String sessionId) {
        /*if (sessionId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                Map.of("status", "bad", "message", "no session found")
            );
        }

        Session session = new QSession().token.eq(sessionId).findOne();
        if (session == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                Map.of("status", "bad", "message", "session not found in database")
            );
        }

        Lecturer lecturer = new QLecturer().id.eq(session.getLecturer().getId()).findOne();
        if (lecturer == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                Map.of("status", "bad", "message", "session not linked to an account")
            );
        }*/

        UUID uuid;
        try {
            uuid = UUID.fromString(uuidStr);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                Map.of("status", "bad", "message", "invalid UUID format")
            );
        }

        Course course = new QCourse().uuid.eq(uuid).findOne();
        if(course == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("The requested resource was not found.");
        }

        /*if (!lecturer.getId().equals(course.getLecturer().getId())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("not allowed to change course");
        }*/

        return ResponseEntity.status(HttpStatus.OK).body(course);
    }

}
