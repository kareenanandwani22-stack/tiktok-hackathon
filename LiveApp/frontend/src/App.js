import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import { supabase } from "./supabaseClient";

function App() {
  const [messages, setMessages] = useState([
    { user: "Host", text: "SUPPORT DI BIO :) XZEE" },
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
    // Mark the time U001 opened the live
    sessionStartMsRef.current = Date.now();

    // (Optional) persist across reloads:
    // const saved = Number(sessionStorage.getItem("sessStartMs"));
    // const now = Date.now();
    // sessionStartMsRef.current = saved && !Number.isNaN(saved) ? saved : now;
    // if (!saved) sessionStorage.setItem("sessStartMs", String(now));
  }, []);

  async function sendGiftToDB({ giftType, coins }) {
    if (!supabase) {
      return { ok: false, error: new Error("Supabase not configured") };
    }

    // Seconds since session started (live)
    const start = sessionStartMsRef.current ?? Date.now();
    const sessionSecs = Math.floor((Date.now() - start) / 1000);

    const { error } = await supabase
      .from("gift_events")
      .insert([
        {
          viewer_id: VIEWER_ID,
          gift_type: giftType,              // e.g. 'rose'
          gift_coins: coins,                // e.g. 10
          session_duration_secs: sessionSecs, // live seconds
        },
      ]);

    return { ok: !error, error };
  }

  const send = () => {
    if (!text) return;
    setMessages((prev) => {
      const updated = [...prev, { user: "You", text }];
      return updated.slice(-5); // keep last 5 messages
    });
    setText("");
  };

  const handleSendGift = async (gift) => {
    // If you want optimistic chat UI, uncomment:
    // setMessages(prev =>
    //   [...prev, { user: "You", text: `sent ${gift.emoji} ${gift.name}` }].slice(-5)
    // );

    const { ok, error } = await sendGiftToDB({
      giftType: gift.name.toLowerCase(),
      coins: gift.coins,
    });

    if (!ok) {
      console.warn("Gift failed:", error?.message);
      // Keep errors out of chat UI
    }

    setShowGifts(false);
  };

  return (
    <div className="app-root">
      <div className="phone-frame">
        <div className="live-container">
          {/* Background video */}
          <video
            className="live-video"
            src="https://www.w3schools.com/html/mov_bbb.mp4"
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
                  src="https://via.placeholder.com/40"
                  alt="avatar"
                  className="avatar"
                />
                <div>
                  <strong>Asep Kopling</strong>
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
  