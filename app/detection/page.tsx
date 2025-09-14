"use client";

import React, { useState, useRef } from "react";

interface Detection {
  label: string;
  confidence: number;
  box: { x: number; y: number; width: number; height: number };
}

function DetectionPage() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setDetections([]); // Clear previous detections
        setError(null);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedImage(null);
      setImagePreview(null);
      setDetections([]);
      setError(null);
    }
  };

  const handleDetect = async () => {
    if (!selectedImage || !imagePreview) {
      setError("Please select an image first.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/detection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageBase64: imagePreview }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to perform detection.");
      }

      const data = await response.json();
      setDetections(data.detections);
    } catch (err: any) {
      setError(err.message || "An unknown error occurred during detection.");
      console.error("Detection error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Draw bounding boxes on the canvas
  React.useEffect(() => {
    if (
      imagePreview &&
      imageRef.current &&
      canvasRef.current &&
      detections.length > 0
    ) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const img = imageRef.current;

      if (ctx) {
        // Ensure canvas matches image dimensions
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;

        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear previous drawings
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height); // Draw the image

        detections.forEach((detection) => {
          const { box, label, confidence } = detection;

          // Scale box coordinates if image was resized for display
          const scaleX = canvas.width / img.width;
          const scaleY = canvas.height / img.height;

          const x = box.x * scaleX;
          const y = box.y * scaleY;
          const width = box.width * scaleX;
          const height = box.height * scaleY;

          ctx.beginPath();
          ctx.rect(x, y, width, height);
          ctx.lineWidth = 2;
          ctx.strokeStyle = "red";
          ctx.fillStyle = "red";
          ctx.stroke();

          ctx.font = "18px Arial";
          ctx.fillText(
            `${label} (${(confidence * 100).toFixed(2)}%)`,
            x,
            y > 10 ? y - 5 : y + 20
          );
        });
      }
    } else if (
      imagePreview &&
      imageRef.current &&
      canvasRef.current &&
      detections.length === 0
    ) {
      // If no detections, just draw the image without boxes
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const img = imageRef.current;
      if (ctx) {
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      }
    }
  }, [imagePreview, detections]);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Object Detection</h1>

      <input type="file" accept="image/*" onChange={handleImageChange} />
      <button
        onClick={handleDetect}
        disabled={!selectedImage || loading}
        style={{ marginLeft: "10px", padding: "8px 15px" }}
      >
        {loading ? "Detecting..." : "Detect Objects"}
      </button>

      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      {imagePreview && (
        <div
          style={{
            marginTop: "20px",
            position: "relative",
            display: "inline-block",
          }}
        >
          <img
            ref={imageRef}
            src={imagePreview}
            alt="Preview"
            style={{ maxWidth: "600px", height: "auto", display: "block" }}
            onLoad={() => {
              // When image loads, if there are no detections, draw it on canvas
              if (
                detections.length === 0 &&
                canvasRef.current &&
                imageRef.current
              ) {
                const canvas = canvasRef.current;
                const ctx = canvas.getContext("2d");
                const img = imageRef.current;
                if (ctx) {
                  canvas.width = img.naturalWidth;
                  canvas.height = img.naturalHeight;
                  ctx.clearRect(0, 0, canvas.width, canvas.height);
                  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                }
              }
            }}
          />
          <canvas
            ref={canvasRef}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              maxWidth: "600px",
              height: "auto",
              pointerEvents: "none", // Allow clicks to pass through to the image if needed
            }}
          />
        </div>
      )}

      {detections.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h2>Detection Results:</h2>
          <ul>
            {detections.map((det, index) => (
              <li key={index}>
                {det.label} - {(det.confidence * 100).toFixed(2)}% confidence
                (Box: x:{det.box.x}, y:{det.box.y}, w:{det.box.width}, h:
                {det.box.height})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default DetectionPage;
