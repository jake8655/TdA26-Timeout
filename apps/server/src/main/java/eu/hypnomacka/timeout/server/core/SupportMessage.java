package eu.hypnomacka.timeout.server.core;

import io.ebean.Model;
import io.ebean.annotation.WhenCreated;
import io.ebean.annotation.WhenModified;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "support_messages")
public class SupportMessage extends Model {

  @Id private UUID uuid;

  @ManyToOne(optional = false)
  @JoinColumn(name = "submitted_by_uuid", nullable = false)
  private Account submittedBy;

  @Column(nullable = false)
  private String subject;

  @Column(name = "page_url", nullable = false)
  private String pageUrl;

  @Column(name = "steps_to_reproduce", nullable = false, columnDefinition = "text")
  private String stepsToReproduce;

  @WhenCreated private Instant createdAt;

  @WhenModified private Instant updatedAt;

  public SupportMessage() {}

  public SupportMessage(Account submittedBy, String subject, String pageUrl, String stepsToReproduce) {
    this.submittedBy = submittedBy;
    this.subject = subject;
    this.pageUrl = pageUrl;
    this.stepsToReproduce = stepsToReproduce;
  }
}
