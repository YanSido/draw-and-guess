import React from "react";
import "./waiting.css";
import { Link } from "react-router-dom";

export default function Waiting() {
  return (
    <div id="waiting">
      <Link to={`/`}>
        <button id="back-button">↩</button>
      </Link>
      <div class="lds-ring">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
      <p>Waiting for second player ...</p>
    </div>
  );
}
