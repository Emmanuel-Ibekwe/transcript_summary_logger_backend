const mongoose = require("mongoose");
const {Schema} = mongoose;
const { ObjectId} = Schema.Types;

const passwordResetCodeSchema = new Schema({
    userId: {
        type: ObjectId,
        ref: "User",
        required: true
    },
    code: {
        type: Number,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true
    }
},
{
    collection: "passwordResetCodes",
    timestamps: true
}
);

passwordResetCodeSchema.index({expiresAt: 1}, {expiresAfterSeconds: 0});

const PasswordResetCode = mongoose.model("PasswordResetCode", passwordResetCodeSchema);

module.exports = PasswordResetCode;
