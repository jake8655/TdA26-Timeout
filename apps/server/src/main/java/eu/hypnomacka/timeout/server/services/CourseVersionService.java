package eu.hypnomacka.timeout.server.services;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import eu.hypnomacka.timeout.server.core.Account;
import eu.hypnomacka.timeout.server.core.Course;
import eu.hypnomacka.timeout.server.core.CourseVersion;
import eu.hypnomacka.timeout.server.core.Module;
import eu.hypnomacka.timeout.server.core.Question;
import eu.hypnomacka.timeout.server.core.Quiz;
import io.ebean.DB;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class CourseVersionService {

  private final ObjectMapper objectMapper = new ObjectMapper();

  public void createSnapshot(Course course, Account actor, String reason) {
    if (course == null || actor == null) {
      return;
    }

    Integer latestVersion =
        DB.find(CourseVersion.class)
            .where()
            .eq("course.uuid", course.getUuid())
            .orderBy("versionNo desc")
            .setMaxRows(1)
            .findOneOrEmpty()
            .map(CourseVersion::getVersionNo)
            .orElse(0);

    Map<String, Object> snapshot = buildSnapshot(course);
    String payload;
    try {
      payload = objectMapper.writeValueAsString(snapshot);
    } catch (JsonProcessingException e) {
      throw new RuntimeException("failed to serialize course snapshot", e);
    }

    CourseVersion version = new CourseVersion(course, latestVersion + 1, payload, actor, reason);
    version.save();
  }

  private Map<String, Object> buildSnapshot(Course course) {
    Map<String, Object> root = new LinkedHashMap<>();
    root.put("course", Map.of("name", course.getName(), "description", course.getDescription(), "status", course.getStatus().name()));

    List<Map<String, Object>> modules = new ArrayList<>();
    for (Module module : course.getModules()) {
      Map<String, Object> modulePayload = new LinkedHashMap<>();
      modulePayload.put("title", module.getTitle());
      modulePayload.put("description", module.getDescription());
      modulePayload.put("orderIndex", module.getOrderIndex());
      modulePayload.put("visible", module.getVisible());

      List<Map<String, Object>> materials = new ArrayList<>();
      module.getFileAttachments().forEach(file -> materials.add(Map.of("type", "file", "name", file.getName(), "description", file.getDescription() == null ? "" : file.getDescription(), "url", file.getFileUrl(), "sizeBytes", file.getSizeBytes() == null ? 0 : file.getSizeBytes(), "mimeType", file.getMimeType() == null ? "" : file.getMimeType())));
      module.getUrlAttachments().forEach(url -> materials.add(Map.of("type", "url", "name", url.getName(), "description", url.getDescription() == null ? "" : url.getDescription(), "url", url.getUrl(), "faviconUrl", url.getFaviconUrl() == null ? "" : url.getFaviconUrl())));
      modulePayload.put("materials", materials);

      List<Map<String, Object>> quizzes = new ArrayList<>();
      for (Quiz quiz : module.getQuizzes()) {
        Map<String, Object> quizPayload = new LinkedHashMap<>();
        quizPayload.put("title", quiz.getTitle());
        List<Map<String, Object>> questions = new ArrayList<>();
        for (Question question : quiz.getQuestions()) {
          Map<String, Object> questionPayload = new LinkedHashMap<>();
          questionPayload.put("type", question.getType().name());
          questionPayload.put("question", question.getQuestion());
          questionPayload.put("options", question.getOptions());
          questionPayload.put("correctIndex", question.getCorrectIndex());
          questionPayload.put("correctIndices", question.getCorrectIndices());
          questionPayload.put("position", question.getPosition());
          questions.add(questionPayload);
        }
        quizPayload.put("questions", questions);
        quizzes.add(quizPayload);
      }
      modulePayload.put("quizzes", quizzes);

      modules.add(modulePayload);
    }
    root.put("modules", modules);

    return root;
  }
}
