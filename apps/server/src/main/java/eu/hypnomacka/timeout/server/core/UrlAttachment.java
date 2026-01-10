package eu.hypnomacka.timeout.server.core;

import com.fasterxml.jackson.annotation.JsonBackReference;
import io.ebean.Model;
import io.ebean.annotation.DbDefault;
import io.ebean.annotation.DbEnumValue;
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
@Table(name = "url_attachments")
public class UrlAttachment extends Model {

  public enum Type {
    url("url");

    private final String dbValue;

    Type(String dbValue) {
      this.dbValue = dbValue;
    }

    @DbEnumValue
    public String getDbValue() {
      return dbValue;
    }
  }

  @Id private UUID uuid;

  @ManyToOne(optional = false)
  @JoinColumn(name = "course_uuid", nullable = false)
  @JsonBackReference
  private Course course;

  @Column(nullable = false)
  private String name;

  @Column(nullable = false)
  private String url;

  @Column private String description;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  @DbDefault("url")
  private Type type;

  @Column(nullable = false)
  private String faviconUrl;

  @WhenCreated private Instant createdAt;

  @WhenModified private Instant updatedAt;

  public UrlAttachment() {}

  public UrlAttachment(
      Course course, String name, String url, String description, Type type, String faviconUrl) {
    this.course = course;
    this.name = name;
    this.url = url;
    this.description = description;
    this.type = type;
    this.faviconUrl = faviconUrl;
  }
}
