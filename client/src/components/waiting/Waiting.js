import React, { useEffect, useState } from "react";
import "./waiting.css";
import { useLocation, useNavigate } from "react-router-dom";
import socket from "../../utilities/socket";

export default function Waiting() {
  const location = useLocation();
  const navigate = useNavigate();
  const [myId, setMyId] = useState("");
  const { roomId, nickname, action } = location.state;
  const [serverMessage, setServerMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState(false);
  const [readyToPlay, setReadyToPlay] = useState(false); // indicates if opponent has joined
  const [players, setPlayers] = useState([]); // players list
  const [currentRoom, setCurrentRoom] = useState("");

  const handleBack = () => {
    // navigates back to home page
    navigate("/");
  };

  useEffect(() => {
    // sets id and indicates who is player 1
    setMyId(socket.id);
    if (action === "create") {
      socket.emit("create_room", { nickname });
    } else {
      socket.emit("join_room", { roomId, nickname });
    }
  }, []);

  useEffect(() => {
    // navigates player 2 to guessing page
    if (myId === players[1]) {
      socket.emit("start_game", { roomId, myId });
      navigate("/guess", { state: { currentRoom, nickname, myId } });
    }
  }, [readyToPlay]);

  socket.on("created_successfully", ({ roomId }) => {
    // room created successfully
    setCurrentRoom(roomId);
  });

  socket.on("joined_successfully", ({ joinedId }) => {
    // joined successfully
    socket.emit("setup", { roomId: joinedId });
    socket.on("data", (data) => {
      console.log("30", data);
      setCurrentRoom(joinedId);
      setPlayers(data.players);
      setReadyToPlay(true);
    });
  });

  socket.on("start_game", () => {
    // navigates player 1 to word choosing page
    socket.emit("get_words_start", { currentRoom, nickname, myId });
    navigate("/wordchoosing", { state: { currentRoom, nickname, myId } });
  });

  socket.on("error", ({ message }) => {
    // displays error message
    setServerMessage(message);
    setErrorMessage(true);
  });

  return (
    <div id="waiting">
      <button
        onClick={() => {
          handleBack();
        }}
        className="back-button"
      >
        ↩
      </button>
      <h1>Room ID: {currentRoom}</h1>
      {errorMessage && <p id="server-message">{serverMessage}</p>}
      {!errorMessage && (
        <div class="lds-ring">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      )}
      {!errorMessage && <p>Waiting for second player ...</p>}
    </div>
  );
}
