"use client";

import {
  createCourseAction,
  deleteCourseAction,
  updateCourseAction,
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

type CourseRow = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  thumbnailUrl: string;
  ageGroup: string;
  difficulty: string;
  durationMinutes: number;
  displayOrder: number;
  isPublished: boolean;
  lessonCount: number;
};

const selectClassName =
  "flex h-8 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

function getAgeGroupLabel(ageGroup: string) {
  const map: Record<string, string> = {
    AGE_5_7: "Ages 5-7",
    AGE_8_10: "Ages 8-10",
    AGE_11_13: "Ages 11-13",
  };

  return map[ageGroup] ?? ageGroup;
}

function getDifficultyLabel(difficulty: string) {
  const map: Record<string, string> = {
    BEGINNER: "Beginner",
    INTERMEDIATE: "Intermediate",
    ADVANCED: "Advanced",
  };

  return map[difficulty] ?? difficulty;
}

function CourseForm({
  mode,
  course,
}: {
  mode: "create" | "edit";
  course?: CourseRow;
}) {
  const action = mode === "create" ? createCourseAction : updateCourseAction;

  return (
    <form action={action} className="grid gap-3 overflow-y-auto px-4 pb-4">
      {course ? <input type="hidden" name="id" value={course.id} /> : null}
      <div>
        <Label htmlFor={`${mode}-title-${course?.id ?? "new"}`}>Title</Label>
        <Input
          id={`${mode}-title-${course?.id ?? "new"}`}
          name="title"
          defaultValue={course?.title}
          required
        />
      </div>
      <div>
        <Label htmlFor={`${mode}-slug-${course?.id ?? "new"}`}>Slug</Label>
        <Input
          id={`${mode}-slug-${course?.id ?? "new"}`}
          name="slug"
          defaultValue={course?.slug}
          required
        />
      </div>
      <div>
        <Label htmlFor={`${mode}-shortDescription-${course?.id ?? "new"}`}>
          Short Description
        </Label>
        <Textarea
          id={`${mode}-shortDescription-${course?.id ?? "new"}`}
          name="shortDescription"
          defaultValue={course?.shortDescription}
          required
        />
      </div>
      <div>
        <Label htmlFor={`${mode}-description-${course?.id ?? "new"}`}>
          Description
        </Label>
        <Textarea
          id={`${mode}-description-${course?.id ?? "new"}`}
          name="description"
          defaultValue={course?.description}
          required
        />
      </div>
      <div>
        <Label htmlFor={`${mode}-thumbnailUrl-${course?.id ?? "new"}`}>
          Thumbnail URL
        </Label>
        <Input
          id={`${mode}-thumbnailUrl-${course?.id ?? "new"}`}
          name="thumbnailUrl"
          defaultValue={course?.thumbnailUrl}
          required
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor={`${mode}-ageGroup-${course?.id ?? "new"}`}>
            Age Group
          </Label>
          <select
            id={`${mode}-ageGroup-${course?.id ?? "new"}`}
            name="ageGroup"
            className={selectClassName}
            defaultValue={course?.ageGroup ?? "AGE_8_10"}
          >
            <option value="AGE_5_7">Ages 5-7</option>
            <option value="AGE_8_10">Ages 8-10</option>
            <option value="AGE_11_13">Ages 11-13</option>
          </select>
        </div>
        <div>
          <Label htmlFor={`${mode}-difficulty-${course?.id ?? "new"}`}>
            Difficulty
          </Label>
          <select
            id={`${mode}-difficulty-${course?.id ?? "new"}`}
            name="difficulty"
            className={selectClassName}
            defaultValue={course?.difficulty ?? "BEGINNER"}
          >
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </select>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor={`${mode}-durationMinutes-${course?.id ?? "new"}`}>
            Duration Minutes
          </Label>
          <Input
            id={`${mode}-durationMinutes-${course?.id ?? "new"}`}
            name="durationMinutes"
            type="number"
            min="1"
            defaultValue={course?.durationMinutes ?? 30}
            required
          />
        </div>
        <div>
          <Label htmlFor={`${mode}-displayOrder-${course?.id ?? "new"}`}>
            Display Order
          </Label>
          <Input
            id={`${mode}-displayOrder-${course?.id ?? "new"}`}
            name="displayOrder"
            type="number"
            min="0"
            defaultValue={course?.displayOrder ?? 0}
            required
          />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="isPublished"
          defaultChecked={course?.isPublished ?? true}
        />
        Published
      </label>
      <div>
        <Button type="submit">
          {mode === "create" ? "Create Course" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}

export function CoursesCrudTable({ courses }: { courses: CourseRow[] }) {
  return (
    <div className="rounded-xl border">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <h2 className="text-lg font-semibold">Courses</h2>
          <p className="text-sm text-muted-foreground">
            {courses.length} total records
          </p>
        </div>
        <Drawer direction="right">
          <DrawerTrigger asChild>
            <Button>
              <PlusIcon />
              Add Course
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Create Course</DrawerTitle>
              <DrawerDescription>
                Add a new course to the catalog.
              </DrawerDescription>
            </DrawerHeader>
            <CourseForm mode="create" />
          </DrawerContent>
        </Drawer>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Audience</TableHead>
            <TableHead>Lessons</TableHead>
            <TableHead>Order</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {courses.map((course) => (
            <TableRow key={course.id}>
              <TableCell>
                <div className="font-medium">{course.title}</div>
                <div className="text-xs text-muted-foreground">{course.slug}</div>
              </TableCell>
              <TableCell>
                <Badge variant={course.isPublished ? "default" : "outline"}>
                  {course.isPublished ? "Published" : "Draft"}
                </Badge>
              </TableCell>
              <TableCell>
                <div>{getAgeGroupLabel(course.ageGroup)}</div>
                <div className="text-xs text-muted-foreground">
                  {getDifficultyLabel(course.difficulty)}
                </div>
              </TableCell>
              <TableCell>{course.lessonCount}</TableCell>
              <TableCell>{course.displayOrder}</TableCell>
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
                        <DrawerTitle>Edit Course</DrawerTitle>
                        <DrawerDescription>
                          Update course information.
                        </DrawerDescription>
                      </DrawerHeader>
                      <CourseForm mode="edit" course={course} />
                    </DrawerContent>
                  </Drawer>
                  <form action={deleteCourseAction}>
                    <input type="hidden" name="id" value={course.id} />
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
