import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar, { type UserRole } from "./Sidebar";
import TopBar from "./Topbar";

const roles: UserRole[] = ["Admin", "Teacher", "Student", "Parent"];

export default function AppLayout() {
  const [role, setRole] = useState<UserRole>("Admin");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpenForPath, setMobileOpenForPath] = useState<string | null>(
    null,
  );
  const [dark, setDark] = useState(
    () => localStorage.getItem("school-theme") === "dark",
  );
  const location = useLocation();
  const mobileOpen = mobileOpenForPath === location.pathname;

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("school-theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Sidebar
        role={role}
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggle={() => setCollapsed((value) => !value)}
        onClose={() => setMobileOpenForPath(null)}
      />

      <div
        className={`min-h-screen transition-[margin] duration-200 ${
          collapsed ? "lg:ml-20" : "lg:ml-64"
        }`}
      >
        <TopBar
          role={role}
          dark={dark}
          onThemeToggle={() => setDark((value) => !value)}
          onMenuClick={() => {
            if (window.matchMedia("(min-width: 1024px)").matches) {
              setCollapsed((value) => !value);
            } else {
              setMobileOpenForPath(location.pathname);
            }
          }}
        />

        <main className="min-w-0 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
