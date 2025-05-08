import { db } from '$lib/server/db';
import { user, logs } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

/**
 * Detects the operating system from the user agent string.
 * @param {string} userAgent - The user agent string from the request headers.
 * @returns {string} - The detected operating system.
 */
function detectOS(userAgent) {
  if (!userAgent) return 'Unknown';

  if (/Windows NT 10.0/i.test(userAgent)) return 'Windows 10';
  if (/Windows NT 6.3/i.test(userAgent)) return 'Windows 8.1';
  if (/Windows NT 6.2/i.test(userAgent)) return 'Windows 8';
  if (/Windows NT 6.1/i.test(userAgent)) return 'Windows 7';
  if (/Macintosh|Mac OS X/i.test(userAgent)) return 'MacOS';
  if (/Android/i.test(userAgent)) return 'Android';
  if (/Linux/i.test(userAgent)) return 'Linux';
  if (/iPhone|iPad|iPod/i.test(userAgent)) return 'iOS';
  return 'Unknown';
}

export async function POST({ request, cookies, getClientAddress }) {
  try {
    let { username, password } = await request.json();

    console.log('Login attempt:', { username });

    // Validate input
    if (!username || !password) {
      return new Response(JSON.stringify({ error: 'Username and password are required' }), { status: 400 });
    }

    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
    if (!usernameRegex.test(username)) {
      return new Response(JSON.stringify({ error: 'Invalid username format' }), { status: 400 });
    }

    // Sanitize username
    username = username.trim();

    // Fetch user from the database
    const result = await db.select().from(user).where(eq(user.username, username)).limit(1);

    if (result.length === 0) {
      console.warn(`Failed login attempt for username: ${username} from IP: ${getClientAddress()}`);
      return new Response(JSON.stringify({ error: 'Invalid username or password' }), { status: 401 });
    }

    const userRecord = result[0];

    // Check if the password is plain text or hashed
    const isPasswordValid =
      userRecord.password === password || // Plain-text password check
      (await bcrypt.compare(password, userRecord.password)); // Hashed password check

    if (!isPasswordValid) {
      console.warn(`Failed login attempt for username: ${username} from IP: ${getClientAddress()}`);
      return new Response(JSON.stringify({ error: 'Invalid username or password' }), { status: 401 });
    }

    // Check if the user is disabled
    if (userRecord.status === 'disable') {
      return new Response(JSON.stringify({ error: 'Your account is disabled. Please contact the administrator.' }), { status: 403 });
    }

    // If the password is plain text, hash it and update the database
    if (userRecord.password === password && userRecord.role === 'superadmin') {
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.update(user).set({ password: hashedPassword }).where(eq(user.username, username));
      console.log(`Password for user ${username} has been hashed and updated.`);
    }

    // Log user activity
    const ip = getClientAddress();
    const userAgent = request.headers.get('user-agent') || '';
    const os = detectOS(userAgent);
    const time = new Date().toISOString();

    try {
      await db.insert(logs).values({
        username,
        ip,
        time,
        os,
        browser: userAgent || 'Unknown',
      });
    } catch (logError) {
      console.error('Error logging user activity:', logError);
    }

    // Set session cookie
    cookies.set('session', username, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
      sameSite: 'lax',
      secure: process.env.NODE_ENV !== 'development',
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Error during login:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}