require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const PORT = process.env.PORT || 8080;
const { words } = require("./data/words.js");
const mongoose = require("mongoose");
const MONGO_URI = process.env.MONGO_URI;
const Session = require("./models/sessionSchema");

let rooms = {}; // rooms in game

async function getDatabase() {
  // get all sessions from database
  let sessions = await Session.find();
  return sessions;
}

async function updateDataBase(session) {
  // update database
  await Session.create({
    roomid: session.currentRoom,
    playerone: session.playerOne,
    playertwo: session.playerTwo,
    score: session.score,
    minutes: session.minutes,
    seconds: session.seconds,
  });
}

const addUser = (id, nickname, roomId) => {
  // add user to room
  const user = { nickname: nickname, id };
  rooms[roomId]["users"].push(user);
};

const createRoom = (roomId, socketId) => {
  // create room
  rooms[roomId] = {
    users: [],
    word: null,
    score: 0,
    minutes: 0,
    seconds: 0,
  };
};

const getSixDigitRandom = () => {
  // generate six digit random number
  return parseInt(Math.random().toString().substring(2, 8));
};

const getSixRandomWords = () => {
  // get six random words from "words.js" dictionary file
  let randomWords = [];
  let easyWord = "";
  let mediumWord = "";
  let hardWord = "";
  while (randomWords.length < 6) {
    easyWord = words.easy[Math.floor(Math.random() * words.easy.length)];
    mediumWord = words.medium[Math.floor(Math.random() * words.medium.length)];
    hardWord = words.hard[Math.floor(Math.random() * words.hard.length)];
    if (!randomWords.includes(easyWord) || randomWords.length < 6) randomWords.push(easyWord);
    if (!randomWords.includes(mediumWord) || randomWords.length < 6) randomWords.push(mediumWord);
    if (!randomWords.includes(hardWord) || randomWords.length < 6) randomWords.push(hardWord);
  }
  return randomWords;
};

const getOpponent = (id, roomId) => {
  // get opponent's id
  if (rooms[roomId]["users"][0].id === id) return rooms[roomId]["users"][1].id;
  if (rooms[roomId]["users"][1].id === id) return rooms[roomId]["users"][0].id;
};

const getOpponentNickname = (id, roomId) => {
  // get opponent's nickname
  if (rooms[roomId]["users"][0].id === id) return rooms[roomId]["users"][1].nickname;
  if (rooms[roomId]["users"][1].id === id) return rooms[roomId]["users"][0].nickname;
};

const bestSession = (sessions) => {
  // returns best session
  sessions.sort((a, b) => {
    if (a.minutes === b.minutes) {
      if (a.seconds === b.seconds) {
        return a.score < b.score ? -1 : a.score > b.score ? 1 : 0;
      } else {
        return a.seconds < b.seconds ? -1 : 1;
      }
    } else {
      return a.minutes < b.minutes ? -1 : 1;
    }
  });
  return sessions[0];
};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

