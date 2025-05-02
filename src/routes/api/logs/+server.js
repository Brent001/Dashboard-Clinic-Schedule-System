import { db } from '$lib/server/db';
import { logs, user } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET({ cookies }) {
  const session = cookies.get('session');

  if (!session) {
    return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401 });
  }

  // Fetch the user's role and username from the session
  const userResult = await db
    .select()
    .from(user)
    .where(eq(user.username, session))
    .limit(1);

  if (userResult.length === 0) {
    return new Response(JSON.stringify({ error: 'Invalid session' }), { status: 401 });
  }

  const { username, role } = userResult[0];

  // Fetch logs based on the user's role
  let logsResult;
  if (role === 'superadmin') {
    // Superadmin can see all logs
    logsResult = await db.select().from(logs).orderBy(desc(logs.time));
  } else {
    // Regular users can only see their own logs
    logsResult = await db.select().from(logs).where(eq(logs.username, username)).orderBy(desc(logs.time));
  }

  return new Response(JSON.stringify(logsResult), { status: 200 });
}