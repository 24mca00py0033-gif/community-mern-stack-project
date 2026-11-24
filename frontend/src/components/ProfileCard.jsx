import { Link } from "react-router-dom";
import Avatar, { colorFor, fullName } from "./Avatar";
import { tag } from "../ui";

// One member card. Clicking it opens the full profile page.
export default function ProfileCard({ person }) {
  const name = fullName(person);
  const [topColor] = colorFor(name);

  return (
    <Link
      to={`/members/${person._id}`}
      className="block overflow-hidden rounded-3xl border border-line bg-white pb-5 text-center text-ink transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_36px_rgba(31,35,48,0.12)]"
    >
      <div className="h-[74px]" style={{ background: topColor }} />
      <div className="-mt-10 flex justify-center">
        <Avatar src={person.profilePic} name={name} size={80} className="border-4 border-white" />
      </div>

      <h3 className="mt-3 px-3 text-base font-semibold">{name}</h3>
      <span className={`${tag} mt-2`}>Chartered Accountant</span>

      <ul className="mt-3 space-y-0.5 px-3.5 text-[0.86rem] text-muted">
        {person.company && <li className="break-words">🏢 {person.company}</li>}
        {person.locality && <li className="break-words">📍 {person.locality}</li>}
      </ul>

      <span className="mt-3 inline-block text-[0.85rem] font-semibold text-brand">View profile →</span>
    </Link>
  );
}
