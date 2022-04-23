import React, { useState, useEffect } from "react";
import Canvas from "./Canvas";
import "./canvas.css";
import { useLocation, useNavigate } from "react-router-dom";
import socket from "../../utilities/socket";

export default function Drawing() {
  const location = useLocation();
  const navigate = useNavigate();
  const { chosenWord, currentRoom, nickname, myId } = location.state;
  const [paintSent, setPaintSent] = useState(false); // indicates whether the player has sent the paint
  const [score, setScore] = useState(0);
  const [rightGuess, setRightGuess] = useState(false);
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

  socket.on("score", ({ newScore }) => {
    // updates score
    setScore(newScore);
  });

  const endGame = () => {
    // ends game
    socket.emit("end_game", { currentRoom, nickname, myId });
  };

  const clearCanvas = () => {
    // clears canvas
    let canvas = document.getElementById("canvas-board");
    let context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
  };

  const sendCanvas = () => {
    // sends canvas to opponent
    let canvas = document.getElementById("canvas-board");
    let dataURL = canvas.toDataURL();
    socket.emit("paint", { dataURL, chosenWord, currentRoom, myId });
    setPaintSent(true);
  };

  socket.on("correct", ({ newScore }) => {
    // opponent guessed right, updates score and navigates to guess view
    setRightGuess(true);
    setScore(newScore);
    setTimeout(function () {
      socket.emit("get_words", { currentRoom, nickname, myId });
      navigate("/guess", { state: { currentRoom, nickname, myId } });
    }, 3000);
  });

  socket.on("opponent_disconnected", ({ score, opponentNickname }) => {
    // opponent disconnected, navigates to summary
    navigate("/summary", {
      state: { score, opponentNickname, nickname, currentRoom, minutes, seconds },
    });
  });

  return (
    <>
      {rightGuess ? (
        <h1 id="right-guess-title">Good job !</h1>
      ) : (
        <div id="canvas-div">
          <p>
            {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
          </p>
          <h1 id="score">Score: {score}</h1>
          <h1 id="canvas-title">Draw: "{chosenWord}"</h1>
          {paintSent ? (
            <>
              <div class="lds-ring">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
              </div>
              <p>Waiting for second player to guess ...</p>
            </>
          ) : (
            <>
              <Canvas width={400} height={300} />
              <div id="canvas-buttons-div">
                <button className="small-buttons" onClick={() => sendCanvas()}>
                  Send
                </button>
                <button className="small-buttons" onClick={() => clearCanvas()}>
                  Clear
                </button>
              </div>
            </>
          )}
          <button
            onClick={() => {
              endGame();
            }}
            id="end-button"
          >
            End Game
          </button>
        </div>
      )}
    </>
  );
}
