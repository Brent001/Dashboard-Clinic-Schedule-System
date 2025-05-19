import 'dotenv/config';
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema.js';
import bcrypt from 'bcrypt';

const client = createClient({
  url: process.env.DATABASE_URL ?? "",
  authToken: process.env.DATABASE_AUTH_TOKEN ?? ""
});
const db = drizzle(client, { schema });

async function main() {
  // Only insert the admin user if the table is empty
  const users = await db.select().from(schema.user);
  if (users.length === 0) {
    const hashedPassword = await bcrypt.hash('admin', 10); // Hash the password
    await db.insert(schema.user).values({
      username: 'admin',
      password: hashedPassword,
      role: 'temp',
      status: 'enable'
    });
    console.log('Temporary admin user created (password is hashed).');
  } else {
    console.log('User table not empty, skipping temp user creation.');
  }
  await client.close();
}

main().catch((err) => {
  console.error('Seed error:', err);
  client.close();
});