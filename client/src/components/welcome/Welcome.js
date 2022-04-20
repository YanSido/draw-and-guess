import React from "react";
import { Link } from "react-router-dom";
import "./welcome.css";

export default function Welcome() {
  return (
    <div id="welcome">
      <img src={require("./welcomelogo.png")} className="brand_logo" alt="Logo" />

      <Link to={`/waiting`}>
        <button class="button-5" role="button">
          Press To Start
        </button>
      </Link>
    </div>
  );
}
