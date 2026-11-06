import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import { DEFAULT_COMFORT, type ComfortSettings } from "@/constants/comfort";
import { findClassByCode, findStudent, type SchoolClass, type Student } from "@/data/mockClasses";
import { getIdea, getIdeasForChapter } from "@/data/lessons";
import type { Level } from "@/features/questions/types";

type SessionState = {
  classCode: string | null;
  studentId: string | null;
  comfort: ComfortSettings;
  buddyRequested: boolean;
  stars: number;
  buddyMissionsDone: number;
  completedIdeaIds: string[];
  completedChapterIds: string[]; // empty = brand-new child
  /** ideaId -> mistakeId -> how many times this child made it. Drives which questions they get. */
  mistakeCounts: Record<string, Record<string, number>>;
  /** ideaId -> the level this child practises at next time (1 to 5). */
  ideaLevels: Record<string, Level>;
  /** ideaId -> questions this child has already seen, so a revisit gets new ones. */
  seenPrompts: Record<string, string[]>;
};

type SessionValue = SessionState & {
  student: Student | null;
  schoolClass: SchoolClass | null;
  signIn: (classCode: string, studentId: string) => void;
  updateComfort: (patch: Partial<ComfortSettings>) => void;
  requestBuddySession: () => void;
  earnStars: (count: number) => void;
  /** A buddy mission was finished: counts it and gives 2 stars. */
  completeBuddyMission: () => void;
  /** Mark an idea as done. When every idea of a chapter is done, the chapter is done too. */
  completeIdea: (ideaId: string) => void;
  recordMistake: (ideaId: string, mistakeId: string) => void;
  setIdeaLevel: (ideaId: string, level: Level) => void;
  rememberPrompts: (ideaId: string, prompts: string[]) => void;
};

const SessionContext = createContext<SessionValue | null>(null);

const EMPTY: Omit<SessionState, "comfort" | "classCode" | "studentId"> = {
  buddyRequested: false,
  stars: 0,
  buddyMissionsDone: 0,
  completedIdeaIds: [],
  completedChapterIds: [],
  mistakeCounts: {},
  ideaLevels: {},
  seenPrompts: {},
};

/**
 * App-wide state for the signed-in child: who they are, comfort choices, progress.
 * In memory for now (resets when the app closes).
 * TODO: persist with AsyncStorage, then move to your backend.
 */
export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>({
    classCode: null,
    studentId: null,
    comfort: DEFAULT_COMFORT,
    ...EMPTY,
  });

  const signIn = useCallback((classCode: string, studentId: string) => {
    setState((s) => ({ ...s, ...EMPTY, classCode, studentId }));
  }, []);

  const updateComfort = useCallback((patch: Partial<ComfortSettings>) => {
    setState((s) => ({ ...s, comfort: { ...s.comfort, ...patch } }));
  }, []);

  const requestBuddySession = useCallback(() => {
    // TODO: send this request to the teacher (backend).
    setState((s) => ({ ...s, buddyRequested: true }));
  }, []);

  const earnStars = useCallback((count: number) => {
    setState((s) => ({ ...s, stars: s.stars + count }));
  }, []);

  const completeBuddyMission = useCallback(() => {
    setState((s) => ({ ...s, stars: s.stars + 2, buddyMissionsDone: s.buddyMissionsDone + 1 }));
  }, []);

  const completeIdea = useCallback((ideaId: string) => {
    setState((s) => {
      if (s.completedIdeaIds.includes(ideaId)) return s;
      const completedIdeaIds = [...s.completedIdeaIds, ideaId];
      const chapterId = getIdea(ideaId)?.chapterId;
      const chapterDone =
        chapterId && getIdeasForChapter(chapterId).every((i) => completedIdeaIds.includes(i.id));
      return {
        ...s,
        completedIdeaIds,
        completedChapterIds:
          chapterDone && chapterId && !s.completedChapterIds.includes(chapterId)
            ? [...s.completedChapterIds, chapterId]
            : s.completedChapterIds,
      };
    });
  }, []);

  const recordMistake = useCallback((ideaId: string, mistakeId: string) => {
    setState((s) => {
      const forIdea = s.mistakeCounts[ideaId] ?? {};
      return {
        ...s,
        mistakeCounts: { ...s.mistakeCounts, [ideaId]: { ...forIdea, [mistakeId]: (forIdea[mistakeId] ?? 0) + 1 } },
      };
    });
  }, []);

  const setIdeaLevel = useCallback((ideaId: string, level: Level) => {
    setState((s) => (s.ideaLevels[ideaId] === level ? s : { ...s, ideaLevels: { ...s.ideaLevels, [ideaId]: level } }));
  }, []);

  const rememberPrompts = useCallback((ideaId: string, prompts: string[]) => {
    setState((s) => {
      const before = s.seenPrompts[ideaId] ?? [];
      const added = prompts.filter((p) => !before.includes(p));
      if (added.length === 0) return s;
      // Keep the last 60 so the AI prompt stays small.
      return { ...s, seenPrompts: { ...s.seenPrompts, [ideaId]: [...before, ...added].slice(-60) } };
    });
  }, []);

  const value = useMemo<SessionValue>(
    () => ({
      ...state,
      student: findStudent(state.classCode, state.studentId),
      schoolClass: state.classCode ? findClassByCode(state.classCode) : null,
      signIn,
      updateComfort,
      requestBuddySession,
      earnStars,
      completeBuddyMission,
      completeIdea,
      recordMistake,
      setIdeaLevel,
      rememberPrompts,
    }),
    [
      state,
      signIn,
      updateComfort,
      requestBuddySession,
      earnStars,
      completeBuddyMission,
      completeIdea,
      recordMistake,
      setIdeaLevel,
      rememberPrompts,
    ],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used inside <SessionProvider> (see app/_layout.tsx)");
  return ctx;
}