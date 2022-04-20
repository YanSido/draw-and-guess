import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import WordChoosing from "./components/wordchoosing/WordChoosing";
import { Routes, Route } from "react-router-dom";
import { BrowserRouter as Router } from "react-router-dom";
import Waiting from "./components/waiting/Waiting";

ReactDOM.render(
  <Router>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/waiting" element={<Waiting />} />
      <Route path="/wordchoosing" element={<WordChoosing />} />
    </Routes>
  </Router>,
  document.getElementById("root")
);
