import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// Site favicon, generated at build time: a gold watch face on near-black,
// matching the header logo mark.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0e0b08",
          borderRadius: 7,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 22,
            height: 22,
            border: "3px solid #d4a64a",
            borderRadius: 11,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <div style={{ position: "absolute", width: 2, height: 7, background: "#f0d58a", top: 3, left: 8 }} />
          <div style={{ position: "absolute", width: 6, height: 2, background: "#f0d58a", top: 10, left: 8 }} />
        </div>
      </div>
    ),
    { ...size }
  );
}
