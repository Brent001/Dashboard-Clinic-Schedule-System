import { redirect, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export async function load({ cookies }) {
  const session = cookies.get('session');

  if (!session) {
    throw redirect(302, '/login'); // Redirect to login if no session
  }

  // Fetch the user's role from the database
  const userResult = await db
    .select()
    .from(user)
    .where(eq(user.username, session))
    .limit(1);

  if (userResult.length === 0) {
    throw redirect(302, '/login'); // Redirect to login if session is invalid
  }

  const { role } = userResult[0];

  if (role !== 'superadmin') {
    throw error(404, 'Page not found'); // Return 404 for unauthorized users
  }

  return {
    username: userResult[0].username,
    role
  };
}