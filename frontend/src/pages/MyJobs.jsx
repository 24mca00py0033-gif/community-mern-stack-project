import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import Avatar, { fullName } from "../components/Avatar";
import JobCard from "../components/JobCard";
import { useAuth } from "../context/AuthContext";
import { chip, chipGray, errMsg, timeAgo, typeStyle } from "../jobs";
import { alertErr, btn, btnOutline, btnOutlineSm, wrap } from "../ui";
import { linkedinUrl } from "../utils";

const tabCls = (on) =>
  `rounded-full px-5 py-2 text-sm font-semibold transition ${on ? "bg-ink text-white" : "bg-white text-slate-600 hover:text-ink"}`;

export default function MyJobs() {
  const { user } = useAuth();
  const [tab, setTab] = useState("posts");
  const [mine, setMine] = useState([]);
  const [sent, setSent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  useEffect(() => {
    Promise.all([api.get("/interested/mine"), api.get("/interested/sent")])
      .then(([a, b]) => {
        setMine(a.data.jobs);
        setSent(b.data.jobs);
      })
      .catch((err) => setError(errMsg(err, "Could not load your jobs")))
      .finally(() => setLoading(false));
  }, []);

  const act = async (id, fn) => {
    setError("");
    setBusyId(id);
    try {
      await fn();
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusyId("");
    }
  };

  const toggleStatus = (job) =>
    act(job._id, async () => {
      const status = job.status === "open" ? "closed" : "open";
      await api.put(`/users/me/jobs/${job._id}`, { status });
      setMine((list) => list.map((j) => (j._id === job._id ? { ...j, status } : j)));
    });

  const remove = (job) => {
    if (!window.confirm(`Delete "${job.title}"? This cannot be undone.`)) return;
    act(job._id, async () => {
      await api.delete(`/users/me/jobs/${job._id}`);
      setMine((list) => list.filter((j) => j._id !== job._id));
    });
  };

  const withdraw = (row) =>
    act(row.job._id, async () => {
      await api.delete(`/interested/${row.poster._id}/${row.job._id}`);
      setSent((list) => list.filter((r) => r.job._id !== row.job._id));
    });

  const openCount = mine.filter((j) => j.status === "open").length;
  const interestedTotal = mine.reduce((n, j) => n + j.interestedCount, 0);

  const stats = [
    { label: "Posts", value: mine.length, bg: "#eceaff" },
    { label: "Open", value: openCount, bg: "#dff5e9" },
    { label: "Interested members", value: interestedTotal, bg: "#ffe9dc" },
  ];

  return (
    <div className="bg-soft py-8 sm:py-10">
      <div className={wrap}>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold sm:text-4xl">My jobs</h1>
            <p className="mt-1 text-muted">Manage your posts and see who is interested.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/jobs/new" className={btn}>+ Post a job</Link>
            <Link to="/jobs" className={btnOutline}>All jobs</Link>
          </div>
        </div>

        <div className="mb-6 inline-flex gap-1.5 rounded-full bg-line/70 p-1.5">
          <button className={tabCls(tab === "posts")} onClick={() => setTab("posts")}>My posts ({mine.length})</button>
          <button className={tabCls(tab === "sent")} onClick={() => setTab("sent")}>I'm interested ({sent.length})</button>
        </div>

        {error && <div className={`${alertErr} mb-5`}>{error}</div>}

        {loading ? (
          <p className="py-14 text-center text-muted">Loading...</p>
        ) : tab === "posts" ? (
          <>
            <div className="mb-6 grid grid-cols-3 gap-3 sm:gap-5">
              {stats.map((s) => (
                <div key={s.label} className="rounded-3xl p-4 sm:p-5" style={{ background: s.bg }}>
                  <p className="font-display text-2xl font-bold sm:text-3xl">{s.value}</p>
                  <p className="text-xs text-slate-600 sm:text-sm">{s.label}</p>
                </div>
              ))}
            </div>

            {mine.length === 0 ? (
              <div className="py-12 text-center">
                <p className="mb-5 text-muted">You haven't posted a job yet.</p>
                <Link to="/jobs/new" className={btn}>Post your first job</Link>
              </div>
            ) : (
              <div className="space-y-5">
                {mine.map((job) => (
                  <article key={job._id} className="rounded-3xl border border-line bg-white p-5 shadow-sm sm:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`${chip} ${typeStyle[job.jobType] || chipGray}`}>{job.jobType}</span>
                          <span className={chipGray}>{job.workMode}</span>
                          <span className={`${chip} ${job.status === "open" ? "bg-[#dff5e9] text-[#1f7a4d]" : "bg-[#fff0f2] text-danger"}`}>
                            {job.status === "open" ? "Open" : "Closed"}
                          </span>
                        </div>
                        <h2 className="mt-2 break-words text-lg font-semibold sm:text-xl">{job.title}</h2>
                        <p className="text-sm text-muted">
                          {[job.company, job.location].filter(Boolean).join(" · ")} {job.company || job.location ? "· " : ""}
                          posted {timeAgo(job.createdAt)} · 💬 {job.commentCount}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Link to={`/jobs/${user._id}/${job._id}`} className={btnOutlineSm}>View</Link>
                        <Link to={`/jobs/${job._id}/edit`} className={btnOutlineSm}>Edit</Link>
                        <button className={btnOutlineSm} disabled={busyId === job._id} onClick={() => toggleStatus(job)}>
                          {job.status === "open" ? "Close" : "Reopen"}
                        </button>
                        <button className={`${btnOutlineSm} !border-[#f5c2cb] text-danger`} disabled={busyId === job._id} onClick={() => remove(job)}>
                          Delete
                        </button>
                      </div>
                    </div>

                    <details className="group mt-5 rounded-2xl bg-soft" open={job.interestedCount > 0 && job.interestedCount <= 3}>
                      <summary className="cursor-pointer list-none rounded-2xl px-4 py-3 text-sm font-semibold">
                        <span className="mr-1.5 inline-block transition group-open:rotate-90">▸</span>
                        🙋 {job.interestedCount} interested {job.interestedCount === 1 ? "member" : "members"}
                      </summary>

                      {job.interestedCount === 0 ? (
                        <p className="px-4 pb-4 text-sm text-muted">No one has shown interest yet.</p>
                      ) : (
                        <ul className="grid gap-3 px-3 pb-3 md:grid-cols-2 2xl:grid-cols-3">
                          {job.interested.map(({ _id, at, user }) => {
                            const name = fullName(user);
                            const li = linkedinUrl(user.linkedin);
                            return (
                              <li key={_id} className="rounded-2xl bg-white p-4">
                                <div className="flex items-center gap-3">
                                  <Avatar src={user.profilePic} name={name} size={44} />
                                  <div className="min-w-0">
                                    <Link to={`/members/${user._id}`} className="block truncate font-semibold hover:underline">{name}</Link>
                                    <p className="truncate text-xs text-muted">
                                      {[user.company, user.locality].filter(Boolean).join(" · ") || user.profession}
                                    </p>
                                  </div>
                                </div>
                                <p className="mt-2 text-xs text-muted">Interested {timeAgo(at)}</p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                  <a href={`mailto:${user.email}`} className={btnOutlineSm}>Email</a>
                                  {user.mobile && <a href={`tel:${user.mobile}`} className={btnOutlineSm}>Call</a>}
                                  {li && <a href={li} target="_blank" rel="noopener noreferrer" className={btnOutlineSm}>LinkedIn</a>}
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </details>
                  </article>
                ))}
              </div>
            )}
          </>
        ) : sent.length === 0 ? (
          <div className="py-12 text-center">
            <p className="mb-5 text-muted">You haven't shown interest in any job yet.</p>
            <Link to="/jobs" className={btn}>Browse jobs</Link>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {sent.map((row) => (
              <div key={row.job._id} className="flex flex-col gap-2">
                <div className="flex-1"><JobCard row={row} /></div>
                <button className={btnOutline} disabled={busyId === row.job._id} onClick={() => withdraw(row)}>
                  Withdraw my interest
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
