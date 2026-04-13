"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

type QuizQuestion = {
  question: string;
  options: string[];
  answerIndex: number;
  explanation?: string;
};

type LessonQuizProps = {
  title: string;
  questions: QuizQuestion[];
};

export function LessonQuiz({ title, questions }: LessonQuizProps) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

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

  return (
    <Card className="rounded-3xl">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {questions.map((question, index) => (
          <div key={index} className="rounded-2xl border border-border p-4">
            <p className="font-semibold">{index + 1}. {question.question}</p>
            <div className="mt-3 space-y-2">
              {question.options.map((option, optionIndex) => {
                const inputId = `q-${index}-o-${optionIndex}`;
                return (
                  <Label key={inputId} htmlFor={inputId} className="flex items-center gap-2 rounded-lg border border-border p-2">
                    <input
                      id={inputId}
                      type="radio"
                      name={`question-${index}`}
                      checked={answers[index] === optionIndex}
                      onChange={() => setAnswers((prev) => ({ ...prev, [index]: optionIndex }))}
                    />
                    <span>{option}</span>
                  </Label>
                );
              })}
            </div>

            {isSubmitted ? (
              <p className="mt-3 text-sm text-muted-foreground">
                {answers[index] === question.answerIndex ? "Correct" : "Not quite"}
                {question.explanation ? ` - ${question.explanation}` : ""}
              </p>
            ) : null}
          </div>
        ))}

        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" onClick={() => setIsSubmitted(true)}>
            Check Answers
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setAnswers({});
              setIsSubmitted(false);
            }}
          >
            Reset
          </Button>

          {isSubmitted ? (
            <p className="text-sm font-medium text-muted-foreground">
              Score: {result.correct}/{result.total} ({result.percent}%)
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
