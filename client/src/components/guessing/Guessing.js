import React from "react";
import "./guess.css";

export default function Guessing() {
  return (
    <div id="guess-div">
      <h1 id="guess-title">Guess: </h1>
      <div>PICTURE</div>
      <input className="big-input" placeholder="Enter your guess here"></input>
      <button className="small-buttons">Check</button>
    </div>
  );
}
