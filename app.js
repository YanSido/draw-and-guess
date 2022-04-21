require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const PORT = process.env.PORT || 8080;
const { words } = require("./data/words.js");

let rooms = {};

const createUser = (id, username, roomId) => {
  const user = { username: username, id };
  rooms[roomId]["users"].push(user);
};

const createRoom = (roomId, socketId) => {
  rooms[roomId] = {
    users: [],
    word: null,
    score: 0,
    firstDrawer: socketId,
  };
};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

io.on("connection", (socket) => {
  console.log(socket.id, "connected");
});

app.use("/", express.static(`./client/build`));

if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
}

http.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
