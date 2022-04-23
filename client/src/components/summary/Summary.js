import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./summary.css";

export default function Summary() {
  const location = useLocation();
  const navigate = useNavigate();
  const { score, opponentNickname, nickname, currentRoom } = location.state;

  const handleStart = () => {
    navigate("/");
  };

  return (
    <div id="summary-div">
      <h1 id="choose-title">Game Summary:</h1>
      <p className="summary-details">Room ID: {currentRoom}</p>
      <p className="summary-details">Player 1: {nickname}</p>
      <p className="summary-details">Player 2: {opponentNickname}</p>
      <p id="summary-score">Score: {score}</p>
      <button
        onClick={() => {
          handleStart();
        }}
        class="button-5"
        role="button"
      >
        Start New Game
      </button>
    </div>
  );
}
