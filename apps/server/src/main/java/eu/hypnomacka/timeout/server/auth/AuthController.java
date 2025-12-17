package eu.hypnomacka.timeout.server.auth;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class AuthController {

    private static final String USERNAME = "admin";
    private static final String PASSWORD = "password123";

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");

        if (USERNAME.equals(username) && PASSWORD.equals(password)) {
            return ResponseEntity.ok(
                    Map.of(
                            "status", "ok",
                            "message", "logged in"
                    )
            );
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                Map.of(
                        "status", "bad",
                        "message", "invalid credentials"
                )
        );
    }
}
