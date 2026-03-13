import { createOrUpdateUserBudget } from "@/app/actions/user-budgets";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const result = await createOrUpdateUserBudget(formData);
    
    if (result.success) {
      return Response.json({ success: true, budget: result.budget });
    } else {
      return Response.json({ success: false, error: "Failed to set budget" }, { status: 400 });
    }
  } catch (error) {
    console.error("API error:", error);
    return Response.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}
