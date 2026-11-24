import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProfilePrompt from "./components/ProfilePrompt";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Search from "./pages/Search";
import Profile from "./pages/Profile";
import Members from "./pages/Members";
import MemberProfile from "./pages/MemberProfile";
import Jobs from "./pages/Jobs";
import JobForm from "./pages/JobForm";
import JobDetail from "./pages/JobDetail";
import MyJobs from "./pages/MyJobs";
import About from "./pages/About";

// start every new page at the top
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

const guard = (page) => <ProtectedRoute>{page}</ProtectedRoute>;

export default function App() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/about" element={<About />} />

          <Route path="/" element={guard(<Home />)} />
          <Route path="/search" element={guard(<Search />)} />
          <Route path="/profile" element={guard(<Profile />)} />
          <Route path="/members" element={guard(<Members />)} />
          <Route path="/members/:id" element={guard(<MemberProfile />)} />

          <Route path="/jobs" element={guard(<Jobs />)} />
          <Route path="/jobs/new" element={guard(<JobForm />)} />
          <Route path="/jobs/:jobId/edit" element={guard(<JobForm />)} />
          <Route path="/jobs/:ownerId/:jobId" element={guard(<JobDetail />)} />
          <Route path="/my-jobs" element={guard(<MyJobs />)} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
      <ProfilePrompt />
    </div>
  );
}
