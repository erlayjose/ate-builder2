import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
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

/**
 * ATE (Actividad Tecnológica Escolar) table for storing teacher projects
 */
export const ates = mysqlTable("ates", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Información general
  teacherName: varchar("teacherName", { length: 255 }).notNull(),
  institution: varchar("institution", { length: 255 }).notNull(),
  ateName: varchar("ateName", { length: 255 }).notNull(),
  grade: varchar("grade", { length: 50 }),
  competencia: varchar("competencia", { length: 255 }),
  tipo: mysqlEnum("tipo", ["producto", "proceso", "sistema"]).default("producto").notNull(),
  
  // Fase 1: Identificación del problema
  fase1Problema: text("fase1Problema"),
  fase1Contexto: text("fase1Contexto"),
  fase1PreguntaOrientadora: text("fase1PreguntaOrientadora"),
  fase1Importancia: text("fase1Importancia"),
  fase1Completed: int("fase1Completed").default(0).notNull(),
  
  // Fase 2: Exploración y documentación
  fase2Investigacion: text("fase2Investigacion"),
  fase2Ideas: text("fase2Ideas"),
  fase2MejorIdea: text("fase2MejorIdea"),
  fase2Justificacion: text("fase2Justificacion"),
  fase2Completed: int("fase2Completed").default(0).notNull(),
  
  // Fase 3: Diseño de la solución
  fase3DescripcionSolucion: text("fase3DescripcionSolucion"),
  fase3CriteriosDiseño: text("fase3CriteriosDiseño"),
  fase3Materiales: text("fase3Materiales"),
  fase3Herramientas: text("fase3Herramientas"),
  fase3Esquema: text("fase3Esquema"),
  fase3Completed: int("fase3Completed").default(0).notNull(),
  
  // Fase 4: Planeación y construcción
  fase4Planificacion: text("fase4Planificacion"),
  fase4Pasos: text("fase4Pasos"),
  fase4Cronograma: text("fase4Cronograma"),
  fase4Responsables: text("fase4Responsables"),
  fase4Desafios: text("fase4Desafios"),
  fase4Avances: text("fase4Avances"),
  fase4Completed: int("fase4Completed").default(0).notNull(),
  
  // Fase 5: Evaluación y mejora
  fase5Funcionamiento: text("fase5Funcionamiento"),
  fase5ErroresEncontrados: text("fase5ErroresEncontrados"),
  fase5Mejoras: text("fase5Mejoras"),
  fase5Resultados: text("fase5Resultados"),
  fase5CriteriosEvaluacion: text("fase5CriteriosEvaluacion"),
  fase5Completed: int("fase5Completed").default(0).notNull(),
  
  // Fase 6: Comunicación y socialización
  fase6DescripcionFinal: text("fase6DescripcionFinal"),
  fase6AudienciaDestino: text("fase6AudienciaDestino"),
  fase6FormatoPresentacion: text("fase6FormatoPresentacion"),
  fase6MensajePrincipal: text("fase6MensajePrincipal"),
  fase6Aprendizajes: text("fase6Aprendizajes"),
  fase6Impacto: text("fase6Impacto"),
  fase6Completed: int("fase6Completed").default(0).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ATE = typeof ates.$inferSelect;
export type InsertATE = typeof ates.$inferInsert;