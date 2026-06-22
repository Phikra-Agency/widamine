export type MotifFamilyKey = "default";

export interface MotifFamily {
  key: MotifFamilyKey;
  label: string;
  color: string;
}

export const MOTIF_FAMILIES: MotifFamily[] = [
  { key: "default", label: "Consultation", color: "#3b82f6" },
];

export function getFamilyForMotif(motif?: { color?: string | null } | null): MotifFamily {
  return { key: "default", label: "Consultation", color: motif?.color || "#3b82f6" };
}

export function getEventColor(motif?: { color?: string | null } | null): string {
  return motif?.color || "#3b82f6";
}
