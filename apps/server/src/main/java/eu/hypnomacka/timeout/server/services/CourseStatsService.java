package eu.hypnomacka.timeout.server.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import eu.hypnomacka.timeout.server.core.Course;
import eu.hypnomacka.timeout.server.core.CourseStats;
import io.ebean.DB;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class CourseStatsService {

  private final ObjectMapper objectMapper;
  private final CourseStatsSseService statsSseService;

  public CourseStats getOrCreate(Course course) {
    CourseStats stats =
        DB.find(CourseStats.class).where().eq("course.uuid", course.getUuid()).findOne();
    if (stats == null) {
      stats = new CourseStats(course);
      stats.save();
    }
    return stats;
  }

  public void recordQuizResult(Course course, double score, double maxScore) {
    CourseStats stats = getOrCreate(course);
    stats.setTotalSubmissions(stats.getTotalSubmissions() + 1);
    stats.setTotalScoreSum(stats.getTotalScoreSum() + score);
    stats.setTotalMaxScoreSum(stats.getTotalMaxScoreSum() + maxScore);
    double percentage = maxScore > 0 ? (score / maxScore) * 100.0 : 0.0;
    stats.setTotalPercentageSum(stats.getTotalPercentageSum() + percentage);
    stats.save();

    if (course.getStatus() == Course.Status.LIVE) {
      broadcastStats(course.getUuid(), stats);
    }
  }

  public void recordMaterialInteraction(Course course) {
    CourseStats stats = getOrCreate(course);
    stats.setMaterialInteractions(stats.getMaterialInteractions() + 1);
    stats.save();

    if (course.getStatus() == Course.Status.LIVE) {
      broadcastStats(course.getUuid(), stats);
    }
  }

  private void broadcastStats(UUID courseId, CourseStats stats) {
    try {
      String data =
          objectMapper.writeValueAsString(
              Map.of(
                  "totalSubmissions", stats.getTotalSubmissions(),
                  "avgScore",
                      stats.getTotalSubmissions() > 0
                          ? stats.getTotalScoreSum() / stats.getTotalSubmissions()
                          : 0.0,
                  "avgMaxScore",
                      stats.getTotalSubmissions() > 0
                          ? stats.getTotalMaxScoreSum() / stats.getTotalSubmissions()
                          : 0.0,
                  "avgPercentage",
                      stats.getTotalSubmissions() > 0
                          ? stats.getTotalPercentageSum() / stats.getTotalSubmissions()
                          : 0.0,
                  "materialInteractions", stats.getMaterialInteractions(),
                  "updatedAt",
                      stats.getUpdatedAt() != null ? stats.getUpdatedAt().toString() : ""));
      statsSseService.broadcastMessage(courseId, "stats_update", data);
    } catch (Exception e) {
      log.error("Error broadcasting stats: {}", e.getMessage(), e);
    }
  }
}
