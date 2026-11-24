// "Interested" API: members show interest in a job post, and the poster
// sees who is interested so they can manage their post.
const express = require("express");
const User = require("../models/User");
const auth = require("../middleware/auth");
const { isId, toId, jobRowProjection } = require("../utils/jobHelpers");

const router = express.Router();
router.use(auth);

// GET /api/interested/mine
// The logged-in poster's own jobs, each with the list of interested members
router.get("/mine", async (req, res) => {
  const me = await User.findById(req.userId)
    .select("+jobs")
    .populate({
      path: "jobs.interested.user",
      select: "name lastName email mobile linkedin profilePic profession company locality",
    })
    .lean();

  const jobs = (me?.jobs || []).map((j) => {
    const interested = (j.interested || [])
      .filter((i) => i.user) // skip accounts that no longer exist
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map((i) => ({ _id: i._id, at: i.createdAt, user: i.user }));

    return {
      _id: j._id,
      title: j.title,
      description: j.description,
      jobType: j.jobType,
      workMode: j.workMode,
      company: j.company,
      location: j.location,
      experience: j.experience,
      salary: j.salary,
      status: j.status,
      createdAt: j.createdAt,
      commentCount: (j.comments || []).length,
      interestedCount: interested.length,
      interested,
    };
  });

  res.json({ jobs });
});

// GET /api/interested/sent
// Jobs (from other members) that the logged-in member is interested in
router.get("/sent", async (req, res) => {
  const me = toId(req.userId);
  const rows = await User.aggregate([
    { $match: { "jobs.interested.user": me } },
    { $unwind: "$jobs" },
    { $match: { "jobs.interested.user": me } },
    { $sort: { "jobs.createdAt": -1 } },
    { $limit: 100 },
    jobRowProjection(me),
  ]);
  res.json({ jobs: rows });
});

// POST /api/interested/:ownerId/:jobId  -> "I'm interested"
router.post("/:ownerId/:jobId", async (req, res) => {
  try {
    const { ownerId, jobId } = req.params;
    if (!isId(ownerId, jobId)) return res.status(404).json({ message: "Job not found" });
    if (String(ownerId) === String(req.userId)) {
      return res.status(400).json({ message: "You can't show interest in your own post" });
    }

    const me = toId(req.userId);
    const r = await User.updateOne(
      {
        _id: ownerId,
        jobs: { $elemMatch: { _id: jobId, status: "open", "interested.user": { $ne: me } } },
      },
      { $push: { "jobs.$.interested": { user: me, createdAt: new Date() } } }
    );

    if (r.matchedCount) return res.status(201).json({ interested: true });

    // Nothing changed: find out why (missing job, already interested or closed)
    const owner = await User.findById(ownerId).select("+jobs").lean();
    const job = owner?.jobs?.find((j) => String(j._id) === String(jobId));
    if (!job) return res.status(404).json({ message: "Job not found" });
    if ((job.interested || []).some((i) => String(i.user) === String(req.userId))) {
      return res.json({ interested: true }); // already interested, nothing to do
    }
    return res.status(400).json({ message: "This job is closed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not save your interest" });
  }
});

// DELETE /api/interested/:ownerId/:jobId  -> withdraw interest
router.delete("/:ownerId/:jobId", async (req, res) => {
  try {
    const { ownerId, jobId } = req.params;
    if (!isId(ownerId, jobId)) return res.status(404).json({ message: "Job not found" });

    const r = await User.updateOne(
      { _id: ownerId, "jobs._id": jobId },
      { $pull: { "jobs.$.interested": { user: toId(req.userId) } } }
    );
    if (!r.matchedCount) return res.status(404).json({ message: "Job not found" });

    res.json({ interested: false });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not remove your interest" });
  }
});

module.exports = router;
