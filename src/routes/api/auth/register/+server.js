import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export async function POST({ request }) {
  const { username, password } = await request.json();

  if (!username || !password) {
    return new Response(JSON.stringify({ error: 'Username and password are required.' }), { status: 400 });
  }

  // Check if the username already exists
  const existingUser = await db.select().from(user).where(eq(user.username, username)).limit(1);
  if (existingUser.length > 0) {
    return new Response(JSON.stringify({ error: 'Username already exists.' }), { status: 400 });
  }

  // Insert the new user into the database
  await db.insert(user).values({ username, password });

  return new Response(JSON.stringify({ message: 'Account created successfully.' }), { status: 201 });
}