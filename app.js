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
};

const createRoom = (roomId, socketId) => {
  rooms[roomId] = {
    users: [],
    word: null,
    score: 0,
  };
};

const getSixDigitRandom = () => {
  return parseInt(Math.random().toString().substring(2, 8));
};

const getSixRandomWords = () => {
  let randomWords = [];
  for (let i = 0; i < 2; i++) {
    randomWords.push(words.easy[Math.floor(Math.random() * words.easy.length)]);
    randomWords.push(words.medium[Math.floor(Math.random() * words.medium.length)]);
    randomWords.push(words.hard[Math.floor(Math.random() * words.hard.length)]);
  }
  return randomWords;
};

const getOpponent = (id, roomId) => {
  if (rooms[roomId]["users"][0].id === id) return rooms[roomId]["users"][1].id;
  if (rooms[roomId]["users"][1].id === id) return rooms[roomId]["users"][0].id;
};

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
    socket.emit("created_successfully", { roomId });
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

  socket.on("setup", ({ roomId }) => {
    let players = [];
    if (rooms[roomId]) {
      for (user of rooms[roomId]["users"]) {
        players.push(user["id"]);
      }
      let data = { roomId, players, score: rooms[roomId]["score"] };
      io.in(roomId).emit("data", data);
    }
  });

  socket.on("start_game", ({ roomId }) => {
    if (rooms[roomId]) {
      io.to(rooms[roomId]["users"][0].id).emit("start_game");
    }
  });

  socket.on("get_words_start", ({ currentRoom, nickname, myId }) => {
    if (rooms[currentRoom]) {
      const randomWords = getSixRandomWords();
      io.to(myId).emit("words", { randomWords });
    }
  });

  socket.on("get_words", ({ currentRoom, nickname, myId }) => {
    if (rooms[currentRoom]) {
      const randomWords = getSixRandomWords();
      io.to(getOpponent(myId, currentRoom)).emit("words", { randomWords });
      io.to(myId).emit("words", { randomWords });
    }
  });

  socket.on("set_word", ({ chosenWord, currentRoom, nickname, myId }) => {
    if (rooms[currentRoom]) {
      rooms[currentRoom]["word"] = chosenWord;
    }
  });

  socket.on("paint", ({ dataURL, chosenWord, currentRoom, myId }) => {
    if (rooms[currentRoom]) {
      io.to(getOpponent(myId, currentRoom)).emit("received-paint", { dataURL });
    }
  });

  socket.on("check-answer", ({ answer, currentRoom, myId }) => {
    if (rooms[currentRoom]) {
      if (rooms[currentRoom]["word"].toLowerCase() === answer.toLowerCase()) {
        if (answer.length <= 4) {
          rooms[currentRoom]["score"] += 1;
        } else if (answer.length === 5) {
          rooms[currentRoom]["score"] += 3;
        } else {
          rooms[currentRoom]["score"] += 5;
        }
        console.log("Correct answer, new score:", rooms[currentRoom]["score"]);
        io.to(myId).emit("correct", { newScore: rooms[currentRoom]["score"] });
        io.to(getOpponent(myId, currentRoom)).emit("correct", {
          newScore: rooms[currentRoom]["score"],
        });
      } else {
        console.log("Incorrect answer:", answer);
        io.to(myId).emit("incorrect");
        io.to(getOpponent(myId, currentRoom)).emit("incorrect");
      }
    }
  });

  socket.on("get_score", ({ currentRoom, myId }) => {
    if (rooms[currentRoom]) {
      io.to(getOpponent(myId, currentRoom)).emit("score", {
        newScore: rooms[currentRoom]["score"],
      });
      io.to(myId).emit("score", {
        newScore: rooms[currentRoom]["score"],
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
