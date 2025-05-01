import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export async function handle({ event, resolve }) {
  const session = event.cookies.get('session');

  if (session) {
    const result = await db
      .select()
      .from(user)
      .where(eq(user.username, session))
      .limit(1);

    if (result.length > 0) {
      event.locals.user = { username: result[0].username };
    } else {
      event.locals.user = null;
    }
  } else {
    event.locals.user = null;
  }

  // Redirect to login if the user is not authenticated and accessing a protected route
  if (!event.locals.user && event.url.pathname.startsWith('/login/dashboard')) {
    return new Response(null, {
      status: 302,
      headers: { Location: '/login' },
    });
  }

  return resolve(event);
}