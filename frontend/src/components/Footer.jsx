import { Link } from "react-router-dom";
import { BrandMark } from "./Illustrations";
import { wrap } from "../ui";

const linkCls = "mb-2 block text-sm text-[#b9bfd8] transition hover:text-white";
const headCls = "mb-3.5 font-display text-base font-semibold text-white";

export default function Footer() {
  return (
    <footer className="bg-[#14182f] text-[#b9bfd8]">
      <div className={`${wrap} pb-7 pt-14`}>
        <div className="grid gap-9 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5 font-display text-xl font-bold text-white">
              <BrandMark /> Community Connect
            </div>
            <p className="mt-3.5 max-w-sm text-sm">
              Connecting the community with each other. Built for the Pareek
              community's Chartered Accountants. Currently in beta.
            </p>
          </div>

          <div>
            <h4 className={headCls}>Explore</h4>
            <Link to="/" className={linkCls}>Home</Link>
            <Link to="/search" className={linkCls}>Search</Link>
            <Link to="/members" className={linkCls}>Members</Link>
            <Link to="/jobs" className={linkCls}>Jobs</Link>
          </div>

          <div>
            <h4 className={headCls}>Account</h4>
            <Link to="/profile" className={linkCls}>My profile</Link>
            <Link to="/login" className={linkCls}>Login</Link>
            <Link to="/register" className={linkCls}>Register</Link>
          </div>

          <div>
            <h4 className={headCls}>Community</h4>
            <Link to="/about" className={linkCls}>About us</Link>
            <span className="mb-2 block text-sm">Find CAs by company</span>
            <span className="mb-2 block text-sm">Find CAs by locality</span>
            <span className="mb-2 block text-sm">Post and find jobs</span>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap justify-between gap-2.5 border-t border-white/10 pt-5 text-[0.85rem]">
          <span>© 2026 Community Connect. All rights reserved.</span>
          <span>Beta version · Made with care for the Pareek community</span>
        </div>
      </div>
    </footer>
  );
}
