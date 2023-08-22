const mongoose = require("mongoose");

const Schema = mongoose.Schema;
// Define MongoDB schema and models for mood
const moodSchema = new Schema({
  moodEmoji: String,
  mood: String,
  date: String,
});

const Mood = mongoose.model("Mood", moodSchema);
module.exports = Mood;
