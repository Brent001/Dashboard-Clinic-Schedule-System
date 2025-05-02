import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export async function GET({ cookies }) {
  const session = cookies.get('session');

  if (!session) {
    return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401 });
  }

  const result = await db
    .select()
    .from(user)
    .where(eq(user.username, session))
    .limit(1);

  if (result.length === 0) {
    return new Response(JSON.stringify({ error: 'Invalid session' }), { status: 401 });
  }

  // Include the role in the response
  return new Response(
    JSON.stringify({
      username: result[0].username,
      role: result[0].role, // Add the role field
    }),
    { status: 200 }
  );
}