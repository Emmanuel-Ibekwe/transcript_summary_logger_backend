const express = require("express");
const router = express.Router();
const {
  getPaginatedTranscripts,
  addTranscript,
  addSummary,
  editSummary,
} = require("../controllers/transcript.controller.js");

const checkAuth = require("../middleware/checkAuth.js");

router.get("/transcripts", checkAuth, getPaginatedTranscripts);

router.post("/add-transcript", checkAuth, addTranscript);

router.post("/:transcriptId/add-summary", checkAuth, addSummary);

router.patch("/:transcriptId/edit-summary", checkAuth, editSummary);

module.exports = router;
