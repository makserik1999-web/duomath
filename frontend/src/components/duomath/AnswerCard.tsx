import { Check, X } from "lucide-react";

interface AnswerCardProps {
  label: string;
  text: string;
  selected?: boolean;
  correct?: boolean | null;
  disabled?: boolean;
  onClick?: () => void;
}

export function AnswerCard({ label, text, selected, correct, disabled, onClick }: AnswerCardProps) {
  let stateClass = "hover:bg-secondary/80 hover:border-primary/20";
  if (selected && correct === null) stateClass = "bg-primary/10 border-primary/40 glow-primary";
  if (correct === true) stateClass = "bg-success/10 border-success/40 glow-success";
  if (correct === false && selected) stateClass = "bg-destructive/10 border-destructive/40";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center gap-4 p-4 rounded-xl border border-border motion-safe:transition-all motion-safe:duration-200 btn-press ${stateClass} ${
        disabled && !selected ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      }`}
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold font-display shrink-0 ${
        correct === true ? "bg-success text-success-foreground" :
        correct === false && selected ? "bg-destructive text-destructive-foreground" :
        selected ? "bg-primary text-primary-foreground" :
        "bg-secondary text-muted-foreground"
      }`}>
        {correct === true ? <Check className="w-4 h-4" /> :
         correct === false && selected ? <X className="w-4 h-4" /> : label}
      </div>
      <span className="text-sm font-medium text-left">{text}</span>
    </button>
  );
}
