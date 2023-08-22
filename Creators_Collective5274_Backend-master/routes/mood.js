const router = require('express').Router();
const Mood = require('../models/mood.model');

// New API endpoint for saving the selected mood
router.post('/saveMoodEntry', async (req, res) => {
    console.log('Received a request to /saveMoodEntry',req.body );
    try {
      const { moodEmoji,mood, date } = req.body;
      console.log('Received mood:', moodEmoji);
      console.log('Received mood:', mood);
      console.log('Received selectedDate:', date);
  
      // Convert the date string back to a Date object
         const dateObject = new Date(date);
  
  
      // Create a new Mood document and save it to MongoDB
      const newMood = new Mood({
        moodEmoji:moodEmoji,
        mood,
     
        date: dateObject,
      });
  
      await newMood.save();
  
      res.status(201).json({ message: 'Mood saved successfully' });
    } catch (error) {
      console.error('Error during mood save:', error);
      res.status(500).json({ error: 'Mood save failed' });
    }
  });
  
module.exports = router;