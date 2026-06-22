import { useState, useEffect, useRef } from "react";
import Timer from "./components/Timer";
import questions from "./questions";

function App() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [warnings, setWarnings] = useState(0);
  const [reviewQuestions, setReviewQuestions] = useState([]);
  const [showReview, setShowReview] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [bestScore, setBestScore] = useState(Number(localStorage.getItem("bestScore")) || 0);
  const videoRef = useRef(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.warn("Camera access denied!");
      }
    };
    startCamera();
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setWarnings((prev) => prev + 1);
        alert("⚠️ Tab Switching Detected!");
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  useEffect(() => {
    if (score > bestScore) {
      setBestScore(score);
      localStorage.setItem("bestScore", score);
    }
  }, [score]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        alert("⚠️ Fullscreen Exit Detected!");
        setWarnings((prev) => prev + 1);
      }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    if (warnings >= 3) {
      alert("❌ Exam Auto Submitted due to violations!");
      setShowResult(true);
    }
  }, [warnings]);

  useEffect(() => {
    const disableContextMenu = (e) => e.preventDefault();
    const disableCopy = (e) => {
      e.preventDefault();
      alert("⚠️ Copy-Paste Disabled!");
    };
    document.addEventListener("contextmenu", disableContextMenu);
    document.addEventListener("copy", disableCopy);
    document.addEventListener("cut", disableCopy);
    document.addEventListener("paste", disableCopy);
    return () => {
      document.removeEventListener("contextmenu", disableContextMenu);
      document.removeEventListener("copy", disableCopy);
      document.removeEventListener("cut", disableCopy);
      document.removeEventListener("paste", disableCopy);
    };
  }, []);

  const handleAnswer = (selectedOption) => {
    setSelectedAnswer(selectedOption);
    setShowAnswer(true);
    if (selectedOption === questions[currentQuestion].answer) {
      setScore((prev) => prev + 1);
    }
    setTimeout(() => {
      setSelectedAnswer(null);
      setShowAnswer(false);
      if (showReview) {
        if (reviewQuestions.length > 0) {
          setCurrentQuestion(reviewQuestions[0]);
          setReviewQuestions(reviewQuestions.slice(1));
        } else {
          setShowReview(false);
          setShowResult(true);
        }
      } else {
        if (currentQuestion < questions.length - 1) {
          setCurrentQuestion((prev) => prev + 1);
        } else {
          setShowResult(true);
        }
      }
    }, 1000);
  };

  if (showResult) {
    return (
      <>
        <video ref={videoRef} autoPlay muted width="180"
          style={{ position: "fixed", top: "10px", right: "10px", border: "2px solid white", borderRadius: "10px", zIndex: 1000 }}
        ></video>
        <div style={{ textAlign: "center", color: "white", marginTop: "100px" }}>
          <h1>🎉 Exam Finished</h1>
          <h2>Score: {score} / {questions.length}</h2>
          <h3>🏆 Best Score: {bestScore}/{questions.length}</h3>
          <h3>⚠️ Warnings: {warnings}</h3>
          <h3>Percentage: {((score / questions.length) * 100).toFixed(0)}%</h3>
          <h3 style={{ color: score / questions.length >= 0.4 ? "lightgreen" : "red" }}>
            {score / questions.length >= 0.4 ? "✅ Pass" : "❌ Fail"}
          </h3>
          <h3>✅ Correct: {score}</h3>
          <h3>❌ Wrong: {questions.length - score}</h3>
          <button onClick={() => {
            if (reviewQuestions.length > 0) {
              setShowReview(true);
              setCurrentQuestion(reviewQuestions[0]);
              setReviewQuestions(reviewQuestions.slice(1));
              setShowResult(false);
            }
          }} style={{ padding: "10px 20px", fontSize: "16px", marginBottom: "15px", cursor: "pointer" }}>
            Attempt Review Questions
          </button>
          <br />
          <button onClick={() => {
            setCurrentQuestion(0);
            setScore(0);
            setShowResult(false);
            setWarnings(0);
            setReviewQuestions([]);
            setSelectedAnswer(null);
            setShowAnswer(false);
            setTimeout(() => {
  navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
    if (videoRef.current) videoRef.current.srcObject = stream;
  });
}, 300);
          }} style={{ padding: "10px 20px", fontSize: "18px", cursor: "pointer" }}>
            Restart Exam
          </button>
        </div>
      </>
    );
  }

  return (
    <div style={{ textAlign: "center", color: "white", marginTop: "50px" }}>
      <video ref={videoRef} autoPlay muted width="180"
        style={{ position: "fixed", top: "10px", right: "10px", border: "2px solid white", borderRadius: "10px", zIndex: 1000 }}
      ></video>
      <h1>📄 ExamSim AI</h1>
      <Timer secondsLeft={secondsLeft} setSecondsLeft={setSecondsLeft} onTimeUp={() => setShowResult(true)} />
      <h3 style={{ color: "red" }}>⚠️ Warnings: {warnings}</h3>
      <h3>Question {currentQuestion + 1} / {questions.length}</h3>
      <div style={{ width: "500px", height: "10px", background: "#444", margin: "10px auto", borderRadius: "10px" }}>
        <div style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%`, height: "100%", background: "limegreen", borderRadius: "10px" }}></div>
      </div>
      <div style={{ width: "500px", margin: "30px auto", padding: "20px", border: "1px solid white", borderRadius: "10px" }}>
        <h2>{questions[currentQuestion].question}</h2>
        {questions[currentQuestion].options.map((option, index) => (
          <button key={index} disabled={showAnswer} onClick={() => handleAnswer(option)}
            style={{
              display: "block", width: "100%", margin: "10px 0", padding: "10px", fontSize: "16px", cursor: "pointer",
              backgroundColor: showAnswer ? option === questions[currentQuestion].answer ? "green" : option === selectedAnswer ? "red" : "white" : "white",
              color: showAnswer ? "white" : "black",
            }}>
            {option}
          </button>
        ))}
        <button onClick={() => {
          setReviewQuestions([...reviewQuestions, currentQuestion]);
          if (currentQuestion < questions.length - 1) setCurrentQuestion((prev) => prev + 1);
        }} style={{ marginTop: "15px", padding: "10px 20px", fontSize: "16px", cursor: "pointer", backgroundColor: "#ff9800", color: "white", border: "none", borderRadius: "8px" }}>
          Review Later
        </button>
      </div>
    </div>
  );
}

export default App;