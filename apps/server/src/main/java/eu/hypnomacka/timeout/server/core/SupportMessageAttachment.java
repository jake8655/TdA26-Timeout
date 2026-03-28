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
@Table(name = "support_message_attachments")
public class SupportMessageAttachment extends Model {

  @Id private UUID uuid;

  @ManyToOne(optional = false)
  @JoinColumn(name = "support_message_uuid", nullable = false)
  private SupportMessage supportMessage;

  @OneToOne(optional = false)
  @JoinColumn(name = "asset_uuid", nullable = false)
  private FileAsset asset;

  @Column(name = "file_name", nullable = false)
  private String fileName;

  @Column(name = "file_url", nullable = false)
  private String fileUrl;

  @Column(name = "mime_type", nullable = false)
  private String mimeType;

  @Column(name = "size_bytes", nullable = false)
  private Long sizeBytes;

  @WhenCreated private Instant createdAt;

  @WhenModified private Instant updatedAt;

  public SupportMessageAttachment() {}

  public SupportMessageAttachment(
      SupportMessage supportMessage,
      FileAsset asset,
      String fileName,
      String fileUrl,
      String mimeType,
      Long sizeBytes) {
    this.supportMessage = supportMessage;
    this.asset = asset;
    this.fileName = fileName;
    this.fileUrl = fileUrl;
    this.mimeType = mimeType;
    this.sizeBytes = sizeBytes;
  }
}
