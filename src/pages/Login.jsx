import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    const user = login(email, password);

    if (user) {
      navigate("/dashboard");
    } else {
      setError("Email or password is incorrect.");
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f6f0] px-5 py-10 text-[#213b31] dark:bg-night-900 dark:text-stone-100">
      <section className="mx-auto mt-10 max-w-md rounded-2xl border border-[#e2e6de] bg-white p-7 shadow-sm dark:border-night-700 dark:bg-night-800 sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#39785a]">
          Welcome back
        </p>
        <h1 className="mt-3 text-3xl font-semibold">Sign in</h1>
        <p className="mt-2 text-sm text-[#6d776f] dark:text-stone-400">
          Sign in to manage your lost and found reports.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium">
              Campus email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="sara.abdo@lau.edu"
              className="w-full rounded-lg border border-[#dce3dc] px-3 py-3 text-sm dark:border-night-700 dark:bg-night-800 dark:text-stone-100 dark:placeholder-stone-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium">
              Password
            </label>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="mb-2 text-xs text-[#216747] underline dark:text-brand-300"
            >
              {showPassword ? "Hide" : "Show"} password
            </button>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-[#dce3dc] px-3 py-3 text-sm dark:border-night-700 dark:bg-night-800 dark:text-stone-100"
            />
          </div>

          {error && (
            <p className="text-sm text-red-700 dark:text-red-300" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-lg bg-[#216747] px-4 py-3 text-sm font-semibold text-white"
          >
            Sign in
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#6d776f] dark:text-stone-400">
          New here?{" "}
          <Link
            to="/register"
            className="font-semibold text-[#216747] underline dark:text-brand-300"
          >
            Create an account
          </Link>
        </p>
      </section>
    </main>
  );
}