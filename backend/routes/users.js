const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const User = require("../models/User");
const auth = require("../middleware/auth");
const { uploadBuffer } = require("../config/cloudinary");
const { isId, toId, like, readJob, jobRowProjection } = require("../utils/jobHelpers");

const router = express.Router();

// keep the uploaded image in memory, then send it to Cloudinary
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024 }, // 4 MB (Vercel allows ~4.5 MB per request)
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});

const MAX_JOBS_PER_USER = 50;
const MAX_COMMENTS_PER_JOB = 300;

// All routes below need a valid JWT
router.use(auth);

// ---------------------------------------------------------------------------
// Members
// ---------------------------------------------------------------------------

// GET /api/users/featured  -> 10 profiles for the home page
router.get("/featured", async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 }).limit(10);
  res.json({ users });
});

// GET /api/users/search?name=&lastName=&profession=&locality=&company=
router.get("/search", async (req, res) => {
  const { name, lastName, profession, locality, company } = req.query;
  const query = {};

  if (name && name.trim()) query.name = like(name);
  if (lastName && lastName.trim()) query.lastName = like(lastName);
  if (profession && profession.trim()) query.profession = like(profession);
  if (locality && locality.trim()) query.locality = like(locality);
  if (company && company.trim()) query.company = like(company);

  const users = await User.find(query).sort({ name: 1 }).limit(100);
  res.json({ users });
});

// GET /api/users/filters -> distinct values for the members page dropdowns
router.get("/filters", async (req, res) => {
  const clean = (arr) => arr.filter(Boolean).sort((a, b) => a.localeCompare(b));
  const [companies, localities, professions] = await Promise.all([
    User.distinct("company"),
    User.distinct("locality"),
    User.distinct("profession"),
  ]);
  res.json({
    companies: clean(companies),
    localities: clean(localities),
    professions: clean(professions),
  });
});

// ---------------------------------------------------------------------------
// Job posts (stored inside each user's record, text only)
// ---------------------------------------------------------------------------

// GET /api/users/jobs?q=&jobType=&workMode=&location=  -> open jobs from everyone
router.get("/jobs", async (req, res) => {
  const { q, jobType, workMode, location } = req.query;
  const me = toId(req.userId);
  const match = { "jobs.status": "open" };

  if (jobType && User.JOB_TYPES.includes(jobType)) match["jobs.jobType"] = jobType;
  if (workMode && User.WORK_MODES.includes(workMode)) match["jobs.workMode"] = workMode;
  if (location && String(location).trim()) match["jobs.location"] = like(location);
  if (q && String(q).trim()) {
    const r = like(q);
    match.$or = ["title", "company", "description", "location"].map((f) => ({ [`jobs.${f}`]: r }));
  }

  const rows = await User.aggregate([
    { $match: { "jobs.0": { $exists: true } } },
    { $unwind: "$jobs" },
    { $match: match },
    { $sort: { "jobs.createdAt": -1 } },
    { $limit: 100 },
    jobRowProjection(me),
  ]);

  res.json({ jobs: rows });
});

// GET /api/users/jobs/:ownerId/:jobId  -> one job with its comments
router.get("/jobs/:ownerId/:jobId", async (req, res) => {
  const { ownerId, jobId } = req.params;
  if (!isId(ownerId, jobId)) return res.status(404).json({ message: "Job not found" });

  const owner = await User.findById(ownerId)
    .select("+jobs")
    .populate("jobs.comments.user", "name lastName profilePic");
  const job = owner && owner.jobs.id(jobId);
  if (!job) return res.status(404).json({ message: "Job not found" });

  const me = String(req.userId);
  const plain = job.toObject();
  const interestedCount = plain.interested.length;
  const iAmInterested = plain.interested.some((i) => String(i.user) === me);
  delete plain.interested; // the list is only for the poster (see /api/interested/mine)

  res.json({
    job: { ...plain, interestedCount, iAmInterested, isOwner: String(owner._id) === me },
    poster: {
      _id: owner._id,
      name: owner.name,
      lastName: owner.lastName,
      profilePic: owner.profilePic,
      profession: owner.profession,
      company: owner.company,
      locality: owner.locality,
    },
  });
});

