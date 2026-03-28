package eu.hypnomacka.timeout.server.services;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.springframework.stereotype.Service;

@Service
public class CertificatePdfService {

  private static final DateTimeFormatter DATE_FORMATTER =
      DateTimeFormatter.ofPattern("yyyy-MM-dd").withZone(ZoneId.systemDefault());
  private static final PDType1Font FONT_HELVETICA =
      new PDType1Font(Standard14Fonts.FontName.HELVETICA);
  private static final PDType1Font FONT_HELVETICA_BOLD =
      new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);

  public byte[] generate(String username, String courseName, Instant issuedAt) {
    try (PDDocument document = new PDDocument(); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
      PDPage page = new PDPage(PDRectangle.A4);
      document.addPage(page);

      try (PDPageContentStream stream = new PDPageContentStream(document, page)) {
        stream.beginText();
        stream.setFont(FONT_HELVETICA_BOLD, 28);
        stream.newLineAtOffset(140, 760);
        stream.showText("Certificate of Completion");
        stream.endText();

        stream.beginText();
        stream.setFont(FONT_HELVETICA, 16);
        stream.newLineAtOffset(90, 680);
        stream.showText("This certifies that");
        stream.endText();

        stream.beginText();
        stream.setFont(FONT_HELVETICA_BOLD, 24);
        stream.newLineAtOffset(90, 640);
        stream.showText(safeText(username));
        stream.endText();

        stream.beginText();
        stream.setFont(FONT_HELVETICA, 16);
        stream.newLineAtOffset(90, 590);
        stream.showText("has successfully reached the required score in");
        stream.endText();

        stream.beginText();
        stream.setFont(FONT_HELVETICA_BOLD, 20);
        stream.newLineAtOffset(90, 550);
        stream.showText(safeText(courseName));
        stream.endText();

        stream.beginText();
        stream.setFont(FONT_HELVETICA, 12);
        stream.newLineAtOffset(90, 500);
        stream.showText("Issued: " + DATE_FORMATTER.format(issuedAt));
        stream.endText();
      }

      document.save(output);
      return output.toByteArray();
    } catch (IOException e) {
      throw new IllegalStateException("failed to generate certificate", e);
    }
  }

  private String safeText(String value) {
    if (value == null || value.isBlank()) {
      return "Student";
    }
    String normalized = value.replaceAll("[\\r\\n\\t]", " ").trim();
    return normalized.length() > 120 ? normalized.substring(0, 120) : normalized;
  }
}
