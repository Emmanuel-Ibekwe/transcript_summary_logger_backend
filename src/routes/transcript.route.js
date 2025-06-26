const express = require("express");
const router = express.Router();
const {
  getPaginatedTranscripts,
  addTranscript,
  addSummary,
  editSummary,
  editTranscript,
} = require("../controllers/transcript.controller.js");

const checkAuth = require("../middleware/checkAuth.js");

router.get("/transcripts", checkAuth, getPaginatedTranscripts);

router.post("/add-transcript", checkAuth, addTranscript);

router.patch("/transcripts/:videoId", checkAuth, editTranscript);

router.post("/:transcriptId/add-summary", checkAuth, addSummary);

router.patch("/:transcriptId/edit-summary", checkAuth, editSummary);

module.exports = router;
