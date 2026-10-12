import {
  create,
  findByUsername,
  findByCredentials,
} from "../repositories/userRepository.js";
export async function registerUser(username: string, password: string) {
  const existingUser = await findByUsername(username);

  if (existingUser) {
    throw new Error("USERNAME_EXISTS");
  }

  return create(username, password);
}

export async function loginUser(username: string, password: string) {
  const user = await findByCredentials(username, password);

  if (!user) {
    throw new Error("INVALID_CREDENTIALS");
  }
  return user;
}

export async function logoutUser(
  destroySession: (callback: (error?: Error) => void) => void,
) {
  return new Promise<void>((resolve, reject) => {
    destroySession((error) => {
      if (error) {
        reject(new Error("LOGOUT_FAILED"));
        return;
      }

      resolve();
    });
  });
}
