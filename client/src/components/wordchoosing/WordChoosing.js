import React, { useState, useEffect } from "react";
import "./wordchoosing.css";
import { useLocation, useNavigate } from "react-router-dom";
import socket from "../../utilities/socket";

export default function WordChoosing() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentRoom, nickname, myId } = location.state;
  const [words, setWords] = useState([]);
  const [score, setScore] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [minutes, setMinutes] = useState(0);

  socket.on("stopWatch", ({ seconds, minutes }) => {
    // updates stopWatch
    setSeconds(seconds);
    setMinutes(minutes);
  });

  useEffect(() => {
    // gets score from server
    socket.emit("get_score", { currentRoom, myId });
  }, []);

  socket.on("opponent_disconnected", ({ score, opponentNickname }) => {
    // opponent disconnected, navigates to summary
    navigate("/summary", {
      state: { score, opponentNickname, nickname, currentRoom, minutes, seconds },
    });
  });

  socket.on("words", ({ randomWords }) => {
    // gets 6 words from server
    setWords(randomWords);
  });

  socket.on("score", ({ newScore }) => {
    // updates score
    setScore(newScore);
  });

  const refreshWords = () => {
    // gets 6 new words from server
    socket.emit("get_words", { currentRoom, nickname, myId });
  };

  const endGame = () => {
    // ends game
    socket.emit("end_game", { currentRoom, nickname, myId });
  };

  const chooseWordHandle = (chosenWord) => {
    // chooses word, navigates to drawing view
    socket.emit("set_word", { chosenWord, currentRoom, nickname, myId });
    navigate("/drawing", { state: { chosenWord, currentRoom, nickname, myId, score } });
  };

  return (
    <div id="wordchoosing">
      <p>
        {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
      </p>
      <h1 id="score">Score: {score}</h1>
      <h1 id="choose-title">Choose word to draw</h1>
      <p id="rules">
        Remember:<br></br>3-4 letters = 1 point<br></br>5 letters = 3 points<br></br>6 or more
        letters = 6 points
      </p>
      <div class="grid-container">
        {words.map((word, index) => {
          return (
            <button
              onClick={() => {
                chooseWordHandle(word);
              }}
              class="grid-item"
              id={index}
            >
              {word}
            </button>
          );
        })}
      </div>
      <div id="action-buttons">
        <button
          onClick={() => {
            refreshWords();
          }}
          id="refresh-button"
        >
          ↻
        </button>
        <button
          onClick={() => {
            endGame();
          }}
          id="end-button"
        >
          End Game
        </button>
      </div>
    </div>
  );
}
