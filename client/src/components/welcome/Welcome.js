import React from "react";
import "./welcome.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Welcome() {
  const [roomId, setRoomId] = useState("");
  const [nickname, setNickname] = useState("");
  const navigate = useNavigate();

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
