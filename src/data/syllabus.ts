import type { AvatarTone } from "@/components/ui/Avatar";

/**
 * DUMMY SYLLABUS: CBSE Class 5 core books (NCERT, 2025-26 / 2026-27).
 * 47 chapters in total. Titles come from published school syllabus lists.
 * `needsCheck: true` marks a title we could not confirm. Check it against the book.
 * Later this file is replaced by data from your backend.
 */
export type BookId = "maths" | "english" | "evs" | "hindi";

export type Chapter = {
  id: string; // e.g. "maths-2"
  number: number;
  title: string;
  unit?: string;
  kind?: "poem" | "lesson";
  needsCheck?: boolean;
};

export type Book = {
  id: BookId;
  subject: string;
  title: string;
  titleNative?: string;
  tone: AvatarTone; // card colour
  chapters: Chapter[];
};

const make = (book: BookId, rows: [string, Partial<Chapter>?][]): Chapter[] =>
  rows.map(([title, extra], i) => ({
    id: `${book}-${i + 1}`,
    number: i + 1,
    title,
    ...extra,
  }));

const MATHS = make("maths", [
  ["We the Travellers — I"],
  ["Fractions"],
  ["Angles as Turns"],
  ["We the Travellers — II"],
  ["Far and Near"],
  ["The Dairy Farm"],
  ["Shapes and Patterns"],
  ["Weight and Capacity"],
  ["Coconut Farm"],
  ["Symmetrical Designs"],
  ["Grandmother’s Quilt"],
  ["Racing Seconds"],
  ["Animal Jumps"],
  ["Maps and Locations"],
  ["Data Through Pictures"],
]);

const ENGLISH = make("english", [
  ["Papa’s Spectacles", { unit: "Unit 1", kind: "poem" }],
  ["Gone with the Scooter", { unit: "Unit 1", kind: "lesson" }],
  ["The Rainbow", { unit: "Unit 2", kind: "poem" }],
  ["The Wise Parrot", { unit: "Unit 2", kind: "lesson" }],
  ["The Frog", { unit: "Unit 3", kind: "poem" }],
  ["What a Tank!", { unit: "Unit 3", kind: "lesson" }],
  ["Gilli Danda", { unit: "Unit 4", kind: "poem" }],
  ["The Decision of the Panchayat", { unit: "Unit 4", kind: "lesson" }],
  ["Vocation", { unit: "Unit 5", kind: "poem" }],
  ["Glass Bangles", { unit: "Unit 5", kind: "lesson" }],
]);

const EVS = make("evs", [
  ["Water — The Essence of Life", { unit: "Unit 1 · Life Around Us" }],
  ["Journey of a River", { unit: "Unit 1 · Life Around Us" }],
  ["The Mystery of Food", { unit: "Unit 2 · Health and Well-being" }],
  ["Our School — A Happy Place", { unit: "Unit 2 · Health and Well-being" }],
  ["Our Vibrant Country", { unit: "Unit 3 · Incredible India" }],
  ["Some Unique Places", { unit: "Unit 3 · Incredible India" }],
  ["Energy — How Things Work", { unit: "Unit 4 · Things Around Us" }],
  ["Clothes — How Things Are Made", { unit: "Unit 4 · Things Around Us" }],
  ["Rhythms of Nature", { unit: "Unit 5 · Our Amazing Planet" }],
  ["Earth — Our Shared Home", { unit: "Unit 5 · Our Amazing Planet" }],
]);

const HINDI = make("hindi", [
  ["किरण"],
  ["न्याय की कुर्सी"],
  ["चाँद का कुर्ता"],
  ["[अध्याय 4]", { needsCheck: true }],
  ["सुंदरिया", { needsCheck: true }],
  ["चतुर चित्रकार"],
  ["मेरा बचपन"],
  ["काजीरंगा राष्ट्रीय उद्यान की यात्रा"],
  ["न्याय"],
  ["तीन मछलियाँ"],
  ["हमारे ये कलामंदिर"],
  ["गंगा की कहानी"],
]);

/** Order here = order of the subject cards. Maths first. */
export const SYLLABUS: Book[] = [
  { id: "maths", subject: "Maths", title: "Maths Mela", tone: "mint", chapters: MATHS },
  { id: "english", subject: "English", title: "Santoor", tone: "lavender", chapters: ENGLISH },
  { id: "evs", subject: "EVS", title: "Our Wondrous World", tone: "butter", chapters: EVS },
  {
    id: "hindi",
    subject: "Hindi",
    title: "Veena",
    titleNative: "वीणा",
    tone: "peach",
    chapters: HINDI,
  },
];

export const CLASS_LABEL = "Class 5 · CBSE";
export const TOTAL_CHAPTERS = SYLLABUS.reduce((n, b) => n + b.chapters.length, 0); // 47

export const getBook = (id: string | undefined) => SYLLABUS.find((b) => b.id === id) ?? null;

/**
 * Today's mission. A brand-new child (nothing completed) gets Maths chapter 1.
 * Otherwise: the first chapter, in book order, that is not completed yet.
 */
export function getNextMission(completedChapterIds: string[]) {
  for (const book of SYLLABUS) {
    const chapter = book.chapters.find((c) => !completedChapterIds.includes(c.id));
    if (chapter) return { book, chapter };
  }
  return null;
}
export function findChapter(chapterId: string | undefined) {
  for (const book of SYLLABUS) {
    const chapter = book.chapters.find((c) => c.id === chapterId);
    if (chapter) return { book, chapter };
  }
  return null;
}