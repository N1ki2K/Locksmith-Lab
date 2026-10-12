import { useState } from "react";
import { apiRequest } from "../api/client";

type Props = {
  onLogin: () => void;
  onRegister: () => void;
};

export default function LoginPage({ onLogin, onRegister }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          username,
          password,
        }),
      });

      onLogin();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Login failed");
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

          <h1 className="mt-3 text-3xl font-bold">Secure Notes V1</h1>

          <p className="mt-2 text-sm text-zinc-400">
            Sign in to access your notes.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm text-zinc-300">Username</label>

            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none transition focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-300">Password</label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none transition focus:border-emerald-500"
            />
          </div>

          {message && <p className="text-sm text-red-400">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-emerald-500 px-4 py-3 font-semibold text-zinc-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-zinc-400">
          No account yet?{" "}
          <button
            onClick={onRegister}
            className="font-medium text-emerald-400 hover:text-emerald-300"
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
}
