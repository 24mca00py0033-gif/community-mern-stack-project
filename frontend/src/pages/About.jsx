import { FeatureIcon } from "../components/Illustrations";
import FlowerRain from "../components/FlowerRain";
import { betaBadge, eyebrow, wrap } from "../ui";

const pillars = [
  { kind: "career", color: "#ff7a3d", bg: "#ffe9dc", title: "Find by company", text: "Look up fellow Chartered Accountants working in a company you are interested in." },
  { kind: "connect", color: "#2f9e63", bg: "#dff5e9", title: "Find by profession", text: "Meet people from related areas of practice and grow your professional circle." },
  { kind: "pin", color: "#5b5bd6", bg: "#eceaff", title: "Find by locality", text: "Discover community members who live or work in your city or neighbourhood." },
];

const steps = [
  { n: "1", title: "Create your profile", text: "Register, then add your profession, company, locality, LinkedIn ID and a photo." },
  { n: "2", title: "Search or browse", text: "Find people by name, profession, company or locality, or filter the members list." },
  { n: "3", title: "Get in touch", text: "Open any profile to see full details and reach out by email, phone or LinkedIn." },
];

export default function About() {
  return (
    <>
      <FlowerRain />
      <section className="bg-gradient-to-br from-[#f3f1ff] via-white to-[#fff4ec] py-14">
        <div className={wrap}>
          <p className={eyebrow}>About us</p>
          <h1 className="mb-5 text-4xl font-bold sm:text-5xl">About Community Connect</h1>
          <p className="max-w-4xl text-lg text-slate-600">
            Community Connect is made for the <strong>Pareek community</strong> and
            its <strong>Chartered Accountants</strong>. It helps people in the
            community connect with each other and makes it easier to find people
            from a related company or a related profession.
          </p>
        </div>
      </section>

      <section className="bg-white py-14">
        <div className={wrap}>
          <div className="grid gap-5 md:grid-cols-3">
            {pillars.map((p) => (
              <div key={p.title} className="rounded-3xl p-7" style={{ background: p.bg }}>
                <FeatureIcon kind={p.kind} color={p.color} />
                <h3 className="mb-2 text-xl font-semibold">{p.title}</h3>
                <p className="text-[0.95rem] text-slate-600">{p.text}</p>
              </div>
            ))}
          </div>

          <h2 className="mb-5 mt-14 text-2xl font-bold sm:text-3xl">How it works</h2>
          <div className="grid gap-5 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n} className="rounded-3xl bg-soft p-6">
                <span className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-iris font-bold text-white">
                  {s.n}
                </span>
                <h3 className="mb-1.5 text-lg font-semibold">{s.title}</h3>
                <p className="text-sm text-muted">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#fff3d6] py-10">
        <div className={`${wrap} flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5`}>
          <span className={`${betaBadge} self-start`}>Beta</span>
          <div>
            <h3 className="mb-1.5 text-xl font-semibold">This is the beta version</h3>
            <p className="max-w-4xl text-[#6b5a2b]">
              Community Connect is a personal project, built to solve a problem
              faced by the community. This beta version is the first step, and it
              will be developed at a larger scale later. Features may change as
              it grows.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-brand py-12 text-center text-white">
        <div className={wrap}>
          <span className="block text-xs uppercase tracking-[2px] opacity-80">Our motto</span>
          <strong className="font-display text-2xl sm:text-4xl">Connecting the community with each other.</strong>
        </div>
      </section>
    </>
  );
}
