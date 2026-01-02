package eu.hypnomacka.timeout.server.controllers;

import eu.hypnomacka.timeout.server.core.Lecturer;
import eu.hypnomacka.timeout.server.core.query.QLecturer;
import jakarta.servlet.http.Cookie;

public class Controller {

    public boolean isCookieValid(String sessionId, String username) {
        Lecturer l = new QLecturer().username.eq(username).findOne();
        Cookie cookie = new Cookie("SESSION_ID", sessionId);
        if(cookie.getMaxAge() > 0 && l != null) {
            return true;
        } else {
            return false;
        }
    }

}
