import { useState, useEffect } from "react";

function Timer({ secondsLeft, setSecondsLeft, onTimeUp }) {

  useEffect(() => {
    if (secondsLeft <= 0) {
      onTimeUp();
      return;
    }

    const interval = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsLeft, onTimeUp]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  return (
    <div
      style={{
        fontSize: "2rem",
        fontWeight: "bold",
        color: secondsLeft < 60 ? "red" : "white",
      }}
    >
      ⏱ {minutes}:{seconds.toString().padStart(2, "0")}
    </div>
  );
}

export default Timer;