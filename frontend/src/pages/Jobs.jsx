import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import JobCard from "../components/JobCard";
import { JOB_TYPES, WORK_MODES } from "../jobs";
import { btn, btnOutline, card, field, label, wrap } from "../ui";

const start = { q: "", jobType: "", workMode: "", location: "" };

export default function Jobs() {
  const [filters, setFilters] = useState(start);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // reload the list shortly after the filters change (so typing does not spam the server)
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      api
        .get("/users/jobs", { params: filters })
        .then((res) => {
          setRows(res.data.jobs);
          setError("");
        })
        .catch(() => setError("Could not load jobs. Please try again."))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [filters]);

  const onChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });
  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div className="bg-soft py-8 sm:py-10">
      <div className={wrap}>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold sm:text-4xl">Jobs</h1>
            <p className="mt-1 text-muted">Openings posted by Chartered Accountants of the community.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/jobs/new" className={btn}>+ Post a job</Link>
            <Link to="/my-jobs" className={btnOutline}>My jobs</Link>
          </div>
        </div>

        <div className={`${card} grid gap-x-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_auto]`}>
          <div className="sm:col-span-2 lg:col-span-1">
            <label className={label}>Search</label>
            <input className={field} name="q" value={filters.q} onChange={onChange} placeholder="Heading, company or keywords" />
          </div>
          <div>
            <label className={label}>Job type</label>
            <select className={field} name="jobType" value={filters.jobType} onChange={onChange}>
              <option value="">All types</option>
              {JOB_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className={label}>Work mode</label>
            <select className={field} name="workMode" value={filters.workMode} onChange={onChange}>
              <option value="">Any</option>
              {WORK_MODES.map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className={label}>Location</label>
            <input className={field} name="location" value={filters.location} onChange={onChange} placeholder="City" />
          </div>
          <div className="flex items-end">
            <button type="button" className={`${btnOutline} mt-3.5 w-full lg:w-auto`} disabled={!hasFilters} onClick={() => setFilters(start)}>
              Reset
            </button>
          </div>
        </div>

        {error ? (
          <p className="py-14 text-center text-danger">{error}</p>
        ) : loading ? (
          <p className="py-14 text-center text-muted">Loading jobs...</p>
        ) : rows.length === 0 ? (
          <div className="py-14 text-center">
            <p className="text-muted">
              {hasFilters ? "No jobs match your search. Try fewer filters." : "No jobs have been posted yet."}
            </p>
            <Link to="/jobs/new" className={`${btn} mt-5`}>Post the first job</Link>
          </div>
        ) : (
          <>
            <p className="mb-3.5 mt-5 text-muted">{rows.length} {rows.length === 1 ? "job" : "jobs"} found</p>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {rows.map((r) => <JobCard key={r.job._id} row={r} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
