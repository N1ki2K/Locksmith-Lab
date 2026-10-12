import argon2 from "argon2";
import { create, findByUsername } from "../repositories/userRepository.js";

export async function registerUser(username: string, password: string) {
  const passwordHash = await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  });
  try {
    return await create(username, passwordHash);
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "23505") {
      throw new Error("USERNAME_EXISTS");
    }
    throw error;
  }
}

export async function loginUser(username: string, password: string) {
  const user = await findByUsername(username);
  if (!user || !(await argon2.verify(user.password, password))) {
    throw new Error("INVALID_CREDENTIALS");
  }
  return { id: user.id as number, username: user.username as string };
}

export async function logoutUser(destroySession: (callback: (error?: Error) => void) => void) {
  return new Promise<void>((resolve, reject) => {
    destroySession((error) => error ? reject(new Error("LOGOUT_FAILED")) : resolve());
  });
}
