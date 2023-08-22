const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const chatSchema = new mongoose.Schema({
  sender: String,
  receiver: String,
  text: String,
  time: String,
});
// Define MongoDB schema and models
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
  email: String,
  age: Number,
  gender: String,
  chats: [chatSchema], // Embed the chat schema
});

const User = mongoose.model("User", userSchema);
module.exports = User;
