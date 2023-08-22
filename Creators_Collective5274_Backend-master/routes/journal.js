const router = require("express").Router();
const JournalEntry = require("../models/journal.model");
// New API endpoint for saving journal entries
router.post("/saveJournalEntry", async (req, res) => {
  try {
    const { moodEmoji, mood, selectedDate, journalText } = req.body;
    console.log("Received mood:", moodEmoji);
    console.log("Received mood:", mood);
    console.log("Received selectedDate:", selectedDate);
    console.log("Received journalText:", journalText);

    // Convert the date string back to a Date object
    const dateObject = new Date(selectedDate);
    // const selectedEmoji = '😀';
    // Create a new JournalEntry document and save it to MongoDB
    const newEntry = new JournalEntry({
      moodEmoji: moodEmoji,
      mood,
      date: dateObject,
      text: journalText,
    });

    await newEntry.save();

    res.status(201).json({ message: "Journal entry saved successfully" });
  } catch (error) {
    console.error("Error during journal entry save:", error);
    res.status(500).json({ error: "Journal entry save failed" });
  }
});

// New API endpoint for fetching journal entries
router.get("/fetchJournalEntries", async (req, res) => {
  try {
    // Fetch all journal entries from MongoDB
    const journalEntries = await JournalEntry.find();

    res.status(200).json(journalEntries);
  } catch (error) {
    console.error("Error fetching journal entries:", error);
    res.status(500).json({ error: "Failed to fetch journal entries" });
  }
});

router.get("/fetchdateJournalEntries", async (req, res) => {
  try {
    const selectedDate = req.query.selectedDate; // Get the selected date from query parameters

    let journalEntries;

    if (selectedDate) {
      const dateObject = new Date(selectedDate);

      // Fetch journal entries from MongoDB for the selected date
      journalEntries = await JournalEntry.find({ date: dateObject });
    } else {
      // Fetch all journal entries if no selected date is provided
      journalEntries = await JournalEntry.find();
    }

    res.status(200).json(journalEntries);
  } catch (error) {
    console.error("Error fetching journal entries:", error);
    res.status(500).json({ error: "Failed to fetch journal entries" });
  }
});

module.exports = router;
