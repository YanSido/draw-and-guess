import React from "react";
import Canvas from "./Canvas";
import "./canvas.css";

export default function Drawing() {
  function clearCanvas() {
    let canvas = document.getElementById("canvas-board");
    let context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
  }

  function sendCanvas() {}

  return (
    <div id="canvas-div">
      <h1 id="canvas-title">Draw: </h1>
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
