type RoleValue = "admin" | "learner";

export type LessonActivityEntry = {
  lessonId: string;
  courseSlug: string;
  lessonSlug: string;
  lastVisitedAt?: string;
  videoCompletedAt?: string;
  gamePlayedAt?: string;
  quizSubmittedAt?: string;
  quizScorePercent?: number;
};

type SessionClaimsLike = Record<string, unknown> | null;

function normalizeRole(value: unknown): RoleValue | null {
  if (value === "admin") {
    return "admin";
  }

  if (value === "learner") {
    return "learner";
  }

  return null;
}

export function getRoleFromSessionClaims(claims: SessionClaimsLike): RoleValue {
  const metadataRole = (claims?.metadata as { role?: unknown } | undefined)?.role;
  const fromMetadata = normalizeRole(metadataRole);
  if (fromMetadata) {
    return fromMetadata;
  }

  const metadataPublicRole = (
    claims?.metadata as
      | { publicMetadata?: { role?: unknown }; public_metadata?: { role?: unknown } }
      | undefined
  )?.publicMetadata?.role;
  const fromMetadataPublic = normalizeRole(metadataPublicRole);
  if (fromMetadataPublic) {
    return fromMetadataPublic;
  }

  const metadataPublicRoleSnake = (
    claims?.metadata as
      | { publicMetadata?: { role?: unknown }; public_metadata?: { role?: unknown } }
      | undefined
  )?.public_metadata?.role;
  const fromMetadataPublicSnake = normalizeRole(metadataPublicRoleSnake);
  if (fromMetadataPublicSnake) {
    return fromMetadataPublicSnake;
  }

  const publicMetadataRole = (claims?.publicMetadata as { role?: unknown } | undefined)?.role;
  const fromPublicMetadata = normalizeRole(publicMetadataRole);
  if (fromPublicMetadata) {
    return fromPublicMetadata;
  }

  const publicMetadataRoleSnake = (claims?.public_metadata as { role?: unknown } | undefined)
    ?.role;
  const fromPublicMetadataSnake = normalizeRole(publicMetadataRoleSnake);
  if (fromPublicMetadataSnake) {
    return fromPublicMetadataSnake;
  }

  const fromRoot = normalizeRole(claims?.role);
  if (fromRoot) {
    return fromRoot;
  }

  return "learner";
}

export function getRoleFromUser(user: { publicMetadata?: Record<string, unknown> | null }): RoleValue {
  const role = normalizeRole(user.publicMetadata?.role);
  return role ?? "learner";
}

export function parseLessonActivityMap(value: unknown): Record<string, LessonActivityEntry> {
  if (!value || typeof value !== "object") {
    return {};
  }

  const rawMap = value as Record<string, unknown>;
  const safeMap: Record<string, LessonActivityEntry> = {};

  for (const [lessonId, rawEntry] of Object.entries(rawMap)) {
    if (!rawEntry || typeof rawEntry !== "object") {
      continue;
    }

    const entry = rawEntry as Partial<LessonActivityEntry>;
    if (typeof entry.lessonId !== "string") {
      continue;
    }

    safeMap[lessonId] = {
      lessonId: entry.lessonId,
      courseSlug: typeof entry.courseSlug === "string" ? entry.courseSlug : "",
      lessonSlug: typeof entry.lessonSlug === "string" ? entry.lessonSlug : "",
      lastVisitedAt: typeof entry.lastVisitedAt === "string" ? entry.lastVisitedAt : undefined,
      videoCompletedAt:
        typeof entry.videoCompletedAt === "string" ? entry.videoCompletedAt : undefined,
      gamePlayedAt: typeof entry.gamePlayedAt === "string" ? entry.gamePlayedAt : undefined,
      quizSubmittedAt:
        typeof entry.quizSubmittedAt === "string" ? entry.quizSubmittedAt : undefined,
      quizScorePercent:
        typeof entry.quizScorePercent === "number" ? entry.quizScorePercent : undefined,
    };
  }

  return safeMap;
}
