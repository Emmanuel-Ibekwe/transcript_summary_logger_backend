const mongoose = require("mongoose");
const {Schema} = mongoose;
const {ObjectId} = Schema.Types;


const transcriptSchema = new Schema(
    {
        videoId: {
            type: String,
            required: true
        },
       transcript: {
        type: String,
        required: true
       },
       url: {
        type: String,
        required: true 
       },
       title: {
        type: String,
        required: true
       },
       newsChannel: {
        type: String,
        required: true
       },
       summary: {
        type: String,
        default: ""
       },
       hasSummary: {
        type: Boolean,
        default: false
       },
       userId: {
        type: ObjectId,
        ref: "User",
        required: true
       }
    },
    {
        collection: "transcripts",
        timestamps: true
       }
)

const Transcript = mongoose.models.Transcript || mongoose.model("Transcript", transcriptSchema)

module.exports = Transcript