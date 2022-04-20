import React from "react";
import { useCanvas } from "./Hooks";

export const ClearCanvasButton = () => {
  const { clearCanvas } = useCanvas();

  return <button onClick={clearCanvas}>Clear</button>;
};
