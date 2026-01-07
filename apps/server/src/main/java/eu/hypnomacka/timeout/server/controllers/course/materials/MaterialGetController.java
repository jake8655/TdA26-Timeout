package eu.hypnomacka.timeout.server.controllers.course.materials;

import eu.hypnomacka.timeout.server.controllers.Controller;
import eu.hypnomacka.timeout.server.core.Course;
import eu.hypnomacka.timeout.server.core.FileAttachment;
import eu.hypnomacka.timeout.server.core.UrlAttachment;
import eu.hypnomacka.timeout.server.core.query.QCourse;
import eu.hypnomacka.timeout.server.core.query.QFileAttachment;
import eu.hypnomacka.timeout.server.core.query.QUrlAttachment;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.lang.reflect.Array;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/courses/{courseId}/materials")
public class MaterialGetController extends Controller {

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> listMaterials(@PathVariable("courseId") String courseIdStr) {
        UUID courseId;
        try {
            courseId = UUID.fromString(courseIdStr);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                Map.of("status", "bad", "message", "invalid UUID format")
            );
        }

        Course course = new QCourse().uuid.eq(courseId).findOne();
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
                ? ((FileAttachment) a).getUpdatedAt()
                : ((UrlAttachment) a).getUpdatedAt();
            Instant dateB = b instanceof FileAttachment
                ? ((FileAttachment) b).getUpdatedAt()
                : ((UrlAttachment) b).getUpdatedAt();
            return dateB.compareTo(dateA);
        });

        return ResponseEntity.ok(materials);
    }
}
