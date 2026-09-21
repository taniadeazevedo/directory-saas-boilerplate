import { ImageResponse } from "next/og";
import { getListingBySlug } from "@/lib/data";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: { slug: string } }) {
  const listing = await getListingBySlug(params.slug);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #111827 0%, #1f2937 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 28, opacity: 0.7 }}>Directory</div>
        <div style={{ display: "flex", fontSize: 64, fontWeight: 700, marginTop: 24, maxWidth: 900 }}>
          {listing?.title ?? "Listado"}
        </div>
        <div style={{ display: "flex", fontSize: 28, opacity: 0.8, marginTop: 24, maxWidth: 850 }}>
          {listing?.description?.slice(0, 120) ?? ""}
        </div>
      </div>
    ),
    { ...size },
  );
}
