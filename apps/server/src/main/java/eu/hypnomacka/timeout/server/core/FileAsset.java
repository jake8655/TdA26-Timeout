package eu.hypnomacka.timeout.server.core;

import io.ebean.Model;
import io.ebean.annotation.DbDefault;
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
@Table(name = "file_assets")
public class FileAsset extends Model {

  public enum RetentionState {
    ACTIVE,
    SOFT_DELETED,
    PROTECTED
  }

  @Id private UUID uuid;

  @Column(name = "storage_key", nullable = false, unique = true)
  private String storageKey;

  @Column(nullable = false)
  private String checksum;

  @Column(name = "mime_type", nullable = false)
  private String mimeType;

  @Column(name = "size_bytes", nullable = false)
  private Long sizeBytes;

  @Enumerated(EnumType.STRING)
  @Column(name = "retention_state", nullable = false)
  @DbDefault("ACTIVE")
  private RetentionState retentionState = RetentionState.ACTIVE;

  @Column(name = "deleted_at")
  private Instant deletedAt;

  @WhenCreated private Instant createdAt;

  @WhenModified private Instant updatedAt;

  public FileAsset() {}

  public FileAsset(String storageKey, String checksum, String mimeType, Long sizeBytes) {
    this.storageKey = storageKey;
    this.checksum = checksum;
    this.mimeType = mimeType;
    this.sizeBytes = sizeBytes;
    this.retentionState = RetentionState.ACTIVE;
  }
}
