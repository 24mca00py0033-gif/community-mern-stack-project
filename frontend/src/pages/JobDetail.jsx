import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api";
import Avatar, { fullName } from "../components/Avatar";
import { chip, chipGray, errMsg, timeAgo, typeStyle } from "../jobs";
import { alertErr, btn, btnOutline, card, field, wrap } from "../ui";

export default function JobDetail() {
  const { ownerId, jobId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError("");
    api
      .get(`/users/jobs/${ownerId}/${jobId}`)
      .then((res) => {
        setData(res.data);
        setComments(res.data.job.comments || []);
      })
      .catch((err) => setError(errMsg(err, "Could not load this job")))
      .finally(() => setLoading(false));
  }, [ownerId, jobId]);

  if (loading) return <p className="py-24 text-center text-muted">Loading job...</p>;

  if (error) {
    return (
      <div className={`${wrap} py-20 text-center`}>
        <p className="mb-6 text-muted">{error}</p>
        <Link to="/jobs" className={btnOutline}>Back to jobs</Link>
      </div>
    );
  }

  const { job, poster } = data;
  const posterName = fullName(poster);
  const closed = job.status === "closed";

  // run an action, show its error if it fails
  const run = async (fn) => {
    setActionError("");
    setBusy(true);
    try {
      await fn();
    } catch (err) {
      setActionError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  const patchJob = (changes) => setData((d) => ({ ...d, job: { ...d.job, ...changes } }));

  const toggleInterest = () =>
    run(async () => {
      if (job.iAmInterested) {
        await api.delete(`/interested/${ownerId}/${jobId}`);
        patchJob({ iAmInterested: false, interestedCount: Math.max(0, job.interestedCount - 1) });
      } else {
        await api.post(`/interested/${ownerId}/${jobId}`);
        patchJob({ iAmInterested: true, interestedCount: job.interestedCount + 1 });
      }
    });

  const toggleStatus = () =>
    run(async () => {
      const status = closed ? "open" : "closed";
      await api.put(`/users/me/jobs/${jobId}`, { status });
      patchJob({ status });
    });

  const remove = () => {
    if (!window.confirm("Delete this job post? This cannot be undone.")) return;
    run(async () => {
      await api.delete(`/users/me/jobs/${jobId}`);
      navigate("/my-jobs");
    });
  };

  const addComment = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    run(async () => {
      const res = await api.post(`/users/${ownerId}/jobs/${jobId}/comments`, { text });
      setComments((c) => [...c, res.data.comment]);
      patchJob({ commentCount: (job.commentCount || 0) + 1 });
      setText("");
    });
  };

  return (
    <div className="bg-soft py-8 sm:py-10">
      <div className={wrap}>
        <Link to="/jobs" className="text-sm font-medium text-brand">← Back to jobs</Link>

        <div className="mt-4 grid items-start gap-6 lg:grid-cols-[1fr_340px]">
          {/* ---------- left: the job + comments ---------- */}
          <div className="space-y-6">
            <article className={card}>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`${chip} ${typeStyle[job.jobType] || chipGray}`}>{job.jobType}</span>
                <span className={chipGray}>{job.workMode}</span>
                {closed && <span className={`${chip} bg-[#fff0f2] text-danger`}>Closed</span>}
              </div>

              <h1 className="mt-3 break-words text-2xl font-bold sm:text-3xl">{job.title}</h1>
              <p className="mt-1 text-muted">
                {[job.company, job.location].filter(Boolean).join(" · ") || "Company and location not added"}
              </p>
              <p className="mt-1 text-xs text-muted">Posted {timeAgo(job.createdAt)}</p>

              {(job.experience || job.salary) && (
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {job.experience && (
                    <div className="rounded-2xl bg-soft p-4">
                      <p className="text-xs uppercase tracking-wider text-muted">Experience</p>
                      <p className="font-semibold">{job.experience}</p>
                    </div>
                  )}
                  {job.salary && (
                    <div className="rounded-2xl bg-soft p-4">
                      <p className="text-xs uppercase tracking-wider text-muted">Salary</p>
                      <p className="font-semibold">{job.salary}</p>
                    </div>
                  )}
                </div>
              )}

              <h2 className="mb-2 mt-6 text-lg font-semibold">About the job</h2>
              <p className="whitespace-pre-line break-words text-slate-700">{job.description}</p>
            </article>

            <section className={card}>
              <h2 className="mb-4 text-xl font-semibold">Comments ({comments.length})</h2>

              <form onSubmit={addComment}>
                <textarea
                  className={`${field} min-h-24 resize-y`}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  maxLength={500}
                  placeholder="Ask a question or share a thought..."
                />
                <div className="mt-2 flex items-center justify-between gap-3">
                  <span className="text-xs text-muted">{text.length} / 500</span>
                  <button className={`${btn} px-6 py-2.5`} disabled={busy || !text.trim()}>Comment</button>
                </div>
              </form>

              <ul className="mt-6 space-y-5">
                {comments.length === 0 && <li className="text-sm text-muted">No comments yet. Be the first to comment.</li>}
                {comments.map((c) => {
                  const n = c.user ? fullName(c.user) : "Former member";
                  return (
                    <li key={c._id} className="flex gap-3">
                      <Avatar src={c.user?.profilePic} name={n} size={38} />
                      <div className="min-w-0 flex-1 rounded-2xl bg-soft px-4 py-3">
                        <p className="flex flex-wrap items-baseline gap-x-2 text-sm">
                          {c.user ? (
                            <Link to={`/members/${c.user._id}`} className="font-semibold text-ink hover:underline">{n}</Link>
                          ) : (
                            <span className="font-semibold">{n}</span>
                          )}
                          <span className="text-xs text-muted">{timeAgo(c.createdAt)}</span>
                        </p>
                        <p className="mt-1 whitespace-pre-line break-words text-sm text-slate-700">{c.text}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          </div>

          {/* ---------- right: poster + actions ---------- */}
          <aside className="space-y-6 lg:sticky lg:top-6">
            <div className={card}>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">Posted by</p>
              <div className="flex items-center gap-3">
                <Avatar src={poster.profilePic} name={posterName} size={56} />
                <div className="min-w-0">
                  <Link to={`/members/${poster._id}`} className="block truncate font-semibold hover:underline">{posterName}</Link>
                  <p className="truncate text-sm text-muted">{[poster.company, poster.locality].filter(Boolean).join(" · ") || poster.profession}</p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {job.isOwner ? (
                  <>
                    <Link to="/my-jobs" className={`${btn} w-full`}>
                      🙋 {job.interestedCount} interested
                    </Link>
                    <div className="grid grid-cols-2 gap-3">
                      <Link to={`/jobs/${jobId}/edit`} className={btnOutline}>Edit</Link>
                      <button className={btnOutline} onClick={toggleStatus} disabled={busy}>
                        {closed ? "Reopen" : "Close"}
                      </button>
                    </div>
                    <button className={`${btnOutline} w-full !border-[#f5c2cb] text-danger`} onClick={remove} disabled={busy}>
                      Delete post
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className={`${job.iAmInterested ? btnOutline : btn} w-full`}
                      onClick={toggleInterest}
                      disabled={busy || (closed && !job.iAmInterested)}
                    >
                      {job.iAmInterested ? "✓ You're interested (tap to withdraw)" : closed ? "This job is closed" : "🙋 I'm interested"}
                    </button>
                    <p className="text-xs text-muted">
                      {job.interestedCount} {job.interestedCount === 1 ? "member is" : "members are"} interested. The poster
                      can see who is interested and contact you.
                    </p>
                  </>
                )}
                {actionError && <div className={alertErr}>{actionError}</div>}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
