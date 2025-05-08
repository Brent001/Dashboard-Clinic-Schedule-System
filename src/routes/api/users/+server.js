// filepath: e:\Code\web\clinic-system-dashboard\src\lib\server\routes\users.js
import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm'; // Import the `eq` function

// Fetch all users
export async function GET() {
  try {
    const users = await db.select().from(user);
    return json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

// Delete a user
export async function DELETE({ request }) {
  try {
    const { username } = await request.json();
    console.log('DELETE request received:', { username }); // Debugging log

    if (!username) {
      return json({ error: 'Username is required' }, { status: 400 });
    }

    const result = await db.delete(user).where(eq(user.username, username));
    console.log('Database delete result:', result); // Debugging log

    if (result.rowsAffected === 0) {
      return json({ error: 'User not found' }, { status: 404 });
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting user:', error);
    return json({ error: 'Failed to delete user' }, { status: 500 });
  }
}

// Disable/Enable a user
export async function PATCH({ request }) {
  try {
    const { username, newUsername, newPassword, role, status } = await request.json();
    console.log('PATCH request received:', { username, newUsername, newPassword, role, status });

    if (!username) {
      return json({ error: 'Username is required' }, { status: 400 });
    }

    // Start with an empty updates object
    let updates = {};

    if (newUsername) {
      updates = { ...updates, username: newUsername };
    }

    if (newPassword) {
      updates = { ...updates, password: newPassword };
    }

    if (role) {
      updates = { ...updates, role };
    }

    if (status) {
      if (status !== 'enable' && status !== 'disable') {
        return json({ error: 'Invalid status value' }, { status: 400 });
      }
      updates = { ...updates, status };
    }

    const result = await db.update(user).set(updates).where(eq(user.username, username));

    if (result.rowsAffected === 0) {
      return json({ error: 'User not found' }, { status: 404 });
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Error updating user:', error);
    return json({ error: 'Failed to update user' }, { status: 500 });
  }
}

// Change a user's password (with validation)
export async function POST({ request }) {
  const { username, oldPassword, newPassword } = await request.json();

  if (!username || !oldPassword || !newPassword) {
    return new Response(JSON.stringify({ error: 'All fields are required.' }), { status: 400 });
  }

  // Validate the old password
  const userRecord = await db.select().from(user).where(eq(user.username, username)).limit(1);
  if (userRecord.length === 0 || userRecord[0].password !== oldPassword) {
    return new Response(JSON.stringify({ error: 'Old password is incorrect.' }), { status: 400 });
  }

  // Update the password
  await db.update(user).set({ password: newPassword }).where(eq(user.username, username));

  return new Response(JSON.stringify({ message: 'Password updated successfully.' }), { status: 200 });
}