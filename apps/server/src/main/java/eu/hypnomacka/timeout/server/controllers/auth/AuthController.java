package eu.hypnomacka.timeout.server.controllers.auth;

import eu.hypnomacka.timeout.server.controllers.Controller;
import eu.hypnomacka.timeout.server.core.Lecturer;
import eu.hypnomacka.timeout.server.core.Session;
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
    String username = body.get("username");
    String password = body.get("password");

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
    if (sessionId != null && !sessionId.isEmpty()) {
      Session session = new QSession().token.eq(sessionId).findOne();

      if (session == null || session.getExpiresAt().isBefore(Instant.now())) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(Map.of("status", "bad", "message", "session expired"));
      }

      return ResponseEntity.ok(
          Map.of(
              "status",
              "ok",
              "message",
              "returning username",
              "username",
              session.getLecturer().getUsername()));
    }
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
        .body(Map.of("status", "bad", "message", "not logged in"));
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
