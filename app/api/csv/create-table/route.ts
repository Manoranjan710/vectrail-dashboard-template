import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const csvFile = formData.get("csvFile") as File;
    const tableName = formData.get("tableName") as string;

    if (!csvFile) {
      return NextResponse.json(
        { error: "No CSV file provided" },
        { status: 400 }
      );
    }

    if (!tableName) {
      return NextResponse.json(
        { error: "No table name provided" },
        { status: 400 }
      );
    }

    // Forward request to backend API
    const backendUrl = process.env.BACKEND_API_URL || "http://localhost:3000";
    const backendFormData = new FormData();
    backendFormData.append("csvFile", csvFile);
    backendFormData.append("tableName", tableName);

    const response = await fetch(`${backendUrl}/api/csv/create-table`, {
      method: "POST",
      body: backendFormData,
    });

    const responseData = await response.json();

    // Return the backend response with its status code
    return NextResponse.json(responseData, { status: response.status });
  } catch (error) {
    console.error("Error creating table:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to create table",
      },
      { status: 500 }
    );
  }
}
