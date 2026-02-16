package eu.hypnomacka.timeout.server.storage;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.text.Normalizer;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Set;
import java.util.UUID;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class FileStorageService {

  private static final Set<String> ALLOWED_EXTENSIONS =
      Set.of(".pdf", ".docx", ".txt", ".png", ".jpg", ".jpeg", ".gif", ".mp4", ".mp3");
  private static final long MAX_FILE_SIZE = 30L * 1024 * 1024;
  private static final int MAX_FILENAME_LENGTH = 200;
  private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyyMMdd");

  private final Path uploadsDir;

  public FileStorageService() {
    String uploadsPath = getUploadsDir();
    this.uploadsDir = Paths.get(uploadsPath).toAbsolutePath().normalize();
    log.info("File storage initialized with uploads directory: {}", uploadsDir);
  }

  private String getUploadsDir() {
    String env = System.getenv("UPLOADS_DIR");
    if (env != null && !env.isBlank()) {
      return env;
    }
    String prop = System.getProperty("UPLOADS_DIR");
    if (prop != null && !prop.isBlank()) {
      return prop;
    }
    return "./uploads";
  }

  public String store(UUID courseUuid, String originalFilename, byte[] content) throws IOException {
    if (courseUuid == null) {
      throw new IllegalArgumentException("Course UUID cannot be null");
    }
    if (originalFilename == null || originalFilename.isBlank()) {
      throw new IllegalArgumentException("Filename cannot be null or empty");
    }
    if (content == null || content.length == 0) {
      throw new IllegalArgumentException("File content cannot be null or empty");
    }
    if (!isValidSize(content.length)) {
      throw new IllegalArgumentException(
          "File size exceeds maximum of " + (MAX_FILE_SIZE / 1024 / 1024) + "MB");
    }
    if (!isValidExtension(originalFilename)) {
      throw new IllegalArgumentException("File extension not allowed: " + originalFilename);
    }

    String extension = extractExtension(originalFilename);
    String dateDir = LocalDate.now().format(DATE_FORMAT);
    String ulid = UUID.randomUUID().toString().replace("-", "");

    String relativePath = String.format("%s/%s/%s.%s", dateDir, courseUuid, ulid, extension);
    Path targetPath = uploadsDir.resolve(relativePath).normalize();

    validatePath(targetPath);

    Files.createDirectories(targetPath.getParent());
    Files.write(targetPath, content, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);

    log.info("Stored file: {} bytes at {}", content.length, targetPath);

    return "/uploads/" + relativePath;
  }

  public void delete(String fileUrl) throws IOException {
    if (fileUrl == null || fileUrl.isBlank()) {
      throw new IllegalArgumentException("File URL cannot be null or empty");
    }

    String relativePath = extractRelativePath(fileUrl);
    Path targetPath = uploadsDir.resolve(relativePath).normalize();

    validatePath(targetPath);

    if (!Files.exists(targetPath)) {
      log.warn("File not found for deletion: {}", targetPath);
      return;
    }

    Files.deleteIfExists(targetPath);
    log.info("Deleted file: {}", targetPath);

    cleanupEmptyDirectories(targetPath.getParent());
  }

  public boolean isValidExtension(String filename) {
    if (filename == null || filename.isBlank()) {
      return false;
    }
    String ext = extractExtension(filename);
    return !ext.isEmpty() && ALLOWED_EXTENSIONS.contains("." + ext.toLowerCase());
  }

  public boolean isValidSize(long sizeBytes) {
    return sizeBytes > 0 && sizeBytes <= MAX_FILE_SIZE;
  }

  private String extractExtension(String filename) {
    String normalized = normalizeFilename(filename);
    int lastDot = normalized.lastIndexOf('.');
    if (lastDot == -1 || lastDot == normalized.length() - 1) {
      return "";
    }
    return normalized.substring(lastDot + 1).toLowerCase();
  }

  private String normalizeFilename(String filename) {
    String normalized = Normalizer.normalize(filename, Normalizer.Form.NFC);
    normalized = normalized.replaceAll("[\\\\/:*?\"<>|]", "");
    normalized = normalized.replaceAll("\\s+", " ").trim();
    if (normalized.length() > MAX_FILENAME_LENGTH) {
      String ext = extractExtensionRaw(normalized);
      int extLen = ext.isEmpty() ? 0 : ext.length() + 1;
      int nameLen = MAX_FILENAME_LENGTH - extLen;
      if (nameLen > 0) {
        int dotIdx = normalized.lastIndexOf('.');
        if (dotIdx > 0) {
          normalized = normalized.substring(0, Math.min(nameLen, dotIdx)) + ext;
        } else {
          normalized = normalized.substring(0, nameLen);
        }
      } else {
        normalized = normalized.substring(0, MAX_FILENAME_LENGTH);
      }
    }
    return normalized;
  }

  private String extractExtensionRaw(String filename) {
    int lastDot = filename.lastIndexOf('.');
    if (lastDot == -1 || lastDot == filename.length() - 1) {
      return "";
    }
    return filename.substring(lastDot + 1);
  }

  private String extractRelativePath(String fileUrl) {
    if (fileUrl.startsWith("/uploads/")) {
      return fileUrl.substring("/uploads/".length());
    }
    if (fileUrl.startsWith("uploads/")) {
      return fileUrl.substring("uploads/".length());
    }
    throw new IllegalArgumentException("Invalid file URL format: " + fileUrl);
  }

  private void validatePath(Path targetPath) {
    if (!targetPath.startsWith(uploadsDir)) {
      throw new IllegalArgumentException("Path traversal detected: " + targetPath);
    }
  }

  private void cleanupEmptyDirectories(Path dir) throws IOException {
    if (!dir.startsWith(uploadsDir)) {
      return;
    }
    if (!Files.isDirectory(dir)) {
      return;
    }
    try (var stream = Files.list(dir)) {
      if (stream.findAny().isEmpty()) {
        Files.delete(dir);
        log.debug("Removed empty directory: {}", dir);
        cleanupEmptyDirectories(dir.getParent());
      }
    }
  }
}