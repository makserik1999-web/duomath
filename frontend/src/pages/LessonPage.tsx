import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, X } from "lucide-react";
import { AnswerCard } from "@/components/duomath/AnswerCard";
import { QuestionStepper } from "@/components/duomath/QuestionStepper";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { learningApi, type LessonDetails } from "@/lib/api";

export default function LessonPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const lessonId = searchParams.get("id") ?? "";
  const { t } = useLanguage();
  const { accessToken } = useAuth();
  const [lessonDetails, setLessonDetails] = useState<LessonDetails | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [answers, setAnswers] = useState<(boolean | null)[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);

  useEffect(() => {
    if (!accessToken || !lessonId) return;
    learningApi.lessonDetails(accessToken, lessonId).then(details => {
      setLessonDetails(details);
      setAnswers(new Array(details.questions.length).fill(null));
      setSelectedAnswers(new Array(details.questions.length).fill(""));
    }).catch(() => {
      // handle error
    });
  }, [accessToken, lessonId]);

  const questions = lessonDetails?.questions ?? [];
  const question = questions[currentQ];
  const isCorrect = question && selectedAnswer !== null ? question.choices[selectedAnswer] === question.correctAnswer : false;

  if (!lessonDetails || !question) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">{t("lesson.question", { current: 0, total: 0 })}</p>
      </div>
    );
  }

  const handleSubmit = () => {
    if (selectedAnswer === null || !question) return;
    const isAnsCorrect = question.choices[selectedAnswer] === question.correctAnswer;
    
    const newAnswers = [...answers];
    newAnswers[currentQ] = isAnsCorrect;
    setAnswers(newAnswers);
    
    const newSelectedAnswers = [...selectedAnswers];
    newSelectedAnswers[currentQ] = question.choices[selectedAnswer];
    setSelectedAnswers(newSelectedAnswers);
    
    setSubmitted(true);
  };

  const handleFinish = async () => {
    if (!accessToken || !lessonDetails) return;
    const payload = questions.map((q, i) => ({
      questionId: q.id,
      answer: selectedAnswers[i] ?? "",
    }));
    try {
      const result = await learningApi.submitLesson(accessToken, lessonDetails.lesson.id, payload);
      navigate("/result", { state: { correct: result.correctAnswers, total: result.totalQuestions, xpGained: result.xpGained, streakDays: result.streakDays, achievements: result.unlockedAchievements } });
    } catch {
      // handle error
    }
  };

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
      setSelectedAnswer(null);
      setSubmitted(false);
    } else {
      void handleFinish();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col motion-safe:animate-page-enter">
      <div className="border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-4">
          <button onClick={() => navigate("/dashboard")} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground motion-safe:transition-colors btn-press">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <QuestionStepper total={questions.length} current={currentQ} answers={answers} />
          </div>
          <button onClick={() => navigate("/dashboard")} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground motion-safe:transition-colors btn-press">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-start justify-center pt-8 sm:pt-16 px-4 pb-32">
        <div className="w-full max-w-2xl motion-safe:animate-slide-up">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-warning/15 text-warning border border-[hsl(var(--warning)/0.2)]">
              {t("difficulty." + (lessonDetails.lesson.level?.toLowerCase() || "medium"))}
            </span>
            <span className="text-xs text-muted-foreground">{t("lessonTitles." + lessonDetails.lesson.id) || lessonDetails.lesson.title}</span>
          </div>

          <div className="flex items-center justify-between mb-8">
            <span className="text-xs text-muted-foreground">{t("lesson.question", { current: currentQ + 1, total: questions.length })}</span>
            <span className="text-xs text-xp font-medium">+50 XP</span>
          </div>

          <h2 className="font-display text-xl sm:text-2xl font-bold mb-8">{t("questions." + question.id) || question.prompt}</h2>

          <div className="space-y-3 mb-8">
            {question.choices.map((opt, i) => (
              <AnswerCard
                key={`${currentQ}-${i}`}
                label={String.fromCharCode(65 + i)}
                text={opt}
                selected={selectedAnswer === i}
                correct={submitted ? (question.choices[i] === question.correctAnswer ? true : selectedAnswer === i ? false : null) : null}
                disabled={submitted}
                onClick={() => !submitted && setSelectedAnswer(i)}
              />
            ))}
          </div>

          {submitted && (
            <div className={`p-4 rounded-xl mb-6 motion-safe:animate-scale-in ${
              isCorrect ? "bg-success/10 border border-success/30" : "bg-destructive/10 border border-destructive/30"
            }`}>
              <p className={`font-semibold text-sm ${isCorrect ? "text-success" : "text-destructive"}`}>
                {isCorrect ? t("lesson.correct") : t("lesson.incorrect")}
              </p>
              {!isCorrect && (
                <p className="text-xs text-muted-foreground mt-1">
                  {t("lesson.correctAnswerIs", { answer: question.correctAnswer })}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/90 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-4 py-4 flex justify-end">
          {!submitted ? (
            <button
              onClick={handleSubmit}
              disabled={selectedAnswer === null}
              className={`px-8 py-2.5 rounded-lg font-semibold text-sm motion-safe:transition-all btn-press ${
                selectedAnswer !== null
                  ? "bg-primary text-primary-foreground hover:opacity-90 glow-primary"
                  : "bg-secondary text-muted-foreground cursor-not-allowed"
              }`}
            >
              {t("lesson.checkAnswer")}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-8 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 glow-primary motion-safe:transition-all btn-press"
            >
              {currentQ < questions.length - 1 ? t("lesson.nextQuestion") : t("lesson.seeResults")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
