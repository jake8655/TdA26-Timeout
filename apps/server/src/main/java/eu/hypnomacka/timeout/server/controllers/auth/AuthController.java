package eu.hypnomacka.timeout.server.controllers.auth;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/")
public class AuthController {

    private static final String USERNAME = "lecturer";
    private static final String PASSWORD = "TdA26!";
    public static final Map<String, String> SESSIONS = new ConcurrentHashMap<>();

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody Map<String, String> body, HttpServletResponse response) {
        String username = body.get("username");
        String password = body.get("password");

        if (!USERNAME.equals(username) || !PASSWORD.equals(password)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    Map.of("status", "bad", "message", "invalid credentials")
            );
        }

        String sessionId = UUID.randomUUID().toString();
        SESSIONS.put(sessionId, username);

        Cookie cookie = new Cookie("SESSION_ID", sessionId);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(60 * 60);
        response.addCookie(cookie);

        return ResponseEntity.ok(
                Map.of("status", "ok", "message", "logged in")
        );
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(@CookieValue(value = "SESSION_ID", required = false) String sessionId, HttpServletResponse response) {
        if (sessionId != null) {
            SESSIONS.remove(sessionId);

            Cookie cookie = new Cookie("SESSION_ID", "");
            cookie.setPath("/");
            cookie.setMaxAge(0);
            response.addCookie(cookie);
        }

        return ResponseEntity.ok(
                Map.of("status", "ok", "message", "logged out")
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

}
