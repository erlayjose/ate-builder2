import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { createATE, getATEById, updateATE, listATEsByUser, deleteATE } from "./db";
import { z } from "zod";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  ate: router({
    create: protectedProcedure
      .input(
        z.object({
          teacherName: z.string().min(1),
          institution: z.string().min(1),
          ateName: z.string().min(1),
          grade: z.string().optional(),
          componente: z.string().optional(),
          tipo: z.string().default("Producto"),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const ateData = {
          teacherName: input.teacherName,
          institution: input.institution,
          ateName: input.ateName,
          grade: input.grade || "",
          componente: input.componente || "",
          tipo: input.tipo,
          situacionProblema: "",
          analisisEntorno: "",
          vinculacionIntereses: "",
          objetivosAprendizaje: "",
          contenidosDisciplinares: "",
          articulacionCurriculo: "",
          secuenciacion: "",
          estrategias: "",
          rolesYTiempos: "",
          ejecucion: "",
          mediacionDocente: "",
          acompanamiento: "",
          tipoEvaluacion: "",
          criteriosEvaluacion: "",
          instrumentosEvaluacion: "",
          reflexionRetroalimentacion: "",
          fase1Completed: 0,
          fase2Completed: 0,
          fase3Completed: 0,
          fase4Completed: 0,
          fase5Completed: 0,
        };
        return await createATE(ctx.user.id, ateData);
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const ate = await getATEById(input.id, ctx.user.id);
        if (!ate) {
          throw new Error("ATE not found or unauthorized");
        }
        return ate;
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      return await listATEsByUser(ctx.user.id);
    }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          data: z.record(z.string(), z.any()),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return await updateATE(input.id, ctx.user.id, input.data as any);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return await deleteATE(input.id, ctx.user.id);
      }),
  }),
});

export type AppRouter = typeof appRouter;
