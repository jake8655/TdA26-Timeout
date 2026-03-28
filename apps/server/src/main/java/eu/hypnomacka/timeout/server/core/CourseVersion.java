package eu.hypnomacka.timeout.server.core;

import io.ebean.Model;
import io.ebean.annotation.WhenCreated;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "course_versions")
public class CourseVersion extends Model {

  @Id private UUID uuid;

  @ManyToOne(optional = false)
  @JoinColumn(name = "course_uuid", nullable = false)
  private Course course;

  @Column(name = "version_no", nullable = false)
  private Integer versionNo;

  @Lob
  @Column(name = "snapshot_json", nullable = false)
  private String snapshotJson;

  @ManyToOne(optional = false)
  @JoinColumn(name = "created_by_account_uuid", nullable = false)
  private Account createdByAccount;

  @Column(nullable = false)
  private String reason;

  @Column(nullable = false)
  private String source = "manual";

  @WhenCreated private Instant createdAt;

  public CourseVersion() {}

  public CourseVersion(
      Course course,
      Integer versionNo,
      String snapshotJson,
      Account createdByAccount,
      String reason) {
    this.course = course;
    this.versionNo = versionNo;
    this.snapshotJson = snapshotJson;
    this.createdByAccount = createdByAccount;
    this.reason = reason;
    this.source = "manual";
  }
}
