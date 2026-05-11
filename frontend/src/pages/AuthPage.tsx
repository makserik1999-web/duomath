import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, Flame, CheckCircle, Star, Eye, EyeOff } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import heroImage from "@/assets/hero-math.jpg";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { login, loginGuest, register } = useAuth();

  const chips = [
    { icon: Flame, label: t("auth.chips.streak") },
    { icon: CheckCircle, label: t("auth.chips.checks") },
    { icon: Star, label: t("auth.chips.xp") },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(email, password, name || undefined);
      }
      navigate("/dashboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Auth failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex motion-safe:animate-page-enter">
      {/* Left - Hero */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img src={heroImage} alt="Math visualization" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        <div className="relative z-10 flex flex-col justify-center p-12 xl:p-16 max-w-lg">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Zap className="w-5 h-5 text-background" />
            </div>
            <span className="font-display font-bold text-2xl">DuoMath</span>
          </div>
          <h1 className="font-display text-4xl xl:text-5xl font-bold leading-tight mb-4">
            {t("auth.hero.title")}{" "}
            <span className="text-gradient-primary">{t("auth.hero.titleHighlight")}</span>
          </h1>
          <p className="text-muted-foreground text-lg mb-8">{t("auth.hero.subtitle")}</p>
          <div className="flex flex-wrap gap-2">
            {chips.map(chip => (
              <div key={chip.label} className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel text-sm">
                <chip.icon className="w-3.5 h-3.5 text-accent" />
                <span className="text-muted-foreground">{chip.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Zap className="w-4 h-4 text-background" />
            </div>
            <span className="font-display font-bold text-xl">DuoMath</span>
          </div>

          <h2 className="font-display text-2xl font-bold mb-1">
            {mode === "login" ? t("auth.welcomeBack") : t("auth.createAccount")}
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            {mode === "login" ? t("auth.continueJourney") : t("auth.startLearning")}
          </p>

          <div className="flex bg-secondary rounded-lg p-1 mb-6">
            {(["login", "register"] as const).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2 rounded-md text-sm font-medium motion-safe:transition-all btn-press ${
                  mode === m ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m === "login" ? t("auth.login") : t("auth.signup")}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div className="motion-safe:animate-fade-in">
                <label className="text-sm font-medium mb-1.5 block">{t("auth.name")}</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder={t("auth.namePlaceholder")}
                  className="w-full h-11 px-4 rounded-lg bg-secondary border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary motion-safe:transition-all"
                />
              </div>
            )}
            <div>
              <label className="text-sm font-medium mb-1.5 block">{t("auth.email")}</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={t("auth.emailPlaceholder")}
                className="w-full h-11 px-4 rounded-lg bg-secondary border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary motion-safe:transition-all"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">{t("auth.password")}</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={t("auth.passwordPlaceholder")}
                  className="w-full h-11 px-4 pr-11 rounded-lg bg-secondary border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary motion-safe:transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-lg bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-semibold text-sm hover:opacity-90 motion-safe:transition-opacity glow-primary btn-press disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "..." : mode === "login" ? t("auth.login") : t("auth.createAccount")}
            </button>
            <div className="relative flex py-4 items-center">
              <div className="flex-grow border-t border-border"></div>
              <span className="flex-shrink-0 mx-4 text-muted-foreground text-xs">{t("auth.or")}</span>
              <div className="flex-grow border-t border-border"></div>
            </div>
            <button
              type="button"
              onClick={async () => {
                setLoading(true);
                try {
                  await loginGuest();
                  navigate("/dashboard");
                } catch (e) {
                  setError(e instanceof Error ? e.message : "Auth failed");
                  setLoading(false);
                }
              }}
              disabled={loading}
              className="w-full h-11 rounded-lg bg-secondary text-foreground border border-border font-semibold text-sm hover:bg-secondary/80 motion-safe:transition-colors btn-press disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t("auth.guestLogin")}
            </button>
            {error && <p className="text-sm text-destructive mt-3">{error}</p>}
          </form>

          <p className="text-center text-xs text-muted-foreground mt-6">
            {mode === "login" ? t("auth.noAccount") + " " : t("auth.hasAccount") + " "}
            <button onClick={() => setMode(mode === "login" ? "register" : "login")} className="text-primary hover:underline">
              {mode === "login" ? t("auth.signup") : t("auth.login")}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
