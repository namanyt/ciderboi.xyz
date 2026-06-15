import { NextResponse } from "next/server";
import { getSearchIndexPayload } from "@/lib/content/search";

export const dynamic = "force-static";

export async function GET() {
  return NextResponse.json(await getSearchIndexPayload(), {
    headers: {
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
