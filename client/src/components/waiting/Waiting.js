import React, { useEffect, useState } from "react";
import "./waiting.css";
import { useLocation, useNavigate } from "react-router-dom";
import socket from "../../utilities/socket";

export default function Waiting() {
  const location = useLocation();
  const navigate = useNavigate();
  const { roomId, nickname, action } = location.state;
  const [serverMessage, setServerMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState(false);

  const handleBack = () => {
    navigate("/");
  };

  useEffect(() => {
    if (action === "create") {
      socket.emit("create_room", { nickname });
    } else {
      socket.emit("join_room", { roomId, nickname });
    }
  }, []);

  socket.on("error", ({ message }) => {
    setServerMessage(message);
    setErrorMessage(true);
  });

  return (
    <div id="waiting">
      <button
        onClick={() => {
          handleBack();
        }}
        id="back-button"
      >
        ↩
      </button>
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
