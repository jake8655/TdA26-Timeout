package eu.hypnomacka.timeout.server.controllers.users;

import eu.hypnomacka.timeout.server.entities.User;
import eu.hypnomacka.timeout.server.entities.query.QUser;
import io.ebean.DB;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/users")
public class UserController {

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public List<User> getAllUsers() {
        List<User> users = new QUser().name.equalTo("meno").findList();
        return users;
    }

    @PostMapping(value = "/create", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<User> createUser(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        if (name == null || name.isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        User user = new User(name);
        user.save();

        return ResponseEntity.ok(user);
    }
}
