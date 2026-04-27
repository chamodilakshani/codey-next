"use client";

import {
  createQuizAction,
  deleteQuizAction,
  updateQuizAction,
} from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { PlusIcon } from "lucide-react";

type LessonOption = {
  id: string;
  title: string;
  courseTitle: string;
};

type QuizRow = {
  id: string;
  lessonId: string;
  lessonTitle: string;
  courseTitle: string;
  title: string;
  questionsJson: string;
};

const selectClassName =
  "flex h-8 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

const defaultQuizJson = `[
  {
    "question": "Sample question?",
    "options": ["Option A", "Option B"],
    "answerIndex": 0,
    "explanation": "Optional explanation"
  }
]`;

function QuizForm({
  mode,
  quiz,
  lessons,
}: {
  mode: "create" | "edit";
  quiz?: QuizRow;
  lessons: LessonOption[];
}) {
  const action = mode === "create" ? createQuizAction : updateQuizAction;

  return (
    <form action={action} className="grid gap-3 overflow-y-auto px-4 pb-4">
      {quiz ? <input type="hidden" name="id" value={quiz.id} /> : null}
      <div>
        <Label htmlFor={`${mode}-lessonId-${quiz?.id ?? "new"}`}>Lesson</Label>
        <select
          id={`${mode}-lessonId-${quiz?.id ?? "new"}`}
          name="lessonId"
          className={selectClassName}
          defaultValue={quiz?.lessonId}
          required
        >
          <option value="">Select lesson</option>
          {lessons.map((lesson) => (
            <option key={lesson.id} value={lesson.id}>
              {lesson.courseTitle} / {lesson.title}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor={`${mode}-title-${quiz?.id ?? "new"}`}>Title</Label>
        <Input
          id={`${mode}-title-${quiz?.id ?? "new"}`}
          name="title"
          defaultValue={quiz?.title}
          required
        />
      </div>
      <div>
        <Label htmlFor={`${mode}-quizQuestionsJson-${quiz?.id ?? "new"}`}>
          Questions JSON
        </Label>
        <Textarea
          id={`${mode}-quizQuestionsJson-${quiz?.id ?? "new"}`}
          name="quizQuestionsJson"
          defaultValue={quiz?.questionsJson ?? defaultQuizJson}
          className="min-h-44 font-mono text-xs"
          required
        />
      </div>
      <div>
        <Button type="submit">
          {mode === "create" ? "Create Quiz" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}

export function QuizzesCrudTable({
  quizzes,
  lessons,
}: {
  quizzes: QuizRow[];
  lessons: LessonOption[];
}) {
  return (
    <div className="rounded-xl border">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <h2 className="text-lg font-semibold">Quizzes</h2>
          <p className="text-sm text-muted-foreground">
            {quizzes.length} total records
          </p>
        </div>
        <Drawer direction="right">
          <DrawerTrigger asChild>
            <Button>
              <PlusIcon />
              Add Quiz
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Create Quiz</DrawerTitle>
              <DrawerDescription>Add a new quiz record.</DrawerDescription>
            </DrawerHeader>
            <QuizForm mode="create" lessons={lessons} />
          </DrawerContent>
        </Drawer>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Course</TableHead>
            <TableHead>Lesson</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {quizzes.map((quiz) => (
            <TableRow key={quiz.id}>
              <TableCell className="font-medium">{quiz.title}</TableCell>
              <TableCell>{quiz.courseTitle}</TableCell>
              <TableCell>{quiz.lessonTitle}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Drawer direction="right">
                    <DrawerTrigger asChild>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </DrawerTrigger>
                    <DrawerContent>
                      <DrawerHeader>
                        <DrawerTitle>Edit Quiz</DrawerTitle>
                        <DrawerDescription>
                          Update quiz information.
                        </DrawerDescription>
                      </DrawerHeader>
                      <QuizForm mode="edit" quiz={quiz} lessons={lessons} />
                    </DrawerContent>
                  </Drawer>
                  <form action={deleteQuizAction}>
                    <input type="hidden" name="id" value={quiz.id} />
                    <Button type="submit" variant="destructive" size="sm">
                      Delete
                    </Button>
                  </form>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
