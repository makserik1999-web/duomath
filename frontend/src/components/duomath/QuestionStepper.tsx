interface QuestionStepperProps {
  total: number;
  current: number;
  answers: (boolean | null)[];
}

export function QuestionStepper({ total, current, answers }: QuestionStepperProps) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-2 flex-1 rounded-full transition-all duration-300 ${
            answers[i] === true ? "bg-success" :
            answers[i] === false ? "bg-destructive" :
            i === current ? "bg-primary animate-pulse-glow" :
            "bg-secondary"
          }`}
        />
      ))}
    </div>
  );
}
