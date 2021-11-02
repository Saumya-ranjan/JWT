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
let refreshTokens = [];
app.post("/server/refresh", (req, res) => {
  //take refresh token from user
  const refreshToken = req.body.token;
  //send error if there is no token or it's invalid
  if (!refreshToken) {
    return res.status(401).json("you are not authenticated");
  }
  if (!refreshTokens.includes(refreshToken)) {
    return res.status(403).json("refresh token is not valid");
  }

  //if everything is ok , create new access token, refresh token and send to user
  jwt.verify(refreshToken, "myrefreshsecretkey", (err, user) => {
    err && console.log(err);
    refreshTokens = refreshTokens.filter((token) => token !== refreshToken);

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    refreshTokens.push(newRefreshToken);
    res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  });
});

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, isAdmin: user.isAdmin },
    "mysecretkey",
    { expiresIn: "20s" }
    //Token expires in 20s so no-one else can delete account rather than the user itselfb but user also have to login after 20 second so we use refresh token
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id, isAdmin: user.isAdmin },
    "myrefreshsecretkey",
    { expiresIn: "20s" }
    //Refresh token generated so after 20 s only access token change but user wouldnt be logout
  );
};

//login from jwt
app.post("/server/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u) => {
    return u.username === username && u.password === password;
  });
  if (user) {
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    refreshTokens.push(refreshToken);

    res.json({
      username: user.username,
      isAdmin: user.isAdmin,
      accessToken,
      refreshToken,
    });
  } else {
    res.status(400).json("Username or password incorrect");
  }
});

//verify if admin or not so it can delete accounts or not

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

//if admin then only can delete the accounts

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
