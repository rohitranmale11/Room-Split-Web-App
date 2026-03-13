import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'expense';

  try {
    const categories = await db.category.findMany({
      where: {
        type: type,
        roomId: null, // Only get global categories
      },
      orderBy: { name: 'asc' },
    });

    return Response.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return Response.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}
