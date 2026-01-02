package eu.hypnomacka.timeout.server.controllers.course;

import eu.hypnomacka.timeout.server.core.Course;
import eu.hypnomacka.timeout.server.core.Lecturer;
import eu.hypnomacka.timeout.server.core.query.QLecturer;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/courses")
public class CoursePostController {

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Course> create(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        String description = body.get("description");
        String lecturerId = body.get("lecturerId");

        if (name == null || name.isBlank() || lecturerId == null || lecturerId.isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        Lecturer lecturer = new QLecturer().id.eq(java.util.UUID.fromString(lecturerId)).findOne();
        if (lecturer == null) {
            return ResponseEntity.badRequest().build();
        }

        Course course = new Course(lecturer, name, description);
        course.save();

        return ResponseEntity.status(HttpStatus.CREATED).body(course);
    }

}
