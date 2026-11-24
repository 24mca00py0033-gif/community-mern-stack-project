// Shared job constants and small helpers (the options match the backend)
export const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Articleship", "Internship", "Freelance"];
export const WORK_MODES = ["On-site", "Remote", "Hybrid"];

// Soft colors for the job type chips
export const typeStyle = {
  "Full-time": "bg-[#dff5e9] text-[#1f7a4d]",
  "Part-time": "bg-[#e0dcff] text-[#4338ca]",
  Contract: "bg-[#ffe9dc] text-[#c2410c]",
  Articleship: "bg-[#ffd6e1] text-[#be185d]",
  Internship: "bg-[#d6e8ff] text-[#1d4ed8]",
  Freelance: "bg-[#fff3d6] text-[#a16207]",
};

export const chip = "inline-block rounded-full px-3 py-0.5 text-xs font-semibold";
export const chipGray = `${chip} bg-soft text-slate-600`;

// "3 days ago" style text for a date
export function timeAgo(date) {
  const secs = Math.max(0, (Date.now() - new Date(date).getTime()) / 1000);
  const steps = [
    [60, "second"],
    [60, "minute"],
    [24, "hour"],
    [7, "day"],
    [4.345, "week"],
    [12, "month"],
    [Infinity, "year"],
  ];
  let value = secs;
  for (const [size, unit] of steps) {
    if (value < size) {
      const n = Math.floor(value);
      if (unit === "second" && n < 45) return "just now";
      return `${n || 1} ${unit}${n > 1 ? "s" : ""} ago`;
    }
    value /= size;
  }
  return "";
}

// Pulls the readable message out of an API error
export const errMsg = (err, fallback = "Something went wrong") =>
  err?.response?.data?.message || fallback;
