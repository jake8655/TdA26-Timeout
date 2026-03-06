package eu.hypnomacka.timeout.server.controllers.feed;

import com.fasterxml.jackson.databind.ObjectMapper;
import eu.hypnomacka.timeout.server.core.Event;
import java.io.IOException;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Slf4j
@Service
@RequiredArgsConstructor
public class CourseFeedService {

  private final ObjectMapper objectMapper;

  private final Map<UUID, CopyOnWriteArrayList<SseEmitter>> courseEmitters =
      new ConcurrentHashMap<>();

  public void addEmitter(UUID courseId, SseEmitter emitter) {
    courseEmitters.computeIfAbsent(courseId, k -> new CopyOnWriteArrayList<>()).add(emitter);
    log.info(
        "Added SSE emitter for course: {}, total: {}",
        courseId,
        courseEmitters.get(courseId).size());
  }

  public void removeEmitter(UUID courseId, SseEmitter emitter) {
    CopyOnWriteArrayList<SseEmitter> emitters = courseEmitters.get(courseId);
    if (emitters != null) {
      emitters.remove(emitter);
      log.info("Removed SSE emitter for course: {}, remaining: {}", courseId, emitters.size());

      if (emitters.isEmpty()) {
        courseEmitters.remove(courseId);
      }
    }
  }

  public void broadcastEvent(Event event) {
    UUID courseId = event.getCourse().getUuid();
    CopyOnWriteArrayList<SseEmitter> emitters = courseEmitters.get(courseId);

    if (emitters == null || emitters.isEmpty()) {
      log.debug("No active emitters for course: {}", courseId);
      return;
    }

    if (!isVisibleFeedEvent(event)) {
      log.debug("Skipping visible feed broadcast for event: {}", event.getUuid());
      return;
    }

    String eventName = event.getType() == Event.Type.MANUAL ? "new_post" : "system_event";

    try {
      String eventData =
          objectMapper.writeValueAsString(
              Map.of(
                  "uuid", event.getUuid().toString(),
                  "message", event.getMessage(),
                  "type", event.getType().toString().toLowerCase(),
                  "edited", event.getEdited(),
                  "createdAt", event.getCreatedAt().toString()));

      emitters.removeIf(
          emitter -> {
            try {
              emitter.send(SseEmitter.event().name(eventName).data(eventData));
              return false;
            } catch (IOException e) {
              log.warn("Failed to send event to emitter, removing: {}", e.getMessage());
              return true;
            }
          });

      log.info(
          "Broadcasted {} to {} emitters for course: {}", eventName, emitters.size(), courseId);

    } catch (Exception e) {
      log.error("Error broadcasting event: {}", e.getMessage(), e);
    }
  }

  public void broadcastMessage(UUID courseId, String eventName, String message) {
    CopyOnWriteArrayList<SseEmitter> emitters = courseEmitters.get(courseId);

    if (emitters == null || emitters.isEmpty()) {
      return;
    }

    emitters.removeIf(
        emitter -> {
          try {
            emitter.send(SseEmitter.event().name(eventName).data(message));
            return false;
          } catch (IOException e) {
            log.warn("Failed to send message to emitter: {}", e.getMessage());
            return true;
          }
        });
  }

  public int getActiveConnectionCount(UUID courseId) {
    CopyOnWriteArrayList<SseEmitter> emitters = courseEmitters.get(courseId);
    return emitters != null ? emitters.size() : 0;
  }

  private boolean isVisibleFeedEvent(Event event) {
    if (event.getType() == Event.Type.MANUAL) {
      return true;
    }

    String message = event.getMessage();
    if (message == null) {
      return false;
    }

    return message.startsWith("Module revealed:") || message.startsWith("Module hidden:");
  }
}
