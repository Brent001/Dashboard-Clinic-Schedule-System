import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

export async function POST({ request }) {
  const { username, password, role } = await request.json();

  if (!username || !password || !role) {
    return new Response(JSON.stringify({ error: 'Username, password, and role are required.' }), { status: 400 });
  }

  // Prevent registration of the reserved username 'admin'
  if (username.trim().toLowerCase() === 'admin') {
    return new Response(JSON.stringify({ error: 'The username "admin" is reserved and cannot be registered.' }), { status: 400 });
  }

  if (role !== 'user' && role !== 'superadmin') {
    return new Response(JSON.stringify({ error: 'Invalid role.' }), { status: 400 });
  }

  // Check if the username already exists
  const existingUser = await db.select().from(user).where(eq(user.username, username)).limit(1);
  if (existingUser.length > 0) {
    return new Response(JSON.stringify({ error: 'Username already exists.' }), { status: 400 });
  }

  // Conditionally hash the password for superadmin, store plain text for user
  let storedPassword;
  if (role === 'superadmin') {
    storedPassword = await bcrypt.hash(password, 10); // Hash password for superadmin
  } else {
    storedPassword = password; // Store plain text password for user (not recommended)
  }

  // Insert the new user into the database
  await db.insert(user).values({ username, password: storedPassword, role });

  return new Response(JSON.stringify({ message: 'Account created successfully.' }), { status: 201 });
}