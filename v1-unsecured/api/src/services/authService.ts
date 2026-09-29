import { asyncWrapProviders } from "async_hooks";
import {
  createUser,
  findUserByUsername,
} from "../repositories/userReposityry.js";

export async function registerUser(username: string, password: string) {
  const existingUser = await findUserByUsername(username);

  if (existingUser) {
    throw new Error("USERNAME_EXISTS");
  }

  return createUser(username, password);
}
