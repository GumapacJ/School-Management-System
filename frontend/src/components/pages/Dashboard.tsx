import { Users, GraduationCap, BookOpen, CalendarCheck } from "lucide-react";

const stats = [
  {
    label: "Total Students",
    value: "0",
    note: "Registered students",
    icon: Users,
    color: "text-indigo-600 bg-indigo-100 dark:bg-indigo-950",
  },
  {
    label: "Total Teachers",
    value: "0",
    note: "Registered teachers",
    icon: GraduationCap,
    color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-950",
  },
  {
    label: "Classes",
    value: "0",
    note: "Active classes",
    icon: BookOpen,
    color: "text-amber-600 bg-amber-100 dark:bg-amber-950",
  },
  {
    label: "Attendance",
    value: "—",
    note: "Today's attendance",
    icon: CalendarCheck,
    color: "text-sky-600 bg-sky-100 dark:bg-sky-950",
  },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Dashboard Overview
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Welcome to your High School Management System.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, note, icon: Icon, color }) => (
          <div
            key={label}
            className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {label}
              </span>
              <div className={`rounded-xl p-2.5 ${color}`}>
                <Icon size={22} />
              </div>
            </div>

            <p className="mt-4 text-3xl font-bold">{value}</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {note}
            </p>
          </div>
        ))}
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-semibold">Getting Started</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
          Start by registering students, adding teachers, creating Grade 7–12
          classes, and recording attendance and grades. Dashboard totals will be
          connected to your Laravel API later.
        </p>
      </section>
    </div>
  );
}
