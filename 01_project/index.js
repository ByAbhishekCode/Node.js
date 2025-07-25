const express = require("express");
const fs = require("fs");
// const users = require("./MOCK_DATA.json");
const mongoose = require("mongoose");
const { error } = require("console");
const { type } = require("os");
const app = express();
const PORT = 8000;

mongoose
  .connect("mongodb://127.0.0.1:27017/youtube-app-1")
  .then(() => console.log("MongoDB Connceted"))
  .catch((err) => console.log("Mongo Error ", err));

//Schema
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    jobTitle: {
      type: String,
    },
    gender: {
      type: String,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("user", userSchema);

// middleware -- plugins
app.use(express.urlencoded({ extended: false }));
app.use(express.json()); // ✅ Added to parse JSON body

app.use((req, res, next) => {
  const now = new Date();

  const date = now.toLocaleDateString("en-IN"); // 👉 "dd/mm/yyyy"
  const time = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }); // 👉 "12:00 AM" format

  const log = `${date} ${time} - ${req.method} ${req.path}\n`;
  fs.appendFile("log.txt", log, (err, data) => {
    next();
  });
});

// Routes
app.get("/users", async (req, res) => {
  const allDbUsers = await User.find({});
  const html = `
    <ul>
    ${allDbUsers
      .map((user) => `<li>${user.firstName} - ${user.email}</li>`)
      .join("")}
    </ul>`;
  res.send(html);
});

// REST API
app.get("/api/users", async (req, res) => {
  const allDbUsers = await User.find({});
  res.setHeader("X-MyName", "Abhishek");
  return res.json(allDbUsers);
});

app
  .route("/api/users/:id")
  .get(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.json(user);
  })
  .patch(async (req, res) => {
    try {
      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true } // return updated doc
      );

      if (!updatedUser) {
        return res.status(404).json({ status: "User not found" });
      }

      return res.json({ status: "User updated", user: updatedUser });
    } catch (err) {
      return res
        .status(500)
        .json({ status: "Failed to update", error: err.message });
    }
  })

  .delete(async (req, res) => {
    try {
      const deletedUser = await User.findByIdAndDelete(req.params.id);

      if (!deletedUser) {
        return res.status(404).json({ status: "User not found" });
      }

      return res.json({ status: "User deleted", user: deletedUser });
    } catch (err) {
      return res
        .status(500)
        .json({ status: "Failed to delete", error: err.message });
    }
  });
  
// ✅ Corrected POST route
app.post("/api/users", async (req, res) => {
  const body = req.body;
  if (
    !body ||
    !body.first_name ||
    !body.email ||
    !body.gender ||
    !body.job_title
  ) {
    return res.status(400).json("All felid required");
  }
  const result = await User.create({
    firstName: body.first_name,
    lastName: body.last_name,
    email: body.email,
    gender: body.gender,
    jobTitle: body.job_title,
  });

  console.log("result", result);
  return res.status(201).json({ msg: "Success" });
});

app.listen(PORT, () => console.log(`SERVER STARTED AT PORT ${PORT}`));
