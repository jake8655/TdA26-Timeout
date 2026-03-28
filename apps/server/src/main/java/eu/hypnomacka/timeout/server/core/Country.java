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
@Table(name = "countries")
public class Country extends Model {

  public enum Status {
    ACTIVE,
    ONBOARDING,
    WAITING
  }

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "iso_code", nullable = false, unique = true, length = 2)
  private String isoCode;

  @Column(nullable = false)
  private String name;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  @DbDefault("ACTIVE")
  private Status status = Status.ACTIVE;

  @WhenCreated private Instant createdAt;

  @WhenModified private Instant updatedAt;

  public Country() {}

  public Country(String isoCode, String name, Status status) {
    this.isoCode = isoCode;
    this.name = name;
    this.status = status;
  }

  public String getCountryKey() {
    if (isoCode == null || id == null) {
      return null;
    }
    return isoCode.toLowerCase() + "-" + id;
  }
}
