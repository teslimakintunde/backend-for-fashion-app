const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: {
    message:
      "Too many login attempts from thisIP, please try again after a 60 second pause",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
module.exports = loginLimiter;
