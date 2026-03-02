package eu.hypnomacka.timeout.server.services;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Slf4j
@Service
public class CourseStatsSseService {

  private final Map<UUID, CopyOnWriteArrayList<SseEmitter>> courseEmitters =
      new ConcurrentHashMap<>();

  public void addEmitter(UUID courseId, SseEmitter emitter) {
    courseEmitters.computeIfAbsent(courseId, k -> new CopyOnWriteArrayList<>()).add(emitter);
    log.info(
        "Added stats SSE emitter for course: {}, total: {}",
        courseId,
        courseEmitters.get(courseId).size());
  }

  public void removeEmitter(UUID courseId, SseEmitter emitter) {
    CopyOnWriteArrayList<SseEmitter> emitters = courseEmitters.get(courseId);
    if (emitters != null) {
      emitters.remove(emitter);
      log.info(
          "Removed stats SSE emitter for course: {}, remaining: {}", courseId, emitters.size());
      if (emitters.isEmpty()) {
        courseEmitters.remove(courseId);
      }
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
            log.warn("Failed to send stats message to emitter: {}", e.getMessage());
            return true;
          }
        });
  }
}
