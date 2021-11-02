const express = require("express");
const app = express();
app.use(express.json());
const jwt = require("jsonwebtoken");

const users = [
  {
    id: "1",
    username: "sam",
    password: "sam2002",
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
    const accessToken = jwt.sign(
      { id: user.id, isAdmin: user.isAdmin },
      "mysecretkey"
    );
    res.json({
      username: user.username,
      isAdmin: user.isAdmin,
      accessToken,
    });
  } else {
    res.status(400).json("Username or password incorrect");
  }
});

const verify = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];

    jwt.verify(token, "mysecretkey", (err, user) => {
      if (err) {
        return res.status(403).json("Token is not valid");
      }

      req.user = user;
      next();
    });
  } else {
    res.status(401).json("you are not authenticated");
  }
};

app.delete("/server/users/:userId", verify, (req, res) => {
  if (req.user.id === req.params.userId || req.user.isAdmin) {
    res.status(200).json("User has been deleted");
  } else {
    res.status(403).json("you are not allowed to delete this user");
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
