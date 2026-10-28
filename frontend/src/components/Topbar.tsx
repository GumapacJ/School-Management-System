import { useState } from "react";
import {
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  UserRound,
  Settings,
  LogOut,
} from "lucide-react";
import { Link } from "react-router-dom";
import type { UserRole } from "./Sidebar";

type TopBarProps = {
  role: UserRole;
  dark: boolean;
  onThemeToggle: () => void;
  onMenuClick: () => void;
};

export default function TopBar({
  role,
  dark,
  onThemeToggle,
  onMenuClick,
}: TopBarProps) {
  const [search, setSearch] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
      <div className="flex h-20 items-center gap-3 px-4 sm:px-6">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Toggle navigation"
          aria-controls="main-navigation"
          className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Menu size={22} />
        </button>

        <div className="hidden min-w-0 sm:block">
          <h1 className="font-semibold">School Portal</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            School Year 2026–2027
          </p>
        </div>

        <form
          className="ml-auto hidden max-w-sm flex-1 md:flex"
          onSubmit={(event) => {
            event.preventDefault();
            if (search.trim()) {
              window.dispatchEvent(
                new CustomEvent("school-search", {
                  detail: search.trim(),
                }),
              );
            }
          }}
        >
          <div className="flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 dark:border-slate-700 dark:bg-slate-800">
            <Search size={18} className="text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search students, classes..."
              aria-label="Search school records"
              className="w-full bg-transparent py-2.5 text-sm outline-none placeholder:text-slate-400"
            />
            <button type="submit" className="sr-only">
              Search
            </button>
          </div>
        </form>

        <button
          type="button"
          onClick={onThemeToggle}
          title={dark ? "Switch to light mode" : "Switch to dark mode"}
          aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
          className="rounded-xl p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          {dark ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setNotificationsOpen((value) => !value);
              setProfileOpen(false);
            }}
            aria-label="Notifications"
            aria-expanded={notificationsOpen}
            aria-controls="notifications-panel"
            className="relative rounded-xl p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Bell size={20} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
          </button>

          {notificationsOpen && (
            <div
              id="notifications-panel"
              className="absolute right-0 mt-3 w-64 rounded-xl border border-slate-200 bg-white p-4 shadow-lg dark:border-slate-700 dark:bg-slate-900"
            >
              <p className="font-semibold">Notifications</p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                No new notifications.
              </p>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setProfileOpen((value) => !value);
              setNotificationsOpen(false);
            }}
            aria-expanded={profileOpen}
            aria-controls="profile-menu"
            aria-label={`${role} account options`}
            className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              {role.charAt(0)}
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-sm font-semibold">{role}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                School account
              </p>
            </div>
            <ChevronDown size={16} className="hidden sm:block" />
          </button>

          {profileOpen && (
            <div
              id="profile-menu"
              className="absolute right-0 mt-3 w-48 rounded-xl border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-700 dark:bg-slate-900"
            >
              <button
                type="button"
                onClick={() => setProfileOpen(false)}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <UserRound size={17} /> My Profile
              </button>
              <Link
                to="/settings"
                onClick={() => setProfileOpen(false)}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Settings size={17} /> Settings
              </Link>
              <button
                type="button"
                onClick={() => setProfileOpen(false)}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
              >
                <LogOut size={17} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
