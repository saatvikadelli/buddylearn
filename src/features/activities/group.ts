import type { Role } from "@/data/activities";
import type { Status, StudentInsight } from "@/data/analytics";
import type { Student } from "@/data/mockClasses";

export type GroupMember = { student: Student; role: Role; reason: string };
export type Group = { number: number; members: GroupMember[] };

const ORDER: Status[] = ["ready", "on-track", "nudge"];

/**
 * Makes mixed groups and gives each child the role that suits a strength they have.
 *  1. Children are sorted by how they are doing (ready, on track, needs a nudge) and then dealt out
 *     like cards, one group at a time, so every kind of child is spread across all the groups.
 *  2. Each role goes to a child whose strengths match it. If none match, the next child tries it.
 *  3. Fewer children than roles: a child takes two roles ("Cutter + Drawer"), so every role is done.
 *     More children than roles: the extra children share a role ("Shares the Speaker role").
 *     Every child is always in a group, and every role always has someone.
 * `shuffle` changes who ends up together (press "Shuffle" to try another mix).
 */
export function buildGroups(insights: StudentInsight[], size: number, roles: Role[], shuffle = 0): Group[] {
  if (insights.length === 0 || roles.length === 0) return [];

  const ordered = ORDER.flatMap((status) => {
    const list = insights.filter((i) => i.status === status);
    const turn = list.length ? shuffle % list.length : 0;
    return [...list.slice(turn), ...list.slice(0, turn)];
  });

  // As many groups as needed so none is bigger than `size`; sizes differ by at most one child.
  const groupCount = Math.max(1, Math.ceil(insights.length / size));
  const chunks: StudentInsight[][] = Array.from({ length: groupCount }, () => []);
  ordered.forEach((child, i) => chunks[i % groupCount].push(child));

  return chunks.map((chunk, index) => {
    const free = [...chunk];
    const members: GroupMember[] = [];

    // One child per role, matched on strengths.
    roles.slice(0, chunk.length).forEach((role) => {
      let pick = free.findIndex((c) => c.strengths.some((s) => role.fits.includes(s)));
      let reason = "";
      if (pick === -1) {
        pick = 0;
        reason = "Tries something new";
      } else {
        reason = free[pick].strengths.find((s) => role.fits.includes(s)) ?? "";
      }
      const [chosen] = free.splice(pick, 1);
      members.push({ student: chosen.student, role, reason });
    });

    // Fewer children than roles: each spare role is added to the child it suits best,
    // e.g. "Cutter + Drawer", so every role in the activity is still done.
    for (const role of roles.slice(chunk.length)) {
      const best =
        members.find((m) => chunk.find((c) => c.student.id === m.student.id)?.strengths.some((s) => role.fits.includes(s))) ??
        members[members.length - 1];
      best.role = { name: `${best.role.name} + ${role.name}`, job: `${best.role.job}. ${role.job}`, fits: [...best.role.fits, ...role.fits] };
    }

    // More children than roles: each extra child shares the role that suits them best.
    // Spread them out: the least-shared role that suits them, else the least-shared role.
    const sharing = new Map<string, number>();
    const least = (list: Role[]) => [...list].sort((x, y) => (sharing.get(x.name) ?? 0) - (sharing.get(y.name) ?? 0))[0];
    for (const child of free) {
      const suits = roles.filter((r) => child.strengths.some((s) => r.fits.includes(s)));
      const role = least(suits.length ? suits : roles);
      sharing.set(role.name, (sharing.get(role.name) ?? 0) + 1);
      members.push({ student: child.student, role, reason: `Shares the ${role.name} role` });
    }

    return { number: index + 1, members };
  });
}