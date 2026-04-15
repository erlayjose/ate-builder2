import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, ates, ATE, InsertATE } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
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

// ATE queries
export async function createATE(userId: number, data: Omit<InsertATE, 'userId'>): Promise<ATE | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create ATE: database not available");
    return null;
  }

  try {
    const result = await db.insert(ates).values({ ...data, userId } as InsertATE);
    const ateId = result[0].insertId;
    return await getATEById(ateId);
  } catch (error) {
    console.error("[Database] Failed to create ATE:", error);
    throw error;
  }
}

export async function getATEById(id: number): Promise<ATE | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get ATE: database not available");
    return null;
  }

  try {
    const result = await db.select().from(ates).where(eq(ates.id, id)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get ATE:", error);
    throw error;
  }
}

export async function updateATE(id: number, userId: number, data?: Record<string, any>): Promise<ATE | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update ATE: database not available");
    return null;
  }

  try {
    // Verify ownership
    const ate = await getATEById(id);
    if (!ate || ate.userId !== userId) {
      throw new Error("ATE not found or unauthorized");
    }

    if (data && Object.keys(data).length > 0) {
      await db.update(ates).set(data as Partial<InsertATE>).where(eq(ates.id, id));
    }
    return await getATEById(id);
  } catch (error) {
    console.error("[Database] Failed to update ATE:", error);
    throw error;
  }
}

export async function listATEsByUser(userId: number): Promise<ATE[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot list ATEs: database not available");
    return [];
  }

  try {
    return await db.select().from(ates).where(eq(ates.userId, userId)).orderBy(ates.updatedAt);
  } catch (error) {
    console.error("[Database] Failed to list ATEs:", error);
    throw error;
  }
}

export async function deleteATE(id: number, userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete ATE: database not available");
    return false;
  }

  try {
    // Verify ownership
    const ate = await getATEById(id);
    if (!ate || ate.userId !== userId) {
      throw new Error("ATE not found or unauthorized");
    }

    await db.delete(ates).where(eq(ates.id, id));
    return true;
  } catch (error) {
    console.error("[Database] Failed to delete ATE:", error);
    throw error;
  }
}
