import { redirect, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

/** @type {import('./$types').PageServerLoad} */
export async function load({ cookies }) {
    const session = cookies.get('session');

    if (!session) {
        throw error(401, 'Unauthorized: No session found');
    }

    // Fetch the user's role from the database
    const userResult = await db
        .select()
        .from(user)
        .where(eq(user.username, session))
        .limit(1);

    if (userResult.length === 0) {
        throw redirect(302, '/login');
    }

    const { role } = userResult[0];

    // Block temp users from accessing the dashboard
    if (role === 'temp') {
        throw error(403, 'Forbidden: Temp users cannot access the dashboard');
    }

    return {
        username: userResult[0].username,
        role
    };
}