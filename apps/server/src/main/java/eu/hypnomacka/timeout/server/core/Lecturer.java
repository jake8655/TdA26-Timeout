package eu.hypnomacka.timeout.server.core;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

public class Lecturer {

    @Getter @Setter
    int id;
    @Getter
    String name, hashedPassword;
    LocalDateTime createdAt, updatedAt;

    public Lecturer(int id, String name, String hashedPassword, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.hashedPassword = hashedPassword;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public  Lecturer(String name, String hashedPassword) {
        this.name = name;
        this.hashedPassword = hashedPassword;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

}
