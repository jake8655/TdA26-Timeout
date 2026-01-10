package eu.hypnomacka.timeout.server.utils;

import java.util.Base64;
import org.bouncycastle.crypto.generators.Argon2BytesGenerator;
import org.bouncycastle.crypto.params.Argon2Parameters;

public class HashUtil {

  private static final int HASH_LENGTH = 32;
  private static final byte[] SALT =
      Base64.getDecoder().decode("PU8HlVnSIXjqU1zEexYD92870xqXaFsBOLP5lWMPnNQ=");

  public static String hashPassword(String password) {
    Argon2Parameters.Builder builder =
        new Argon2Parameters.Builder(Argon2Parameters.ARGON2_id)
            .withSalt(SALT)
            .withIterations(2)
            .withMemoryAsKB(65536)
            .withParallelism(1);

    Argon2BytesGenerator generator = new Argon2BytesGenerator();
    generator.init(builder.build());

    byte[] hash = new byte[HASH_LENGTH];
    generator.generateBytes(password.toCharArray(), hash, 0, hash.length);

    return Base64.getEncoder().encodeToString(hash);
  }

  public static boolean verifyPassword(String password, String stored) {
    byte[] storedHash = Base64.getDecoder().decode(stored);

    Argon2Parameters.Builder builder =
        new Argon2Parameters.Builder(Argon2Parameters.ARGON2_id)
            .withSalt(SALT)
            .withIterations(2)
            .withMemoryAsKB(65536)
            .withParallelism(1);

    Argon2BytesGenerator generator = new Argon2BytesGenerator();
    generator.init(builder.build());

    byte[] newHash = new byte[HASH_LENGTH];
    generator.generateBytes(password.toCharArray(), newHash, 0, newHash.length);

    return constantTimeEquals(storedHash, newHash);
  }

  private static boolean constantTimeEquals(byte[] a, byte[] b) {
    if (a.length != b.length) return false;
    int result = 0;
    for (int i = 0; i < a.length; i++) {
      result |= a[i] ^ b[i];
    }
    return result == 0;
  }
}
