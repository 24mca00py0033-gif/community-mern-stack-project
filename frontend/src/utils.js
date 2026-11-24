// Fields a member must fill in for the profile to count as complete
export const requiredFields = [
  { key: "lastName", label: "Last name" },
  { key: "company", label: "Company" },
  { key: "locality", label: "Locality" },
  { key: "mobile", label: "Mobile number" },
  { key: "linkedin", label: "LinkedIn ID" },
];

export function missingFields(profile) {
  return requiredFields.filter((f) => !String(profile?.[f.key] || "").trim());
}

export function isProfileComplete(profile) {
  return missingFields(profile).length === 0;
}

// Turns a LinkedIn ID ("rahul-sharma") or a link into a safe linkedin.com URL
export function linkedinUrl(value = "") {
  const v = value.trim();
  if (!v) return "";
  try {
    const u = new URL(/^https?:\/\//i.test(v) ? v : `https://${v}`);
    if (u.hostname === "linkedin.com" || u.hostname.endsWith(".linkedin.com")) return u.href;
  } catch {
    // not a link, treat it as an ID below
  }
  const id = v.replace(/^@/, "").replace(/[^\w\-%.]/g, "");
  return id ? `https://www.linkedin.com/in/${id}` : "";
}

// The "complete your profile" pop-up is shown once per login session
const PROMPT_KEY = "cc_profile_prompt_done";

export function promptDone() {
  try {
    return sessionStorage.getItem(PROMPT_KEY) === "1";
  } catch {
    return false;
  }
}
export function markPromptDone() {
  try {
    sessionStorage.setItem(PROMPT_KEY, "1");
  } catch {
    // ignore
  }
}
export function resetPrompt() {
  try {
    sessionStorage.removeItem(PROMPT_KEY);
  } catch {
    // ignore
  }
}
