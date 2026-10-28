import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  CalendarCheck,
  ClipboardList,
  Wallet,
  Settings,
} from "lucide-react";

export type UserRole = "Admin" | "Teacher" | "Student" | "Parent";

type SidebarProps = {
  role: UserRole;
  collapsed: boolean;
  mobileOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
};

const menuItems = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Students", path: "/students", icon: Users },
  { name: "Teachers", path: "/teachers", icon: GraduationCap },
  { name: "Classes", path: "/classes", icon: BookOpen },
  { name: "Attendance", path: "/attendance", icon: CalendarCheck },
  { name: "Grades", path: "/grades", icon: ClipboardList },
  { name: "Payments", path: "/payments", icon: Wallet },
];

export default function Sidebar({
  // role,
  collapsed,
  mobileOpen,
  // onToggle,
  onClose,
}: SidebarProps) {
  const linkClass = (isActive: boolean) =>
    `flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition ${
      collapsed ? "lg:justify-center lg:px-0" : ""
    } ${
      isActive
        ? "bg-indigo-600 text-white"
        : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
    }`;

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden"
        />
      )}
      <aside
        id="main-navigation"
        className={`fixed inset-y-0 left-0 z-50 flex h-dvh w-64 flex-col border-r border-slate-200 bg-white p-4 transition-[width,transform] duration-200 dark:border-slate-800 dark:bg-slate-900 ${
          collapsed ? "lg:w-20" : "lg:w-64"
        } ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div
          className={`mb-8 flex items-center gap-3 px-2 ${
            collapsed ? "lg:justify-center lg:px-0" : ""
          }`}
        >
          <div className="rounded-xl bg-indigo-600 p-3 text-white">
            <GraduationCap size={24} />
          </div>
          <div className={collapsed ? "lg:hidden" : ""}>
            <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              EduManage
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              School Management
            </p>
          </div>
        </div>

        <p
          className={`mb-3 px-3 text-xs font-semibold text-slate-400 ${
            collapsed ? "lg:sr-only" : ""
          }`}
        >
          MAIN MENU
        </p>

        <nav
          aria-label="Main navigation"
          className="flex flex-1 flex-col gap-1 overflow-y-auto"
        >
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                onClick={onClose}
                aria-label={collapsed ? item.name : undefined}
                title={collapsed ? item.name : undefined}
                className={({ isActive }) => linkClass(isActive)}
              >
                <Icon size={20} className="shrink-0" />
                <span className={collapsed ? "lg:hidden" : ""}>
                  {item.name}
                </span>
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
