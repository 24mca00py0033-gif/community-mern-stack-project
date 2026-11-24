import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { JOB_TYPES, WORK_MODES, errMsg } from "../jobs";
import { alertErr, btn, btnOutline, card, field, label, wrap } from "../ui";

// Used for both "Post a job" (/jobs/new) and "Edit job" (/jobs/:jobId/edit)
export default function JobForm() {
  const { jobId } = useParams();
  const editing = Boolean(jobId);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    jobType: "Full-time",
    workMode: "On-site",
    company: user.company || "",
    location: user.locality || "",
    experience: "",
    salary: "",
    description: "",
  });
  const [loading, setLoading] = useState(editing);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // when editing, load the saved job
  useEffect(() => {
    if (!editing) return;
    api
      .get(`/users/jobs/${user._id}/${jobId}`)
      .then((res) => {
        const j = res.data.job;
        setForm({
          title: j.title,
          jobType: j.jobType,
          workMode: j.workMode,
          company: j.company || "",
          location: j.location || "",
          experience: j.experience || "",
          salary: j.salary || "",
          description: j.description,
        });
      })
      .catch((err) => setError(errMsg(err, "Could not load this job")))
      .finally(() => setLoading(false));
  }, [editing, jobId, user._id]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (editing) {
        await api.put(`/users/me/jobs/${jobId}`, form);
        navigate(`/jobs/${user._id}/${jobId}`);
      } else {
        const res = await api.post("/users/me/jobs", form);
        navigate(`/jobs/${user._id}/${res.data.job._id}`);
      }
    } catch (err) {
      setError(errMsg(err, "Could not save the job"));
      setBusy(false);
    }
  };

  if (loading) return <p className="py-24 text-center text-muted">Loading...</p>;

  return (
    <div className="bg-soft py-8 sm:py-10">
      <div className={wrap}>
        <Link to={editing ? "/my-jobs" : "/jobs"} className="text-sm font-medium text-brand">
          ← Back
        </Link>
        <h1 className="mb-6 mt-2 text-3xl font-bold sm:text-4xl">{editing ? "Edit job" : "Post a job"}</h1>

        <div className="grid items-start gap-6 lg:grid-cols-[1fr_320px]">
          <form className={card} onSubmit={onSubmit}>
            <label className={`${label} mt-0`}>Job heading *</label>
            <input
              className={field}
              name="title"
              value={form.title}
              onChange={onChange}
              maxLength={120}
              placeholder="e.g. Audit Senior (CA)"
              required
            />

            <div className="grid gap-x-5 sm:grid-cols-2">
              <div>
                <label className={label}>Job type</label>
                <select className={field} name="jobType" value={form.jobType} onChange={onChange}>
                  {JOB_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className={label}>Work mode</label>
                <select className={field} name="workMode" value={form.workMode} onChange={onChange}>
                  {WORK_MODES.map((m) => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className={label}>Company</label>
                <input className={field} name="company" value={form.company} onChange={onChange} maxLength={100} placeholder="Company or firm name" />
              </div>
              <div>
                <label className={label}>Location</label>
                <input className={field} name="location" value={form.location} onChange={onChange} maxLength={100} placeholder="City" />
              </div>
              <div>
                <label className={label}>Experience</label>
                <input className={field} name="experience" value={form.experience} onChange={onChange} maxLength={60} placeholder="e.g. 2-4 years" />
              </div>
              <div>
                <label className={label}>Salary (optional)</label>
                <input className={field} name="salary" value={form.salary} onChange={onChange} maxLength={60} placeholder="e.g. 8-12 LPA" />
              </div>
            </div>

            <label className={label}>Job description *</label>
            <textarea
              className={`${field} min-h-48 resize-y`}
              name="description"
              value={form.description}
              onChange={onChange}
              maxLength={3000}
              placeholder="What is the role? Responsibilities, skills needed, how to apply..."
              required
            />
            <p className="mt-1 text-right text-xs text-muted">{form.description.length} / 3000</p>

            {error && <div className={alertErr}>{error}</div>}

            <div className="mt-6 flex flex-wrap gap-3">
              <button className={btn} disabled={busy}>
                {busy ? "Saving..." : editing ? "Save changes" : "Post job"}
              </button>
              <Link to={editing ? "/my-jobs" : "/jobs"} className={btnOutline}>Cancel</Link>
            </div>
          </form>

          <aside className="rounded-3xl bg-[#fff3d6] p-6 text-sm text-[#6b5a2b]">
            <h3 className="mb-2 font-display text-lg font-semibold text-ink">Good to know</h3>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>Job posts are text only, no images.</li>
              <li>Every member can see your post and comment on it.</li>
              <li>Members who click "I'm interested" show up in <strong>My jobs</strong> with their contact details.</li>
              <li>You can edit, close or delete your post any time.</li>
            </ul>
          </aside>
        </div>
      </div>
    </div>
  );
}
