import React, { useState } from "react";
import "./guess.css";
import socket from "../../utilities/socket";

export default function Guessing() {
  const [paint, setPaint] = useState("");
  const [received, setReceived] = useState(false); // received paint from opponent

  socket.on("received-paint", ({ dataURL }) => {
    setPaint(dataURL);
    setReceived(true);
  });

  return (
    <div id="guess-div">
      <h1 id="guess-title">Guess: </h1>
      {received ? (
        <div id="img-div">
          <img id="guess-img" src={paint} alt="guess" />
        </div>
      ) : (
        <>
          <div class="lds-ring">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
          <p>Waiting for second player to draw ...</p>
        </>
      )}

      <input className="big-input" placeholder="Enter your guess here"></input>
      <button disabled={!received} className="small-buttons">
        Check
      </button>
    </div>
  );
}
