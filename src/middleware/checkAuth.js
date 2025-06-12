const dotenv = require("dotenv");
const createHttpError = require('http-errors');
const jwt = require("jsonwebtoken");

const checkAuth = async(req, res, next) => {
    try {
        const authHeader = req.get("Authorization");
        if(!authHeader) {
            return next(createHttpError.Unauthorized("Not authorized."))
        }

        const splitArray = authHeader.split(" ");
        const lastIndex = splitArray.length - 1;
        const token = authHeader.split(" ")[lastIndex];

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
            if(err) {
                return next(createHttpError.Unauthorized("Not authorized."));
            }

            req.user = payload;
        });
        next();
    } catch(error) {
        if(!error.status) {
            error.status = 500;
        }
        next(error);
    }
}

module.exports = checkAuth;