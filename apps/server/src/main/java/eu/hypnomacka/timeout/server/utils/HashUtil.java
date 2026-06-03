package eu.hypnomacka.timeout.server.utils;

import java.security.SecureRandom;
import java.util.Base64;
import org.bouncycastle.crypto.generators.Argon2BytesGenerator;
import org.bouncycastle.crypto.params.Argon2Parameters;

public class HashUtil {

  private static final int SALT_LENGTH = 32;
  private static final int HASH_LENGTH = 32;
  private static final SecureRandom SECURE_RANDOM = new SecureRandom();

  public static String hashPassword(String password) {
    byte[] salt = new byte[SALT_LENGTH];
    SECURE_RANDOM.nextBytes(salt);

    byte[] hash = hashPassword(password, salt);

    return Base64.getEncoder().encodeToString(salt)
        + ":"
        + Base64.getEncoder().encodeToString(hash);
  }

  public static boolean verifyPassword(String password, String stored) {
    String[] parts = stored.split(":", 2);

    if (parts.length != 2) {
      return false;
    }

    byte[] salt = Base64.getDecoder().decode(parts[0]);
    byte[] storedHash = Base64.getDecoder().decode(parts[1]);
    byte[] newHash = hashPassword(password, salt);

    return constantTimeEquals(storedHash, newHash);
  }

  private static byte[] hashPassword(String password, byte[] salt) {
    Argon2Parameters.Builder builder =
        new Argon2Parameters.Builder(Argon2Parameters.ARGON2_id)
            .withSalt(salt)
            .withIterations(2)
            .withMemoryAsKB(65536)
            .withParallelism(1);

    Argon2BytesGenerator generator = new Argon2BytesGenerator();
    generator.init(builder.build());

    byte[] hash = new byte[HASH_LENGTH];
    generator.generateBytes(password.toCharArray(), hash, 0, hash.length);

    return hash;
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
