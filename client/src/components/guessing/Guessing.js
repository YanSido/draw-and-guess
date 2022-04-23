import React, { useState, useEffect } from "react";
import "./guess.css";
import socket from "../../utilities/socket";
import { useLocation, useNavigate } from "react-router-dom";

export default function Guessing() {
  const location = useLocation();
  const navigate = useNavigate();
  const [paint, setPaint] = useState(""); // opponent's paint
  const [answer, setAnswer] = useState(""); // player's answer
  const [received, setReceived] = useState(false); // received paint from opponent
  const { chosenWord, currentRoom, nickname, myId } = location.state;
  const [wrongGuess, setWrongGuess] = useState(false); // player guessed wrong
  const [rightGuess, setRightGuess] = useState(false); // player guessed right
  const [score, setScore] = useState(0); // current score
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

  const handleCheckAnswer = () => {
    // checks if guessed right
    if (answer !== "") {
      socket.emit("check-answer", { answer, currentRoom, myId });
    }
  };

  const endGame = () => {
    // ends game
    socket.emit("end_game", { currentRoom, nickname, myId });
  };

  socket.on("received-paint", ({ dataURL }) => {
    // receives paint from opponent
    setPaint(dataURL);
    setReceived(true);
  });

  socket.on("incorrect", () => {
    // guessed wrong
    setWrongGuess(true);
  });

  socket.on("correct", ({ newScore }) => {
    // guessed right, updates score and navigates to word choosing view
    setWrongGuess(false);
    setRightGuess(true);
    setScore(newScore);
    setTimeout(function () {
      navigate("/wordchoosing", { state: { currentRoom, nickname, myId, score } });
    }, 3000);
  });

  socket.on("opponent_disconnected", ({ score, opponentNickname }) => {
    // opponent disconnected, navigates to summary
    navigate("/summary", {
      state: { score, opponentNickname, nickname, currentRoom, minutes, seconds },
    });
  });

  return (
    <div id="guess-div">
      <p>
        {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
      </p>
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
      <button
        onClick={() => {
          endGame();
        }}
        id="end-button"
      >
        End Game
      </button>
    </div>
  );
}
