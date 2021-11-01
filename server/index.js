const express = require("express");
const app = express();
app.use(express.json());

const users = [
  {
    id: "1",
    username: "sam",
    password: "Sam2002",
    isAdmin: true,
  },
  {
    id: "2",
    username: "john",
    password: "john2021",
    isAdmin: false,
  },
];

app.post("/server/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u) => {
    return u.username === username && u.password === password;
  });
  if (user) {
    res.json(user);
  } else {
    res.status(400).json("Username or password incorrect");
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
