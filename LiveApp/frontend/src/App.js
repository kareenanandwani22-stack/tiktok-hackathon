import React, { useState } from "react";
import "./App.css";

function App() {
  const [messages, setMessages] = useState([
    { user: "Host", text: "Don't forget to Gift :D" },
    { user: "Heyyy", text: "joined" },
    { user: "xZEE", text: "joined" },
  ]);
  const [text, setText] = useState("");
  const [showGifts, setShowGifts] = useState(false);

  const gifts = [
    { name: "Rose", emoji: "🌹", coins: 1 },
    { name: "Lion", emoji: "🦁", coins: 1 },
    { name: "Castle", emoji: "🏰", coins: 1 },
    { name: "Galaxy", emoji: "🌌", coins: 1 },
    { name: "Star", emoji: "⭐", coins: 1 },
  ];

  const send = () => {
    if (!text) return;
    setMessages((prev) => {
      const updated = [...prev, { user: "You", text }];
      return updated.slice(-5); // keep last 5 messages
    });
    setText("");
  };

  const sendGift = (gift) => {
    setMessages((prev) => {
      const updated = [
        ...prev,
        { user: "You", text: `sent ${gift.emoji} ${gift.name}` },
      ];
      return updated.slice(-5);
    });
    setShowGifts(false);
  };

  return (
    <div className="app-root">
      <div className="phone-frame">
        <div className="live-container">
          {/* Background video */}
          <video
            className="live-video"
            src="/livevid.mp4"
            autoPlay
            muted
            loop
            playsInline
          />

          {/* Overlay */}
          <div className="overlay">
            {/* Top bar */}
            <div className="top-bar">
              <div className="profile">
                <img
                  src="/profile.jpg"
                  alt="avatar"
                  className="avatar"
                />
                <div>
                  <strong>Pentabyte</strong>
                  <p>22.2K ♥</p>
                </div>
              </div>
              <button className="follow-btn">+ Follow</button>
            </div>

            {/* Chat pinned left */}
            <div className="chat-box">
              {messages.map((m, i) => (
                <div key={i} className="chat-message">
                  <strong>{m.user}:</strong> {m.text}
                </div>
              ))}
            </div>

            {/* Bottom bar */}
            <div className="bottom-bar">
              <input
                className="chat-input"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type..."
              />
              <button className="send-btn" onClick={send}>
                ➤
              </button>
              <div className="icons">
                <button className="icon-btn">👥</button>

                {/* 🌹 button sends Rose immediately */}
                <button
                  className="icon-btn"
                  onClick={() => sendGift(gifts[0])}
                >
                  🌹
                </button>

                {/* 🎁 button opens modal */}
                <button
                  className="icon-btn"
                  onClick={() => setShowGifts(true)}
                >
                  🎁
                </button>

                <button className="icon-btn">↗</button>
              </div>
            </div>
          </div>

          {/* Gift modal */}
          {showGifts && (
            <div className="gift-modal">
              <div className="gift-header">
                <h4>Send a Gift 🎁</h4>
                <button
                  className="close-btn"
                  onClick={() => setShowGifts(false)}
                >
                  ✕
                </button>
              </div>
              <div className="gift-grid">
                {gifts.map((gift, i) => (
                  <div
                    key={i}
                    className="gift-card"
                    onClick={() => sendGift(gift)}
                  >
                    <div className="gift-emoji">{gift.emoji}</div>
                    <p>{gift.name}</p>
                    <span>{gift.coins} coin</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
