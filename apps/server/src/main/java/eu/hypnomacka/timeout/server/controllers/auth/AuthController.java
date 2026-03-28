package eu.hypnomacka.timeout.server.controllers.auth;

import eu.hypnomacka.timeout.server.controllers.Controller;
import eu.hypnomacka.timeout.server.core.Account;
import eu.hypnomacka.timeout.server.core.Branch;
import eu.hypnomacka.timeout.server.core.Country;
import eu.hypnomacka.timeout.server.core.Lecturer;
import eu.hypnomacka.timeout.server.core.Session;
import io.ebean.DB;
import eu.hypnomacka.timeout.server.core.query.QLecturer;
import eu.hypnomacka.timeout.server.core.query.QSession;
import eu.hypnomacka.timeout.server.utils.HashUtil;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController extends Controller {

  @PostMapping("/login")
  public ResponseEntity<Map<String, String>> login(
      @RequestBody Map<String, String> body, HttpServletResponse response) {
    return doLogin(body, null, response);
  }

  @PostMapping("/tenants/{countryKey}/login")
  public ResponseEntity<Map<String, String>> tenantLogin(
      @PathVariable String countryKey,
      @RequestBody Map<String, String> body,
      HttpServletResponse response) {
    return doLogin(body, countryKey, response);
  }

  private ResponseEntity<Map<String, String>> doLogin(
      Map<String, String> body, String countryKey, HttpServletResponse response) {
    String username = body.get("username");
    String password = body.get("password");

    if (username == null || password == null || username.isBlank() || password.isBlank()) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("status", "bad", "message", "missing credentials"));
    }

    Account account = DB.find(Account.class).where().eq("username", username).findOne();
    if (account != null && HashUtil.verifyPassword(password, account.getHashedPass())) {
      Country scopedCountry = null;
      Branch scopedBranch = null;

      if (countryKey != null && !countryKey.isBlank()) {
        scopedCountry = resolveCountryFromKey(countryKey);
        if (scopedCountry == null) {
          return ResponseEntity.status(HttpStatus.BAD_REQUEST)
              .body(Map.of("status", "bad", "message", "invalid country key"));
        }
      }

      if (account.getRole() == Account.Role.MANAGER || account.getRole() == Account.Role.LECTURER) {
        Branch managedBranch =
            DB.find(Branch.class)
                .where()
                .or()
                .eq("managerAccount.uuid", account.getUuid())
                .eq("lecturerAccount.uuid", account.getUuid())
                .endOr()
                .findOne();
        if (managedBranch == null) {
          return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
              .body(Map.of("status", "bad", "message", "account has no branch"));
        }
        scopedBranch = managedBranch;
        scopedCountry = managedBranch.getCountry();
      }

      String sessionId = generateNewToken();
      Cookie cookie = new Cookie("SESSION_ID", sessionId);
      cookie.setHttpOnly(true);
      cookie.setPath("/");
      cookie.setMaxAge(60 * 60 * 24 * 30);
      response.addCookie(cookie);

      Session session =
          new Session(account, scopedCountry, scopedBranch, sessionId, Instant.now().plus(Duration.ofDays(30)));
      session.save();

      return ResponseEntity.ok(Map.of("status", "ok", "message", "logged in"));
    }

    Lecturer lecturer = new QLecturer().username.eq(username).findOne();
    if (lecturer == null || !HashUtil.verifyPassword(password, lecturer.getHashedPass())) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(Map.of("status", "bad", "message", "invalid credentials"));
    }

    String sessionId = generateNewToken();

    Cookie cookie = new Cookie("SESSION_ID", sessionId);
    cookie.setHttpOnly(true);
    cookie.setPath("/");
    cookie.setMaxAge(60 * 60 * 24 * 30); // 30 days
    response.addCookie(cookie);
    Session session =
        new Session(lecturer, sessionId, Instant.now().plus(Duration.ofDays(30))); // 30 days
    session.save();

    return ResponseEntity.ok(Map.of("status", "ok", "message", "logged in"));
  }

  @PostMapping("/logout")
  public ResponseEntity<Map<String, String>> logout(
      @CookieValue(value = "SESSION_ID", required = false) String sessionId,
      HttpServletResponse response) {
    if (sessionId != null && !sessionId.isEmpty()) {
      Session session = new QSession().token.eq(sessionId).findOne();
      if (!session.delete()) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(Map.of("status", "bad", "message", "failed to delete session"));
      }

      Cookie cookie = new Cookie("SESSION_ID", null);
      cookie.setPath("/");
      cookie.setMaxAge(0);
      cookie.setHttpOnly(true);

      response.addCookie(cookie);
    } else {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(Map.of("status", "bad", "message", "not logged in"));
    }

    return ResponseEntity.ok(Map.of("status", "ok", "message", "logged out"));
  }

  @GetMapping("/me")
  public ResponseEntity<Map<String, String>> self(
      @CookieValue(value = "SESSION_ID", required = false) String sessionId,
      HttpServletResponse response) {
    if (sessionId == null || sessionId.isEmpty()) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(Map.of("status", "bad", "message", "not logged in"));
    }

    Session session = new QSession().token.eq(sessionId).findOne();
    if (session == null || session.getExpiresAt().isBefore(Instant.now())) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(Map.of("status", "bad", "message", "session expired"));
    }

    Account account = resolveAccount(session);
    if (account != null) {
      String countryKey = session.getCountry() == null ? "" : session.getCountry().getCountryKey();
      String countryId = session.getCountry() == null ? "" : String.valueOf(session.getCountry().getId());
      String branchId = session.getBranch() == null ? "" : String.valueOf(session.getBranch().getId());
      String branchKey = session.getBranch() == null ? "" : session.getBranch().getBranchKey();
      String branchName = session.getBranch() == null ? "" : session.getBranch().getName();
      String displayName = account.getDisplayName() == null ? account.getUsername() : account.getDisplayName();

      return ResponseEntity.ok(
          Map.of(
              "status", "ok",
              "username", account.getUsername(),
              "displayName", displayName,
              "role", account.getRole().name().toLowerCase(),
              "countryKey", countryKey,
              "countryId", countryId,
              "branchId", branchId,
              "branchKey", branchKey,
              "branchName", branchName));
    }

    if (session.getLecturer() != null) {
      return ResponseEntity.ok(
          Map.of(
              "status", "ok",
              "username", session.getLecturer().getUsername(),
              "displayName", session.getLecturer().getUsername(),
              "role", "lecturer",
              "countryKey", "",
              "countryId", "",
              "branchId", "",
              "branchKey", "",
              "branchName", ""));
    }

    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
        .body(Map.of("status", "bad", "message", "session not linked to account"));
  }

  @PostMapping("/register")
  public ResponseEntity<Map<String, String>> register(
      @RequestBody Map<String, String> body, HttpServletResponse response) {
    String username = body.get("username");
    String password = body.get("password");

    if (username.length() < 4 || !isPasswordValid(password)) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(Map.of("status", "bad", "message", "invalid credentials"));
    }

    // create new user here

    return ResponseEntity.ok(Map.of("status", "ok", "message", "registered"));
  }

  public boolean isPasswordValid(String password) {
    if (password.length() < 8
        && password.matches(".*\\d.*")
        && password.matches(".*[^a-zA-Z0-9].*")) {
      return true;
    } else {
      return false;
    }
  }

  private static final SecureRandom secureRandom = new SecureRandom();
  private static final Base64.Encoder base64Encoder = Base64.getUrlEncoder();

  public static String generateNewToken() {
    byte[] randomBytes = new byte[24];
    secureRandom.nextBytes(randomBytes);
    return base64Encoder.encodeToString(randomBytes);
  }
}
