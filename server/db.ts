import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, ates, type ATE } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ATE Functions
export async function createATE(userId: number, data: Omit<ATE, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(ates).values({
    userId,
    ...data,
  });

  return result;
}

export async function getATEById(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(ates)
    .where(eq(ates.id, id))
    .limit(1);

  if (result.length === 0) return null;
  if (result[0].userId !== userId) throw new Error("Unauthorized");
  return result[0];
}

export async function updateATE(id: number, userId: number, data: Partial<ATE>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await getATEById(id, userId);
  if (!existing) throw new Error("ATE not found");

  await db.update(ates).set(data).where(eq(ates.id, id));
  return await getATEById(id, userId);
}

export async function listATEsByUser(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.select().from(ates).where(eq(ates.userId, userId));
}

export async function deleteATE(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await getATEById(id, userId);
  if (!existing) throw new Error("ATE not found");

  await db.delete(ates).where(eq(ates.id, id));
}
