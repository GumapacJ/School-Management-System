import { Moon, Sun } from "lucide-react";

type ThemeToggleProps = {
  dark: boolean;
  onToggle: () => void;
};

export default function ThemeToggle({ dark, onToggle }: ThemeToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Light mode" : "Dark mode"}
      className="rounded-xl border border-slate-200 p-2.5 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
    >
      {dark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
