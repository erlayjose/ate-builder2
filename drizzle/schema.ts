import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ATE Table - Actividades Tecnológicas Escolares
export const ates = mysqlTable("ates", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Información General
  teacherName: varchar("teacherName", { length: 255 }).notNull(),
  institution: varchar("institution", { length: 255 }).notNull(),
  ateName: varchar("ateName", { length: 255 }).notNull(),
  grade: varchar("grade", { length: 100 }),
  componente: varchar("componente", { length: 255 }).notNull(),
  tipo: varchar("tipo", { length: 100 }).notNull(),
  
  // FASE 1: CONTEXTUALIZACIÓN
  situacionProblema: text("situacionProblema"),
  analisisEntorno: text("analisisEntorno"),
  vinculacionIntereses: text("vinculacionIntereses"),
  
  // FASE 2: FUNDAMENTACIÓN
  objetivosAprendizaje: text("objetivosAprendizaje"),
  contenidosDisciplinares: text("contenidosDisciplinares"),
  articulacionCurriculo: text("articulacionCurriculo"),
  
  // FASE 3: DISEÑO DIDÁCTICO
  secuenciacion: text("secuenciacion"),
  estrategias: text("estrategias"),
  rolesYTiempos: text("rolesYTiempos"),
  
  // FASE 4: IMPLEMENTACIÓN
  ejecucion: text("ejecucion"),
  mediacionDocente: text("mediacionDocente"),
  acompanamiento: text("acompanamiento"),
  
  // FASE 5: EVALUACIÓN
  tipoEvaluacion: text("tipoEvaluacion"),
  criteriosEvaluacion: text("criteriosEvaluacion"),
  instrumentosEvaluacion: text("instrumentosEvaluacion"),
  reflexionRetroalimentacion: text("reflexionRetroalimentacion"),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ATE = typeof ates.$inferSelect;
export type InsertATE = typeof ates.$inferInsert;