io.on("connection", (socket) => {
  // when user connects to the server
  console.log(socket.id, "connected");

  socket.on("sessions_data", async ({}) => {
    let data = await getDatabase(); // get sessions data from db
    let best = bestSession(data); // get best session
    socket.emit("sessions_data", {
      bestPlayerOne: best.playerone,
      bestPlayerTwo: best.playertwo,
      bestScore: best.score,
      minutes: best.minutes,
      seconds: best.seconds,
    });
  });

  socket.on("create_room", ({ nickname }) => {
    // when user creates room
    let roomId = getSixDigitRandom();
    createRoom(roomId, socket.id);
    addUser(socket.id, nickname, roomId);
    console.log(nickname, "created room:", roomId);
    socket.join(roomId); // add socket to room
    socket.emit("created_successfully", { roomId });
  });

  socket.on("join_room", ({ roomId, nickname }) => {
    // when user joins room
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
    // send players initial data
    let players = [];
    if (rooms[roomId]) {
      for (user of rooms[roomId]["users"]) {
        players.push(user["id"]);
      }
      let data = { roomId, players, score: rooms[roomId]["score"] };
      io.in(roomId).emit("data", data);
    }
  });

  socket.on("start_game", ({ roomId, myId }) => {
    // tells players that the game has started
    if (rooms[roomId]) {
      io.to(rooms[roomId]["users"][0].id).emit("start_game");
      let myInterval = setInterval(() => {
        if (rooms[roomId]) {
          // start stopWatch
          if (rooms[roomId].seconds < 59) {
            rooms[roomId].seconds++;
          }
          if (rooms[roomId].seconds === 59) {
            if (rooms[roomId].minutes === 60) {
              clearInterval(myInterval);
            } else {
              io.to(myId).emit("stopWatch", {
                seconds: rooms[roomId].seconds,
                minutes: rooms[roomId].minutes,
              });
              io.to(getOpponent(myId, roomId)).emit("stopWatch", {
                seconds: rooms[roomId].seconds,
                minutes: rooms[roomId].minutes,
              });
              rooms[roomId].minutes++;
              rooms[roomId].seconds = 0;
            }
          }
          io.to(myId).emit("stopWatch", {
            seconds: rooms[roomId].seconds,
            minutes: rooms[roomId].minutes,
          });
          io.to(getOpponent(myId, roomId)).emit("stopWatch", {
            seconds: rooms[roomId].seconds,
            minutes: rooms[roomId].minutes,
          });
        }
      }, 1000);
      return () => {
        clearInterval(myInterval);
      };
    }
  });

  socket.on("get_words_start", ({ currentRoom, nickname, myId }) => {
    // sends drawing player the words at the start of the game
    if (rooms[currentRoom]) {
      const randomWords = getSixRandomWords();
      io.to(myId).emit("words", { randomWords });
    }
  });

  socket.on("get_words", ({ currentRoom, nickname, myId }) => {
    // sends drawing player the words
    if (rooms[currentRoom]) {
      const randomWords = getSixRandomWords();
      io.to(getOpponent(myId, currentRoom)).emit("words", { randomWords });
      io.to(myId).emit("words", { randomWords });
    }
  });

  socket.on("set_word", ({ chosenWord, currentRoom, nickname, myId }) => {
    // set room's word
    if (rooms[currentRoom]) {
      rooms[currentRoom]["word"] = chosenWord;
    }
  });

  socket.on("paint", ({ dataURL, chosenWord, currentRoom, myId }) => {
    // sends guessing player the paint of the drawing player
    if (rooms[currentRoom]) {
      io.to(getOpponent(myId, currentRoom)).emit("received-paint", { dataURL });
    }
  });

  socket.on("check-answer", ({ answer, currentRoom, myId }) => {
    // check player's answer
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
    // sends players their score
    if (rooms[currentRoom]) {
      io.to(getOpponent(myId, currentRoom)).emit("score", {
        newScore: rooms[currentRoom]["score"],
      });
      io.to(myId).emit("score", {
        newScore: rooms[currentRoom]["score"],
      });
    }
  });

  socket.on("end_game", ({ currentRoom, nickname, myId }) => {
    // one of the players ends the game
    if (rooms[currentRoom]) {
      console.log(nickname, "ended game from room:", currentRoom);
      io.to(getOpponent(myId, currentRoom)).emit("opponent_disconnected", {
        score: rooms[currentRoom]["score"],
        opponentNickname: nickname,
      });
      io.to(myId).emit("opponent_disconnected", {
        score: rooms[currentRoom]["score"],
        opponentNickname: getOpponentNickname(myId, currentRoom),
      });

      updateDataBase({
        currentRoom,
        playerOne: nickname,
        playerTwo: getOpponentNickname(myId, currentRoom),
        score: rooms[currentRoom]["score"],
        minutes: rooms[currentRoom]["minutes"],
        seconds: rooms[currentRoom]["seconds"],
      });
      delete rooms[currentRoom];
    }
  });

  socket.on("disconnect", () => {
    // one of the players disconnects
    if (!rooms) {
      return;
    }
    for (roomId in rooms) {
      let user = rooms[roomId]["users"].find((user) => user["id"] === socket.id);
      if (user) {
        console.log(user.nickname, "disconnected from room:", roomId);
        io.to(getOpponent(socket.id, roomId)).emit("opponent_disconnected", {
          score: rooms[roomId]["score"],
          opponentNickname: user["nickname"],
        });
        delete rooms[roomId];
      }
    }
  });
});

app.use("/", express.static(`./client/build`));

if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    http.listen(PORT, () => {
      console.log(`Listening on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.log("error connecting to MongoDB or Server:", error.message);
  });
