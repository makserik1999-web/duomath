import { X, Globe, Sun, Moon, Monitor, Zap, Volume2, VolumeX } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useSettings } from "@/contexts/SettingsContext";

interface SettingsDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsDrawer({ open, onClose }: SettingsDrawerProps) {
  const { lang, setLang, t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { reducedMotion, setReducedMotion, soundEnabled, setSoundEnabled } = useSettings();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm motion-safe:animate-fade-in" />
      {/* Panel */}
      <div
        className="absolute right-0 top-0 h-full w-full max-w-sm bg-card border-l border-border shadow-2xl motion-safe:animate-slide-in-right overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-display font-bold text-lg">{t("settings.title")}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Language */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-semibold">{t("settings.language")}</span>
            </div>
            <div className="flex bg-secondary rounded-lg p-1">
              {(["en", "ru"] as const).map(l => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`flex-1 py-2 rounded-md text-sm font-medium transition-all duration-150 ${
                    lang === l ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {l === "en" ? "English" : "Русский"}
                </button>
              ))}
            </div>
          </section>

          {/* Theme */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Sun className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-semibold">{t("settings.theme")}</span>
            </div>
            <div className="flex bg-secondary rounded-lg p-1">
              {([
                { val: "light" as const, label: t("settings.themeLight"), icon: Sun },
                { val: "dark" as const, label: t("settings.themeDark"), icon: Moon },
                { val: "system" as const, label: t("settings.themeSystem"), icon: Monitor },
              ]).map(({ val, label, icon: Icon }) => (
                <button
                  key={val}
                  onClick={() => setTheme(val)}
                  className={`flex-1 py-2 rounded-md text-sm font-medium transition-all duration-150 flex items-center justify-center gap-1.5 ${
                    theme === val ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
            </div>
          </section>

          {/* Motion */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-semibold">{t("settings.motion")}</span>
            </div>
            <div className="flex bg-secondary rounded-lg p-1">
              {([
                { val: false, label: t("settings.motionNormal") },
                { val: true, label: t("settings.motionReduced") },
              ]).map(({ val, label }) => (
                <button
                  key={String(val)}
                  onClick={() => setReducedMotion(val)}
                  className={`flex-1 py-2 rounded-md text-sm font-medium transition-all duration-150 ${
                    reducedMotion === val ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </section>

          {/* Sound */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              {soundEnabled ? <Volume2 className="w-4 h-4 text-muted-foreground" /> : <VolumeX className="w-4 h-4 text-muted-foreground" />}
              <span className="text-sm font-semibold">{t("settings.sound")}</span>
            </div>
            <div className="flex bg-secondary rounded-lg p-1">
              {([
                { val: true, label: t("settings.on") },
                { val: false, label: t("settings.off") },
              ]).map(({ val, label }) => (
                <button
                  key={String(val)}
                  onClick={() => setSoundEnabled(val)}
                  className={`flex-1 py-2 rounded-md text-sm font-medium transition-all duration-150 ${
                    soundEnabled === val ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
