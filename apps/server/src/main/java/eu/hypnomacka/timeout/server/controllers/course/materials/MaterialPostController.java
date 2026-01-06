package eu.hypnomacka.timeout.server.controllers.course.materials;

import eu.hypnomacka.timeout.server.controllers.Controller;
import eu.hypnomacka.timeout.server.core.Course;
import eu.hypnomacka.timeout.server.core.FileAttachment;
import eu.hypnomacka.timeout.server.core.UrlAttachment;
import eu.hypnomacka.timeout.server.core.query.QCourse;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/courses/{courseId}/materials")
public class MaterialPostController extends Controller {

    private static final String URL = cdn + "/upload";
    private final WebClient webClient = WebClient.builder().build();

    private String getApiKey() {
        String key = System.getenv("API_KEY");
        if (key == null || key.isEmpty()) {
            key = System.getProperty("API_KEY");
        }
        return key;
    }

    @PostMapping(consumes = MediaType. APPLICATION_JSON_VALUE)
    public ResponseEntity<? > uploadMaterialJson(
            @PathVariable String courseId,
            @RequestBody Map<String, String> request) {

        Course course = new QCourse().uuid.eq(UUID. fromString(courseId)).findOne();

        if(course == null) {
            return ResponseEntity. status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                Map. of("status", "bad", "message", "course not found")
            );
        }

        String name = request.get("name");
        String url = request.get("url");
        String type = request.get("type");
        String description = request.get("description");

        if (name == null || name.isEmpty() ||
            url == null || url.isEmpty() ||
            type == null || type.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    Map.of("status", "bad", "message", "bad request")
            );
        }

        if (description == null) {
            description = "";
        }

        UrlAttachment attachment = new UrlAttachment(
            course,
            name,
            url,
            description,
            UrlAttachment.Type.url,
            "https://icons.duckduckgo.com/ip2/" + url.replace("https://", "").split("/")[0] + ".ico"
        );
        attachment.save();

        return ResponseEntity.status(HttpStatus.CREATED).body(attachment);
    }

    @PostMapping(consumes = MediaType. MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<? > uploadMaterial(@PathVariable String courseId, @RequestPart(value = "file") MultipartFile file, @RequestPart("type") String type, @RequestPart("name") String name, @RequestPart(value = "description", required = false) String description) throws Exception {
        MultipartBodyBuilder builder = new MultipartBodyBuilder();
        builder.part("file", new ByteArrayResource(file.getBytes()) {
            @Override
            public String getFilename() {
                return file.getOriginalFilename();
            }
        });

        Map<String, Object> response;

        try {
             response = webClient. post()
                .uri(URL)
                .header("Authorization", "Bearer " + getApiKey())
                .header("Xfilename", file.getOriginalFilename())
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(BodyInserters.fromMultipartData(builder. build()))
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .block();
        } catch (WebClientResponseException e) {
            System.err. println("Error: " + e.getRawStatusCode() + " - " + e. getResponseBodyAsString());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                Map.  of("status", "bad", "message", "file upload to cdn server failed")
            );
        }

        if(response == null || !Boolean. parseBoolean(response.get("success").toString())) {
            return ResponseEntity. status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                Map. of("status", "bad", "message", "cdn server error")
            );
        }

        String fileUrl = cdn + response.get("url").toString();
        long sizeBytes = file.getSize();
        String mimeType = file.getContentType();

        if (description == null) {
            description = "";
        }

        Course course = new QCourse().uuid.eq(UUID.fromString(courseId)).findOne();
        if(course == null) {
            return ResponseEntity. status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                Map. of("status", "bad", "message", "course not found")
            );
        }
        FileAttachment attachment = new FileAttachment(course, name, description, FileAttachment.Type.file, sizeBytes, mimeType, fileUrl);
        attachment.save();

        return ResponseEntity.status(HttpStatus.CREATED).body(attachment);
    }
}
