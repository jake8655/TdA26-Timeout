package eu.hypnomacka.timeout. server.controllers.course.materials;

import eu.hypnomacka.timeout. server.controllers.Controller;
import eu. hypnomacka.timeout.server. core.Course;
import eu. hypnomacka.timeout.server. core.query.QCourse;
import eu.hypnomacka.timeout.server.core.query.QFileAttachment;
import eu.hypnomacka.timeout.server.core.query.QUrlAttachment;
import org.springframework. http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web. multipart.MultipartFile;

import java.lang.reflect.Array;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java. util.UUID;

@RestController
@RequestMapping("/courses/{courseId}/materials")
public class MaterialGetController extends Controller {

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<? > listMaterials(@PathVariable("courseId") String courseIdStr) {
        UUID courseId;
        try {
            courseId = UUID. fromString(courseIdStr);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                Map. of("status", "bad", "message", "invalid UUID format")
            );
        }

        Course course = new QCourse().uuid.eq(courseId).findOne();
        if (course == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("The requested resource was not found.");
        }

        List<Object> materials = new ArrayList<>();
        materials.addAll(course.getFileAttachments());
        materials.addAll(course.getUrlAttachments());

        return ResponseEntity. ok(materials);
    }
}