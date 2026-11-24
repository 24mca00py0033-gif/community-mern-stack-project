import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api";
import Avatar, { fullName } from "../components/Avatar";
import { useAuth } from "../context/AuthContext";
import { btn, btnOutline, tag, wrap } from "../ui";
import { linkedinUrl } from "../utils";

// Full profile of one member (opened by clicking a card)
export default function MemberProfile() {
  const { id } = useParams();
  const { user: me } = useAuth();
  const [person, setPerson] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError("");
    api
      .get(`/users/${id}`)
      .then((res) => setPerson(res.data.user))
      .catch((err) => setError(err.response?.data?.message || "Could not load this profile"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="py-24 text-center text-muted">Loading profile...</p>;

  if (error) {
    return (
      <div className={`${wrap} py-20 text-center`}>
        <p className="mb-6 text-muted">{error}</p>
        <Link to="/members" className={btnOutline}>Back to members</Link>
      </div>
    );
  }

  const name = fullName(person);
  const isMe = me && me._id === person._id;
  const since = new Date(person.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  const liUrl = linkedinUrl(person.linkedin);

  const details = [
    { icon: "🏢", label: "Company", value: person.company },
    { icon: "📍", label: "Locality", value: person.locality },
    { icon: "📞", label: "Mobile", value: person.mobile },
    { icon: "✉️", label: "Email", value: person.email },
    {
      icon: "💼",
      label: "LinkedIn",
      value: person.linkedin,
      node: liUrl && (
        <a href={liUrl} target="_blank" rel="noopener noreferrer" className="break-all font-semibold text-brand hover:underline">
          {person.linkedin}
        </a>
      ),
    },
  ];

  return (
    <div className="bg-soft pb-16">
      {/* full-width banner */}
      <div className="relative h-44 overflow-hidden bg-gradient-to-r from-[#e0dcff] to-[#ffe1d3] sm:h-56">
        <div className="absolute -top-10 right-[8%] h-48 w-48 rounded-full bg-[#ffc857]/70" />
        <div className="absolute -bottom-14 left-[6%] h-32 w-44 rounded-t-full bg-iris/35" />
      </div>

      <div className={wrap}>
        <Link to="/members" className="mt-5 inline-block text-sm font-medium text-brand">← Back to members</Link>

        <div className="-mt-4 flex flex-wrap items-end gap-6 sm:-mt-14">
          <Avatar src={person.profilePic} name={name} size={132} className="border-[6px] border-white shadow-xl" />
          <div className="min-w-[220px] flex-1 pb-1.5">
            <h1 className="mb-2 text-3xl font-bold sm:text-4xl">{name}</h1>
            <span className={tag}>Chartered Accountant</span>
            <p className="mt-1.5 text-sm text-muted">Member since {since}</p>
          </div>
          <div className="flex flex-wrap gap-3 pb-2.5">
            {isMe ? (
              <Link to="/profile" className={btn}>Edit my profile</Link>
            ) : (
              <>
                <a href={`mailto:${person.email}`} className={btn}>Send email</a>
                {liUrl && (
                  <a href={liUrl} target="_blank" rel="noopener noreferrer" className={btnOutline}>LinkedIn</a>
                )}
                {person.mobile && <a href={`tel:${person.mobile}`} className={btnOutline}>Call</a>}
              </>
            )}
          </div>
        </div>

        <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {details.map((d) => (
            <div key={d.label} className="flex items-center gap-4 rounded-3xl bg-white p-5 shadow-sm">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-soft text-xl">{d.icon}</span>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wider text-muted">{d.label}</p>
                <p className="break-words font-semibold">
                  {d.value ? d.node || d.value : <span className="font-normal text-muted">Not added yet</span>}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
