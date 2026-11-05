import { ImageResponse } from "next/og";

/**
 * Ikon aplikasi (PNG) dibuat dari bentuk sederhana: Matahari di dalam cincin orbit.
 * ?size=48..1024  ?maskable=1 -> area aman lebih besar, tanpa sudut membulat (untuk ikon adaptif).
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const size = Math.min(1024, Math.max(48, Number(searchParams.get("size")) || 192));
  const maskable = searchParams.get("maskable") === "1";

  const ring = size * (maskable ? 0.42 : 0.5);
  const border = Math.max(3, size * 0.055);
  const sun = size * (maskable ? 0.2 : 0.24);

  return new ImageResponse(
    (
      <div
        style={{
          width: size,
          height: size,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(145deg, #4f86ff 0%, #074ce0 70%)",
          borderRadius: maskable ? 0 : size * 0.22,
        }}
      >
        <div
          style={{
            width: ring,
            height: ring,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            border: `${border}px solid rgba(255,255,255,0.95)`,
          }}
        >
          <div style={{ width: sun, height: sun, borderRadius: "50%", background: "#ffd23f" }} />
        </div>
      </div>
    ),
    {
      width: size,
      height: size,
      headers: { "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800" },
    },
  );
}
