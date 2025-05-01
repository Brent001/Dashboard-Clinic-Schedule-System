import { db } from '$lib/server/db';
import { logs } from '$lib/server/db/schema';
import { desc } from 'drizzle-orm'; // Import the `desc` function

export async function GET() {
  try {
    const result = await db.select().from(logs).orderBy(desc(logs.time)); // Use `desc()` for descending order
    return new Response(JSON.stringify(result), { status: 200 });
  } catch (error) {
    console.error('Error fetching logs:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}