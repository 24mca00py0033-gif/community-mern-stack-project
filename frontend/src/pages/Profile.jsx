import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import Avatar, { fullName } from "../components/Avatar";
import { alertErr, alertOk, btn, card, field, label, wrap } from "../ui";
import { linkedinUrl, missingFields, requiredFields } from "../utils";

const blank = { name: "", lastName: "", company: "", locality: "", mobile: "", linkedin: "" };

export default function Profile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState(blank);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [busy, setBusy] = useState(false);

  // fill the form with the saved profile
  useEffect(() => {
    setForm({
      name: user.name || "",
      lastName: user.lastName || "",
      company: user.company || "",
      locality: user.locality || "",
      mobile: user.mobile || "",
      linkedin: user.linkedin || "",
    });
    setPreview(user.profilePic || "");
  }, [user]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: "", text: "" });
    setBusy(true);

    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => data.append(k, v));
    if (file) data.append("profilePic", file);

    try {
      const res = await api.put("/users/me", data);
      setUser(res.data.user);
      setFile(null);
      setMsg({ type: "ok", text: "Profile saved!" });
    } catch (err) {
      setMsg({ type: "err", text: err.response?.data?.message || "Could not save profile" });
    } finally {
      setBusy(false);
    }
  };

  // progress is based on what is saved, not what is being typed
  const missing = missingFields(user);
  const done = requiredFields.length - missing.length;
  const percent = Math.round((done / requiredFields.length) * 100);
  const liUrl = linkedinUrl(form.linkedin);

  return (
    <div className="bg-soft py-10">
      <div className={wrap}>
        <h1 className="mb-6 text-3xl font-bold sm:text-4xl">My profile</h1>

        <div className="grid items-start gap-6 lg:grid-cols-[340px_1fr]">
          {/* left: photo + completion */}
          <div className={`${card} text-center`}>
            <div className="flex justify-center">
              <Avatar src={preview} name={fullName(form) || user.name} size={130} />
            </div>
            <h2 className="mt-4 text-xl font-semibold">{fullName(form) || user.name}</h2>
            <p className="break-all text-sm text-muted">{user.email}</p>

            <div className="mt-6 text-left">
              <div className="mb-1.5 flex justify-between text-sm font-medium">
                <span>Profile completion</span>
                <span>{percent}%</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-line">
                <div className="h-full rounded-full bg-leaf transition-all" style={{ width: `${percent}%` }} />
              </div>
              {missing.length > 0 ? (
                <p className="mt-3 text-xs text-muted">
                  Still to add: {missing.map((m) => m.label).join(", ")}
                </p>
              ) : (
                <p className="mt-3 text-xs font-medium text-leaf">Your profile is complete. 🎉</p>
              )}
            </div>

            <Link to={`/members/${user._id}`} className="mt-5 inline-block text-sm font-semibold text-brand">
              See how others view my profile →
            </Link>
          </div>

          {/* right: form */}
          <form className={card} onSubmit={onSubmit}>
            <label className="mb-1.5 block text-[0.82rem] font-medium text-muted">Profile picture</label>
            <input className={field} type="file" accept="image/*" onChange={onFile} />
            <p className="mt-1.5 text-xs text-muted">JPG or PNG, up to 4 MB. Stored on Cloudinary.</p>

            <div className="grid gap-x-5 sm:grid-cols-2">
              <div>
                <label className={label}>Name</label>
                <input className={field} name="name" value={form.name} onChange={onChange} required />
              </div>
              <div>
                <label className={label}>Last name</label>
                <input className={field} name="lastName" value={form.lastName} onChange={onChange} />
              </div>
            </div>

            <label className={label}>Email</label>
            <input className={field} value={user.email} disabled />

            <div className="grid gap-x-5 sm:grid-cols-2">
              <div>
                <label className={label}>Profession</label>
                <input className={field} value="Chartered Accountant (CA)" disabled />
              </div>
              <div>
                <label className={label}>Company</label>
                <input className={field} name="company" value={form.company} onChange={onChange} placeholder="Where you work" />
              </div>
              <div>
                <label className={label}>Locality</label>
                <input className={field} name="locality" value={form.locality} onChange={onChange} placeholder="Where you belong to" />
              </div>
              <div>
                <label className={label}>Mobile number</label>
                <input className={field} name="mobile" value={form.mobile} onChange={onChange} placeholder="+91 ..." />
              </div>
            </div>

            <label className={label}>LinkedIn ID</label>
            <input
              className={field}
              name="linkedin"
              value={form.linkedin}
              onChange={onChange}
              placeholder="e.g. rahul-sharma or your full LinkedIn profile link"
              maxLength={200}
            />
            <p className="mt-1.5 text-xs text-muted">
              Add your LinkedIn ID so other members can find and connect with you.
              {liUrl && (
                <>
                  {" "}Preview:{" "}
                  <a href={liUrl} target="_blank" rel="noopener noreferrer" className="break-all text-brand hover:underline">
                    {liUrl}
                  </a>
                </>
              )}
            </p>

            {msg.text && <div className={msg.type === "ok" ? alertOk : alertErr}>{msg.text}</div>}

            <button className={`${btn} mt-6`} disabled={busy}>{busy ? "Saving..." : "Save profile"}</button>
          </form>
        </div>
      </div>
    </div>
  );
}
