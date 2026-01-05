package eu.hypnomacka.timeout.server.controllers.course.materials;

import eu.hypnomacka.timeout.server.controllers.Controller;
import eu.hypnomacka.timeout.server.core.Course;
import eu.hypnomacka.timeout.server.core.FileAttachment;
import eu.hypnomacka.timeout.server.core.UrlAttachment;
import eu.hypnomacka.timeout.server.core.query.QCourse;
import eu.hypnomacka.timeout.server.core.query.QFileAttachment;
import eu.hypnomacka.timeout.server.core.query.QUrlAttachment;
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
public class MaterialPutController extends Controller {
    private final WebClient webClient = WebClient.builder().build();

    private String getApiKey() {
        String key = System.getenv("API_KEY");
        if (key == null || key.isEmpty()) {
            key = System.getProperty("API_KEY");
        }
        return key;
    }

    @PutMapping(value = "/{materialId}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<? > updateMaterialJson(
            @PathVariable String courseId,
            @PathVariable("materialId") String materialId,
            @RequestBody Map<String, String> request) {

        String name = request.get("name");
        String url = request.get("url");
        String description = request.get("description");

        boolean hasName = name != null && !name.isBlank();
        boolean hasUrl = url != null && !url.isBlank();
        boolean hasDescription = description != null;

        if (!hasName && ! hasUrl && !hasDescription) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    Map.of("status", "bad", "message", "at least one field must be provided")
            );
        }

        UrlAttachment attachment = new QUrlAttachment()
                .uuid. eq(UUID.fromString(materialId))
                .findOne();

        if (attachment == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    Map.of("status", "bad", "message", "attachment not found")
            );
        }

        if (hasName) {
            attachment.setName(name);
        }

        if (hasUrl) {
            attachment.setUrl(url);
            attachment.setFaviconUrl("https://icons.duckduckgo.com/ip2/" + url + ".ico");
        }

        if (hasDescription) {
            attachment.setDescription(description);
        }

        attachment.save();

        return ResponseEntity.ok(attachment);
    }

    @PutMapping(value = "/{materialId}", consumes = MediaType. MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateMaterial(
            @PathVariable String courseId,
            @PathVariable("materialId") String materialId,
            @RequestPart(value = "file", required = false) MultipartFile file,
            @RequestPart(value = "name", required = false) String name,
            @RequestPart(value = "description", required = false) String description) throws Exception {

        boolean hasFile = file != null && !file. isEmpty();
        boolean hasName = name != null && !name. isBlank();
        boolean hasDescription = description != null;

        if (!hasFile && !hasName && !hasDescription) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    Map. of("status", "bad", "message", "at least one field must be provided")
            );
        }

        FileAttachment attachment = new QFileAttachment()
                .uuid. eq(UUID.fromString(materialId))
                .findOne();

        if (attachment == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    Map.of("status", "bad", "message", "attachment not found")
            );
        }

        if (file != null && ! file.isEmpty()) {
            if(!deleteMaterial(attachment)) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                        Map.of("status", "bad", "message", "failed to delete attachment file")
                );
            }
            MultipartBodyBuilder builder = new MultipartBodyBuilder();
            builder.part("file", new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename();
                }
            });

            Map<String, Object> response;

            try {
                response = webClient.post()
                        . uri(cdn + "/upload")
                        .header("Authorization", "Bearer " + getApiKey())
                        .header("Xfilename", file.getOriginalFilename())
                        .contentType(MediaType. MULTIPART_FORM_DATA)
                        .body(BodyInserters. fromMultipartData(builder.build()))
                        .retrieve()
                        . bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                        .block();
            } catch (WebClientResponseException e) {
                System.err.println("Error: " + e.getRawStatusCode() + " - " + e.getResponseBodyAsString());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                        Map.of("status", "bad", "message", "file upload to cdn server failed")
                );
            }

            if (! Boolean.parseBoolean(response.get("success").toString())) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                        Map.of("status", "bad", "message", "cdn server error")
                );
            }

            attachment.setFileUrl(cdn + response.get("url").toString());
            attachment.setSizeBytes(file.getSize());
            attachment.setMimeType(file.getContentType());
        }

        if (name != null && ! name.isBlank()) {
            attachment.setName(name);
        }

        if (description != null) {
            attachment. setDescription(description);
        }

        attachment.save();

        return ResponseEntity.ok(attachment);
    }

    public boolean deleteMaterial(FileAttachment file) {
        Map<String, Object> response;
        String url = file.getFileUrl();
        String[] parts = url.split("/");
        String fileName = parts[parts.length - 1];

        try {
            response = webClient.delete()
                .uri(cdn + "/delete/" + fileName)
                .header("Authorization", "Bearer " + getApiKey())
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .block();
        } catch (WebClientResponseException e) {
            return false;
        }

        if(!Boolean.parseBoolean(response.get("success").toString())) {
            return false;
        }

        return true;
    }

}