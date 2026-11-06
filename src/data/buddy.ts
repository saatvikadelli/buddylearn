export type BuddySession = {
  id: string;
  title: string;
  buddyName: string;
  when: string;
  topic: string;
};

/**
 * DEMO DATA: sessions the teacher has planned, keyed by student id.
 *  - Aarav (s1, the default new child): nothing planned -> "Ask my teacher"
 *  - Riya (s2): a session is planned -> shows the details
 */
const PLANNED: Record<string, BuddySession> = {
  s2: {
    id: "b1",
    title: "Treasure chests",
    buddyName: "Aarav",
    when: "Friday, 11:00",
    topic: "Maths · Fractions",
  },
};

export const getBuddySession = (studentId?: string | null): BuddySession | null =>
  studentId ? (PLANNED[studentId] ?? null) : null;