import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import ProfileCard from "../components/ProfileCard";
import { HeroArt, ListArt, FeatureIcon } from "../components/Illustrations";
import { useAuth } from "../context/AuthContext";
import { btn, btnOutline, btnWhite, eyebrow, gridCards, wrap } from "../ui";

export default function Home() {
  const { user } = useAuth();
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/users/featured")
      .then((res) => setPeople(res.data.users))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="bg-gradient-to-br from-[#f3f1ff] via-white to-[#fff4ec]">
        <div className={`${wrap} grid items-center gap-8 py-12 lg:grid-cols-2 lg:py-16`}>
          <div className="text-center lg:text-left">
            <p className={eyebrow}>Welcome back, {user.name}</p>
            <h1 className="text-4xl font-bold sm:text-5xl lg:text-6xl xl:text-7xl">
              Bring your <span className="text-leaf">community</span> together
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base text-muted lg:mx-0">
              Community Connect helps the Pareek community's Chartered
              Accountants find each other by company, profession and locality.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3.5 lg:justify-start">
              <Link to="/search" className={btn}>Find people</Link>
              <Link to="/members" className={btnOutline}>Browse members</Link>
              <Link to="/jobs" className={btnOutline}>Browse jobs</Link>
            </div>
          </div>
          <HeroArt />
        </div>
      </section>

      {/* ---------- Features ---------- */}
      <section className="bg-white py-16">
        <div className={wrap}>
          <div className="mb-10 text-center">
            <p className={eyebrow}>What you can do</p>
            <h2 className="text-3xl font-bold sm:text-4xl">Everything you need to stay connected</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {[
              { kind: "pin", color: "#5b5bd6", bg: "#eceaff", title: "Find your locality", text: "See who lives and works near you and meet people from your own neighbourhood." },
              { kind: "career", color: "#ff7a3d", bg: "#ffe9dc", title: "Find your company", text: "Search by company and profession to grow your professional network." },
              { kind: "connect", color: "#2f9e63", bg: "#dff5e9", title: "Post and find jobs", text: "Hiring or looking? Post a job, comment on openings and show your interest." },
            ].map((f) => (
              <div key={f.title} className="rounded-3xl p-7 transition duration-300 hover:-translate-y-1.5" style={{ background: f.bg }}>
                <FeatureIcon kind={f.kind} color={f.color} />
                <h3 className="mb-2 text-xl font-semibold">{f.title}</h3>
                <p className="text-[0.95rem] text-slate-600">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Blue band (edge to edge) ---------- */}
      <section className="relative overflow-hidden bg-brand text-white">
        <div className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-white/10" />
        <div className={`${wrap} relative grid items-center gap-8 py-16 lg:grid-cols-2`}>
          <div>
            <p className="mb-2.5 text-xs font-semibold uppercase tracking-[2px] opacity-85">Explore</p>
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl lg:text-5xl">
              One place to discover the people you didn't know you needed
            </h2>
            <p className="mb-6 max-w-xl opacity-90">
              Look people up by name, last name, profession, locality or company.
              Open any profile to see their full details and get in touch.
            </p>
            <Link to="/search" className={btnWhite}>Search the community</Link>
          </div>
          <ListArt />
        </div>
      </section>

      {/* ---------- 10 profiles ---------- */}
      <section className="bg-soft py-16">
        <div className={wrap}>
          <div className="mb-10 text-center">
            <p className={eyebrow}>Our members</p>
            <h2 className="text-3xl font-bold sm:text-4xl">Meet some of the community</h2>
          </div>
          {loading ? (
            <p className="py-12 text-center text-muted">Loading profiles...</p>
          ) : people.length === 0 ? (
            <p className="py-12 text-center text-muted">No members yet. Be the first to complete your profile!</p>
          ) : (
            <div className={gridCards}>
              {people.map((p) => (
                <ProfileCard key={p._id} person={p} />
              ))}
            </div>
          )}
          <div className="mt-9 text-center">
            <Link to="/members" className={btnOutline}>View all members</Link>
          </div>
        </div>
      </section>

      {/* ---------- Call to action (edge to edge) ---------- */}
      <section className="bg-[#fff3d6]">
        <div className={`${wrap} flex flex-wrap items-center justify-between gap-5 py-10`}>
          <div>
            <h2 className="mb-1 text-2xl font-bold sm:text-3xl">Let your community find you</h2>
            <p className="text-[#6b5a2b]">Add your company, locality, LinkedIn and a photo so people can reach you.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/profile" className={btn}>Complete my profile</Link>
            <Link to="/jobs/new" className={btnOutline}>Post a job</Link>
          </div>
        </div>
      </section>
    </>
  );
}
