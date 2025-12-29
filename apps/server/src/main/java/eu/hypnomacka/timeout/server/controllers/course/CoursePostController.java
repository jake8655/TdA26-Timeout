package eu.hypnomacka.timeout.server.controllers.course;

import eu.hypnomacka.timeout.server.core.Course;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/courses")
public class CoursePostController {

    @PostMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, String>> root(@RequestBody Map<String, String> body, HttpServletResponse response) {
        ArrayList<Course> courses = new ArrayList<>();  //placeholder
        String name = body.get("name");
        String description = body.get("description");

        Course course = new Course(1, name, description);

        Map<String, String> courseVal = new LinkedHashMap<>();
        courseVal.put("uuid", String.valueOf(course.getId()));
        courseVal.put("name", course.getName());
        courseVal.put("description", course.getDescription());
        courseVal.put("createdAt", course.getCreatedAt().toString());
        courseVal.put("updatedAt", course.getUpdatedAt().toString());
        return ResponseEntity.status(HttpStatus.CREATED).body(courseVal);
    }

}

