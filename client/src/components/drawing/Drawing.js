import React from "react";
import Canvas from "./Canvas";
import "./canvas.css";

export default function Drawing() {
  return (
    <div id="canvas-div">
      <h1 id="canvas-title">Draw: </h1>
      <Canvas width={400} height={300} />
    </div>
  );
}
