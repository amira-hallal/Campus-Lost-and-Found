import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { LogOut, Menu, Moon, Sun, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { getInitials } from "../utils/format";

const NAV_LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/items", label: "Item List", end: true },
  { to: "/items/new", label: "Report Item" },
];

const linkClass = ({ isActive }) =>
  `block rounded-lg px-3 py-2 text-sm font-semibold transition ${
    isActive
      ? "bg-brand-100 text-brand-800 dark:bg-brand-500/15 dark:text-brand-200"
      : "text-brand-800 hover:bg-brand-50 dark:text-stone-200 dark:hover:bg-night-800"
  }`;

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate("/");
  };

  const links = currentUser ? [...NAV_LINKS, { to: "/dashboard", label: "Dashboard" }] : NAV_LINKS;

  return (
    <header className="sticky top-0 z-40 border-b-2 border-line bg-cream/95 backdrop-blur dark:border-night-700 dark:bg-night-900/95">
      <nav aria-label="Main" className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link to="/" onClick={closeMenu} className="text-base font-bold whitespace-nowrap text-brand-800 sm:text-xl dark:text-stone-50">
          M.A.R.S Campus Lost &amp; Found
        </Link>

        {/* Desktop links */}
        <ul className="hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink to={link.to} end={link.end} className={linkClass}>
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="rounded-lg p-2 text-brand-800 hover:bg-brand-100 dark:text-stone-200 dark:hover:bg-night-800"
          >
            {theme === "dark" ? <Sun className="size-5" aria-hidden="true" /> : <Moon className="size-5" aria-hidden="true" />}
          </button>

          {/* Desktop login state */}
          <div className="hidden items-center gap-2 lg:flex">
            {currentUser ? (
              <>
                <span className="flex items-center gap-2 text-sm text-body dark:text-stone-300">
                  <span
                    className="flex size-8 items-center justify-center rounded-full bg-brand-800 text-xs font-bold text-white dark:bg-brand-500 dark:text-night-950"
                    aria-hidden="true"
                  >
                    {getInitials(currentUser.name)}
                  </span>
                  {currentUser.name.split(" ")[0]}
                </span>
                <button type="button" onClick={handleLogout} className="btn-secondary px-3 py-2">
                  <LogOut className="size-4" aria-hidden="true" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={linkClass}>
                  Login
                </NavLink>
                <Link to="/register" className="btn-primary px-4 py-2">
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Hamburger (mobile and tablet) */}
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="rounded-lg p-2 text-brand-800 hover:bg-brand-100 lg:hidden dark:text-stone-200 dark:hover:bg-night-800"
          >
            {menuOpen ? <X className="size-6" aria-hidden="true" /> : <Menu className="size-6" aria-hidden="true" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div id="mobile-menu" className="border-t border-line px-4 pt-2 pb-4 lg:hidden dark:border-night-700">
          <ul className="space-y-1">
            {links.map((link) => (
              <li key={link.to}>
                <NavLink to={link.to} end={link.end} className={linkClass} onClick={closeMenu}>
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="mt-3 border-t border-line pt-3 dark:border-night-700">
            {currentUser ? (
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm">Signed in as <strong className="text-ink dark:text-stone-100">{currentUser.name}</strong></span>
                <button type="button" onClick={handleLogout} className="btn-secondary px-3 py-2">
                  <LogOut className="size-4" aria-hidden="true" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link to="/login" onClick={closeMenu} className="btn-secondary">Login</Link>
                <Link to="/register" onClick={closeMenu} className="btn-primary">Register</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
