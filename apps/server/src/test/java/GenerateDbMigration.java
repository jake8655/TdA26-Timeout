import io.ebean.dbmigration.DbMigration;
import io.ebean.config.PlatformConfig;
import io.ebean.platform.mysql.MySqlPlatform;
import java.io.IOException;
import java.util.List;

public class GenerateDbMigration {

  public static void main(String[] args) throws IOException {
    createMigration().generateMigration();

    List<String> pendingDrops = createMigration().getPendingDrops();
    while (!pendingDrops.isEmpty()) {
      DbMigration pendingDropMigration = createMigration();
      pendingDropMigration.setGeneratePendingDrop(pendingDrops.get(0));
      String generated = pendingDropMigration.generateMigration();
      if (generated == null) {
        break;
      }
      pendingDrops = createMigration().getPendingDrops();
    }
  }

  private static DbMigration createMigration() {
    DbMigration dbMigration = DbMigration.create();
    TimeoutMySqlPlatform mySqlPlatform = new TimeoutMySqlPlatform();
    PlatformConfig platformConfig = new PlatformConfig();
    platformConfig.setDbUuid(PlatformConfig.DbUuid.VARCHAR);
    mySqlPlatform.apply(platformConfig);
    mySqlPlatform.setUseMigrationStoredProcedures(true);
    dbMigration.setPlatform(mySqlPlatform);
    dbMigration.setStrictMode(false);
    return dbMigration;
  }

  private static final class TimeoutMySqlPlatform extends MySqlPlatform {
    void apply(PlatformConfig platformConfig) {
      configure(platformConfig);
    }
  }
}
