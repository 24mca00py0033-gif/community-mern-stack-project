import { Link } from "react-router-dom";
import Avatar, { fullName } from "./Avatar";
import { chip, chipGray, timeAgo, typeStyle } from "../jobs";

// One job in the list. Clicking it opens the full job post.
export default function JobCard({ row }) {
  const { job, poster } = row;
  const name = fullName(poster);
  const snippet = job.description.length > 150 ? `${job.description.slice(0, 150).trim()}…` : job.description;

  return (
    <Link
      to={`/jobs/${poster._id}/${job._id}`}
      className="flex h-full flex-col rounded-3xl border border-line bg-white p-5 text-ink shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(31,35,48,0.12)] sm:p-6"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className={`${chip} ${typeStyle[job.jobType] || chipGray}`}>{job.jobType}</span>
        <span className={chipGray}>{job.workMode}</span>
        {job.status === "closed" && <span className={`${chip} bg-[#fff0f2] text-danger`}>Closed</span>}
      </div>

      <h3 className="mt-3 text-lg font-semibold leading-snug sm:text-xl">{job.title}</h3>
      <p className="mt-1 text-sm text-muted">
        {[job.company, job.location].filter(Boolean).join(" · ") || "Company and location not added"}
      </p>
      <p className="mt-3 flex-1 whitespace-pre-line break-words text-sm text-slate-600">{snippet}</p>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
        {job.experience && <span>🎓 {job.experience}</span>}
        {job.salary && <span>💰 {job.salary}</span>}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <Avatar src={poster.profilePic} name={name} size={34} />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{name}</p>
            <p className="text-xs text-muted">{timeAgo(job.createdAt)}</p>
          </div>
        </div>
        <div className="flex shrink-0 gap-3 text-xs font-medium text-slate-600">
          <span title="Comments">💬 {job.commentCount}</span>
          <span title="Interested" className={job.iAmInterested ? "text-leaf" : ""}>
            🙋 {job.interestedCount}
          </span>
        </div>
      </div>
    </Link>
  );
}
