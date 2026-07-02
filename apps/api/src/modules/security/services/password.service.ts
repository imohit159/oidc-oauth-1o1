
import argon2 from "argon2";

export class PasswordService {
  private static readonly ARGON2_OPTIONS = {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  };

  /**
   * @desc Hash password using Argon2
   * @param password 
   */
  static async hash(password: string): Promise<string> {
    return argon2.hash(password, PasswordService.ARGON2_OPTIONS);
  }

  /**
   * @desc Verify password using Argon2
   * @param hash 
   * @param password 
   */
  static async verify(hash: string, password: string): Promise<boolean> {
    return argon2.verify(hash, password);
  }
}
