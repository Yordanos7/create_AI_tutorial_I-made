"use client";

import React, { useState } from "react";

function ImagePage() {
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [image, setImage] = useState<string | null>("");
  const [error, setError] = useState<string | null>("");

  const generateImage = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: input }),
      });
      if (!response.ok) {
        //  setError("Something went wrong in sending request");
        const errorData = await response.json();
        setError(errorData.error || "Something went wrong in request");
      } else {
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        setImage(imageUrl);
      }
    } catch (error) {
      setError("Something went wrong in request => " + error);
    } finally {
      setLoading(false);
    }
  };
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      generateImage();
    }
  };

  return (
    <div className="min-h-screen bg-amber-100 p-4 ">
      <div className="max-w-2xl mx-auto flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-4 text-amber-800">
          Image Generator with huggingface
        </h1>
        <div className="flex flex-col items-center">
          {image && (
            <div className="mb-4">
              <img src={image} alt="Genrated" className="w-full" />
            </div>
          )}
          {error && (
            <div className="text-red-400 text-center font-bold">{error}</div>
          )}
        </div>
        <div className="flex gap-3 items-center">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Insert sometext to genrate image"
            className="w-full p-2 border text-black"
          />
          <button
            className="bg-amber-800 p-2 text-white"
            onClick={generateImage}
          >
            {loading ? "Loading..." : "Genrate Image"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ImagePage;
