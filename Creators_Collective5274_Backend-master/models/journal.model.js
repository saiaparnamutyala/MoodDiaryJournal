const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// Define MongoDB schema and models for journal entries
const journalEntrySchema = new Schema({
  moodEmoji:String,
    mood: String,
    date: Date,
    text: String,
  });
  
  const JournalEntry = mongoose.model('JournalEntry', journalEntrySchema);
  module.exports = JournalEntry;