function escapeXml(value: string) {
  return value.replace(/[<>&'"]/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[char] || char));
}

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = escapeXml((searchParams.get("title") || "Promptexa").slice(0, 90));
  const type = escapeXml((searchParams.get("type") || "AI prompt").slice(0, 24));
  const model = escapeXml((searchParams.get("model") || "AI").slice(0, 30));

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#f1eee8"/>
        <stop offset=".48" stop-color="#bdb7ad"/>
        <stop offset="1" stop-color="#5e5a57"/>
      </linearGradient>
      <radialGradient id="light" cx=".52" cy=".35" r=".7">
        <stop offset="0" stop-color="#fff" stop-opacity=".95"/>
        <stop offset=".5" stop-color="#fff" stop-opacity=".16"/>
        <stop offset="1" stop-color="#000" stop-opacity=".18"/>
      </radialGradient>
      <filter id="shadow"><feGaussianBlur stdDeviation="24"/></filter>
    </defs>
    <rect width="1200" height="800" fill="url(#bg)"/>
    <rect width="1200" height="800" fill="url(#light)"/>
    <ellipse cx="600" cy="620" rx="330" ry="72" fill="#171717" opacity=".32" filter="url(#shadow)"/>
    <rect x="405" y="285" width="390" height="260" rx="42" fill="#151515" opacity=".94"/>
    <rect x="440" y="320" width="320" height="190" rx="28" fill="#34312e"/>
    <circle cx="600" cy="415" r="76" fill="#bdb7ad" opacity=".9"/>
    <circle cx="600" cy="415" r="50" fill="#77716b" opacity=".65"/>
    <text x="64" y="82" fill="#111" font-family="Arial,sans-serif" font-size="24" font-weight="700" letter-spacing="5">PROMPTEXA</text>
    <text x="64" y="690" fill="#111" font-family="Arial,sans-serif" font-size="22" font-weight="700" letter-spacing="3">${type} · ${model}</text>
    <text x="64" y="735" fill="#111" font-family="Arial,sans-serif" font-size="34" font-weight="800">${title}</text>
  </svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000",
    },
  });
}
