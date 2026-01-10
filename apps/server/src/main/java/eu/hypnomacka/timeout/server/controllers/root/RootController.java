package eu.hypnomacka.timeout.server.controllers.root;

import eu.hypnomacka.timeout.server.controllers.Controller;
import java.util.Map;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RootController extends Controller {

  @GetMapping(value = "/", produces = MediaType.APPLICATION_JSON_VALUE)
  public Map<String, String> root() {
    return Map.of("organization", "Student Cyber Games");
  }
}
