import { useEffect, useState } from "react";
import { apiRequest } from "../api/client";

type Note = {
  id: number;
  user_id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
};

type Props = {
  onLogout: () => void;
};

export default function NotePage({ onLogout }: Props) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");

  async function loadNotes() {
    try {
      const data = await apiRequest("/notes");
      setNotes(data);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not load notes",
      );
    }
  }

  async function createNote(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      await apiRequest("/notes", {
        method: "POST",
        body: JSON.stringify({
          title,
          content,
        }),
      });

      setTitle("");
      setContent("");
      setMessage("");

      await loadNotes();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not create note",
      );
    }
  }

  async function deleteNote(id: number) {
    try {
      await apiRequest(`/notes/${id}`, {
        method: "DELETE",
      });

      await loadNotes();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not delete note",
      );
    }
  }

  async function logout() {
    await apiRequest("/auth/logout", {
      method: "POST",
    });

    onLogout();
  }

  useEffect(() => {
    loadNotes();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="border-b border-zinc-800 bg-zinc-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-emerald-400">
              Locksmith Lab
            </p>

            <h1 className="mt-1 text-2xl font-bold">Secure Notes v1</h1>
          </div>

          <button
            onClick={logout}
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm transition hover:bg-zinc-800"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-8 px-8 lg:grid-cols-[350px_1fr]">
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-xl font-semibold">Create Note</h2>

          <form onSubmit={createNote} className="my-5 space-y-4">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-emerald-500"
            />

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your note..."
              rows={8}
              className="w-full resize-none rounded-lg border border-zinc-700 bg-zinc-950 px-4 pt-3 outline-none focus:border-emerald-500"
            />

            <button
              type="submit"
              className="w-full rounded-lg bg-emerald-500 px-4 py-3 font-semibold text-zinc-950 transition hover:bg-emerald-400"
            >
              Create note
            </button>
          </form>

          {message && <p className="mt-4 text-sm text-red-400">{message}</p>}
        </section>

        <section>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-2xl font-semibold">My Notes</h2>

            <span className="text-sm text-zinc-500">{notes.length} notes</span>
          </div>

          {notes.length === 0 ? (
            <div className="rounded-2xl border border-zinc-800 p-10 text-center text-zinc-500">
              No notes yet
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {notes.map((note) => (
                <article
                  key={note.id}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-lg font-semibold">{note.title}</h3>

                    <span className="text-xs text-zinc-600">#{note.id}</span>
                  </div>

                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-zinc-400">
                    {note.content}
                  </p>

                  <div className="mt-5 flex justify-end">
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="rounded-lg border border-red-900 px-3 py-2 text-sm text-red-400 transition hover:bg-red-950"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
