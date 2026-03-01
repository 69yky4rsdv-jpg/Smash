import type { ModelGender } from "./types";

/**
 * Male first names / stage names (lowercase) used to infer gender from model name.
 * If the first word of the stage name matches one of these, the model is inferred as male.
 * Add more names as needed.
 */
const MALE_NAMES = new Set([
  "alex", "billy", "buster", "cj", "chris", "christian", "david", "eric", "john", "johnny",
  "julian", "karl", "mark", "michael", "mr", "otto", "randy", "rick", "ryan", "tommy", "van",
  "will", "barry", "barry scott", "billy glide", "buster good", "chris charming", "cj wright",
  "dirty harry", "john strong", "karl kinkaid", "otto bauer", "van damage",
  "talon", "mark wood", "alex gonz", "eric swiss", "mr. pete", "randy spears", "mark ashley",
  "tommy gunn", "tommy steel", "charlie", "cayden", "rane", "julian"
]);

/**
 * Infer gender from a model's stage name.
 * Uses first word (and optionally second) matched against a list of male names; otherwise female.
 */
export function inferModelGender(stageName: string): ModelGender {
  const normalized = stageName.trim().toLowerCase();
  if (!normalized) return "female";

  const words = normalized.split(/\s+/).filter(Boolean);
  const first = words[0] ?? "";
  const firstTwo = words.length >= 2 ? `${words[0]} ${words[1]}` : first;

  if (MALE_NAMES.has(first) || MALE_NAMES.has(firstTwo)) return "male";
  return "female";
}
