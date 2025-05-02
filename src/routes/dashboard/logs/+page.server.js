import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export async function load({ cookies }) {
  const session = cookies.get('session');

  if (!session) {
    throw error(404, 'Page not found'); // Return 404 if no session
  }

  // Validate the session in the database
  const userResult = await db
    .select()
    .from(user)
    .where(eq(user.username, session))
    .limit(1);

  if (userResult.length === 0) {
    throw error(404, 'Page not found'); // Return 404 if session is invalid
  }

  return {
    username: userResult[0].username,
    role: userResult[0].role
  };
}