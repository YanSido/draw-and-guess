import React from "react";
import Canvas from "./Canvas";
import "./canvas.css";
import { useLocation, useNavigate } from "react-router-dom";
import socket from "../../utilities/socket";

export default function Drawing() {
  const location = useLocation();
  const navigate = useNavigate();
  const { chosenWord, currentRoom, nickname, myId } = location.state;

  function clearCanvas() {
    let canvas = document.getElementById("canvas-board");
    let context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
  }

  function sendCanvas() {
    let canvas = document.getElementById("canvas-board");
    let dataURL = canvas.toDataURL();
    socket.emit("paint", { dataURL, chosenWord, currentRoom, myId });
  }

  return (
    <div id="canvas-div">
      <h1 id="canvas-title">Draw: "{chosenWord}"</h1>
      <Canvas width={400} height={300} />
      <div id="canvas-buttons-div">
        <button className="small-buttons" onClick={() => sendCanvas()}>
          Send
        </button>
        <button className="small-buttons" onClick={() => clearCanvas()}>
          Clear
        </button>
      </div>
    </div>
  );
}
