import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { createATE, getATEById, updateATE, listATEsByUser, deleteATE } from "./db";
import { z } from "zod";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
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
          competencia: z.string().optional(),
          tipo: z.enum(["producto", "proceso", "sistema"]).default("producto"),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const ateData = {
          teacherName: input.teacherName,
          institution: input.institution,
          ateName: input.ateName,
          grade: input.grade || null,
          competencia: input.competencia || null,
          tipo: input.tipo,
        };
        return await createATE(ctx.user.id, ateData);
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const ate = await getATEById(input.id);
        if (!ate || ate.userId !== ctx.user.id) {
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
          data: z.record(z.string(), z.any()).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return await updateATE(input.id, ctx.user.id, input.data);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return await deleteATE(input.id, ctx.user.id);
      }),
  }),
});

export type AppRouter = typeof appRouter;
