import { useEffect, useRef } from "react";
import io from "socket.io-client";
import Welcome from "./components/welcome/Welcome";
const URL = "/";

function App() {
  const socketRef = useRef(); // socket refference

  useEffect(() => {
    try {
      socketRef.current = io.connect(URL); // coonect to server with username
      socketRef.current.on("connect", () => {
        console.log("Connected to Server");
      });
    } catch (e) {
      console.log("Server error:", e);
    }
  }, []);

  return (
    <div className="App">
      <Welcome />
    </div>
  );
}

export default App;
