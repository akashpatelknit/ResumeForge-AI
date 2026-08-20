import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default async function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 7,
          background: "linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)",
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2c0.6 4 1.6 6 4.4 7.4C13.6 10.8 12.6 12.8 12 16.8c-0.6-4-1.6-6-4.4-7.4C10.4 8 11.4 6 12 2z"
            fill="white"
          />
        </svg>
      </div>
    ),
    { ...size },
  );
}
