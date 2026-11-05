export type Profile = {
  id: string;
  username: string;
  full_name: string | null;
  bio: string | null;
  skills: string[] | null;
  interests: string[] | null;
  created_at: string;
};

export const PROFILE_FIELDS =
  "id,username,full_name,bio,skills,interests,created_at";

// "Python, Dizayn, AI" -> ["Python", "Dizayn", "AI"]
export const splitList = (text: string) =>
  text
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
