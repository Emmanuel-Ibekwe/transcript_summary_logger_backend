const express = require('express');
const {signup, login, logout, refreshToken,
    sendResetPasswordEmail, validateResetCode,resetPassword} = require("../controllers/auth.controller.js");

const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", logout);

router.post("/refresh-token", refreshToken);

router.post("/send-reset-password-email", sendResetPasswordEmail);

router.post("/validate-reset-code", validateResetCode);

router.post("/reset-password", resetPassword)

module.exports = router;