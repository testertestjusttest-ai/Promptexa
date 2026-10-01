import { ImageResponse } from "next/og";
import { createElement } from "react";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = (searchParams.get("title") || "Promptexa").slice(0, 90);
  const type = (searchParams.get("type") || "AI prompt").slice(0, 24);
  const model = (searchParams.get("model") || "AI").slice(0, 30);

  const content = createElement(
    "div",
    {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "64px",
        background: "linear-gradient(135deg, #111 0%, #27232f 48%, #6d4aff 140%)",
        color: "white",
        fontFamily: "Arial",
      },
    },
    createElement(
      "div",
      { style: { display: "flex", fontSize: 26, fontWeight: 800, letterSpacing: 2 } },
      "PROMPTEXA",
    ),
    createElement(
      "div",
      { style: { display: "flex", flexDirection: "column", gap: 18, maxWidth: 980 } },
      createElement(
        "div",
        { style: { display: "flex", fontSize: 22, color: "#d7d1ff", textTransform: "uppercase", letterSpacing: 3 } },
        `${type} · ${model}`,
      ),
      createElement(
        "div",
        { style: { display: "flex", fontSize: 64, lineHeight: 1.05, fontWeight: 800 } },
        title,
      ),
      createElement("div", { style: { display: "flex", width: 180, height: 8, borderRadius: 8, background: "#9b87ff" } }),
    ),
  );

  return new ImageResponse(content, { width: 1200, height: 630 });
}
