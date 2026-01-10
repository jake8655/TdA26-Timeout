package eu.hypnomacka.timeout.server.controllers.course.materials;

import eu.hypnomacka.timeout.server.controllers.Controller;
import eu.hypnomacka.timeout.server.core.FileAttachment;
import eu.hypnomacka.timeout.server.core.UrlAttachment;
import eu.hypnomacka.timeout.server.core.query.QFileAttachment;
import eu.hypnomacka.timeout.server.core.query.QUrlAttachment;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/courses/{courseId}/materials")
public class MaterialDeleteController extends Controller {

    private static final String URL = cdn + "/delete";
    private final WebClient webClient = WebClient.builder().build();

    private String getApiKey() {
        String key = System.getenv("API_KEY");
        if (key == null || key.isEmpty()) {
            key = System.getProperty("API_KEY");
        }
        return key;
    }

    @DeleteMapping("/{materialId}")
    public ResponseEntity<?> deleteMaterial(
            @PathVariable String courseId, @PathVariable String materialId) {

        Map<String, Object> response;

        UUID uuid;

        try {
            uuid = UUID.fromString(materialId);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(
                            Map.of(
                                    "status",
                                    "error",
                                    "message",
                                    "Failed to parse uuid from materialId"));
        }

        FileAttachment file = new QFileAttachment().uuid.eq(uuid).findOne();
        UrlAttachment urlFile = new QUrlAttachment().uuid.eq(uuid).findOne();

        if (file != null) {
            String url = file.getFileUrl();
            String[] parts = url.split("/");
            String fileName = parts[parts.length - 1];
            try {
                response =
                        webClient
                                .delete()
                                .uri(URL + "/" + fileName)
                                .header("Authorization", "Bearer " + getApiKey())
                                .retrieve()
                                .bodyToMono(
                                        new ParameterizedTypeReference<Map<String, Object>>() {})
                                .block();
            } catch (WebClientResponseException e) {
                System.err.println(
                        "Error:  " + e.getRawStatusCode() + " - " + e.getResponseBodyAsString());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(
                                Map.of(
                                        "status",
                                        "error",
                                        "message",
                                        "Failed to delete file from CDN server"));
            }

            if (response == null || !Boolean.parseBoolean(response.get("success").toString())) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("status", "bad", "message", "cdn server error"));
            } else {
                if (file.delete()) {
                    return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
                } else {
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .body(
                                    Map.of(
                                            "status",
                                            "bad",
                                            "message",
                                            "Failed to delete from database"));
                }
            }
        }

        if (urlFile != null) {
            if (urlFile.delete()) {
                return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("status", "bad", "message", "Failed to delete from database"));
            }
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("status", "bad", "message", "material not found"));
    }
}
