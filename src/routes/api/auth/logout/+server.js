import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export async function POST({ cookies }) {
  const session = cookies.get('session');

  if (!session) {
    return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401 });
  }

  try {
    // Clear the session in the database (if applicable)
    // Example: If you store sessions in a database, delete it here
    // await db.delete().from(sessions).where(eq(sessions.id, session));

    // Clear the session cookie
    cookies.delete('session', { path: '/' });

    return new Response(JSON.stringify({ message: 'Logged out successfully' }), { status: 200 });
  } catch (error) {
    console.error('Error during logout:', error);
    return new Response(JSON.stringify({ error: 'Failed to log out' }), { status: 500 });
  }
}