package eu.hypnomacka.timeout.server.controllers.auth;

import eu.hypnomacka.timeout.server.core.Lecturer;
import eu.hypnomacka.timeout.server.core.Session;
import eu.hypnomacka.timeout.server.core.query.QLecturer;
import eu.hypnomacka.timeout.server.core.query.QSession;
import eu.hypnomacka.timeout.server.utils.HashUtil;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.TemporalAmount;
import java.util.Base64;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private static final String USERNAME = "lecturer";
    private static final String PASSWORD = "TdA26!";

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody Map<String, String> body, HttpServletResponse response) {
        String username = body.get("username");
        String password = body.get("password");

        Lecturer lecturer = new QLecturer().username.eq(username).findOne();
        if (lecturer == null || !HashUtil.verifyPassword(password, lecturer.getHashedPass())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    Map.of("status", "bad", "message", "invalid credentials")
            );
        }

        String sessionId = generateNewToken();

        Cookie cookie = new Cookie("SESSION_ID", sessionId);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(2592000);
        response.addCookie(cookie);
        Session session = new Session(lecturer, sessionId, Instant.now().plusMillis(2592000));
        session.save();

        return ResponseEntity.ok(
                Map.of("status", "ok", "message", "logged in")
        );
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(@CookieValue(value = "SESSION_ID", required = false) String sessionId, HttpServletResponse response) {
        if (sessionId != null && !sessionId.isEmpty()) {
            Session session = new QSession().token.eq(sessionId).findOne();
            if(!session.delete()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    Map.of("status", "bad", "message", "failed to delete session")
                );
            }

            Cookie cookie = new Cookie("SESSION_ID", null);
            cookie.setPath("/");
            cookie.setMaxAge(0);
            cookie.setHttpOnly(true);

            response.addCookie(cookie);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    Map.of("status", "bad", "message", "not logged in")
            );
        }

        return ResponseEntity.ok(
                Map.of("status", "ok", "message", "logged out")
        );
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, String>> self(@CookieValue(value = "SESSION_ID", required = false) String sessionId, HttpServletResponse response) {
        if (sessionId != null && !sessionId.isEmpty()) {
            Session session = new QSession().token.eq(sessionId).findOne();

            return ResponseEntity.ok(
                Map.of("status", "ok", "message", "returning username", "username", session.getLecturer().getUsername())
            );
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
            Map.of("status", "bad", "message", "not logged in")
        );
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@RequestBody Map<String, String> body, HttpServletResponse response) {
        String username = body.get("username");
        String password = body.get("password");

        if (username.length() < 4 || !isPasswordValid(password)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    Map.of("status", "bad", "message", "invalid credentials")
            );
        }

        //create new user here

        return ResponseEntity.ok(
                Map.of("status", "ok", "message", "registered")
        );
    }

    public boolean isPasswordValid(String password) {
        if(password.length() < 8 &&
                password.matches(".*\\d.*") &&
                password.matches(".*[^a-zA-Z0-9].*")
        ) {
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

    public boolean isCookieValid(String sessionId, String username) {
        Lecturer l = new QLecturer().username.eq(username).findOne();
        Cookie cookie = new Cookie("SESSION_ID", sessionId);
        if(cookie.getMaxAge() > 0 && l != null) {
            return true;
        } else {
            return false;
        }
    }

}
