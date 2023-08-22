// server.js
const express = require("express");
const bcrypt = require("bcrypt");
const cors = require("cors");
const app = express();
const PORT = 5000; // You can choose any available port number
const http = require("http");
const socketIo = require("socket.io");
const mongoose = require("mongoose");
const User = require("./models/user.model");
const authenticatedUsers = {};
// const app = express();
const server = http.createServer(app);
const ioOptions = {
  cors: true,
  origins: ["http://localhost:5000"], // Replace with your frontend URL
};
const io = socketIo(server, ioOptions);
// const PORT = 5000;

// app.use(express.json());
app.use(express.json());

// Store authenticated users' sockets

// const userSchema = new mongoose.Schema({
//   username: { type: String, unique: true },
//   password: String,
//   email: String,
//   age: Number,
//   gender: String,
//   chats: [chatSchema], // Embed the chat schema
// });
//-----------------------------------------------------------------------------------------------

// const User = mongoose.model("User", userSchema);
io.on("connection", (socket) => {
  console.log("A user connected");

  // Handle user authentication
  socket.on("authenticate-user", ({ username }) => {
    authenticatedUsers[username] = socket;
    console.log(authenticatedUsers);
    console.log(`User ${username} authenticated`);
  });

  socket.on("join-room", ({ room }) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room ${room}`);
  });
  socket.on("disconnect", () => {
    const username = Object.keys(authenticatedUsers).find(
      (key) => authenticatedUsers[key] === socket
    );
    if (username) {
      delete authenticatedUsers[username];
      console.log(`User ${username} disconnected`);
    }
  });
  socket.on("send-message", async (messageData) => {
    const { sender, receiver, text, time, room } = messageData;
    console.log(messageData);
    console.log(`Message from ${sender} to ${receiver}: ${text} at ${time}`);
    try {
      // ... Your message handling logic ...
      const senderUser = await User.findOne({ username: sender });
      const receiverUser = await User.findOne({ username: receiver }); // Find the receiver user

      if (senderUser && receiverUser) {
        senderUser.chats.push({ sender, receiver, text, time }); // Save to sender's chat
        receiverUser.chats.push({ sender, receiver, text, time }); // Save to receiver's chat

        await senderUser.save();
        await receiverUser.save();

        // Emit the message to the receiver's socket
        io.to(room).emit("receive-message", {
          room,
          message: {
            sender: sender,
            receiver: receiver,
            text,
            time,
            room: room,
          },
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  });

  // ... (Other event handlers)
});

// Modify the existing '/api/messages/:username' endpoint to fetch messages between the sender and receiver
// ... (Previous code)

// Modify the existing '/api/messages/:sender/:receiver' endpoint to fetch messages between the sender and receiver

app.get("/api", async (req, res) => {
  res.status(200).json({ message: "This is a new message" });
});

app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find({}, "username"); // Fetch usernames only
    res.status(200).json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});
app.get("/api/messages/:sender/:receiver", async (req, res) => {
  try {
    const { sender, receiver } = req.params;

    const senderUser = await User.findOne({ username: sender });
    const receiverUser = await User.findOne({ username: receiver });

    if (!senderUser || !receiverUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const senderMessages = senderUser.chats.filter(
      (chat) => chat.sender === sender || chat.sender === receiverUser.username
    );
    const receiverMessages = receiverUser.chats.filter(
      (chat) => chat.sender === senderUser.username || chat.sender === receiver
    );

    const allMessages = [...senderMessages, ...receiverMessages].sort(
      (a, b) => new Date(a.time) - new Date(b.time)
    );

    res.status(200).json({ messages: allMessages });
  } catch (error) {
    console.error("Error fetching chat history:", error);
    res.status(500).json({ error: "Failed to fetch chat history" });
  }
});

// ... (Rest of the code)

app.post("/api/register", async (req, res) => {
  try {
    const { username, password, email, age, gender } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const newUser = new User({
      username,
      password,
      email,
      age,
      gender,
    });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });

    // Emit "authenticate-user" event to frontend after successful registration
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

app.get("/api/messages/:username", async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ messages: user.chats });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

app.delete("/api/chats", async (req, res) => {
  try {
    await User.updateMany({}, { $set: { chats: [] } });
    res.status(200).json({ message: "All chats have been cleared" });
  } catch (error) {
    console.error("Error clearing chats:", error);
    res.status(500).json({ error: "Failed to clear chats" });
  }
});

app.post("/api/messages/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const { sender, text, time } = req.body;

    // Find the user
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Add the new message to the user's chats
    user.chats.push({ sender, text, time });
    await user.save();

    const newMessage = user.chats[user.chats.length - 1]; // Get the last added message

    res.status(201).json({ message: newMessage });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

//-----------------------------------------------------------------------------------------
// Middleware
app.use(cors());

// server.js

// Connect to MongoDB
mongoose
  .connect(
    "mongodb+srv://nisargkamin:nisargkamin@cluster0.sa9rtap.mongodb.net/?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

const usersRouter = require("./routes/user");
app.use("/user", usersRouter);

const moodRouter = require("./routes/mood");
app.use("/mood", moodRouter);

const journalRouter = require("./routes/journal");
app.use("/journalentry", journalRouter);

// Start the server
// app.listen(PORT, () => {
//   console.log(`Server started on port ${PORT}`);
// });
