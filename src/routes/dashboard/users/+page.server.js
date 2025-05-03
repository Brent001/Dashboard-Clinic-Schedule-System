import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export async function load({ cookies }) {
  const session = cookies.get('session');

  // Show 404 if no session is found
  if (!session) {
    throw error(404, 'Page not found'); // Return 404 for unauthenticated users
  }

  // Fetch the user's role from the database
  const userResult = await db
    .select()
    .from(user)
    .where(eq(user.username, session))
    .limit(1);

  // Show 404 if the session is invalid
  if (userResult.length === 0) {
    throw error(404, 'Page not found'); // Return 404 for invalid sessions
  }

  const { role } = userResult[0];

  // Show 404 if the user is not a superadmin
  if (role !== 'superadmin') {
    throw error(404, 'Page not found'); // Return 404 for unauthorized users
  }

  // Return the username and role for use in the page
  return {
    username: userResult[0].username,
    role
  };
}