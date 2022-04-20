import React, { useState, useRef } from "react";
import { Stage, Layer, Line } from "react-konva";

export default function Board({ setDrawing }) {
  const [lines, setLines] = useState([]);
  const isDrawing = useRef(false);

  const handleMouseDown = (e) => {
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    setLines([...lines, { tool: "pen", points: [pos.x, pos.y] }]);
  };

  const handleMouseMove = (e) => {
    // no drawing - skipping
    if (!isDrawing.current) {
      return;
    }
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    let lastLine = lines[lines.length - 1];
    // add point
    lastLine.points = lastLine.points.concat([point.x, point.y]);

    // replace last
    lines.splice(lines.length - 1, 1, lastLine);
    setLines(lines.concat());
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  const doneDrawing = () => {
    const canvas = document.getElementsByTagName("canvas")[0];
    setDrawing(canvas.toDataURL());
    clearBoard();
  };

  const clearBoard = () => {
    setLines([]);
  };

  return (
    <>
      <Stage
        width={300}
        height={300}
        container=".drawing"
        onMouseDown={handleMouseDown}
        onMousemove={handleMouseMove}
        onMouseup={handleMouseUp}
      >
        <Layer>
          {lines.map((line, i) => (
            <Line
              key={i}
              points={line.points}
              stroke="#ffffff"
              strokeWidth={5}
              tension={0.5}
              lineCap="round"
            />
          ))}
        </Layer>
      </Stage>
      <div className="tool_bar">
        <button onClick={clearBoard}>Clear</button>
        <button onClick={doneDrawing}>Done</button>
      </div>
    </>
  );
}
