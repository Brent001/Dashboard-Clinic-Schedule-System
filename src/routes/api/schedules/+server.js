import { db } from '$lib/server/db'; // Adjust the path to your database connection
import { schedules } from '$lib/server/db/schema'; // Import the schedules table schema
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto'; // Import for generating unique IDs

export async function GET() {
  try {
    const allSchedules = await db.select().from(schedules);
    return new Response(JSON.stringify(allSchedules), { status: 200 });
  } catch (error) {
    console.error('Error fetching schedules:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch schedules' }), { status: 500 });
  }
}

export async function POST({ request }) {
  try {
    let { id, purpose, date, time, message } = await request.json();

    console.log('Incoming data for POST:', { id, purpose, date, time, message }); // Debugging log

    // Generate a unique ID if not provided
    if (!id) {
      id = randomUUID();
    }

    // Validate the input
    if (!purpose || !date || !time || !message) {
      console.error('Validation failed: Missing fields');
      return new Response(JSON.stringify({ error: 'All fields are required' }), { status: 400 });
    }

    // Insert the schedule into the database
    await db.insert(schedules).values({ id, purpose, date, time, message });

    return new Response(JSON.stringify({ success: true, id }), { status: 201 });
  } catch (error) {
    console.error('Error creating schedule:', error);
    return new Response(JSON.stringify({ error: 'Failed to create schedule' }), { status: 500 });
  }
}

export async function DELETE({ request }) {
  try {
    const { id } = await request.json();

    if (!id) {
      return new Response(JSON.stringify({ error: 'Schedule ID is required' }), { status: 400 });
    }

    await db.delete(schedules).where(eq(schedules.id, id));
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete schedule' }), { status: 500 });
  }
}

export async function PATCH({ request }) {
  try {
    const { id, purpose, date, time, message } = await request.json();

    console.log('Incoming data for PATCH:', { id, purpose, date, time, message }); // Debugging log

    if (!id || !purpose || !date || !time || !message) {
      console.error('Validation failed: Missing fields');
      return new Response(JSON.stringify({ error: 'All fields are required' }), { status: 400 });
    }

    const result = await db
      .update(schedules)
      .set({ purpose, date, time, message })
      .where(eq(schedules.id, id));
    console.log('Database update result:', result); // Debugging log

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Error updating schedule:', error);
    return new Response(JSON.stringify({ error: 'Failed to update schedule' }), { status: 500 });
  }
}