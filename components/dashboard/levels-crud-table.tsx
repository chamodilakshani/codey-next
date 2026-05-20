"use client";

import {
  createLevelAction,
  deleteLevelAction,
  updateLevelAction,
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
import { PlusIcon } from "lucide-react";

type CourseOption = {
  id: string;
  title: string;
};

type LevelRow = {
  id: string;
  courseId: string;
  courseTitle: string;
  title: string;
  slug: string;
  displayOrder: number;
  lessonCount: number;
};

function LevelForm({
  mode,
  level,
  courses,
}: {
  mode: "create" | "edit";
  level?: LevelRow;
  courses: CourseOption[];
}) {
  const action = mode === "create" ? createLevelAction : updateLevelAction;

  return (
    <form action={action} className="grid gap-3 overflow-y-auto px-4 pb-4">
      {level ? <input type="hidden" name="id" value={level.id} /> : null}
      <div>
        <Label htmlFor={`${mode}-courseId-${level?.id ?? "new"}`}>Course</Label>
        <select
          id={`${mode}-courseId-${level?.id ?? "new"}`}
          name="courseId"
          className="flex h-8 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          defaultValue={level?.courseId}
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
      <div>
        <Label htmlFor={`${mode}-title-${level?.id ?? "new"}`}>Title</Label>
        <Input
          id={`${mode}-title-${level?.id ?? "new"}`}
          name="title"
          defaultValue={level?.title}
          required
        />
      </div>
      <div>
        <Label htmlFor={`${mode}-slug-${level?.id ?? "new"}`}>Slug</Label>
        <Input
          id={`${mode}-slug-${level?.id ?? "new"}`}
          name="slug"
          defaultValue={level?.slug}
          required
        />
      </div>
      <div>
        <Label htmlFor={`${mode}-displayOrder-${level?.id ?? "new"}`}>Display Order</Label>
        <Input
          id={`${mode}-displayOrder-${level?.id ?? "new"}`}
          name="displayOrder"
          type="number"
          min="0"
          defaultValue={level?.displayOrder ?? 0}
          required
        />
      </div>
      <div>
        <Button type="submit">
          {mode === "create" ? "Create Level" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}

export function LevelsCrudTable({
  levels,
  courses,
}: {
  levels: LevelRow[];
  courses: CourseOption[];
}) {
  return (
    <div className="rounded-xl border">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <h2 className="text-lg font-semibold">Levels</h2>
          <p className="text-sm text-muted-foreground">{levels.length} total records</p>
        </div>
        <Drawer direction="right">
          <DrawerTrigger asChild>
            <Button>
              <PlusIcon />
              Add Level
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Create Level</DrawerTitle>
              <DrawerDescription>Add a new level to a course.</DrawerDescription>
            </DrawerHeader>
            <LevelForm mode="create" courses={courses} />
          </DrawerContent>
        </Drawer>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Course</TableHead>
            <TableHead>Lessons</TableHead>
            <TableHead>Order</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {levels.map((level) => (
            <TableRow key={level.id}>
              <TableCell>
                <div className="font-medium">{level.title}</div>
                <div className="text-xs text-muted-foreground">{level.slug}</div>
              </TableCell>
              <TableCell>{level.courseTitle}</TableCell>
              <TableCell>{level.lessonCount}</TableCell>
              <TableCell>{level.displayOrder}</TableCell>
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
                        <DrawerTitle>Edit Level</DrawerTitle>
                        <DrawerDescription>Update level settings.</DrawerDescription>
                      </DrawerHeader>
                      <LevelForm mode="edit" level={level} courses={courses} />
                    </DrawerContent>
                  </Drawer>
                  <form action={deleteLevelAction}>
                    <input type="hidden" name="id" value={level.id} />
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
