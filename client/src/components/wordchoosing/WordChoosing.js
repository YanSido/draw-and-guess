import React, { useState, useEffect } from "react";
import "./wordchoosing.css";
import { useLocation, useNavigate } from "react-router-dom";
import socket from "../../utilities/socket";

export default function WordChoosing() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentRoom, nickname, myId } = location.state;
  const [words, setWords] = useState([]);

  socket.on("words", ({ randomWords }) => {
    setWords(randomWords);
  });

  const refreshWords = () => {
    socket.emit("get_words", { currentRoom, nickname, myId });
  };

  return (
    <div id="wordchoosing">
      <h1 id="choose-title">Choose word to draw</h1>
      <div class="grid-container">
        {words.map((word, index) => {
          return (
            <button class="grid-item" id={index}>
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
