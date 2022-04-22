import React, { useState, useEffect } from "react";
import Canvas from "./Canvas";
import "./canvas.css";
import { useLocation, useNavigate } from "react-router-dom";
import socket from "../../utilities/socket";

export default function Drawing() {
  const location = useLocation();
  const navigate = useNavigate();
  const { chosenWord, currentRoom, nickname, myId } = location.state;
  const [paintSent, setPaintSent] = useState(false);
  const [score, setScore] = useState(0);
  const [rightGuess, setRightGuess] = useState(false);

  function clearCanvas() {
    let canvas = document.getElementById("canvas-board");
    let context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
  }

  function sendCanvas() {
    let canvas = document.getElementById("canvas-board");
    let dataURL = canvas.toDataURL();
    socket.emit("paint", { dataURL, chosenWord, currentRoom, myId });
    setPaintSent(true);
  }

  socket.on("correct", ({ newScore }) => {
    setRightGuess(true);
    setScore(newScore);
    setTimeout(function () {
      socket.emit("get_words", { currentRoom, nickname, myId });
      navigate("/guess", { state: { currentRoom, nickname, myId } });
    }, 3000);
  });

  return (
    <>
      {rightGuess ? (
        <h1 id="right-guess-title">Good job !</h1>
      ) : (
        <div id="canvas-div">
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
        </div>
      )}
    </>
  );
}
