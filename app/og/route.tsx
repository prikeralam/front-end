import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { org } from "../_content/org";

// The default share card (1200x630) for links to pages without an image of their own.
export const dynamic = "force-static";

export async function GET() {
  const logo = await readFile(path.join(process.cwd(), "public", "logo.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "linear-gradient(135deg, #253D9A 0%, #12142b 100%)", color: "white" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 112, height: 112, borderRadius: 24, background: "white" }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse renders plain <img> only */}
            <img src={logoSrc} width={80} height={83} alt="" />
          </div>
          <div style={{ display: "flex", fontSize: 30, letterSpacing: 4, opacity: 0.8 }}>{org.short}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", fontSize: 72, fontWeight: 700, lineHeight: 1.05 }}>{org.name}</div>
          <div style={{ display: "flex", fontSize: 34, opacity: 0.85 }}>{org.tagline} through data-driven research</div>
        </div>
        <div style={{ display: "flex", fontSize: 26, opacity: 0.7 }}>priresearch.in</div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
