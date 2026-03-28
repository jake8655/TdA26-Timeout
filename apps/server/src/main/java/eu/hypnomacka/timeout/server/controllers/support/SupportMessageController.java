package eu.hypnomacka.timeout.server.controllers.support;

import eu.hypnomacka.timeout.server.controllers.Controller;
import eu.hypnomacka.timeout.server.core.Account;
import eu.hypnomacka.timeout.server.core.FileAsset;
import eu.hypnomacka.timeout.server.core.SupportMessage;
import eu.hypnomacka.timeout.server.core.SupportMessageAttachment;
import eu.hypnomacka.timeout.server.core.query.QSupportMessage;
import eu.hypnomacka.timeout.server.storage.FileStorageService;
import io.ebean.DB;
import io.ebean.Transaction;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/support-messages")
@RequiredArgsConstructor
public class SupportMessageController extends Controller {

  private static final long MAX_ATTACHMENT_SIZE = 30L * 1024 * 1024;
  private static final List<String> SUPPORTED_MIME_TYPES =
      List.of(
          "application/pdf",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "text/plain",
          "image/png",
          "image/jpg",
          "image/jpeg",
          "image/gif",
          "video/mp4",
          "audio/mpeg",
          "audio/mp3");

  private final FileStorageService fileStorageService;

  @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<?> create(
      @CookieValue(value = "SESSION_ID", required = false) String sessionId,
      @RequestPart("subject") String subject,
      @RequestPart("pageUrl") String pageUrl,
      @RequestPart("stepsToReproduce") String stepsToReproduce,
      @RequestPart(value = "attachments", required = false) MultipartFile[] attachments) {
    var session = getValidSession(sessionId);
    Account account = resolveAccount(session);
    if (account == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(Map.of("status", "bad", "message", "unauthorized"));
    }

    if (subject == null || subject.isBlank() || pageUrl == null || pageUrl.isBlank() || stepsToReproduce == null || stepsToReproduce.isBlank()) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("status", "bad", "message", "invalid payload"));
    }

    if (attachments != null) {
      for (MultipartFile attachment : attachments) {
        if (attachment == null || attachment.isEmpty()) {
          continue;
        }
        String mimeType = attachment.getContentType();
        if (mimeType == null || !SUPPORTED_MIME_TYPES.contains(mimeType)) {
          return ResponseEntity.status(HttpStatus.BAD_REQUEST)
              .body(
                  Map.of(
                      "status",
                      "bad",
                      "message",
                      "Unsupported file type. Allowed types: "
                          + String.join(", ", SUPPORTED_MIME_TYPES)));
        }
        if (attachment.getSize() > MAX_ATTACHMENT_SIZE) {
          return ResponseEntity.status(HttpStatus.BAD_REQUEST)
              .body(Map.of("status", "bad", "message", "attachment exceeds 30MB"));
        }
      }
    }

    try (Transaction transaction = DB.beginTransaction()) {
      SupportMessage message =
          new SupportMessage(account, subject.trim(), pageUrl.trim(), stepsToReproduce.trim());
      message.save();

      if (attachments != null) {
        for (MultipartFile attachment : attachments) {
          if (attachment == null || attachment.isEmpty()) {
            continue;
          }

          String originalFilename =
              attachment.getOriginalFilename() == null
                  ? "attachment"
                  : attachment.getOriginalFilename();
          String fileUrl =
              fileStorageService.store(message.getUuid(), originalFilename, attachment.getBytes());
          String mimeType =
              attachment.getContentType() == null
                  ? "application/octet-stream"
                  : attachment.getContentType();

          FileAsset asset =
              new FileAsset(
                  fileUrl,
                  UUID.randomUUID().toString().replace("-", ""),
                  mimeType,
                  attachment.getSize());
          asset.setRetentionState(FileAsset.RetentionState.PROTECTED);
          asset.save();

          SupportMessageAttachment messageAttachment =
              new SupportMessageAttachment(
                  message,
                  asset,
                  originalFilename,
                  fileUrl,
                  mimeType,
                  attachment.getSize());
          messageAttachment.save();
        }
      }

      transaction.commit();
      return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("status", "ok"));
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("status", "bad", "message", "failed to submit support message"));
    }
  }

  @GetMapping
  public ResponseEntity<?> list(@CookieValue(value = "SESSION_ID", required = false) String sessionId) {
    if (!isAdminSession(sessionId)) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(Map.of("status", "bad", "message", "unauthorized"));
    }

    List<Map<String, Object>> payload =
        new QSupportMessage()
            .submittedBy.fetch("uuid,username,displayName")
            .orderBy("createdAt desc")
            .findList()
            .stream()
            .map(
                message -> {
                  Map<String, Object> item = new LinkedHashMap<>();
                  item.put("uuid", message.getUuid());
                  item.put("subject", message.getSubject());
                  item.put("pageUrl", message.getPageUrl());
                  item.put("stepsToReproduce", message.getStepsToReproduce());
                  item.put("createdAt", message.getCreatedAt());
                  item.put(
                      "submittedBy",
                      Map.of(
                          "uuid", message.getSubmittedBy().getUuid(),
                          "username", message.getSubmittedBy().getUsername(),
                          "displayName", message.getSubmittedBy().getDisplayName()));

                  List<Map<String, Object>> attachments =
                      DB.find(SupportMessageAttachment.class)
                          .where()
                          .eq("supportMessage.uuid", message.getUuid())
                          .orderBy("createdAt asc")
                          .findList()
                          .stream()
                          .map(
                              attachment -> {
                                Map<String, Object> attachmentItem = new LinkedHashMap<>();
                                attachmentItem.put("uuid", attachment.getUuid());
                                attachmentItem.put("fileName", attachment.getFileName());
                                attachmentItem.put("fileUrl", attachment.getFileUrl());
                                attachmentItem.put("mimeType", attachment.getMimeType());
                                attachmentItem.put("sizeBytes", attachment.getSizeBytes());
                                return attachmentItem;
                              })
                          .toList();
                  item.put("attachments", attachments);
                  return item;
                })
            .toList();

    return ResponseEntity.ok(payload);
  }
}
