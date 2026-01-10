package eu.hypnomacka.timeout.server.config;

import io.ebean.Database;
import io.ebean.DatabaseFactory;
import io.ebean.config.DatabaseConfig;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class EbeanConfiguration {

  @Bean
  public Database database() {
    DatabaseConfig config = new DatabaseConfig();
    config.loadFromProperties();
    return DatabaseFactory.create(config);
  }
}
