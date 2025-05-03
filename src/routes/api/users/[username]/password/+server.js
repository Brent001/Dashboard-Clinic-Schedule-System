import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export async function GET({ params }) {
  const { username } = params;

  try {
    const userRecord = await db.select().from(user).where(eq(user.username, username)).limit(1);
    if (userRecord.length === 0) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({ password: userRecord[0].password }), { status: 200 });
  } catch (error) {
    console.error('Error fetching password:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch password' }), { status: 500 });
  }
}