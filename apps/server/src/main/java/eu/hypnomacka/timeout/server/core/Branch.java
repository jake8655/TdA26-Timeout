package eu.hypnomacka.timeout.server.core;

import io.ebean.Model;
import io.ebean.annotation.DbDefault;
import io.ebean.annotation.WhenCreated;
import io.ebean.annotation.WhenModified;
import jakarta.persistence.*;
import java.time.Instant;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "branches")
public class Branch extends Model {

  public enum Type {
    HQ,
    BRANCH
  }

  public enum Status {
    ACTIVE,
    ONBOARDING,
    WAITING
  }

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(optional = false)
  @JoinColumn(name = "country_id", nullable = false)
  private Country country;

  @Column(nullable = false)
  private String name;

  @Column(nullable = false)
  private String city;

  @Column(nullable = false)
  private String address;

  @Column(name = "postal_code", nullable = false)
  private String postalCode;

  @Column(nullable = false)
  private String region;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private Type type;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  @DbDefault("ACTIVE")
  private Status status = Status.ACTIVE;

  @ManyToOne(optional = false)
  @JoinColumn(name = "manager_account_uuid", nullable = false, unique = true)
  private Account managerAccount;

  @ManyToOne(optional = false)
  @JoinColumn(name = "lecturer_account_uuid", nullable = false, unique = true)
  private Account lecturerAccount;

  @WhenCreated private Instant createdAt;

  @WhenModified private Instant updatedAt;

  public Branch() {}

  public Branch(
      Country country,
      String name,
      String city,
      String address,
      String postalCode,
      String region,
      Type type,
      Status status,
      Account managerAccount,
      Account lecturerAccount) {
    this.country = country;
    this.name = name;
    this.city = city;
    this.address = address;
    this.postalCode = postalCode;
    this.region = region;
    this.type = type;
    this.status = status;
    this.managerAccount = managerAccount;
    this.lecturerAccount = lecturerAccount;
  }

  public String getBranchKey() {
    if (id == null) {
      return null;
    }
    return "branch-" + id;
  }
}
