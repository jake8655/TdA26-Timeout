package eu.hypnomacka.timeout.server.controllers.admin;

import eu.hypnomacka.timeout.server.controllers.Controller;
import eu.hypnomacka.timeout.server.core.Account;
import eu.hypnomacka.timeout.server.core.Branch;
import eu.hypnomacka.timeout.server.core.Country;
import eu.hypnomacka.timeout.server.utils.HashUtil;
import io.ebean.DB;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.Data;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin")
public class AdminController extends Controller {

  @GetMapping("/countries")
  public ResponseEntity<?> listCountries(
      @CookieValue(value = "SESSION_ID", required = false) String sessionId) {
    if (!isAdminSession(sessionId)) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(Map.of("status", "bad", "message", "unauthorized"));
    }

    List<Country> countries = DB.find(Country.class).orderBy("id desc").findList();
    return ResponseEntity.ok(countries);
  }

  @PostMapping("/countries")
  public ResponseEntity<?> createCountry(
      @CookieValue(value = "SESSION_ID", required = false) String sessionId,
      @RequestBody CreateCountryRequest request) {
    if (!isAdminSession(sessionId)) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(Map.of("status", "bad", "message", "unauthorized"));
    }

    if (request.getIsoCode() == null || request.getIsoCode().length() != 2 || request.getName() == null || request.getName().isBlank()) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("status", "bad", "message", "invalid payload"));
    }

    Country existing = DB.find(Country.class).where().eq("isoCode", request.getIsoCode().toUpperCase()).findOne();
    if (existing != null) {
      return ResponseEntity.status(HttpStatus.CONFLICT)
          .body(Map.of("status", "bad", "message", "country already exists"));
    }

    Country country = new Country(request.getIsoCode().toUpperCase(), request.getName(), parseCountryStatus(request.getStatus()));
    country.save();
    return ResponseEntity.status(HttpStatus.CREATED).body(country);
  }

  @PutMapping("/countries/{countryId}")
  public ResponseEntity<?> updateCountry(
      @PathVariable Long countryId,
      @CookieValue(value = "SESSION_ID", required = false) String sessionId,
      @RequestBody UpdateCountryRequest request) {
    if (!isAdminSession(sessionId)) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(Map.of("status", "bad", "message", "unauthorized"));
    }

    Country country = DB.find(Country.class, countryId);
    if (country == null) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND)
          .body(Map.of("status", "bad", "message", "country not found"));
    }

    if (request.getName() != null && !request.getName().isBlank()) {
      country.setName(request.getName());
    }
    if (request.getStatus() != null) {
      country.setStatus(parseCountryStatus(request.getStatus()));
    }
    country.save();

    return ResponseEntity.ok(country);
  }

  @DeleteMapping("/countries/{countryId}")
  public ResponseEntity<?> deleteCountry(
      @PathVariable Long countryId,
      @CookieValue(value = "SESSION_ID", required = false) String sessionId) {
    if (!isAdminSession(sessionId)) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(Map.of("status", "bad", "message", "unauthorized"));
    }

    Country country = DB.find(Country.class, countryId);
    if (country == null) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND)
          .body(Map.of("status", "bad", "message", "country not found"));
    }

    long branchCount = DB.find(Branch.class).where().eq("country.id", countryId).findCount();
    if (branchCount > 0) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("status", "bad", "message", "country has branches"));
    }

    country.delete();
    return ResponseEntity.noContent().build();
  }

  @GetMapping("/branches")
  public ResponseEntity<?> listBranches(
      @CookieValue(value = "SESSION_ID", required = false) String sessionId,
      @RequestParam(value = "countryId", required = false) Long countryId) {
    if (!isAdminSession(sessionId)) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(Map.of("status", "bad", "message", "unauthorized"));
    }

    List<Branch> branches;
    if (countryId == null) {
      branches = DB.find(Branch.class).orderBy("id desc").findList();
    } else {
      branches = DB.find(Branch.class).where().eq("country.id", countryId).orderBy("id desc").findList();
    }

    List<Map<String, Object>> payload =
        branches.stream()
            .map(
                branch -> {
                  Map<String, Object> item = new LinkedHashMap<>();
                  item.put("id", branch.getId());
                  item.put("countryId", branch.getCountry().getId());
                  item.put("countryKey", branch.getCountry().getCountryKey());
                  item.put("name", branch.getName());
                  item.put("city", branch.getCity());
                  item.put("address", branch.getAddress());
                  item.put("postalCode", branch.getPostalCode());
                  item.put("region", branch.getRegion());
                  item.put("type", branch.getType().name().toLowerCase());
                  item.put("status", branch.getStatus().name().toLowerCase());
                  item.put("managerDisplayName", branch.getManagerAccount().getDisplayName());
                  item.put("managerUsername", branch.getManagerAccount().getUsername());
                  item.put("lecturerUsername", branch.getLecturerAccount().getUsername());
                  item.put("branchKey", branch.getBranchKey());
                  return item;
                })
            .toList();

    return ResponseEntity.ok(payload);
  }

  @PostMapping("/branches")
  public ResponseEntity<?> createBranch(
      @CookieValue(value = "SESSION_ID", required = false) String sessionId,
      @RequestBody CreateBranchRequest request) {
    if (!isAdminSession(sessionId)) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(Map.of("status", "bad", "message", "unauthorized"));
    }

    Country country = DB.find(Country.class, request.getCountryId());
    if (country == null) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("status", "bad", "message", "country not found"));
    }

    if (request.getManagerUsername() == null
        || request.getManagerUsername().isBlank()
        || request.getManagerPassword() == null
        || request.getManagerPassword().isBlank()
        || request.getLecturerUsername() == null
        || request.getLecturerUsername().isBlank()
        || request.getLecturerPassword() == null
        || request.getLecturerPassword().isBlank()
        || request.getManagerDisplayName() == null
        || request.getManagerDisplayName().isBlank()) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("status", "bad", "message", "account credentials required"));
    }

    if (DB.find(Account.class).where().eq("username", request.getManagerUsername()).exists()
        || DB.find(Account.class).where().eq("username", request.getLecturerUsername()).exists()) {
      return ResponseEntity.status(HttpStatus.CONFLICT)
          .body(Map.of("status", "bad", "message", "username already in use"));
    }

    Account manager =
        new Account(
            request.getManagerUsername(),
            HashUtil.hashPassword(request.getManagerPassword()),
            request.getManagerDisplayName(),
            Account.Role.MANAGER);
    manager.save();

    Account lecturer =
        new Account(
            request.getLecturerUsername(),
            HashUtil.hashPassword(request.getLecturerPassword()),
            request.getLecturerUsername(),
            Account.Role.LECTURER);
    lecturer.save();

    Branch branch =
        new Branch(
            country,
            request.getName(),
            request.getCity(),
            request.getAddress(),
            request.getPostalCode(),
            request.getRegion(),
            parseBranchType(request.getType()),
            parseBranchStatus(request.getStatus()),
            manager,
            lecturer);
    branch.save();

    return ResponseEntity.status(HttpStatus.CREATED).body(branch);
  }

  @PutMapping("/branches/{branchId}")
  public ResponseEntity<?> updateBranch(
      @PathVariable Long branchId,
      @CookieValue(value = "SESSION_ID", required = false) String sessionId,
      @RequestBody UpdateBranchRequest request) {
    if (!isAdminSession(sessionId)) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(Map.of("status", "bad", "message", "unauthorized"));
    }

    Branch branch = DB.find(Branch.class, branchId);
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
    if (request.getType() != null) {
      branch.setType(parseBranchType(request.getType()));
    }
    if (request.getStatus() != null) {
      branch.setStatus(parseBranchStatus(request.getStatus()));
    }

    branch.save();
    return ResponseEntity.ok(branch);
  }

  @DeleteMapping("/branches/{branchId}")
  public ResponseEntity<?> deleteBranch(
      @PathVariable Long branchId,
      @CookieValue(value = "SESSION_ID", required = false) String sessionId) {
    if (!isAdminSession(sessionId)) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(Map.of("status", "bad", "message", "unauthorized"));
    }

    Branch branch = DB.find(Branch.class, branchId);
    if (branch == null) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND)
          .body(Map.of("status", "bad", "message", "branch not found"));
    }

    long courses = DB.find(eu.hypnomacka.timeout.server.core.Course.class).where().eq("branch.id", branchId).findCount();
    if (courses > 0) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("status", "bad", "message", "branch has courses"));
    }

    Account manager = branch.getManagerAccount();
    Account lecturer = branch.getLecturerAccount();
    branch.delete();

    if (manager != null) {
      manager.delete();
    }
    if (lecturer != null) {
      lecturer.delete();
    }

    return ResponseEntity.noContent().build();
  }

  @PutMapping("/accounts/{accountId}/credentials")
  public ResponseEntity<?> updateAccountCredentials(
      @PathVariable String accountId,
      @CookieValue(value = "SESSION_ID", required = false) String sessionId,
      @RequestBody UpdateAccountCredentialsRequest request) {
    if (!isAdminSession(sessionId)) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(Map.of("status", "bad", "message", "unauthorized"));
    }

    UUID uuid;
    try {
      uuid = UUID.fromString(accountId);
    } catch (IllegalArgumentException e) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("status", "bad", "message", "invalid account id"));
    }

    Account account = DB.find(Account.class, uuid);
    if (account == null) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND)
          .body(Map.of("status", "bad", "message", "account not found"));
    }

    if (request.getUsername() != null && !request.getUsername().isBlank()) {
      Account usernameConflict =
          DB.find(Account.class)
              .where()
              .eq("username", request.getUsername())
              .ne("uuid", account.getUuid())
              .findOne();
      if (usernameConflict != null) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
            .body(Map.of("status", "bad", "message", "username already in use"));
      }
      account.setUsername(request.getUsername());
    }
    if (request.getDisplayName() != null && !request.getDisplayName().isBlank()) {
      account.setDisplayName(request.getDisplayName());
    }
    if (request.getPassword() != null && !request.getPassword().isBlank()) {
      account.setHashedPass(HashUtil.hashPassword(request.getPassword()));
    }

    account.save();
    return ResponseEntity.ok(Map.of("status", "ok"));
  }

  private Country.Status parseCountryStatus(String value) {
    if (value == null || value.isBlank()) {
      return Country.Status.ACTIVE;
    }
    return switch (value.toUpperCase()) {
      case "ONBOARDING" -> Country.Status.ONBOARDING;
      case "WAITING" -> Country.Status.WAITING;
      default -> Country.Status.ACTIVE;
    };
  }

  private Branch.Status parseBranchStatus(String value) {
    if (value == null || value.isBlank()) {
      return Branch.Status.ACTIVE;
    }
    return switch (value.toUpperCase()) {
      case "ONBOARDING" -> Branch.Status.ONBOARDING;
      case "WAITING" -> Branch.Status.WAITING;
      default -> Branch.Status.ACTIVE;
    };
  }

  private Branch.Type parseBranchType(String value) {
    if (value == null || value.isBlank()) {
      return Branch.Type.BRANCH;
    }
    return "HQ".equalsIgnoreCase(value) ? Branch.Type.HQ : Branch.Type.BRANCH;
  }

  @Data
  public static class CreateCountryRequest {
    private String isoCode;
    private String name;
    private String status;
  }

  @Data
  public static class UpdateCountryRequest {
    private String name;
    private String status;
  }

  @Data
  public static class CreateBranchRequest {
    private Long countryId;
    private String name;
    private String city;
    private String address;
    private String postalCode;
    private String region;
    private String type;
    private String status;
    private String managerUsername;
    private String managerPassword;
    private String managerDisplayName;
    private String lecturerUsername;
    private String lecturerPassword;
  }

  @Data
  public static class UpdateBranchRequest {
    private String name;
    private String city;
    private String address;
    private String postalCode;
    private String region;
    private String type;
    private String status;
  }

  @Data
  public static class UpdateAccountCredentialsRequest {
    private String username;
    private String password;
    private String displayName;
  }
}
