import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export async function load({ cookies }) {
  const session = cookies.get('session');

  // Show 401 if no session is found
  if (!session) {
    throw error(401, 'Unauthorized: No session found');
  }

  // Fetch the user's role from the database
  const userResult = await db
    .select()
    .from(user)
    .where(eq(user.username, session))
    .limit(1);

  // Show 401 if the session is invalid
  if (userResult.length === 0) {
    throw error(401, 'Unauthorized: Invalid session');
  }

  const { role } = userResult[0];

  // Show 403 if the user is not a superadmin
  if (role !== 'superadmin') {
    throw error(403, 'Forbidden: Access denied');
  }

  // Return the username and role for use in the page
  return {
    username: userResult[0].username,
    role
  };
}