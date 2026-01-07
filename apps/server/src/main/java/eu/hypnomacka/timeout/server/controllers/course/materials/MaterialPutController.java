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

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/courses/{courseId}/materials")
public class MaterialPutController extends Controller {

    private static final String UPLOAD_URL = cdn + "/upload";
    private static final String DELETE_URL = cdn + "/delete";
    private static final long MAX_FILE_SIZE = 30 * 1024 * 1024;
    private static final List<String> SUPPORTED_MIME_TYPES = Arrays.asList(

        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",

        "image/png",
        "image/jpg",
        "image/jpeg",
        "image/gif",

        "video/mp4",

        "audio/mpeg",
        "audio/mp3"
    );

    private final WebClient webClient = WebClient.builder().build();

    private String getApiKey() {
        String key = System.getenv("API_KEY");
        if (key == null || key.isEmpty()) {
            key = System.getProperty("API_KEY");
        }
        return key;
    }

    private String normalizeMimeType(String mimeType) {
        if (mimeType == null) {
            return null;
        }
        int semicolonIndex = mimeType.indexOf(';');
        if (semicolonIndex != -1) {
            return mimeType.substring(0, semicolonIndex).trim();
        }
        return mimeType.trim();
    }

    private boolean isSupportedMimeType(String mimeType) {
        String normalized = normalizeMimeType(mimeType);
        return normalized != null && SUPPORTED_MIME_TYPES.contains(normalized);
    }

    @PutMapping(value = "/{materialId}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<? > updateMaterialJson(
            @PathVariable String courseId,
            @PathVariable String materialId,
            @RequestBody Map<String, String> request) {

        UUID courseUuid;
        UUID materialUuid;
        try {
            courseUuid = UUID.fromString(courseId);
            materialUuid = UUID.fromString(materialId);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                Map.of("status", "bad", "message", "invalid UUID format")
            );
        }

        Course course = new QCourse().uuid.eq(courseUuid).findOne();
        if (course == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                Map.of("status", "bad", "message", "course not found")
            );
        }

        UrlAttachment urlAttachment = new QUrlAttachment().uuid.eq(materialUuid).findOne();
        if (urlAttachment != null) {
            String name = request.get("name");
            String url = request.get("url");
            String description = request.get("description");

            if (name != null && ! name.isEmpty()) {
                urlAttachment.setName(name);
            }
            if (url != null && !url.isEmpty()) {
                urlAttachment.setUrl(url);
                urlAttachment.setFaviconUrl("https://icons.duckduckgo.com/ip2/" + url.replace("https://", "").replace("http://", "").split("/")[0] + ".ico");
            }
            if (description != null) {
                urlAttachment.setDescription(description);
            }
            urlAttachment.save();

            return ResponseEntity.ok(urlAttachment);
        }

        FileAttachment fileAttachment = new QFileAttachment().uuid.eq(materialUuid).findOne();
        if (fileAttachment != null) {
            String name = request.get("name");
            String description = request.get("description");

            if (name != null && !name.isEmpty()) {
                fileAttachment.setName(name);
            }
            if (description != null) {
                fileAttachment.setDescription(description);
            }
            fileAttachment.save();

            return ResponseEntity.ok(fileAttachment);
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
            Map.of("status", "bad", "message", "material not found")
        );
    }

    @PutMapping(value = "/{materialId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateMaterialFile(
            @PathVariable String courseId,
            @PathVariable String materialId,
            @RequestPart(value = "file", required = false) MultipartFile file,
            @RequestPart(value = "name", required = false) String name,
            @RequestPart(value = "description", required = false) String description) throws Exception {

        UUID courseUuid;
        UUID materialUuid;
        try {
            courseUuid = UUID.fromString(courseId);
            materialUuid = UUID.fromString(materialId);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                Map.of("status", "bad", "message", "invalid UUID format")
            );
        }

        Course course = new QCourse().uuid.eq(courseUuid).findOne();
        if (course == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                Map.of("status", "bad", "message", "course not found")
            );
        }

        FileAttachment fileAttachment = new QFileAttachment().uuid.eq(materialUuid).findOne();
        if (fileAttachment == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                Map.of("status", "bad", "message", "material not found")
            );
        }

        if (name != null && ! name.isEmpty()) {
            fileAttachment.setName(name);
        }
        if (description != null) {
            fileAttachment.setDescription(description);
        }

        if (file != null && ! file.isEmpty()) {
            if (file.getSize() > MAX_FILE_SIZE) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    Map.of("status", "bad", "message", "file size exceeds 30MB limit")
                );
            }

            if (!isSupportedMimeType(file.getContentType())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    Map.of("status", "bad", "message", "unsupported file format")
                );
            }

            String oldUrl = fileAttachment.getFileUrl();
            String[] parts = oldUrl.split("/");
            String oldFileName = parts[parts.length - 1];
            try {
                webClient.delete()
                    .uri(DELETE_URL + "/" + oldFileName)
                    .header("Authorization", "Bearer " + getApiKey())
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                    .block();
            } catch (WebClientResponseException e) {
                System.err.println("Warning: Failed to delete old file from CDN:  " + e.getMessage());
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
                    .uri(UPLOAD_URL)
                    .header("Authorization", "Bearer " + getApiKey())
                    .header("Xfilename", file.getOriginalFilename())
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(BodyInserters.fromMultipartData(builder.build()))
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                    .block();
            } catch (WebClientResponseException e) {
                System.err.println("Error: " + e.getRawStatusCode() + " - " + e.getResponseBodyAsString());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    Map.of("status", "bad", "message", "file upload to cdn server failed")
                );
            }

            if (response == null || !Boolean.parseBoolean(response.get("success").toString())) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    Map.of("status", "bad", "message", "cdn server error")
                );
            }

            String newFileUrl = cdn + response.get("url").toString();
            String mimeType = normalizeMimeType(file.getContentType());

            fileAttachment.setFileUrl(newFileUrl);
            fileAttachment.setSizeBytes(file.getSize());
            fileAttachment.setMimeType(mimeType);
        }

        fileAttachment.save();

        return ResponseEntity.ok(fileAttachment);
    }
}