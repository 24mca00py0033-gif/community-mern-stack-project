import { useEffect, useState } from "react";
import { NavLink, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Avatar, { fullName } from "./Avatar";
import { BrandMark } from "./Illustrations";
import { btnOutlineSm, betaBadge, wrap } from "../ui";
import { isProfileComplete } from "../utils";

// Links look like a menu list on phones and like a plain row on laptops
const linkCls = ({ isActive }) =>
  `flex items-center gap-2 rounded-xl px-3 py-2.5 text-[0.95rem] font-medium transition hover:bg-soft hover:text-ink lg:rounded-none lg:bg-transparent lg:px-0 lg:py-1 lg:text-sm lg:hover:bg-transparent ${
    isActive ? "bg-soft text-ink lg:shadow-[inset_0_-2px_0_var(--color-leaf)]" : "text-slate-600"
  }`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  // close the phone menu after moving to another page
  useEffect(() => setOpen(false), [pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="relative z-40 border-b border-line bg-white">
      <div className={`${wrap} flex flex-wrap items-center justify-between gap-x-4 py-3 lg:py-4`}>
        <Link to="/" className="flex items-center gap-2.5 font-display text-lg font-bold text-ink sm:text-xl">
          <BrandMark /> <span>Community Connect</span>
          <span className={betaBadge}>Beta</span>
        </Link>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-line text-ink lg:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>

        <nav
          className={`${open ? "flex" : "hidden"} w-full flex-col gap-1 pb-2 pt-3 lg:flex lg:w-auto lg:flex-row lg:items-center lg:gap-6 lg:pb-0 lg:pt-0`}
        >
          {user ? (
            <>
              <NavLink to="/" end className={linkCls}>Home</NavLink>
              <NavLink to="/search" className={linkCls}>Search</NavLink>
              <NavLink to="/members" className={linkCls}>Members</NavLink>
              <NavLink to="/jobs" className={linkCls}>Jobs</NavLink>
              <NavLink to="/about" className={linkCls}>About</NavLink>
              <NavLink to="/profile" className={linkCls}>
                <Avatar src={user.profilePic} name={fullName(user)} size={30} />
                <span>My Profile</span>
                {!isProfileComplete(user) && (
                  <span className="h-2 w-2 rounded-full bg-ember" title="Profile incomplete" />
                )}
              </NavLink>
              <button className={`${btnOutlineSm} mt-2 lg:mt-0`} onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={linkCls}>Login</NavLink>
              <NavLink to="/about" className={linkCls}>About</NavLink>
              <Link to="/register" className={`${btnOutlineSm} mt-2 lg:mt-0`}>Sign up</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
