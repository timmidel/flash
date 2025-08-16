import { generateRationalesForQuestions } from "@/app/services/rationaleGeneratorService";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { documentId, rationaleImageIndices } = await req.json();

    await generateRationalesForQuestions(documentId, rationaleImageIndices);

    return NextResponse.json({
      success: true,
      message: "Rationales generated successfully.",
    });
  } catch (error) {
    console.error("Error generating rationales:", error);
    return NextResponse.json(
      { success: false, message: "Failed to generate rationales." },
      { status: 500 }
    );
  }
}
