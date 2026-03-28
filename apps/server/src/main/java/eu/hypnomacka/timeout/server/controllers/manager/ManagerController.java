package eu.hypnomacka.timeout.server.controllers.manager;

import eu.hypnomacka.timeout.server.controllers.Controller;
import eu.hypnomacka.timeout.server.core.Account;
import eu.hypnomacka.timeout.server.core.Branch;
import eu.hypnomacka.timeout.server.core.Session;
import eu.hypnomacka.timeout.server.utils.HashUtil;
import io.ebean.DB;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/manager")
public class ManagerController extends Controller {

  @GetMapping("/branch")
  public ResponseEntity<?> branch(@CookieValue(value = "SESSION_ID", required = false) String sessionId) {
    Session session = getValidSession(sessionId);
    if (session == null || !isManagerSession(sessionId) || session.getBranch() == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(Map.of("status", "bad", "message", "unauthorized"));
    }

    Branch branch = DB.find(Branch.class, session.getBranch().getId());
    if (branch == null) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND)
          .body(Map.of("status", "bad", "message", "branch not found"));
    }

    Map<String, Object> payload = new LinkedHashMap<>();
    payload.put("id", branch.getId());
    payload.put("countryId", branch.getCountry().getId());
    payload.put("countryKey", branch.getCountry().getCountryKey());
    payload.put("name", branch.getName());
    payload.put("city", branch.getCity());
    payload.put("address", branch.getAddress());
    payload.put("postalCode", branch.getPostalCode());
    payload.put("region", branch.getRegion());
    payload.put("type", branch.getType().name().toLowerCase());
    payload.put("status", branch.getStatus().name().toLowerCase());
    payload.put("lecturerAccountId", branch.getLecturerAccount().getUuid().toString());
    payload.put("lecturerUsername", branch.getLecturerAccount().getUsername());

    return ResponseEntity.ok(payload);
  }

  @PutMapping("/branch")
  public ResponseEntity<?> updateBranch(
      @CookieValue(value = "SESSION_ID", required = false) String sessionId,
      @RequestBody UpdateBranchRequest request) {
    Session session = getValidSession(sessionId);
    if (session == null || !isManagerSession(sessionId) || session.getBranch() == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(Map.of("status", "bad", "message", "unauthorized"));
    }

    Branch branch = DB.find(Branch.class, session.getBranch().getId());
    if (branch == null) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND)
          .body(Map.of("status", "bad", "message", "branch not found"));
    }

    if (request.getName() != null && !request.getName().isBlank()) {
      branch.setName(request.getName());
    }
    if (request.getCity() != null && !request.getCity().isBlank()) {
      branch.setCity(request.getCity());
    }
    if (request.getAddress() != null && !request.getAddress().isBlank()) {
      branch.setAddress(request.getAddress());
    }
    if (request.getPostalCode() != null && !request.getPostalCode().isBlank()) {
      branch.setPostalCode(request.getPostalCode());
    }
    if (request.getRegion() != null && !request.getRegion().isBlank()) {
      branch.setRegion(request.getRegion());
    }
    if (request.getType() != null && !request.getType().isBlank()) {
      branch.setType("HQ".equalsIgnoreCase(request.getType()) ? Branch.Type.HQ : Branch.Type.BRANCH);
    }
    if (request.getStatus() != null && !request.getStatus().isBlank()) {
      branch.setStatus(
          switch (request.getStatus().toUpperCase()) {
            case "ONBOARDING" -> Branch.Status.ONBOARDING;
            case "WAITING" -> Branch.Status.WAITING;
            default -> Branch.Status.ACTIVE;
          });
    }

    branch.save();
    return ResponseEntity.ok(Map.of("status", "ok"));
  }

  @PutMapping("/lecturer/credentials")
  public ResponseEntity<?> updateLecturerCredentials(
      @CookieValue(value = "SESSION_ID", required = false) String sessionId,
      @RequestBody UpdateLecturerCredentialsRequest request) {
    Session session = getValidSession(sessionId);
    if (session == null || !isManagerSession(sessionId) || session.getBranch() == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(Map.of("status", "bad", "message", "unauthorized"));
    }

    Branch branch = DB.find(Branch.class, session.getBranch().getId());
    if (branch == null || branch.getLecturerAccount() == null) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND)
          .body(Map.of("status", "bad", "message", "lecturer not found"));
    }

    Account lecturer = DB.find(Account.class, branch.getLecturerAccount().getUuid());
    if (lecturer == null || lecturer.getRole() != Account.Role.LECTURER) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND)
          .body(Map.of("status", "bad", "message", "lecturer not found"));
    }

    if (request.getUsername() != null && !request.getUsername().isBlank()) {
      Account existing =
          DB.find(Account.class)
              .where()
              .eq("username", request.getUsername())
              .ne("uuid", lecturer.getUuid())
              .findOne();
      if (existing != null) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
            .body(Map.of("status", "bad", "message", "username already in use"));
      }
      lecturer.setUsername(request.getUsername());
    }

    if (request.getPassword() != null && !request.getPassword().isBlank()) {
      lecturer.setHashedPass(HashUtil.hashPassword(request.getPassword()));
    }

    lecturer.save();
    return ResponseEntity.ok(Map.of("status", "ok"));
  }

  public static class UpdateBranchRequest {
    private String name;
    private String city;
    private String address;
    private String postalCode;
    private String region;
    private String type;
    private String status;

    public String getName() {
      return name;
    }

    public String getCity() {
      return city;
    }

    public String getAddress() {
      return address;
    }

    public String getPostalCode() {
      return postalCode;
    }

    public String getRegion() {
      return region;
    }

    public String getType() {
      return type;
    }

    public String getStatus() {
      return status;
    }
  }

  public static class UpdateLecturerCredentialsRequest {
    private String username;
    private String password;

    public String getUsername() {
      return username;
    }

    public String getPassword() {
      return password;
    }
  }
}
