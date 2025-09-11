"use client";
import React from "react";
import { useState } from "react";

function ChatPage() {
  const [message, setMessage] = useState<
    Array<{ role: "user" | "AI"; text: string }>
  >([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [input, setInput] = useState("");

  // here is the place to set in to set sendMessage function

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = input.trim();
    setInput("");
    setLoading(true);

    setMessage((prv) => [...prv, { role: "user", text: userMessage }]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage }),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage((prev) => [
          ...prev,
          {
            role: "AI",
            text: "Error: " + (data.error || "Something went wrong"),
          },
        ]);
      } else {
        setMessage((prv) => [
          ...prv,
          { role: "AI", text: data.choices[0].message.content },
        ]);
      }
    } catch (error) {
      setMessage((prv) => [
        ...prv,
        { role: "AI", text: "Error: Something went wrong" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold  text-black">
          {" "}
          🤖 AI Chat with Hugging Face
        </h1>
        <div className="bg-white shadow-emerald-500">
          {message.length === 0 ? (
            <div className="text-amber-500 text-center">
              Start Chatting with AI!
            </div>
          ) : (
            message.map((msg, index) => (
              <div
                key={index}
                className={`mb-4 ${
                  msg.role === "user" ? "text-right" : " text-left"
                }}`}
              >
                <div
                  className={`inline-block max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    msg.role === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  {msg.text}
                </div>
                {loading && (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900">
                    <div className="sr-only">AI is thinking...</div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="flex gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type somthing...."
            className="flex-grow p-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 "
            onClick={sendMessage}
          >
            {loading ? "..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatPage;
