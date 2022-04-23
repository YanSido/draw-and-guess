const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
  roomid: {
    type: Number,
    required: true,
  },
  playerone: {
    type: String,
    required: true,
  },
  playertwo: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  minutes: {
    type: Number,
    required: true,
  },
  seconds: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("Session", sessionSchema);
