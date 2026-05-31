"use client";

import { useMemo, useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Trophy } from "lucide-react";

type QuizQuestion = {
  question: string;
  options: string[];
  answerIndex: number;
  explanation?: string;
};

type QuizAttempt = {
  id: string;
  score: number;
  total: number;
  percent: number;
  createdAt: string;
  answers: Array<{
    questionIndex: number;
    selectedOptionIndex: number;
    isCorrect: boolean;
    question: string;
    options: string[];
    correctAnswerIndex: number;
    explanation?: string;
  }>;
};

type LessonQuizProps = {
  quizId: string;
  title: string;
  questions: QuizQuestion[];
  onQuizSubmitted?: (percent: number) => void;
};

export function LessonQuiz({ quizId, title, questions, onQuizSubmitted }: LessonQuizProps) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [certificateIssued, setCertificateIssued] = useState(false);

  useEffect(() => {
    // Fetch previous attempts
    fetch(`/api/quiz-attempts?quizId=${quizId}`)
      .then((res) => res.json())
      .then((data) => setAttempts(data.attempts || []))
      .catch(console.error);
  }, [quizId]);

  const result = useMemo(() => {
    const total = questions.length;
    const correct = questions.reduce((sum, question, index) => {
      return sum + (answers[index] === question.answerIndex ? 1 : 0);
    }, 0);

    return {
      total,
      correct,
      percent: total > 0 ? Math.round((correct / total) * 100) : 0,
    };
  }, [answers, questions]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/quiz-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quizId, answers }),
      });
      const data = await res.json();

      if (data.attemptId) {
        onQuizSubmitted?.(data.percent);

        // Refresh attempts list
        const attemptsRes = await fetch(`/api/quiz-attempts?quizId=${quizId}`);
        const attemptsData = await attemptsRes.json();
        setAttempts(attemptsData.attempts || []);

        if (data.certificateIssued) {
          setCertificateIssued(true);
        }
      }
    } catch (error) {
      console.error("Submit error:", error);
    } finally {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }
  };

  const latestAttempt = attempts[0];
  const passed = latestAttempt && latestAttempt.percent >= 70;
  const canSubmit = !isSubmitting && Object.keys(answers).length === questions.length;

  return (
    <Card className="rounded-3xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          {passed && (
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              <CheckCircle className="w-3 h-3 mr-1" />
              Passed ({latestAttempt.percent}%)
            </Badge>
          )}
        </div>
        {certificateIssued && (
          <CardDescription className="text-green-600 flex items-center gap-2 mt-2">
            <Trophy className="w-4 h-4" />
            Course completed! Certificate issued.
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-5">
        {questions.map((question, index) => (
          <div key={index} className="rounded-2xl border border-border p-4">
            <p className="font-semibold">{index + 1}. {question.question}</p>
            <div className="mt-3 space-y-2">
              {question.options.map((option, optionIndex) => {
                const inputId = `q-${index}-o-${optionIndex}`;
                const isSelected = answers[index] === optionIndex;
                const showResult = isSubmitted;
                const attemptAnswer = latestAttempt?.answers.find(a => a.questionIndex === index);

                let borderColor = "border-border";
                if (showResult && attemptAnswer) {
                  if (optionIndex === attemptAnswer.correctAnswerIndex) {
                    borderColor = "border-green-500 bg-green-50";
                  } else if (optionIndex === attemptAnswer.selectedOptionIndex && !attemptAnswer.isCorrect) {
                    borderColor = "border-red-500 bg-red-50";
                  }
                } else if (isSelected && !showResult) {
                  borderColor = "border-primary";
                }

                return (
                  <Label
                    key={inputId}
                    htmlFor={inputId}
                    className={`flex items-center gap-2 rounded-lg border p-2 cursor-pointer ${borderColor}`}
                  >
                    <input
                      id={inputId}
                      type="radio"
                      name={`question-${index}`}
                      checked={isSelected}
                      onChange={() => setAnswers((prev) => ({ ...prev, [index]: optionIndex }))}
                      disabled={isSubmitting}
                    />
                    <span>{option}</span>
                    {showResult && optionIndex === attemptAnswer?.correctAnswerIndex && (
                      <CheckCircle className="w-4 h-4 text-green-600 ml-auto" />
                    )}
                    {showResult && optionIndex === attemptAnswer?.selectedOptionIndex && !attemptAnswer.isCorrect && (
                      <XCircle className="w-4 h-4 text-red-600 ml-auto" />
                    )}
                  </Label>
                );
              })}
            </div>

            {isSubmitted ? (
              <div className="mt-3 space-y-2">
                {latestAttempt?.answers.find(a => a.questionIndex === index)?.explanation && (
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Explanation:</span> {latestAttempt.answers.find(a => a.questionIndex === index)?.explanation}
                  </p>
                )}
              </div>
            ) : null}
          </div>
        ))}

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            {isSubmitting ? "Submitting..." : attempts.length > 0 ? "Retake Quiz" : "Submit Answers"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setAnswers({});
              setIsSubmitted(false);
            }}
            disabled={isSubmitting}
          >
            Reset
          </Button>
          {attempts.length > 0 ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowHistory(!showHistory)}
            >
              {showHistory ? "Hide" : "View"} Attempt History ({attempts.length})
            </Button>
          ) : null}

          {isSubmitted && (
            <p className="text-sm font-medium text-muted-foreground">
              Score: {result.correct}/{result.total} ({result.percent}%)
            </p>
          )}
        </div>

        {showHistory && attempts.length > 0 && (
          <div className="mt-4 space-y-3">
            <h4 className="font-semibold">Attempt History</h4>
            {attempts.map((attempt, idx) => (
              <Card key={attempt.id} className="p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Attempt #{attempts.length - idx}
                  </span>
                  <Badge variant={attempt.percent >= 70 ? "default" : "secondary"}>
                    {attempt.score}/{attempt.total} ({attempt.percent}%)
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(attempt.createdAt).toLocaleString()}
                </p>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
