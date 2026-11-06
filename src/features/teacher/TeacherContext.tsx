import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import type { LanguageCode } from "@/constants/languages";
import { findClassByCode, registerClass, type SchoolClass } from "@/data/mockClasses";
import type { BookId } from "@/data/syllabus";

export type Teacher = { name: string; school: string; phone: string; language: LanguageCode };

/** DEMO: any sign-in code you type is checked against this. Replace with a real SMS service. */
export const DEMO_OTP = "123456";
/** DEMO: this teacher already exists, so you can try "Sign in" with 9876543210. */
export const DEMO_PHONE = "9876543210";

type Pending = { flow: "signin"; phone: string } | { flow: "signup"; profile: Teacher } | null;

type State = {
  teachers: Teacher[];
  classesByPhone: Record<string, SchoolClass[]>;
  currentPhone: string | null;
  activeClassCode: string | null;
  pending: Pending;
};

type Value = {
  teacher: Teacher | null;
  classes: SchoolClass[];
  /** The class shown on Home and Class. Defaults to the first one. */
  activeClass: SchoolClass | null;
  setActiveClass: (code: string) => void;
  pendingFlow: "signin" | "signup" | null;
  pendingPhone: string | null;
  /** Returns false if no account uses this number. */
  startSignIn: (phone: string) => boolean;
  /** Returns false if this number already has an account. */
  startSignUp: (profile: Teacher) => boolean;
  /** Returns the flow that finished, or null if the code is wrong. */
  verifyOtp: (code: string) => "signin" | "signup" | null;
  createClass: (input: { name: string; code: string; bookIds: BookId[]; studentNames: string[] }) => void;
  signOut: () => void;
};

const TeacherContext = createContext<Value | null>(null);

const demoClass = findClassByCode("B5A472");

/**
 * Teacher account state, in memory for now (resets when the app closes).
 * TODO: replace with a real backend (Supabase / Firebase auth + database).
 */
export function TeacherProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>({
    teachers: [{ name: "Ms. Rao", school: "Demo School", phone: DEMO_PHONE, language: "en" }],
    classesByPhone: { [DEMO_PHONE]: demoClass ? [demoClass] : [] },
    currentPhone: null,
    activeClassCode: null,
    pending: null,
  });

  const startSignIn = useCallback(
    (phone: string) => {
      if (!state.teachers.some((t) => t.phone === phone)) return false;
      setState((s) => ({ ...s, pending: { flow: "signin", phone } }));
      return true;
    },
    [state.teachers],
  );

  const startSignUp = useCallback(
    (profile: Teacher) => {
      if (state.teachers.some((t) => t.phone === profile.phone)) return false;
      setState((s) => ({ ...s, pending: { flow: "signup", profile } }));
      return true;
    },
    [state.teachers],
  );

  const verifyOtp = useCallback(
    (code: string) => {
      const pending = state.pending;
      if (!pending || code !== DEMO_OTP) return null;
      setState((s) =>
        pending.flow === "signup"
          ? {
              ...s,
              teachers: [...s.teachers, pending.profile],
              classesByPhone: { ...s.classesByPhone, [pending.profile.phone]: [] },
              currentPhone: pending.profile.phone,
              pending: null,
            }
          : { ...s, currentPhone: pending.phone, pending: null },
      );
      return pending.flow;
    },
    [state.pending],
  );

  const createClass = useCallback(
    (input: { name: string; code: string; bookIds: BookId[]; studentNames: string[] }) => {
      const created = registerClass(input);
      setState((s) => {
        if (!s.currentPhone) return s;
        const existing = s.classesByPhone[s.currentPhone] ?? [];
        return { ...s, classesByPhone: { ...s.classesByPhone, [s.currentPhone]: [...existing, created] } };
      });
    },
    [],
  );

  const setActiveClass = useCallback((code: string) => setState((s) => ({ ...s, activeClassCode: code })), []);

  const signOut = useCallback(() => setState((s) => ({ ...s, currentPhone: null, pending: null })), []);

  const value = useMemo<Value>(() => {
    const teacher = state.teachers.find((t) => t.phone === state.currentPhone) ?? null;
    const classes = state.currentPhone ? (state.classesByPhone[state.currentPhone] ?? []) : [];
    return {
      teacher,
      classes,
      activeClass: classes.find((c) => c.code === state.activeClassCode) ?? classes[0] ?? null,
      setActiveClass,
      pendingFlow: state.pending?.flow ?? null,
      pendingPhone:
        state.pending?.flow === "signin"
          ? state.pending.phone
          : state.pending?.flow === "signup"
            ? state.pending.profile.phone
            : null,
      startSignIn,
      startSignUp,
      verifyOtp,
      createClass,
      signOut,
    };
  }, [state, startSignIn, startSignUp, verifyOtp, createClass, setActiveClass, signOut]);

  return <TeacherContext.Provider value={value}>{children}</TeacherContext.Provider>;
}

export function useTeacher() {
  const ctx = useContext(TeacherContext);
  if (!ctx) throw new Error("useTeacher must be used inside <TeacherProvider> (see app/_layout.tsx)");
  return ctx;
}