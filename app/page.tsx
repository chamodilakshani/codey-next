import Link from "next/link";
import Image from "next/image";
import { PlayCircle, Sparkles } from "lucide-react";
import { auth } from "@clerk/nextjs/server";

import { Button } from "@/components/ui/button";
import {
  getAgeGroupLabel,
  getDifficultyLabel,
  getPublishedCourses,
} from "@/lib/course-data";

export default async function Home() {
  const { userId } = await auth();
  const courses = await getPublishedCourses();

  return (
    <main className="min-h-full bg-[radial-gradient(120%_120%_at_20%_10%,oklch(0.96_0.02_85),transparent),radial-gradient(90%_70%_at_90%_20%,oklch(0.92_0.04_230),transparent),linear-gradient(180deg,oklch(0.99_0_0)_0%,oklch(0.97_0.01_95)_100%)] px-6 py-10 sm:px-10">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-10">
        <div className="flex flex-wrap justify-end gap-2">
          {userId ? (
            <Button asChild variant="outline">
              <Link href="/profile">My Profile</Link>
            </Button>
          ) : null}
          <Button asChild variant="outline">
            <Link href="/admin">Open Admin Dashboard</Link>
          </Button>
        </div>

        <div className="rounded-3xl border border-border/70 bg-card/70 p-8 shadow-lg backdrop-blur sm:p-12">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="size-4" />
            Video Academy for Curious Kids
          </p>
          <h1 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-5xl">
            Learn Through Bite-Sized Video Lessons
          </h1>
          <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Discover science, coding, and language courses designed for kids.
            Every course has fun, guided lessons and simple progress-friendly
            structure.
          </p>
        </div>

        {courses.length > 0 ? (
          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => {
              const thumbnailSrc = course.thumbnailUrl.startsWith("https://images.unsplash.com/")
                ? course.thumbnailUrl
                : "/course-placeholder.svg";

              return (
                <article
                  key={course.id}
                  className="group overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={thumbnailSrc}
                      alt={course.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  </div>

                  <div className="flex flex-col gap-4 p-5">
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full bg-secondary px-2.5 py-1 font-medium text-secondary-foreground">
                        {getAgeGroupLabel(course.ageGroup)}
                      </span>
                      <span className="rounded-full bg-muted px-2.5 py-1 font-medium text-muted-foreground">
                        {getDifficultyLabel(course.difficulty)}
                      </span>
                      <span className="rounded-full bg-muted px-2.5 py-1 font-medium text-muted-foreground">
                        {course.durationMinutes} mins
                      </span>
                    </div>

                    <div>
                      <h2 className="text-xl font-semibold tracking-tight">{course.title}</h2>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {course.shortDescription}
                      </p>
                    </div>

                    <div className="mt-auto flex items-center justify-between text-sm text-muted-foreground">
                      <span>{course.lessons.length} lessons</span>
                      <PlayCircle className="size-4" />
                    </div>

                    <Button asChild className="w-full">
                      <Link href={`/courses/${course.slug}`}>Start Course</Link>
                    </Button>
                  </div>
                </article>
              );
            })}
          </section>
        ) : (
          <section className="rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
            <h2 className="text-2xl font-semibold">No Courses Published Yet</h2>
            <p className="mt-2 text-muted-foreground">
              Courses will appear here as soon as they are published from the dashboard.
            </p>
          </section>
        )}
      </section>
    </main>
  );
}
