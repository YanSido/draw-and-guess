import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import WordChoosing from "./components/wordchoosing/WordChoosing";
import { Routes, Route } from "react-router-dom";
import { BrowserRouter as Router } from "react-router-dom";
import Waiting from "./components/waiting/Waiting";
import Hooks from "./components/drawing/Hooks";

ReactDOM.render(
  <Router>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/waiting" element={<Waiting />} />
      <Route path="/wordchoosing" element={<WordChoosing />} />
      <Route path="/drawing" element={<Hooks />} />
    </Routes>
  </Router>,
  document.getElementById("root")
);
