package eu.hypnomacka.timeout.server.controllers.course;

import eu.hypnomacka.timeout.server.core.Course;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;

@RestController
@RequestMapping("/courses")
public class CourseGetController {

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public List<Map<String, String>> root() {
        ArrayList<Course> courses = new ArrayList<>();  //placeholder
        Course c = new Course(1, "Course 1", "Description 1");
        courses.add(c);
        List<Map<String, String>> courseVals = new ArrayList<>();
        courses.forEach(course -> {
            Map<String, String> courseVal = new LinkedHashMap<>();
            courseVal.put("uuid", String.valueOf(course.getId()));
            courseVal.put("name", course.getName());
            courseVal.put("description", course.getDescription());
            courseVal.put("createdAt", course.getCreatedAt().toString());
            courseVal.put("updatedAt", course.getUpdatedAt().toString());
            courseVals.add(courseVal);
        });
        return courseVals;
    }

}
