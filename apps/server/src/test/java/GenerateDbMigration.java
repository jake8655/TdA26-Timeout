import io.ebean.dbmigration.DbMigration;
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
    MySqlPlatform mySqlPlatform = new MySqlPlatform();
    mySqlPlatform.setUseMigrationStoredProcedures(true);
    dbMigration.setPlatform(mySqlPlatform);
    dbMigration.setStrictMode(false);
    return dbMigration;
  }
}
