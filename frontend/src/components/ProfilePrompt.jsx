import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { btn, btnOutline } from "../ui";
import { markPromptDone, missingFields, isProfileComplete, promptDone } from "../utils";

// Pop-up shown first after login while the member's profile is incomplete
export default function ProfilePrompt() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(!!user && !isProfileComplete(user) && !promptDone() && pathname !== "/profile");
  }, [user, pathname]);

  const close = () => {
    markPromptDone();
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;

  const missing = missingFields(user);

  const goToProfile = () => {
    close();
    navigate("/profile");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-prompt-title"
    >
      <div className="w-full max-w-md animate-pop rounded-3xl bg-white p-8 text-center shadow-2xl motion-reduce:animate-none">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#eceaff] text-3xl">
          👤
        </div>
        <h2 id="profile-prompt-title" className="text-2xl font-bold">
          Complete your profile
        </h2>
        <p className="mt-2 text-sm text-muted">
          Hi {user.name}, add your details so people in the community can find
          you and connect with you.
        </p>

        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {missing.map((f) => (
            <span key={f.key} className="rounded-full bg-[#fff3d6] px-3 py-1 text-xs font-semibold text-[#a16207]">
              {f.label}
            </span>
          ))}
        </div>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button className={btn} onClick={goToProfile}>
            Complete my profile
          </button>
          <button className={btnOutline} onClick={close}>
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
