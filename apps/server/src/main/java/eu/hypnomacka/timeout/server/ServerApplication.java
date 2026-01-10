package eu.hypnomacka.timeout.server;

import eu.hypnomacka.timeout.server.core.Lecturer;
import eu.hypnomacka.timeout.server.core.query.QLecturer;
import eu.hypnomacka.timeout.server.utils.HashUtil;

import io.github.cdimascio.dotenv.Dotenv;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ServerApplication {

    public static void main(String[] args) {
        Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();

        dotenv.entries().forEach(entry -> System.setProperty(entry.getKey(), entry.getValue()));

        SpringApplication.run(ServerApplication.class, args);

        try {
            Lecturer dummy = new QLecturer().username.eq("lecturer").findOne();
            if (dummy == null) {
                dummy = new Lecturer("lecturer", HashUtil.hashPassword("TdA26!"));
                dummy.save();
            }
        } catch (Exception e) {

        }
    }
}
