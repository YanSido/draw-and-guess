import React, { useState } from "react";
import "./guess.css";
import socket from "../../utilities/socket";
import { useLocation, useNavigate } from "react-router-dom";

export default function Guessing() {
  const location = useLocation();
  const navigate = useNavigate();
  const [paint, setPaint] = useState("");
  const [answer, setAnswer] = useState("");
  const [received, setReceived] = useState(false); // received paint from opponent
  const { chosenWord, currentRoom, nickname, myId } = location.state;
  const [wrongGuess, setWrongGuess] = useState(false);
  const [rightGuess, setRightGuess] = useState(false);

  const handleCheckAnswer = () => {
    console.log("SENT 1");
    if (answer !== "") {
      console.log("SENT 2");
      socket.emit("check-answer", { answer, currentRoom, myId });
    }
  };

  socket.on("received-paint", ({ dataURL }) => {
    setPaint(dataURL);
    setReceived(true);
  });

  socket.on("incorrect", () => {
    setWrongGuess(true);
  });

  socket.on("correct", ({ newScore }) => {
    setWrongGuess(false);
    setRightGuess(true);
    console.log(newScore);
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
      {wrongGuess ? <p id="wrong-guess">Wrong guess, try again ...</p> : ""}
      {rightGuess ? <p id="right-guess">Good job !</p> : ""}
      <input
        className="big-input"
        onChange={(e) => {
          setAnswer(e.target.value);
        }}
        placeholder="Enter your guess here"
      ></input>
      <button
        disabled={!received}
        onClick={() => {
          handleCheckAnswer();
        }}
        className="small-buttons"
      >
        Check
      </button>
    </div>
  );
}
