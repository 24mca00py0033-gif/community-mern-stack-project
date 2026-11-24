// Shared Tailwind class strings, so the same look is reused across pages.

// Full-width content wrapper: backgrounds stay edge to edge, content gets side padding
export const wrap = "mx-auto w-full max-w-[1600px] px-5 sm:px-8 lg:px-16";

const base =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border-[1.5px] text-sm font-semibold transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none";

export const btn = `${base} border-transparent bg-ink px-7 py-3 text-white`;
export const btnOutline = `${base} border-slate-300 bg-white px-7 py-3 text-ink`;
export const btnWhite = `${base} border-transparent bg-white px-7 py-3 text-brand`;
export const btnOutlineSm = `${base} border-slate-300 bg-white px-5 py-2 text-ink`;

export const field =
  "w-full rounded-2xl border-[1.5px] border-line bg-soft px-4 py-3 text-[0.95rem] text-ink outline-none transition focus:border-iris focus:bg-white disabled:cursor-not-allowed disabled:opacity-65";
export const label = "mb-1.5 mt-3.5 block text-[0.82rem] font-medium text-muted";

export const card =
  "rounded-3xl border border-line bg-white p-7 shadow-[0_8px_30px_rgba(31,35,48,0.05)]";

export const eyebrow = "mb-2 text-[0.85rem] font-semibold uppercase tracking-[1.5px] text-leaf";
export const tag =
  "inline-block rounded-full bg-[#eceaff] px-3.5 py-0.5 text-xs font-semibold text-[#4338ca]";
export const betaBadge =
  "inline-block rounded-full border border-[#f3d98f] bg-[#fff3d6] px-2.5 py-px font-sans text-[0.68rem] font-bold uppercase tracking-wider text-[#a16207]";

export const alertErr =
  "mt-3.5 rounded-xl border border-[#f5c2cb] bg-[#fff0f2] px-3.5 py-2.5 text-sm text-danger";
export const alertOk =
  "mt-3.5 rounded-xl border border-[#b7e6cb] bg-[#e8f8ef] px-3.5 py-2.5 text-sm text-[#1f7a4d]";

export const gridCards =
  "grid grid-cols-[repeat(auto-fill,minmax(215px,1fr))] gap-5 [perspective:1000px]";
