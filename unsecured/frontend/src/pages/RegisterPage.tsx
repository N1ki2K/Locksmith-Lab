import { useState } from "react";
import { apiRequest } from "../api/client";

type Props = {
  onLogin: () => void;
};

export default function RegisterPage({ onLogin }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          username,
          password,
        }),
      });

      setMessage("User created successfully");

      setTimeout(() => {
        onLogin();
      }, 700);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Registration failed",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-white">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-8 shadow-xl">
        <div className="mb-8">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-emerald-400">
            Locksmith Lab
          </p>

          <h1 className="mt-3 text-3xl font-bold">Create account</h1>

          <p className="mt-2 text-sm text-zinc-400">
            Register for Secure Notes V1.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="username"
              className="mb-2 block text-sm text-zinc-300"
            >
              Username
            </label>

            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose username"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none transition focus:border-emerald-500"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm text-zinc-300"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Choose password"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none transition focus:border-emerald-500"
            />
          </div>

          {message && <p className="text-sm text-zinc-300">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-emerald-500 px-4 py-3 font-semibold text-zinc-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Creating..." : "Register"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-zinc-400">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onLogin}
            className="font-medium text-emerald-400 hover:text-emerald-300"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}
