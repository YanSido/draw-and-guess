import React from "react";
import { useState } from "react";
import "./wordchoosing.css";

export default function WordChoosing() {
  const [words, setWords] = useState(["hello", "world", "hell", "wall", "apple", "shaul"]);

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
      <button id="refresh-button">↻</button>
    </div>
  );
}
