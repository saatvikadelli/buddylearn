import type { CardTone } from "@/components/ui/Card";
import type { IconName } from "@/components/ui/icons";
import { getIdea } from "@/data/lessons";
import { findChapter } from "@/data/syllabus";

export type Badge = {
  id: string;
  title: string;
  /** What the child did (earned) or what to do next (locked). */
  hint: string;
  icon: IconName;
  tone: CardTone;
  earned: boolean;
};

type Progress = {
  stars: number;
  buddyMissionsDone: number;
  completedIdeaIds: string[];
  completedChapterIds: string[];
};

/** Badges come from what the child has really done. Earned ones first, then the next ones to go for. */
export function getBadges(p: Progress): Badge[] {
  const earned: Badge[] = [];
  const locked: Badge[] = [];

  (p.stars >= 1 ? earned : locked).push({
    id: "first-star",
    title: "First star",
    hint: p.stars >= 1 ? "You earned a star" : "Answer a question to earn one",
    icon: "star",
    tone: "butter",
    earned: p.stars >= 1,
  });

  for (const ideaId of p.completedIdeaIds) {
    const idea = getIdea(ideaId);
    if (idea) {
      earned.push({ id: `idea-${ideaId}`, title: `${idea.title} expert`, hint: "You finished this idea", icon: "trophy", tone: "lavender", earned: true });
    }
  }
  for (const chapterId of p.completedChapterIds) {
    const found = findChapter(chapterId);
    if (found) {
      earned.push({ id: `chapter-${chapterId}`, title: "Chapter done", hint: found.chapter.title, icon: "bookOpen", tone: "mint", earned: true });
    }
  }
  if (p.completedIdeaIds.length === 0) {
    locked.push({ id: "first-idea", title: "Idea expert", hint: "Finish your first idea", icon: "trophy", tone: "lavender", earned: false });
  }

  (p.stars >= 5 ? earned : locked).push({
    id: "star-collector",
    title: "Star collector",
    hint: p.stars >= 5 ? "5 stars or more" : "Collect 5 stars",
    icon: "sparkles",
    tone: "sky",
    earned: p.stars >= 5,
  });

  (p.buddyMissionsDone >= 1 ? earned : locked).push({
    id: "buddy-helper",
    title: "Buddy helper",
    hint: p.buddyMissionsDone >= 1 ? "You finished a buddy mission" : "Finish a buddy mission",
    icon: "users",
    tone: "blush",
    earned: p.buddyMissionsDone >= 1,
  });

  return [...earned, ...locked];
}

/** DEMO: how many missions the rest of the class has already done. Later this comes from the backend. */
export const GARDEN_BASE = 18;
export const GARDEN_GOAL = 30;