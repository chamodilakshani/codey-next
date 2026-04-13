import prisma from "../lib/prisma";
import { AgeGroup, Difficulty } from "../app/generated/prisma/enums";

type SeedLesson = {
  title: string;
  slug: string;
  description: string;
  videoUrl: string;
  gameHtmlPath: string;
  quiz: {
    title: string;
    questions: Array<{
      question: string;
      options: string[];
      answerIndex: number;
      explanation?: string;
    }>;
  };
  durationMinutes: number;
  isPreview?: boolean;
};

type SeedCourse = {
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  thumbnailUrl: string;
  ageGroup: AgeGroup;
  difficulty: Difficulty;
  durationMinutes: number;
  displayOrder: number;
  lessons: SeedLesson[];
};

const courses: SeedCourse[] = [
  {
    slug: "space-explorers-101",
    title: "Space Explorers 101",
    shortDescription: "Learn planets, stars, and rockets through fun mini-lessons.",
    description:
      "A beginner-friendly science adventure where kids learn how our solar system works and what astronauts do.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1200&q=80",
    ageGroup: AgeGroup.AGE_8_10,
    difficulty: Difficulty.BEGINNER,
    durationMinutes: 50,
    displayOrder: 1,
    lessons: [
      {
        title: "Meet the Solar System",
        slug: "meet-the-solar-system",
        description: "Tour all planets and discover what makes each one special.",
        videoUrl: "https://www.youtube.com/embed/libKVRa01L8",
        gameHtmlPath: "/games/space-dodge.html",
        quiz: {
          title: "Solar System Quick Quiz",
          questions: [
            {
              question: "Which planet is known as the Red Planet?",
              options: ["Mars", "Earth", "Jupiter"],
              answerIndex: 0,
              explanation: "Mars appears red because of iron oxide dust.",
            },
            {
              question: "Which star is at the center of our solar system?",
              options: ["Polaris", "The Sun", "Sirius"],
              answerIndex: 1,
            },
          ],
        },
        durationMinutes: 12,
        isPreview: true,
      },
      {
        title: "How Rockets Fly",
        slug: "how-rockets-fly",
        description: "Understand lift, thrust, and why astronauts wear space suits.",
        videoUrl: "https://www.youtube.com/embed/A03oI0znAoc",
        gameHtmlPath: "/games/math-race.html",
        quiz: {
          title: "Rocket Science Basics",
          questions: [
            {
              question: "Which force pushes a rocket upward?",
              options: ["Thrust", "Friction", "Magnetism"],
              answerIndex: 0,
            },
            {
              question: "Fuel burns and exits the rocket to create...",
              options: ["Drag", "Lift", "Thrust"],
              answerIndex: 2,
            },
          ],
        },
        durationMinutes: 15,
      },
      {
        title: "A Day on the ISS",
        slug: "a-day-on-the-iss",
        description: "See what life is like aboard the International Space Station.",
        videoUrl: "https://www.youtube.com/embed/SGP6Y0Pnhe4",
        gameHtmlPath: "/games/space-dodge.html",
        quiz: {
          title: "ISS Challenge",
          questions: [
            {
              question: "Why do astronauts float on the ISS?",
              options: ["No gravity at all", "Microgravity", "Strong wind"],
              answerIndex: 1,
            },
          ],
        },
        durationMinutes: 13,
      },
    ],
  },
  {
    slug: "creative-coding-for-kids",
    title: "Creative Coding for Kids",
    shortDescription: "Build animations and games with visual coding ideas.",
    description:
      "Kids learn coding logic by making colorful characters move, react, and tell stories.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
    ageGroup: AgeGroup.AGE_11_13,
    difficulty: Difficulty.INTERMEDIATE,
    durationMinutes: 62,
    displayOrder: 2,
    lessons: [
      {
        title: "Think Like a Coder",
        slug: "think-like-a-coder",
        description: "Learn sequences, loops, and conditions through simple challenges.",
        videoUrl: "https://www.youtube.com/embed/zOjov-2OZ0E",
        gameHtmlPath: "/games/word-blast.html",
        quiz: {
          title: "Coding Thinking Quiz",
          questions: [
            {
              question: "A loop is best used when...",
              options: ["You repeat steps", "You end the game", "You delete code"],
              answerIndex: 0,
            },
          ],
        },
        durationMinutes: 14,
        isPreview: true,
      },
      {
        title: "Make a Character Move",
        slug: "make-a-character-move",
        description: "Animate a sprite with keyboard input and reusable blocks.",
        videoUrl: "https://www.youtube.com/embed/jXUZaf5D12Y",
        gameHtmlPath: "/games/word-blast.html",
        quiz: {
          title: "Sprite Movement Quiz",
          questions: [
            {
              question: "Which input can move a character in games?",
              options: ["Keyboard arrows", "Printer", "Speaker"],
              answerIndex: 0,
            },
          ],
        },
        durationMinutes: 18,
      },
      {
        title: "Build a Mini Game",
        slug: "build-a-mini-game",
        description: "Create points, obstacles, and a game-over screen.",
        videoUrl: "https://www.youtube.com/embed/2S6M8A9X4j0",
        gameHtmlPath: "/games/math-race.html",
        quiz: {
          title: "Mini Game Builder Quiz",
          questions: [
            {
              question: "What usually ends a game round?",
              options: ["A game-over condition", "A random color", "A font change"],
              answerIndex: 0,
            },
          ],
        },
        durationMinutes: 20,
      },
    ],
  },
  {
    slug: "storytime-english-club",
    title: "Storytime English Club",
    shortDescription: "Improve reading and speaking with interactive stories.",
    description:
      "An engaging language course with playful reading, vocabulary games, and story retelling.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80",
    ageGroup: AgeGroup.AGE_5_7,
    difficulty: Difficulty.BEGINNER,
    durationMinutes: 42,
    displayOrder: 3,
    lessons: [
      {
        title: "Meet Story Characters",
        slug: "meet-story-characters",
        description: "Practice names, feelings, and actions with picture cards.",
        videoUrl: "https://www.youtube.com/embed/bD6awQWs6vY",
        gameHtmlPath: "/games/word-blast.html",
        quiz: {
          title: "Character Vocabulary Quiz",
          questions: [
            {
              question: "Which is a feeling word?",
              options: ["Happy", "Table", "Rocket"],
              answerIndex: 0,
            },
          ],
        },
        durationMinutes: 10,
        isPreview: true,
      },
      {
        title: "Read and Repeat",
        slug: "read-and-repeat",
        description: "Follow a short story and repeat key words aloud.",
        videoUrl: "https://www.youtube.com/embed/H7hGiZ579cs",
        gameHtmlPath: "/games/word-blast.html",
        quiz: {
          title: "Read and Repeat Quiz",
          questions: [
            {
              question: "What helps improve pronunciation?",
              options: ["Repeating words aloud", "Skipping words", "Reading once silently"],
              answerIndex: 0,
            },
          ],
        },
        durationMinutes: 12,
      },
      {
        title: "Tell Your Own Ending",
        slug: "tell-your-own-ending",
        description: "Create and share a fun ending using new vocabulary.",
        videoUrl: "https://www.youtube.com/embed/IDkP4Agl95s",
        gameHtmlPath: "/games/math-race.html",
        quiz: {
          title: "Story Ending Quiz",
          questions: [
            {
              question: "A good story ending should...",
              options: ["Connect with the story", "Ignore all characters", "Be one random word"],
              answerIndex: 0,
            },
          ],
        },
        durationMinutes: 11,
      },
    ],
  },
];

