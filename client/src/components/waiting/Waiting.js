import React from "react";
import "./waiting.css";

export default function Waiting() {
  return (
    <div id="waiting">
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
