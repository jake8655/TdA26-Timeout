package eu.hypnomacka.timeout.server.services;

import eu.hypnomacka.timeout.server.controllers.feed.CourseFeedService;
import eu.hypnomacka.timeout.server.core.Course;
import eu.hypnomacka.timeout.server.core.Course.Status;
import eu.hypnomacka.timeout.server.core.CourseJoin;
import eu.hypnomacka.timeout.server.core.Event;
import eu.hypnomacka.timeout.server.core.query.QCourse;
import eu.hypnomacka.timeout.server.core.query.QCourseJoin;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class CourseLifecycleService {

  private final CourseFeedService feedService;

  @Scheduled(fixedDelay = 60000)
  public void applyScheduledTransitions() {
    Instant now = Instant.now();

    List<Course> scheduledCourses =
        new QCourse()
            .status
            .in(Status.SCHEDULED, Status.PAUSED)
            .scheduledStartAt
            .isNotNull()
            .findList();
    for (Course course : scheduledCourses) {
      Instant startAt = course.getScheduledStartAt();
      if (startAt != null && !startAt.isAfter(now)) {
        transitionToLive(course, "Course started automatically");
      }
    }

    List<Course> endBoundCourses =
        new QCourse().status.in(Status.LIVE, Status.PAUSED).scheduledEndAt.isNotNull().findList();
    for (Course course : endBoundCourses) {
      Instant endAt = course.getScheduledEndAt();
      if (endAt != null && !endAt.isAfter(now)) {
        transitionToArchived(course, "Course ended automatically");
        deactivateJoins(course);
        feedService.broadcastMessage(
            course.getUuid(),
            "course_kick",
            String.format(
                "{\"reason\":\"Course ended"
                    + " automatically\",\"status\":\"%s\",\"effectiveAt\":\"%s\"}",
                Status.ARCHIVED.name(), Instant.now()));
      }
    }
  }

  public void transitionToLive(Course course, String reason) {
    course.setStatus(Status.LIVE);
    course.setLastWentLiveAt(Instant.now());
    course.setPausedAt(null);
    course.save();
    createSystemEvent(course, reason);
  }

  public void transitionToPaused(Course course, String reason) {
    course.setStatus(Status.PAUSED);
    course.setPausedAt(Instant.now());
    course.save();
    createSystemEvent(course, reason);
  }

  public void transitionToScheduled(Course course, Instant startAt, Instant endAt, String reason) {
    course.setStatus(Status.SCHEDULED);
    course.setScheduledStartAt(startAt);
    course.setScheduledEndAt(endAt);
    course.setPausedAt(null);
    course.save();
    createSystemEvent(course, reason);
  }

  public void transitionToArchived(Course course, String reason) {
    course.setStatus(Status.ARCHIVED);
    course.setArchivedAt(Instant.now());
    course.save();
    createSystemEvent(course, reason);
  }

  public void deactivateJoins(Course course) {
    List<CourseJoin> joins = new QCourseJoin().course.eq(course).active.eq(true).findList();
    for (CourseJoin join : joins) {
      join.setActive(false);
      join.setLastSeenAt(Instant.now());
      join.save();
    }
  }

  public void transitionToDraft(Course course, String reason) {
    course.setStatus(Status.DRAFT);
    course.setScheduledStartAt(null);
    course.setScheduledEndAt(null);
    course.setPausedAt(null);
    course.setArchivedAt(null);
    course.save();
    createSystemEvent(course, reason);
  }

  public void createSystemEvent(Course course, String message) {
    Event event = new Event();
    event.setUuid(UUID.randomUUID());
    event.setCourse(course);
    event.setType(Event.Type.SYSTEM);
    event.setMessage(message);
    event.setEdited(false);
    event.save();
  }
}
