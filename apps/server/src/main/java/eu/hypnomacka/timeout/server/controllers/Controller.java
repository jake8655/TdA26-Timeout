package eu.hypnomacka.timeout.server.controllers;

import eu.hypnomacka.timeout.server.core.Account;
import eu.hypnomacka.timeout.server.core.Branch;
import eu.hypnomacka.timeout.server.core.Course;
import eu.hypnomacka.timeout.server.core.Country;
import eu.hypnomacka.timeout.server.core.Lecturer;
import eu.hypnomacka.timeout.server.core.Session;
import eu.hypnomacka.timeout.server.core.query.QLecturer;
import eu.hypnomacka.timeout.server.core.query.QSession;
import io.ebean.DB;
import java.time.Instant;
import java.util.UUID;

public class Controller {

  public boolean isCookieValid(String sessionId, String username) {
    if (sessionId == null || sessionId.isEmpty() || username == null || username.isEmpty()) {
      return false;
    }

    UUID uuid;
    try {
      uuid = UUID.fromString(sessionId);
    } catch (Exception e) {
      return false;
    }

    Session session = new QSession().uuid.eq(UUID.fromString(sessionId)).findOne();
    if (session == null || session.getExpiresAt() == null) {
      return false;
    }

    Instant now = Instant.now();
    if (!session.getExpiresAt().isAfter(now)) {
      return false;
    }

    Lecturer sessionLecturer = session.getLecturer();
    if (sessionLecturer == null || sessionLecturer.getUsername() == null) {
      return false;
    }

    return sessionLecturer.getUsername().equals(username);
  }

  public boolean isLecturerSession(String sessionId) {
    Session session = getValidSession(sessionId);
    if (session == null) {
      return false;
    }

    if (session.getAccount() != null) {
      return session.getAccount().getRole() == Account.Role.LECTURER;
    }

    return session.getLecturer() != null;
  }

  public boolean isManagerSession(String sessionId) {
    Session session = getValidSession(sessionId);
    if (session == null || session.getAccount() == null) {
      return false;
    }

    return session.getAccount().getRole() == Account.Role.MANAGER;
  }

  public boolean isAdminSession(String sessionId) {
    Session session = getValidSession(sessionId);
    if (session == null || session.getAccount() == null) {
      return false;
    }

    return session.getAccount().getRole() == Account.Role.ADMIN;
  }

  public Session getValidSession(String sessionId) {
    if (sessionId == null || sessionId.isBlank()) {
      return null;
    }

    Session session = new QSession().token.eq(sessionId).findOne();
    if (session == null || session.getExpiresAt() == null) {
      return null;
    }

    if (!session.getExpiresAt().isAfter(Instant.now())) {
      return null;
    }

    return session;
  }

  public Account resolveAccount(Session session) {
    if (session == null) {
      return null;
    }

    if (session.getAccount() != null) {
      return session.getAccount();
    }

    Lecturer lecturer = session.getLecturer();
    if (lecturer == null) {
      return null;
    }

    return DB.find(Account.class).where().eq("username", lecturer.getUsername()).findOne();
  }

  public Lecturer resolveLecturer(Session session) {
    if (session == null) {
      return null;
    }

    if (session.getLecturer() != null) {
      return session.getLecturer();
    }

    Account account = resolveAccount(session);
    if (account == null || account.getRole() != Account.Role.LECTURER) {
      return null;
    }

    return new QLecturer().username.eq(account.getUsername()).findOne();
  }

  public Country resolveCountryFromKey(String countryKey) {
    if (countryKey == null || countryKey.isBlank()) {
      return null;
    }

    int separator = countryKey.lastIndexOf('-');
    if (separator <= 0 || separator == countryKey.length() - 1) {
      return null;
    }

    String isoCode = countryKey.substring(0, separator).toUpperCase();
    long id;
    try {
      id = Long.parseLong(countryKey.substring(separator + 1));
    } catch (NumberFormatException e) {
      return null;
    }

    return DB.find(Country.class)
        .where()
        .eq("id", id)
        .eq("isoCode", isoCode)
        .findOne();
  }

  public Branch resolveBranchFromKey(String branchKey, Country country) {
    if (branchKey == null || branchKey.isBlank() || country == null) {
      return null;
    }

    String normalized = branchKey;
    if (normalized.startsWith("branch-")) {
      normalized = normalized.substring("branch-".length());
    }

    long branchId;
    try {
      branchId = Long.parseLong(normalized);
    } catch (NumberFormatException e) {
      return null;
    }

    return DB.find(Branch.class)
        .where()
        .eq("id", branchId)
        .eq("country.id", country.getId())
        .findOne();
  }

  public boolean canAccessBranch(Session session, Branch branch) {
    if (session == null || branch == null) {
      return false;
    }

    Account account = resolveAccount(session);
    if (account == null) {
      return false;
    }

    if (account.getRole() == Account.Role.ADMIN) {
      return true;
    }

    if (session.getBranch() == null) {
      return false;
    }

    return session.getBranch().getId().equals(branch.getId());
  }

  public boolean canAccessCourse(Session session, Course course) {
    if (session == null || course == null) {
      return false;
    }

    if (course.getBranch() != null) {
      return canAccessBranch(session, course.getBranch());
    }

    if (session.getLecturer() != null && course.getLecturer() != null) {
      return session.getLecturer().getUuid().equals(course.getLecturer().getUuid());
    }

    Account account = resolveAccount(session);
    return account != null && account.getRole() == Account.Role.ADMIN;
  }

  public String resolveSessionToken(String sessionId) {
    if (sessionId == null || sessionId.isBlank()) {
      return null;
    }
    return sessionId;
  }

  public String getOrCreateAnonymousToken(String sessionId) {
    return sessionId == null || sessionId.isBlank() ? UUID.randomUUID().toString() : sessionId;
  }
}
