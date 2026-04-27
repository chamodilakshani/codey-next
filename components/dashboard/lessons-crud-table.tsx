"use client";

import {
  createLessonAction,
  deleteLessonAction,
  updateLessonAction,
} from "@/app/admin/actions";
import { Badge } from "@/components/ui/badge";
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

type CourseOption = {
  id: string;
  title: string;
};

type LessonRow = {
  id: string;
  courseId: string;
  courseTitle: string;
  title: string;
  slug: string;
  description: string;
  videoUrl: string;
  gameHtmlPath: string | null;
  durationMinutes: number;
  displayOrder: number;
  isPreview: boolean;
  hasQuiz: boolean;
};

const selectClassName =
  "flex h-8 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

function LessonForm({
  mode,
  lesson,
  courses,
}: {
  mode: "create" | "edit";
  lesson?: LessonRow;
  courses: CourseOption[];
}) {
  const action = mode === "create" ? createLessonAction : updateLessonAction;

  return (
    <form action={action} className="grid gap-3 overflow-y-auto px-4 pb-4">
      {lesson ? <input type="hidden" name="id" value={lesson.id} /> : null}
      <div>
        <Label htmlFor={`${mode}-courseId-${lesson?.id ?? "new"}`}>Course</Label>
        <select
          id={`${mode}-courseId-${lesson?.id ?? "new"}`}
          name="courseId"
          className={selectClassName}
          defaultValue={lesson?.courseId}
          required
        >
          <option value="">Select course</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.title}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor={`${mode}-title-${lesson?.id ?? "new"}`}>Title</Label>
          <Input
            id={`${mode}-title-${lesson?.id ?? "new"}`}
            name="title"
            defaultValue={lesson?.title}
            required
          />
        </div>
        <div>
          <Label htmlFor={`${mode}-slug-${lesson?.id ?? "new"}`}>Slug</Label>
          <Input
            id={`${mode}-slug-${lesson?.id ?? "new"}`}
            name="slug"
            defaultValue={lesson?.slug}
            required
          />
        </div>
      </div>
      <div>
        <Label htmlFor={`${mode}-description-${lesson?.id ?? "new"}`}>
          Description
        </Label>
        <Textarea
          id={`${mode}-description-${lesson?.id ?? "new"}`}
          name="description"
          defaultValue={lesson?.description}
          required
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor={`${mode}-videoUrl-${lesson?.id ?? "new"}`}>
            Video URL
          </Label>
          <Input
            id={`${mode}-videoUrl-${lesson?.id ?? "new"}`}
            name="videoUrl"
            defaultValue={lesson?.videoUrl}
            required
          />
        </div>
        <div>
          <Label htmlFor={`${mode}-gameHtmlPath-${lesson?.id ?? "new"}`}>
            Game HTML Path
          </Label>
          <Input
            id={`${mode}-gameHtmlPath-${lesson?.id ?? "new"}`}
            name="gameHtmlPath"
            defaultValue={lesson?.gameHtmlPath ?? ""}
          />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor={`${mode}-durationMinutes-${lesson?.id ?? "new"}`}>
            Duration Minutes
          </Label>
          <Input
            id={`${mode}-durationMinutes-${lesson?.id ?? "new"}`}
            name="durationMinutes"
            type="number"
            min="1"
            defaultValue={lesson?.durationMinutes ?? 10}
            required
          />
        </div>
        <div>
          <Label htmlFor={`${mode}-displayOrder-${lesson?.id ?? "new"}`}>
            Display Order
          </Label>
          <Input
            id={`${mode}-displayOrder-${lesson?.id ?? "new"}`}
            name="displayOrder"
            type="number"
            min="0"
            defaultValue={lesson?.displayOrder ?? 0}
            required
          />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="isPreview"
          defaultChecked={lesson?.isPreview ?? false}
        />
        Preview lesson
      </label>
      <div>
        <Button type="submit">
          {mode === "create" ? "Create Lesson" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}

export function LessonsCrudTable({
  lessons,
  courses,
}: {
  lessons: LessonRow[];
  courses: CourseOption[];
}) {
  return (
    <div className="rounded-xl border">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <h2 className="text-lg font-semibold">Lessons</h2>
          <p className="text-sm text-muted-foreground">
            {lessons.length} total records
          </p>
        </div>
        <Drawer direction="right">
          <DrawerTrigger asChild>
            <Button>
              <PlusIcon />
              Add Lesson
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Create Lesson</DrawerTitle>
              <DrawerDescription>Add a new lesson record.</DrawerDescription>
            </DrawerHeader>
            <LessonForm mode="create" courses={courses} />
          </DrawerContent>
        </Drawer>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Course</TableHead>
            <TableHead>Preview</TableHead>
            <TableHead>Quiz</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lessons.map((lesson) => (
            <TableRow key={lesson.id}>
              <TableCell>
                <div className="font-medium">{lesson.title}</div>
                <div className="text-xs text-muted-foreground">{lesson.slug}</div>
              </TableCell>
              <TableCell>{lesson.courseTitle}</TableCell>
              <TableCell>
                <Badge variant={lesson.isPreview ? "default" : "outline"}>
                  {lesson.isPreview ? "Yes" : "No"}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={lesson.hasQuiz ? "default" : "outline"}>
                  {lesson.hasQuiz ? "Linked" : "None"}
                </Badge>
              </TableCell>
              <TableCell>{lesson.durationMinutes} min</TableCell>
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
                        <DrawerTitle>Edit Lesson</DrawerTitle>
                        <DrawerDescription>
                          Update lesson information.
                        </DrawerDescription>
                      </DrawerHeader>
                      <LessonForm mode="edit" lesson={lesson} courses={courses} />
                    </DrawerContent>
                  </Drawer>
                  <form action={deleteLessonAction}>
                    <input type="hidden" name="id" value={lesson.id} />
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
