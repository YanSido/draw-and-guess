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

const addUser = (id, nickname, roomId) => {
  const user = { nickname: nickname, id };
  rooms[roomId]["users"].push(user);
  console.log(rooms);
};

const createRoom = (roomId, socketId) => {
  rooms[roomId] = {
    users: [],
    word: null,
    score: 0,
    firstDrawer: socketId,
  };
};

function getSixDigitRandom() {
  return parseInt(Math.random().toString().substring(2, 8));
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

io.on("connection", (socket) => {
  console.log(socket.id, "connected");
  socket.on("create_room", ({ nickname }) => {
    let roomId = getSixDigitRandom();
    createRoom(roomId, socket.id);
    addUser(socket.id, nickname, roomId);
    console.log(nickname, "created room:", roomId);
    socket.join(roomId);
    socket.emit("created_success", { room: roomId });
  });

  socket.on("join_room", ({ roomId, nickname }) => {
    if (!rooms[roomId]) {
      console.log(nickname, "tried to join room", roomId, "but room doesn't exist");
      socket.emit("error", { message: "Room doesn't exist" });
    } else if (rooms[roomId]["users"].length < 2) {
      addUser(socket.id, nickname, roomId);
      console.log(nickname, "joined room", roomId);
      socket.join(roomId);
      io.in(roomId).emit("joined_successfully", { joinedId: roomId, nickname });
    } else {
      console.log(nickname, "tried to join room", roomId, "but room is full");
      socket.emit("error", {
        message: "Room is full",
      });
    }
  });
});

app.use("/", express.static(`./client/build`));

if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
}

http.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
