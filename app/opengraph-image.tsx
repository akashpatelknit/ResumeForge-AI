import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "ResumeForge AI - AI-Powered Resume Builder";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
        backgroundImage: "linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
        }}
      >
        <h1
          style={{
            fontSize: 72,
            fontWeight: "bold",
            margin: 0,
            textAlign: "center",
          }}
        >
          ResumeForge AI
        </h1>
        <p
          style={{
            fontSize: 32,
            margin: "20px 0",
            textAlign: "center",
            maxWidth: "80%",
          }}
        >
          Build ATS-Optimized Resumes with AI
        </p>
        <div
          style={{
            display: "flex",
            gap: "20px",
            marginTop: "30px",
          }}
        >
          <div style={{ fontSize: 24 }}>✨ AI-Powered</div>
          <div style={{ fontSize: 24 }}>🎯 ATS-Friendly</div>
          <div style={{ fontSize: 24 }}>⚡ Instant PDF</div>
        </div>
      </div>
    </div>,
    {
      ...size,
    },
  );
}
