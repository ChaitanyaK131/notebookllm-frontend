import React, { useState } from "react";
import axios from "axios";

function App() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [file, setFile] = useState(null);

  const [mode, setMode] = useState("chat");

  // Quiz states (dynamic)
  const [quizData, setQuizData] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);

  // 🔥 YOUR BACKEND URL HERE
  const API_URL = "https://notebookllm-backend.vercel.app";

  // Quotes
  const quotes = [
    "💡 Study hard... Netflix isn’t going anywhere 😭",
    "🚀 You didn’t come this far to only come this far",
    "😂 Debugging: Being the detective in a crime movie where you are also the murderer",
    "📚 One more page… then 10 more 😌",
    "🔥 Your future self is watching you right now",
    "😴 Sleep is temporary, grades are forever (not really tho)",
    "💻 Eat. Code. Cry. Repeat.",
    "🎯 Focus now, flex later"
  ];

  const [quote, setQuote] = useState(
    quotes[Math.floor(Math.random() * quotes.length)]
  );

  const newQuote = () => {
    const random = quotes[Math.floor(Math.random() * quotes.length)];
    setQuote(random);
  };

  // ✅ ASK QUESTION (Backend)
  const askQuestion = async () => {
    if (!question) return;

    const newMessages = [...messages, { type: "user", text: question }];
    setMessages(newMessages);

    try {
      const res = await axios.post(`${API_URL}/ask`, {
        question: question,
      });

      setMessages([
        ...newMessages,
        { type: "bot", text: res.data.answer },
      ]);
    } catch {
      setMessages([
        ...newMessages,
        { type: "bot", text: "Error getting response" },
      ]);
    }

    setQuestion("");
  };

  // ✅ UPLOAD FILE (Backend)
  const uploadFile = async () => {
    if (!file) return alert("Select a file");

    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post(`${API_URL}/upload`, formData);
      alert("File uploaded!");
    } catch {
      alert("Upload failed");
    }
  };

  // ✅ SUMMARY (Backend)
  const summarize = async () => {
    try {
      const res = await axios.get(`${API_URL}/summary`);
      setMessages([...messages, { type: "bot", text: res.data.summary }]);
      setMode("chat");
    } catch {
      alert("Error summarizing");
    }
  };

  // ✅ LOAD QUIZ FROM BACKEND
  const loadQuiz = async () => {
    try {
      const res = await axios.get(`${API_URL}/quiz`);
      setQuizData(res.data.quiz); // backend should send quiz array
      setMode("quiz");
      setCurrentQ(0);
      setScore(0);
    } catch {
      alert("Error loading quiz");
    }
  };

  // Quiz logic
  const handleAnswer = (opt) => {
    setSelected(opt);
    if (opt === quizData[currentQ].answer) {
      setScore(score + 1);
    }
  };

  const nextQ = () => {
    setSelected(null);
    setCurrentQ(currentQ + 1);
  };

  return (
    <div style={{
      display: "flex",
      height: "100vh",
      fontFamily: "Segoe UI",
      background: "#121212"
    }}>

      {/* Sidebar */}
      <div style={{
        width: "25%",
        background: "#1e1e2f",
        color: "white",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "12px"
      }}>
        <h2>📂 Controls</h2>

        <button onClick={() => setMode("chat")} style={btn}>💬 Ask Questions</button>
        <button onClick={summarize} style={btnBlue}>🧾 Summary</button>
        <button onClick={loadQuiz} style={btnPurple}>🧠 Quiz</button>

        <hr style={{ borderColor: "#444" }} />

        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <button onClick={uploadFile} style={btnGreen}>⬆ Upload File</button>

        <hr style={{ borderColor: "#444" }} />

        {/* Quotes */}
        <div style={{
          padding: "12px",
          background: "#2a2a40",
          borderRadius: "10px",
          fontSize: "14px"
        }}>
          <h4>✨ Quote of the Moment</h4>
          <p>{quote}</p>

          <button onClick={newQuote} style={btnGreen}>
            🔄 New Quote
          </button>
        </div>
      </div>

      {/* Main Area */}
      <div style={{
        width: "75%",
        padding: "20px",
        color: "white",
        display: "flex",
        flexDirection: "column"
      }}>

        {mode === "chat" && (
          <>
            <h1>💬 Chat</h1>

            <div style={chatBox}>
              {messages.map((msg, i) => (
                <div key={i} style={{
                  textAlign: msg.type === "user" ? "right" : "left",
                  marginBottom: "10px"
                }}>
                  <span style={{
                    padding: "10px",
                    borderRadius: "10px",
                    background: msg.type === "user" ? "#4CAF50" : "#2a2a40"
                  }}>
                    {msg.text}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", marginTop: "10px" }}>
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask something..."
                style={{ flex: 1, padding: "10px" }}
              />
              <button onClick={askQuestion} style={btnGreen}>Send</button>
            </div>
          </>
        )}

        {mode === "quiz" && (
          <>
            <h1>🧠 Quiz</h1>

            {quizData.length > 0 && currentQ < quizData.length ? (
              <>
                <h3>{quizData[currentQ].question}</h3>

                {quizData[currentQ].options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleAnswer(opt)}
                    style={{
                      ...btn,
                      background:
                        selected === opt
                          ? opt === quizData[currentQ].answer
                            ? "green"
                            : "red"
                          : "#2a2a40"
                    }}
                  >
                    {opt}
                  </button>
                ))}

                {selected && (
                  <button onClick={nextQ} style={btnGreen}>Next</button>
                )}
              </>
            ) : (
              <h2>🎉 Score: {score}/{quizData.length}</h2>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Styles
const btn = {
  padding: "10px",
  background: "#9898aa",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer"
};

const btnGreen = { ...btn, background: "#4CAF50" };
const btnBlue = { ...btn, background: "#2196F3" };
const btnPurple = { ...btn, background: "#9C27B0" };

const chatBox = {
  height: "70%",
  overflowY: "auto",
  background: "#1a1a1a",
  padding: "10px",
  borderRadius: "10px"
};

export default App;