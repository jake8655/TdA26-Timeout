package eu.hypnomacka.timeout.server.core;

import com.fasterxml.jackson.annotation.JsonIgnore;
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
@Table(name = "accounts")
public class Account extends Model {

  public enum Role {
    ADMIN,
    MANAGER,
    LECTURER
  }

  public enum Status {
    ACTIVE,
    DISABLED
  }

  @Id private UUID uuid;

  @Column(nullable = false, unique = true)
  private String username;

  @JsonIgnore
  @Column(name = "hashed_pass", nullable = false)
  private String hashedPass;

  @Column(name = "display_name", nullable = false)
  private String displayName;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private Role role;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  @DbDefault("ACTIVE")
  private Status status = Status.ACTIVE;

  @WhenCreated private Instant createdAt;

  @WhenModified private Instant updatedAt;

  public Account() {}

  public Account(String username, String hashedPass, String displayName, Role role) {
    this.username = username;
    this.hashedPass = hashedPass;
    this.displayName = displayName;
    this.role = role;
    this.status = Status.ACTIVE;
  }
}
