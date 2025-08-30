// App.jsx
import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import { supabase } from "./supabaseClient";

function App() {
  const [messages, setMessages] = useState([
    { user: "Host", text: "SEND GIFTS TO SUPPORT ME!" },
    { user: "Heyyy", text: "joined" },
    { user: "xZEE", text: "joined" },
  ]);
  const [text, setText] = useState("");
  const [showGifts, setShowGifts] = useState(false);

  const gifts = [
    { name: "Rose", emoji: "🌹", coins: 1 },
    { name: "Lion", emoji: "🦁", coins: 10 },
    { name: "Castle", emoji: "🏰", coins: 100 },
    { name: "Star", emoji: "⭐", coins: 1000 },
    { name: "Galaxy", emoji: "🌌", coins: 10000 },
  ];

  const VIEWER_ID = "U001";
  const sessionStartMsRef = useRef(null);

  useEffect(() => {
    sessionStartMsRef.current = Date.now();
  }, []);

  function appendSystem(text) {
    setMessages((prev) => [...prev, { user: "System", text }].slice(-5));
  }

  async function sendGiftToDB({ giftType, coins }) {
    if (!supabase) {
      return { ok: false, error: new Error("Supabase not configured") };
    }

    const start = sessionStartMsRef.current ?? Date.now();
    const sessionSecs = Math.floor((Date.now() - start) / 1000);

    const { error } = await supabase.from("gift_events").insert([
      {
        viewer_id: VIEWER_ID,
        gift_type: giftType,
        gift_coins: coins,
        session_duration_secs: sessionSecs,
      },
    ]);

    return { ok: !error, error };
  }

  const send = () => {
    if (!text) return;
    setMessages((prev) => {
      const updated = [...prev, { user: "You", text }];
      return updated.slice(-5);
    });
    setText("");
  };

  const handleSendGift = async (gift) => {
    const label = `${gift.emoji} ${gift.name}`;

    try {
      const { ok, error } = await sendGiftToDB({
        giftType: gift.name.toLowerCase(),
        coins: gift.coins,
      });

      if (ok) {
        appendSystem(
          `${label} sent successfully (${gift.coins} coin${
            gift.coins > 1 ? "s" : ""
          }).`
        );
      } else {
        console.warn("Gift failed:", error?.message);
        appendSystem(`Failed to send ${label}. Please try again.`);
      }
    } catch (e) {
      console.warn("Gift failed (exception):", e);
      appendSystem(`Failed to send ${label}. Please try again.`);
    } finally {
      setShowGifts(false);
    }
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
                <img src="/profile.jpg" alt="avatar" className="avatar" />
                <div>
                  <strong>PentaByte</strong>
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
                  onClick={() => handleSendGift(gifts[0])}
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
                    onClick={() => handleSendGift(gift)}
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
