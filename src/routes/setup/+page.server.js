import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export async function load({ cookies }) {
  const session = cookies.get('session');

  if (!session) {
    throw error(401, 'Unauthorized: You must be logged in as a temp user to access setup.');
  }

  const userResult = await db
    .select()
    .from(user)
    .where(eq(user.username, session ?? ''))
    .limit(1);

  // Only allow access if the user exists and has role 'temp'
  if (
    userResult.length === 0 ||
    userResult[0].role !== 'temp'
  ) {
    throw error(403, 'Forbidden: Only temp users can access the setup page.');
  }

  return {
    username: userResult[0].username,
    role: userResult[0].role
  };
}