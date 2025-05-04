import { db } from '$lib/server/db';
import { user, logs } from '$lib/server/db/schema'; // Import the logs table
import { eq } from 'drizzle-orm';

/**
 * Detects the operating system from the user agent string.
 * @param {string} userAgent - The user agent string from the request headers.
 * @returns {string} - The detected operating system.
 */
function detectOS(userAgent) {
  if (!userAgent) {
    return 'Unknown'; // Handle null or undefined userAgent
  }

  if (/Windows NT 10.0/i.test(userAgent)) {
    return 'Windows 10';
  }
  if (/Windows NT 6.3/i.test(userAgent)) {
    return 'Windows 8.1';
  }
  if (/Windows NT 6.2/i.test(userAgent)) {
    return 'Windows 8';
  }
  if (/Windows NT 6.1/i.test(userAgent)) {
    return 'Windows 7';
  }
  if (/Macintosh|Mac OS X/i.test(userAgent)) {
    return 'MacOS';
  }
  if (/Android/i.test(userAgent)) {
    return 'Android';
  }
  if (/Linux/i.test(userAgent)) {
    return 'Linux';
  }
  if (/iPhone|iPad|iPod/i.test(userAgent)) {
    return 'iOS';
  }
  return 'Unknown';
}

export async function POST({ request, cookies, getClientAddress }) {
  try {
    const { username, password } = await request.json();

    console.log('Login attempt:', { username }); // Debugging log

    // Validate input
    if (!username || !password) {
      console.error('Validation failed: Missing username or password');
      return new Response(JSON.stringify({ error: 'Username and password are required' }), { status: 400 });
    }

    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
    if (!usernameRegex.test(username)) {
      console.error('Validation failed: Invalid username format');
      return new Response(JSON.stringify({ error: 'Invalid username format' }), { status: 400 });
    }

    // Use parameterized queries to prevent SQL injection
    const result = await db
      .select()
      .from(user)
      .where(eq(user.username, username))
      .limit(1);

    console.log('Database query result:', result); // Debugging log

    if (result.length === 0 || result[0].password !== password) {
      console.error('Invalid credentials');
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 });
    }

    // Check if the user is disabled
    if (result[0].status === 'disable') {
      console.error('Login attempt for disabled user:', username);
      return new Response(JSON.stringify({ error: 'Your account is disabled. Please contact the administrator.' }), { status: 403 });
    }

    // Log user activity (only in development mode)
    const ip = getClientAddress(); // Get client IP address
    const userAgent = request.headers.get('user-agent') || ''; // Provide a default empty string
    const os = detectOS(userAgent); // Detect OS from user agent
    const time = new Date().toISOString();

    try {
      console.log('Logging user activity:', { username, ip, time, os, browser: userAgent || 'Unknown' }); // Debugging log
      await db.insert(logs).values({
        username,
        ip,
        time,
        os, // Save detected OS
        browser: userAgent || 'Unknown', // Save user agent string as browser
      });
      console.log('User activity logged successfully');
    } catch (logError) {
      console.error('Error logging user activity:', logError);
    }

    // Set session cookie
    cookies.set('session', username, {
      httpOnly: true, // Prevents client-side access
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
      sameSite: 'lax', // Ensures the cookie is sent with same-site requests
      secure: process.env.NODE_ENV !== 'development', // Use secure cookies only in production
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Error during login:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}