import { useState } from "react";
import NotesPage from "./pages/NotesPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

type Page = "login" | "register" | "notes";

export default function App() {
  const [page, setPage] = useState<Page>("login");

  if (page === "login") {
    return (
      <LoginPage
        onLogin={() => setPage("notes")}
        onRegister={() => setPage("register")}
      />
    );
  }

  if (page === "register") {
    return <RegisterPage onLogin={() => setPage("login")} />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
      <NotesPage onLogout={() => setPage("login")} />
    </div>
  );
}
