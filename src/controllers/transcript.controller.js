const createHttpError = require("http-errors");
const Transcript = require("../models/transcript.model.js");
const User = require("../models/user.model.js");

const getPaginatedTranscripts = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 10);
    const isSortedTranscripts = req.query.isSortedTranscripts || "false";
    const skip = (page - 1) * limit;

    // Get total count of transcripts
    const totalTranscripts = await Transcript.countDocuments();
    const totalPages = Math.ceil(totalTranscripts / limit);

    let transcripts;
    if (isSortedTranscripts == "true") {
      transcripts = await Transcript.find()
        .sort({
          hasSummary: -1,
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit)
        .exec();
    } else {
      transcripts = await Transcript.find()
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit)
        .exec();
    }

    const prevPage = page > 1 ? page - 1 : null;
    const nextPage = page < totalPages ? page + 1 : null;

    // Generate array of page numbers for pagination buttons
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }

    res.status(200).json({
      success: true,
      currentPage: page,
      totalPages,
      totalTranscripts,
      transcripts,
      pagination: {
        prevPage,
        nextPage,
        pageNumbers,
        hasPrev: prevPage !== null,
        hasNext: nextPage != null,
      },
    });
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    error.success = false;
    next(error);
  }
};

const addTranscript = async (req, res, next) => {
  try {
    const { videoId, transcript, url, title, newsChannel } = req.body;
    const { userId } = req.user;

    if (!userId) {
      throw createHttpError.BadRequest("User id not provided.");
    }

    const user = await User.findById(userId);
    if (!user) {
      throw createHttpError.NotFound("User not found.");
    }

    if (!videoId || !transcript || !url || !title || !newsChannel) {
      throw createHttpError.BadRequest("Fill all fields.");
    }

    const createdTranscript = new Transcript({
      videoId,
      transcript,
      url,
      title,
      newsChannel,
      userId,
    });

    await createdTranscript.save();
    res.status(201).json({ success: true, transcript: createdTranscript });
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    error.success = false;
    next(error);
  }
};

const addSummary = async (req, res, next) => {
  try {
    const { summary } = req.body;
    const { transcriptId } = req.params;
    const userId = req.user.userId;

    const user = await User.findById(userId);

    if (!user) {
      throw createHttpError.NotFound("User not found.");
    }

    if (!summary) {
      throw createHttpError.BadRequest("Summary field missing.");
    }

    const transcript = await Transcript.findById(transcriptId);

    if (!transcript) {
      throw createHttpError.NotFound("Transcript not found.");
    }

    if (user._id.toString() !== transcript.userId.toString()) {
      throw createHttpError.Forbidden("Transcript do not belong to user.");
    }
    transcript.summary = summary;
    transcript.hasSummary = true;
    await transcript.save();

    res.status(200).json({ success: true, summary: transcript.summary });
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    error.success = false;
    next(error);
  }
};

const editSummary = async (req, res, next) => {
  try {
    const { summary } = req.body;
    const { transcriptId } = req.params;
    const userId = req.user.userId;

    const user = await User.findById(userId);

    if (!user) {
      throw createHttpError.NotFound("User not found.");
    }

    if (!summary) {
      throw createHttpError.BadRequest("Summary field missing.");
    }

    const transcript = await Transcript.findById(transcriptId);

    if (!transcript) {
      throw createHttpError.NotFound("Transcript not found.");
    }

    if (user._id.toString() !== transcript.userId.toString()) {
      throw createHttpError.Forbidden("Transcript do not belong to user.");
    }
    transcript.summary = summary;
    await transcript.save();

    res.status(200).json({ success: true, summary: transcript.summary });
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
};

module.exports = {
  getPaginatedTranscripts,
  addTranscript,
  addSummary,
  editSummary,
};
