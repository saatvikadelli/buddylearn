import type { AvatarTone } from "@/components/ui/Avatar";
import type { BookId } from "@/data/syllabus";

export type Student = { id: string; name: string; tone: AvatarTone };
export type SchoolClass = {
  code: string;
  name: string;
  students: Student[];
  bookIds?: BookId[];
  /** DEMO: children who have not opened the app with the class code yet. */
  notJoinedIds?: string[];
};

/**
 * DEMO DATA. Replace with a real lookup (Supabase / Firebase) later.
 * Demo class code to type in the app: B5A472
 * Classes created by a teacher in the app are added to this list while the app is open.
 */
const CLASSES: SchoolClass[] = [
  {
    code: "B5A472",
    name: "Class 5A",
    bookIds: ["maths", "evs"],
    notJoinedIds: ["s4", "s6"], // Kiran and Zoya, as in the Class roster design
    students: [
      { id: "s1", name: "Aarav", tone: "butter" },
      { id: "s2", name: "Riya", tone: "blush" },
      { id: "s3", name: "Sana", tone: "mint" },
      { id: "s4", name: "Kiran", tone: "sky" },
      { id: "s5", name: "Meera", tone: "peach" },
      { id: "s6", name: "Zoya", tone: "lavender" },
    ],
  },
];

const TONES: AvatarTone[] = ["butter", "blush", "mint", "sky", "peach", "lavender"];

export function findClassByCode(code: string): SchoolClass | null {
  return CLASSES.find((c) => c.code === code.trim().toUpperCase()) ?? null;
}

export function findStudent(classCode: string | null, studentId: string | null) {
  if (!classCode || !studentId) return null;
  return findClassByCode(classCode)?.students.find((s) => s.id === studentId) ?? null;
}

/** Makes a class code like "K7M2QX". Avoids look-alike characters (0/O, 1/I). */
export function generateClassCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  do {
    code = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  } while (findClassByCode(code));
  return code;
}

/** Adds a teacher-made class so children can join it with its code. */
export function registerClass(input: {
  code: string;
  name: string;
  studentNames: string[];
  bookIds: BookId[];
}): SchoolClass {
  const created: SchoolClass = {
    code: input.code,
    name: input.name,
    bookIds: input.bookIds,
    students: input.studentNames.map((name, i) => ({
      id: `${input.code}-${i + 1}`,
      name,
      tone: TONES[i % TONES.length],
    })),
  };
  CLASSES.push(created);
  return created;
}