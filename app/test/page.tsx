"use client";

import { useState } from "react";

import React from "react";

function page() {
  const [response, setResponse] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const textAPI = async () => {
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: "Hello, API!" }),
      });
      const data = await res.json();
      if (data.response) {
        setResponse(data.response);
      } else {
        setResponse("No response from API");
      }
    } catch (error) {
      setResponse("Error fetching data" + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-4">Testing the HUgging face</h1>
      <button
        onClick={textAPI}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? "Testing...." : "The result is ready"}
      </button>
      <pre className="bg-black p-4 rounded">
        {response || "Click test to see response"}
      </pre>
    </div>
  );
}

export default page;
