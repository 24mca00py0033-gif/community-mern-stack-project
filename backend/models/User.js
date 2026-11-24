const mongoose = require("mongoose");

const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Articleship", "Internship", "Freelance"];
const WORK_MODES = ["On-site", "Remote", "Hybrid"];

// A comment on a job post
const commentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true, trim: true, maxlength: 500 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Someone who clicked "I'm interested" on a job post
const interestedSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// A job post (text only, no images). Stored inside the poster's user record.
const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, trim: true, maxlength: 3000 },
    jobType: { type: String, enum: JOB_TYPES, default: "Full-time" },
    workMode: { type: String, enum: WORK_MODES, default: "On-site" },
    company: { type: String, trim: true, maxlength: 100, default: "" },
    location: { type: String, trim: true, maxlength: 100, default: "" },
    experience: { type: String, trim: true, maxlength: 60, default: "" },
    salary: { type: String, trim: true, maxlength: 60, default: "" },
    status: { type: String, enum: ["open", "closed"], default: "open" },
    comments: { type: [commentSchema], default: [] },
    interested: { type: [interestedSchema], default: [] },
  },
  { timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    lastName: { type: String, trim: true, default: "" },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: false }, // bcrypt hash
    profession: { type: String, trim: true, default: "Chartered Accountant" }, // site is CA-only
    company: { type: String, trim: true, default: "" },
    locality: { type: String, trim: true, default: "" },
    mobile: { type: String, trim: true, default: "" },
    linkedin: { type: String, trim: true, default: "" }, // LinkedIn ID or profile link
    profilePic: { type: String, default: "" }, // Cloudinary URL

    // Job posts made by this user. Hidden from normal queries (select:false) so
    // member lists never leak comments or the interested list.
    jobs: { type: [jobSchema], default: [], select: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
module.exports.JOB_TYPES = JOB_TYPES;
module.exports.WORK_MODES = WORK_MODES;
