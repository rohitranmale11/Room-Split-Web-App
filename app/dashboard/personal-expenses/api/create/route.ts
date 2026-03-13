import { createPersonalExpense } from "@/app/actions/personal-expenses";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const result = await createPersonalExpense(formData);
    
    if (result.success) {
      return Response.json({ success: true, expense: result.expense });
    } else {
      return Response.json({ success: false, error: "Failed to create expense" }, { status: 400 });
    }
  } catch (error) {
    console.error("API error:", error);
    return Response.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}
