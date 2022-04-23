import React, { useState, useEffect } from "react";
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
  const [score, setScore] = useState(0);

  useEffect(() => {
    socket.emit("get_score", { currentRoom, myId });
  }, []);

  socket.on("score", ({ newScore }) => {
    setScore(newScore);
  });

  const handleCheckAnswer = () => {
    if (answer !== "") {
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
    setScore(newScore);
    setTimeout(function () {
      navigate("/wordchoosing", { state: { currentRoom, nickname, myId, score } });
    }, 3000);
  });

  socket.on("opponent_disconnected", ({ score, opponentNickname }) => {
    navigate("/summary", { state: { score, opponentNickname, nickname, currentRoom } });
  });

  return (
    <div id="guess-div">
      <h1 id="score">Score: {score}</h1>
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
      {rightGuess ? <p className="right-guess">Good job !</p> : ""}
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
