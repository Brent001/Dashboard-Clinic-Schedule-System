import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export async function load({ cookies }) {
  const session = cookies.get('session');

  // Helper to clear session and redirect
  function logoutAndRedirect() {
    cookies.set('session', '', {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      maxAge: 0
    });
    throw redirect(302, '/');
  }

  if (!session) {
    logoutAndRedirect();
  }

  // session is now guaranteed to be a string
  const userResult = await db
    .select()
    .from(user)
    .where(eq(user.username, session ?? '')) // fallback to empty string if somehow undefined
    .limit(1);

  // Only allow access if the user exists and has role 'temp'
  if (
    userResult.length === 0 ||
    userResult[0].role !== 'temp'
  ) {
    logoutAndRedirect();
  }

  return {
    username: userResult[0].username,
    role: userResult[0].role
  };
}