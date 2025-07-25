const express = require("express");
const fs = require("fs");
const users = require("./MOCK_DATA.json");
const app = express();
const PORT = 8000;

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
  fs.appendFile(
    "log.txt",
    log,
    (err, data) => {
      next();
    }
  );
});

// Routes
app.get("/users", (req, res) => {
  const html = `
    <ul>
    ${users.map((user) => `<li>${user.first_name}</li>`).join("")}
    </ul>`;
  res.send(html);
});

// REST API
app.get("/api/users", (req, res) => {
  res.setHeader('X-MyName',"Abhishek")
  return res.json(users);
});

app
  .route("/api/users/:id")
  .get((req, res) => {
    const id = Number(req.params.id);
    const user = users.find((user) => user.id === id);
    return res.json(user);
  })
  .patch((req, res) => {
    const id = Number(req.params.id);
    const userIndex = users.findIndex((user) => user.id === id);

    if (userIndex === -1) {
      return res.status(404).json({ status: "User not found" });
    }

    // Update only the provided fields
    users[userIndex] = { ...users[userIndex], ...req.body };

    fs.writeFile("./MOCK_DATA.json", JSON.stringify(users, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ status: "failed", error: err });
      }
      return res.json({ status: "User updated", user: users[userIndex] });
    });
  })
  .delete((req, res) => {
    const id = Number(req.params.id);
    const userIndex = users.findIndex((user) => user.id === id);

    if (userIndex === -1) {
      return res.status(404).json({ status: "User not found" });
    }

    const deletedUser = users.splice(userIndex, 1); // remove user

    fs.writeFile("./MOCK_DATA.json", JSON.stringify(users, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ status: "failed", error: err });
      }
      return res.json({ status: "User deleted", user: deletedUser[0] });
    });
  });

// ✅ Corrected POST route
app.post("/api/users", (req, res) => {
  const body = req.body;
  users.push({ ...body, id: users.length + 1 });

  fs.writeFile("./MOCK_DATA.json", JSON.stringify(users, null, 2), (err) => {
    if (err) {
      return res.status(500).json({ status: "failed", error: err });
    }
    console.log("New User Added:", body);
    return res.json({ status: "success", id: users.length });
  });
});

app.listen(PORT, () => console.log(`SERVER STARTED AT PORT ${PORT}`));
