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
@Table(name = "sessions")
public class Session extends Model {

  @Id private UUID uuid;

  @DbDefault("")
  @Column(nullable = false)
  private String token;

  @ManyToOne(optional = true)
  @JoinColumn(name = "account_uuid")
  private Account account;

  @ManyToOne(optional = true)
  @JoinColumn(name = "lecturer_uuid")
  private Lecturer lecturer;

  @Enumerated(EnumType.STRING)
  @Column(name = "role_snapshot")
  private Account.Role roleSnapshot;

  @ManyToOne(optional = true)
  @JoinColumn(name = "country_id")
  private Country country;

  @ManyToOne(optional = true)
  @JoinColumn(name = "branch_id")
  private Branch branch;

  @WhenCreated private Instant createdAt;

  @WhenModified private Instant updatedAt;

  @Column(nullable = false)
  private Instant expiresAt;

  public Session() {}

  public Session(Lecturer lecturer, String token, Instant expiresAt) {
    this.lecturer = lecturer;
    this.account = null;
    this.token = token;
    this.expiresAt = expiresAt;
  }

  public Session(Account account, Country country, Branch branch, String token, Instant expiresAt) {
    this.account = account;
    this.roleSnapshot = account == null ? null : account.getRole();
    this.country = country;
    this.branch = branch;
    this.token = token;
    this.expiresAt = expiresAt;
  }
}
