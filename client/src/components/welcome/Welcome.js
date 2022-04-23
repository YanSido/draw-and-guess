import React, { useEffect } from "react";
import "./welcome.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import socket from "../../utilities/socket";

export default function Welcome() {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState("");
  const [nickname, setNickname] = useState("");
  const [bestPlayerOne, setBestPlayerOne] = useState("");
  const [bestPlayerTwo, setBestPlayerTwo] = useState("");
  const [bestScore, setBestScore] = useState("");
  const [bestTime, setBestTime] = useState("");

  useEffect(() => {
    // get score data from server
    socket.emit("sessions_data", {});
  }, []);

  socket.on("sessions_data", ({ bestPlayerOne, bestPlayerTwo, bestScore, minutes, seconds }) => {
    // get score data from server
    setBestPlayerOne(bestPlayerOne);
    setBestPlayerTwo(bestPlayerTwo);
    setBestScore(bestScore.toString());
    if (seconds < 10) setBestTime(`${minutes}:0${seconds}`);
    else if (seconds >= 10) setBestTime(`${minutes}:${seconds}`);
  });

  const handleStart = () => {
    // handles start button, nevigates to waiting view
    if (nickname !== "") {
      if (roomId !== "") {
        navigate("/waiting", { state: { roomId, nickname, action: "join" } });
      } else {
        navigate("/waiting", {
          state: { nickname, action: "create" },
        });
      }
    }
  };

  return (
    <div id="welcome">
      <img src={require("./welcomelogo.png")} className="brand_logo" alt="Logo" />
      <div>
        <p>
          Champions:&nbsp;
          <b>
            {bestPlayerOne}, {bestPlayerTwo}
          </b>
          <br></br>Score: <b>{bestScore}</b>
          <br></br>Time: <b>{bestTime}</b>
        </p>
      </div>
      <input
        className="medium-input"
        required={true}
        onChange={(e) => {
          setNickname(e.target.value);
        }}
        placeholder="Enter nickname"
      ></input>
      <input
        className="medium-input"
        onChange={(e) => {
          setRoomId(e.target.value);
        }}
        placeholder="Enter room ID (if exists)"
      ></input>
      <button
        onClick={() => {
          handleStart();
        }}
        class="button-5"
        role="button"
      >
        Press To Start
      </button>
    </div>
  );
}