async function main() {
  for (const course of courses) {
    const existing = await prisma.course.upsert({
      where: { slug: course.slug },
      update: {
        title: course.title,
        shortDescription: course.shortDescription,
        description: course.description,
        thumbnailUrl: course.thumbnailUrl,
        ageGroup: course.ageGroup,
        difficulty: course.difficulty,
        durationMinutes: course.durationMinutes,
        displayOrder: course.displayOrder,
        isPublished: true,
      },
      create: {
        slug: course.slug,
        title: course.title,
        shortDescription: course.shortDescription,
        description: course.description,
        thumbnailUrl: course.thumbnailUrl,
        ageGroup: course.ageGroup,
        difficulty: course.difficulty,
        durationMinutes: course.durationMinutes,
        displayOrder: course.displayOrder,
        isPublished: true,
      },
    });

    await prisma.lesson.deleteMany({ where: { courseId: existing.id } });

    for (const [index, lesson] of course.lessons.entries()) {
      const createdLesson = await prisma.lesson.create({
        data: {
          courseId: existing.id,
          title: lesson.title,
          slug: lesson.slug,
          description: lesson.description,
          videoUrl: lesson.videoUrl,
          gameHtmlPath: lesson.gameHtmlPath,
          durationMinutes: lesson.durationMinutes,
          displayOrder: index + 1,
          isPreview: Boolean(lesson.isPreview),
        },
      });

      await prisma.quiz.create({
        data: {
          lessonId: createdLesson.id,
          title: lesson.quiz.title,
          questions: lesson.quiz.questions as unknown as object,
        },
      });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("Seed failed", error);
    await prisma.$disconnect();
    process.exit(1);
  });
