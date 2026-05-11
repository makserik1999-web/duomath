import { useState } from "react";
import { Zap, Flame, User, LogOut, Settings } from "lucide-react";
import { XPBar } from "./XPBar";
import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { SettingsDrawer } from "./SettingsDrawer";

interface AppHeaderProps {
  xp?: number;
  maxXp?: number;
  level?: number;
  streak?: number;
  onLogout?: () => void;
}

export function AppHeader({ xp = 750, maxXp = 1000, level = 5, streak = 7, onLogout }: AppHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const navItems = [
    { path: "/dashboard", label: t("nav.learn") },
    { path: "/profile", label: t("nav.profile") },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center h-16 gap-6">
            <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 shrink-0 btn-press">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Zap className="w-4 h-4 text-background" />
              </div>
              <span className="font-display font-bold text-lg hidden sm:block">DuoMath</span>
            </button>

            <nav className="flex items-center gap-1">
              {navItems.map(item => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium motion-safe:transition-colors btn-press ${
                    location.pathname === item.path
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="hidden md:flex flex-1 max-w-xs">
              <div className="w-full">
                <XPBar current={xp} max={maxXp} level={level} />
              </div>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-streak/10 border border-[hsl(var(--streak)/0.2)]">
                <Flame className="w-4 h-4 text-streak" />
                <span className="text-sm font-bold text-streak">{streak}</span>
              </div>

              <button
                onClick={() => setSettingsOpen(true)}
                className="p-2 rounded-lg hover:bg-secondary motion-safe:transition-colors text-muted-foreground hover:text-foreground btn-press"
                aria-label={t("nav.settings")}
              >
                <Settings className="w-5 h-5" />
              </button>

              <button
                onClick={() => navigate("/profile")}
                className="p-2 rounded-lg hover:bg-secondary motion-safe:transition-colors text-muted-foreground hover:text-foreground btn-press"
              >
                <User className="w-5 h-5" />
              </button>

              <button
                onClick={onLogout}
                className="p-2 rounded-lg hover:bg-secondary motion-safe:transition-colors text-muted-foreground hover:text-foreground btn-press"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>
      <SettingsDrawer open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}