// POST /api/users/me/jobs  -> create a job post
router.post("/me/jobs", async (req, res) => {
  try {
    const { data, error } = readJob(req.body, false);
    if (error) return res.status(400).json({ message: error });

    const full = await User.countDocuments({
      _id: req.userId,
      [`jobs.${MAX_JOBS_PER_USER - 1}`]: { $exists: true },
    });
    if (full) {
      return res.status(400).json({ message: `You can keep up to ${MAX_JOBS_PER_USER} job posts. Delete an old one first.` });
    }

    const now = new Date();
    data.createdAt = now;
    data.updatedAt = now;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $push: { jobs: { $each: [data], $position: 0 } } },
      { new: true, runValidators: true }
    ).select("+jobs");

    res.status(201).json({ job: user.jobs[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not post the job" });
  }
});

// PUT /api/users/me/jobs/:jobId  -> edit, close or reopen your job post
router.put("/me/jobs/:jobId", async (req, res) => {
  try {
    const { jobId } = req.params;
    if (!isId(jobId)) return res.status(404).json({ message: "Job not found" });

    const { data, error } = readJob(req.body, true);
    if (error) return res.status(400).json({ message: error });
    if (Object.keys(data).length === 0) return res.status(400).json({ message: "Nothing to update" });

    const set = { "jobs.$.updatedAt": new Date() };
    for (const [k, v] of Object.entries(data)) set[`jobs.$.${k}`] = v;

    const r = await User.updateOne({ _id: req.userId, "jobs._id": jobId }, { $set: set });
    if (!r.matchedCount) return res.status(404).json({ message: "Job not found" });

    res.json({ message: "Job updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not update the job" });
  }
});

// DELETE /api/users/me/jobs/:jobId  -> delete your job post
router.delete("/me/jobs/:jobId", async (req, res) => {
  const { jobId } = req.params;
  if (!isId(jobId)) return res.status(404).json({ message: "Job not found" });

  const r = await User.updateOne({ _id: req.userId }, { $pull: { jobs: { _id: jobId } } });
  if (!r.modifiedCount) return res.status(404).json({ message: "Job not found" });

  res.json({ message: "Job deleted" });
});

// POST /api/users/:ownerId/jobs/:jobId/comments  { text }  -> any member can comment
router.post("/:ownerId/jobs/:jobId/comments", async (req, res) => {
  try {
    const { ownerId, jobId } = req.params;
    if (!isId(ownerId, jobId)) return res.status(404).json({ message: "Job not found" });

    const text = typeof req.body.text === "string" ? req.body.text.trim() : "";
    if (!text) return res.status(400).json({ message: "Write a comment first" });
    if (text.length > 500) return res.status(400).json({ message: "Comment is too long (500 characters max)" });

    const _id = new mongoose.Types.ObjectId();
    const createdAt = new Date();

    const r = await User.updateOne(
      {
        _id: ownerId,
        jobs: { $elemMatch: { _id: jobId, [`comments.${MAX_COMMENTS_PER_JOB - 1}`]: { $exists: false } } },
      },
      { $push: { "jobs.$.comments": { _id, user: req.userId, text, createdAt } } }
    );
    if (!r.matchedCount) {
      return res.status(404).json({ message: "Job not found, or it has reached its comment limit" });
    }

    const me = await User.findById(req.userId).select("name lastName profilePic");
    res.status(201).json({
      comment: {
        _id,
        text,
        createdAt,
        user: { _id: me._id, name: me.name, lastName: me.lastName, profilePic: me.profilePic },
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not add your comment" });
  }
});

// ---------------------------------------------------------------------------
// Members list and single profile
// ---------------------------------------------------------------------------

// GET /api/users?company=&locality=&profession=&hasLinkedin=1&sort=newest|name
router.get("/", async (req, res) => {
  const { company, locality, profession, hasLinkedin, sort } = req.query;
  const query = {};

  if (company) query.company = company;
  if (locality) query.locality = locality;
  if (profession) query.profession = profession;
  if (hasLinkedin === "1") query.linkedin = { $ne: "" };

  const sortBy = sort === "name" ? { name: 1 } : { createdAt: -1 };
  const users = await User.find(query).sort(sortBy);
  res.json({ users });
});

// GET /api/users/:id -> one member's full profile
router.get("/:id", async (req, res) => {
  if (!isId(req.params.id)) {
    return res.status(404).json({ message: "Member not found" });
  }
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "Member not found" });
  res.json({ user });
});

// PUT /api/users/me  (multipart form: fields + optional "profilePic" file)
router.put("/me", (req, res) => {
  upload.single("profilePic")(req, res, async (uploadErr) => {
    if (uploadErr) return res.status(400).json({ message: uploadErr.message });

    try {
      const { name, lastName, company, locality, mobile, linkedin } = req.body;

      if (name !== undefined && !name.trim()) {
        return res.status(400).json({ message: "Name cannot be empty" });
      }

      const update = { profession: "Chartered Accountant" }; // the site is CA-only
      if (name !== undefined) update.name = name.trim();
      if (lastName !== undefined) update.lastName = lastName.trim();
      if (company !== undefined) update.company = company.trim();
      if (locality !== undefined) update.locality = locality.trim();
      if (mobile !== undefined) update.mobile = mobile.trim();
      if (linkedin !== undefined) update.linkedin = linkedin.trim().slice(0, 200);

      if (req.file) {
        update.profilePic = await uploadBuffer(req.file.buffer);
      }

      const user = await User.findByIdAndUpdate(req.userId, update, { new: true });
      res.json({ user });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        message: "Could not update profile. Check your Cloudinary keys in backend/.env",
      });
    }
  });
});

module.exports = router;
