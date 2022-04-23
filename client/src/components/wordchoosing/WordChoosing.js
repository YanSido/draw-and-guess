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

  useEffect(() => {
    socket.emit("get_score", { currentRoom, myId });
  }, []);

  socket.on("opponent_disconnected", ({ score, opponentNickname }) => {
    navigate("/summary", { state: { score, opponentNickname, nickname, currentRoom } });
  });

  socket.on("words", ({ randomWords }) => {
    setWords(randomWords);
  });

  socket.on("score", ({ newScore }) => {
    setScore(newScore);
  });

  const refreshWords = () => {
    socket.emit("get_words", { currentRoom, nickname, myId });
  };

  const chooseWordHandle = (chosenWord) => {
    socket.emit("set_word", { chosenWord, currentRoom, nickname, myId });
    navigate("/drawing", { state: { chosenWord, currentRoom, nickname, myId, score } });
  };

  return (
    <div id="wordchoosing">
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
      <button
        onClick={() => {
          refreshWords();
        }}
        id="refresh-button"
      >
        ↻
      </button>
    </div>
  );
}
