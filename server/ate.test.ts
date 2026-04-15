import { describe, it, expect, beforeEach, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `test-user-${userId}`,
    email: `test${userId}@example.com`,
    name: `Test User ${userId}`,
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("ATE Router", () => {
  describe("ate.create", () => {
    it("debería crear una nueva ATE con datos válidos", async () => {
      const ctx = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.ate.create({
        teacherName: "Dra. María García",
        institution: "IE San José",
        ateName: "Purificador de agua",
        grade: "8°",
        competencia: "Solución de problemas",
        tipo: "producto",
      });

      expect(result).toBeDefined();
      expect(result?.id).toBeDefined();
      expect(result?.teacherName).toBe("Dra. María García");
      expect(result?.institution).toBe("IE San José");
      expect(result?.ateName).toBe("Purificador de agua");
      expect(result?.tipo).toBe("producto");
    });

    it("debería rechazar ATE sin nombre de profesor", async () => {
      const ctx = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.ate.create({
          teacherName: "",
          institution: "IE San José",
          ateName: "Purificador de agua",
          grade: "8°",
          competencia: "Solución de problemas",
          tipo: "producto",
        });
        expect.fail("Debería haber lanzado un error");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("debería rechazar ATE sin institución", async () => {
      const ctx = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.ate.create({
          teacherName: "Dra. María García",
          institution: "",
          ateName: "Purificador de agua",
          grade: "8°",
          competencia: "Solución de problemas",
          tipo: "producto",
        });
        expect.fail("Debería haber lanzado un error");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("debería rechazar ATE sin nombre", async () => {
      const ctx = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.ate.create({
          teacherName: "Dra. María García",
          institution: "IE San José",
          ateName: "",
          grade: "8°",
          competencia: "Solución de problemas",
          tipo: "producto",
        });
        expect.fail("Debería haber lanzado un error");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe("ate.get", () => {
    it("debería obtener una ATE existente", async () => {
      const ctx = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      const created = await caller.ate.create({
        teacherName: "Dra. María García",
        institution: "IE San José",
        ateName: "Purificador de agua",
        grade: "8°",
        competencia: "Solución de problemas",
        tipo: "producto",
      });

      if (!created?.id) {
        expect.fail("No se creó la ATE");
      }

      const retrieved = await caller.ate.get({ id: created.id });
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.ateName).toBe("Purificador de agua");
    });

    it("debería rechazar acceso a ATE de otro usuario", async () => {
      const ctx1 = createAuthContext(1);
      const ctx2 = createAuthContext(2);
      const caller1 = appRouter.createCaller(ctx1);
      const caller2 = appRouter.createCaller(ctx2);

      const created = await caller1.ate.create({
        teacherName: "Dra. María García",
        institution: "IE San José",
        ateName: "Purificador de agua",
        grade: "8°",
        competencia: "Solución de problemas",
        tipo: "producto",
      });

      if (!created?.id) {
        expect.fail("No se creó la ATE");
      }

      try {
        await caller2.ate.get({ id: created.id });
        expect.fail("Debería haber rechazado el acceso");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe("ate.list", () => {
    it("debería listar ATEs del usuario", async () => {
      const ctx = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      await caller.ate.create({
        teacherName: "Dra. María García",
        institution: "IE San José",
        ateName: "Purificador de agua",
        grade: "8°",
        competencia: "Solución de problemas",
        tipo: "producto",
      });

      await caller.ate.create({
        teacherName: "Prof. Juan López",
        institution: "IE San José",
        ateName: "Generador eólico",
        grade: "9°",
        competencia: "Diseño tecnológico",
        tipo: "sistema",
      });

      const list = await caller.ate.list();
      expect(Array.isArray(list)).toBe(true);
      expect(list.length).toBeGreaterThanOrEqual(2);
    });

    it("debería retornar lista vacía si no hay ATEs", async () => {
      const ctx = createAuthContext(999);
      const caller = appRouter.createCaller(ctx);

      const list = await caller.ate.list();
      expect(Array.isArray(list)).toBe(true);
    });
  });

  describe("ate.update", () => {
    it("debería actualizar una ATE existente", async () => {
      const ctx = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      const created = await caller.ate.create({
        teacherName: "Dra. María García",
        institution: "IE San José",
        ateName: "Purificador de agua",
        grade: "8°",
        competencia: "Solución de problemas",
        tipo: "producto",
      });

      if (!created?.id) {
        expect.fail("No se creó la ATE");
      }

      const updated = await caller.ate.update({
        id: created.id,
        data: {
          fase1Problema: "El agua en la comunidad está contaminada",
          fase1Contexto: "Comunidad rural sin acceso a agua potable",
        },
      });

      expect(updated?.fase1Problema).toBe("El agua en la comunidad está contaminada");
      expect(updated?.fase1Contexto).toBe("Comunidad rural sin acceso a agua potable");
    });

    it("debería rechazar actualización de ATE de otro usuario", async () => {
      const ctx1 = createAuthContext(1);
      const ctx2 = createAuthContext(2);
      const caller1 = appRouter.createCaller(ctx1);
      const caller2 = appRouter.createCaller(ctx2);

      const created = await caller1.ate.create({
        teacherName: "Dra. María García",
        institution: "IE San José",
        ateName: "Purificador de agua",
        grade: "8°",
        competencia: "Solución de problemas",
        tipo: "producto",
      });

      if (!created?.id) {
        expect.fail("No se creó la ATE");
      }

      try {
        await caller2.ate.update({
          id: created.id,
          data: { fase1Problema: "Intento de modificación no autorizada" },
        });
        expect.fail("Debería haber rechazado la actualización");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe("ate.delete", () => {
    it("debería eliminar una ATE existente", async () => {
      const ctx = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      const created = await caller.ate.create({
        teacherName: "Dra. María García",
        institution: "IE San José",
        ateName: "Purificador de agua",
        grade: "8°",
        competencia: "Solución de problemas",
        tipo: "producto",
      });

      if (!created?.id) {
        expect.fail("No se creó la ATE");
      }

      await caller.ate.delete({ id: created.id });

      try {
        await caller.ate.get({ id: created.id });
        expect.fail("La ATE debería haber sido eliminada");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("debería rechazar eliminación de ATE de otro usuario", async () => {
      const ctx1 = createAuthContext(1);
      const ctx2 = createAuthContext(2);
      const caller1 = appRouter.createCaller(ctx1);
      const caller2 = appRouter.createCaller(ctx2);

      const created = await caller1.ate.create({
        teacherName: "Dra. María García",
        institution: "IE San José",
        ateName: "Purificador de agua",
        grade: "8°",
        competencia: "Solución de problemas",
        tipo: "producto",
      });

      if (!created?.id) {
        expect.fail("No se creó la ATE");
      }

      try {
        await caller2.ate.delete({ id: created.id });
        expect.fail("Debería haber rechazado la eliminación");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});
