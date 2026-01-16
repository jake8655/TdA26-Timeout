package eu.hypnomacka.timeout.server.config;

import eu.hypnomacka.timeout.server.utils.EventPersistListener;
import io.ebean.Database;
import io.ebean.DatabaseFactory;
import io.ebean.config.DatabaseConfig;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
public class EbeanConfiguration {

  private final EventPersistListener eventPersistListener;

  @Bean
  public Database database() {
    DatabaseConfig config = new DatabaseConfig();
    config.loadFromProperties();
    config.add(eventPersistListener);
    return DatabaseFactory.create(config);
  }
}
