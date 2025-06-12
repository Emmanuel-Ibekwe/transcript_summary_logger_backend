const mongoose = require("mongoose");
const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

const refreshTokenSchema = new Schema({
    token: {
        type: String,
        required: true,
        unique: true
    },
    userId: {
        type: ObjectId,
        ref: "User",
        required: true
    },
    expiresAt: {
        type: Date,
        required: true
    }  
},
    {
    collection: "refreshtokens",
    timestamps: true
    }
    )

    refreshTokenSchema.index({expiresAt: 1}, {expireAfterSeconds: 0});

    const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema);

    module.exports = RefreshToken;