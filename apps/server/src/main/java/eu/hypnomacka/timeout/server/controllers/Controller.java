package eu.hypnomacka.timeout.server.controllers;

import eu.hypnomacka.timeout.server.core.Lecturer;
import eu.hypnomacka.timeout.server.core.Session;
import eu.hypnomacka.timeout.server.core.query.QLecturer;
import eu.hypnomacka.timeout.server.core.query.QSession;
import java.time.Instant;
import java.util.UUID;

public class Controller {
    public static Lecturer lecturer = new QLecturer().username.eq("lecturer").findOne();

    public boolean isCookieValid(String sessionId, String username) {
        if (sessionId == null || sessionId.isEmpty() || username == null || username.isEmpty()) {
            return false;
        }

        UUID uuid;
        try {
            uuid = UUID.fromString(sessionId);
        } catch (Exception e) {
            return false;
        }

        Session session = new QSession().uuid.eq(UUID.fromString(sessionId)).findOne();
        if (session == null || session.getExpiresAt() == null) {
            return false;
        }

        Instant now = Instant.now();
        if (!session.getExpiresAt().isAfter(now)) {
            return false;
        }

        Lecturer sessionLecturer = session.getLecturer();
        if (sessionLecturer == null || sessionLecturer.getUsername() == null) {
            return false;
        }

        return sessionLecturer.getUsername().equals(username);
    }
}
