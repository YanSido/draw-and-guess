import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import WordChoosing from "./components/wordchoosing/WordChoosing";
import { Routes, Route } from "react-router-dom";
import { BrowserRouter as Router } from "react-router-dom";
import Waiting from "./components/waiting/Waiting";
import Drawing from "./components/drawing/Drawing";
import Guess from "./components/guessing/Guessing";
import Summary from "./components/summary/Summary";

ReactDOM.render(
  <Router>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/waiting" element={<Waiting />} />
      <Route path="/wordchoosing" element={<WordChoosing />} />
      <Route path="/drawing" element={<Drawing />} />
      <Route path="/guess" element={<Guess />} />
      <Route path="/summary" element={<Summary />} />
    </Routes>
  </Router>,
  document.getElementById("root")
);
