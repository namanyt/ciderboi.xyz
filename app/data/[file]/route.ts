import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

type Params = {
  file: string;
};

export async function GET(req: Request, { params }: { params: Params }) {
  const { file } = await params;
  const filePath = path.join(process.cwd(), "data", file);

  try {
    const jsonData = await fs.readFile(filePath, "utf8");
    const data = JSON.parse(jsonData);
    return NextResponse.json({ test: "abcd", data: data });
  } catch (error) {
    console.error("Error reading JSON file:\n", error);
    return NextResponse.json({ error: "Failed to read JSON file" }, { status: 500 });
  }
}
