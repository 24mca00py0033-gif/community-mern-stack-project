// Small helpers shared by the users routes (job posts) and the interested routes.
const mongoose = require("mongoose");
const { JOB_TYPES, WORK_MODES } = require("../models/User");

const isId = (...ids) => ids.every((id) => mongoose.isValidObjectId(id));
const toId = (id) => new mongoose.Types.ObjectId(String(id));

// escape user text so it is safe inside a RegExp
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const like = (value) => new RegExp(escapeRegex(String(value).trim()), "i");

const clip = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : undefined);

// Reads and checks the job fields from a request body.
// partial = true for edits (only the fields that were sent are checked).
function readJob(body = {}, partial = false) {
  const data = {};
  const set = (key, max) => {
    const v = clip(body[key], max);
    if (v !== undefined) data[key] = v;
  };

  set("title", 120);
  set("description", 3000);
  set("company", 100);
  set("location", 100);
  set("experience", 60);
  set("salary", 60);

  if (body.jobType !== undefined) {
    if (!JOB_TYPES.includes(body.jobType)) return { error: "Please choose a valid job type" };
    data.jobType = body.jobType;
  }
  if (body.workMode !== undefined) {
    if (!WORK_MODES.includes(body.workMode)) return { error: "Please choose a valid work mode" };
    data.workMode = body.workMode;
  }
  if (body.status !== undefined) {
    if (!["open", "closed"].includes(body.status)) return { error: "Invalid status" };
    data.status = body.status;
  }

  if (!partial || "title" in data) {
    if (!data.title) return { error: "Job heading is required" };
  }
  if (!partial || "description" in data) {
    if (!data.description) return { error: "Job description is required" };
  }

  return { data };
}

// $project stage that turns an unwound { jobs: {...} } user row into
// { poster, job } with counts only (never the comments or the interested list).
// iAmInterested is true when the logged-in user is in the job's interested list.
function jobRowProjection(meId) {
  const interestedList = { $ifNull: ["$jobs.interested", []] };
  return {
    $project: {
      _id: 0,
      poster: {
        _id: "$_id",
        name: "$name",
        lastName: "$lastName",
        profilePic: "$profilePic",
        profession: "$profession",
        company: "$company",
      },
      job: {
        _id: "$jobs._id",
        title: "$jobs.title",
        description: "$jobs.description",
        jobType: "$jobs.jobType",
        workMode: "$jobs.workMode",
        company: "$jobs.company",
        location: "$jobs.location",
        experience: "$jobs.experience",
        salary: "$jobs.salary",
        status: "$jobs.status",
        createdAt: "$jobs.createdAt",
        commentCount: { $size: { $ifNull: ["$jobs.comments", []] } },
        interestedCount: { $size: interestedList },
        iAmInterested: {
          $in: [meId, { $map: { input: interestedList, as: "i", in: "$$i.user" } }],
        },
      },
    },
  };
}

module.exports = { isId, toId, like, readJob, jobRowProjection };
