import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { actionCounters } from "~/utils/actionCounters";
import { set } from "date-fns";


export const costRouter = createTRPCRouter({
    createExpense: publicProcedure
        .input(z.object({
            tripId: z.string(),
            description: z.string(),
            amount: z.number(),
            paidBy: z.string(),
            sharedWith: z.any(),
        }))
        .mutation(async ({ ctx, input }) => {
            const { tripId, description, amount, paidBy, sharedWith } = input;

            const expense = await ctx.db.expense.create({
                data: {
                    tripId,
                    description,
                    amount,
                    paidBy,
                    sharedWith,
                },
            });

            return expense;
        }),
    createPeople: publicProcedure
        .input(z.array(z.object({
            tripId: z.string(),
            name: z.string(),
        })))
        .mutation(async ({ ctx, input }) => {
            const people = await ctx.db.person.createMany({
                data: input,
            });

            return people;
        }),
    getExpenses: publicProcedure
        .input(z.object({
            tripId: z.string(),
        }))
        .query(async ({ ctx, input }) => {
            const { tripId } = input;

            const expenses = await ctx.db.expense.findMany({
                where: {
                    tripId,
                },
            });

            return expenses;
        }),
    getPeople: publicProcedure
        .input(z.object({
            tripId: z.string(),
        }))
        .query(async ({ ctx, input }) => {
            const { tripId } = input;

            const people = await ctx.db.person.findMany({
                where: {
                    tripId,
                },
            });

            return people;
        }),
    deleteExpense: publicProcedure
        .input(z.object({
            expenseId: z.string(),
        }))
        .mutation(async ({ ctx, input }) => {
            const { expenseId } = input;

            const expense = await ctx.db.expense.delete({
                where: {
                    id: expenseId,
                },
            });

            return expense;
        }),
    deletePerson: publicProcedure
        .input(z.object({
            personId: z.string(),
        }))
        .mutation(async ({ ctx, input }) => {
            const { personId } = input;

            const person = await ctx.db.person.delete({
                where: {
                    id: personId,
                },
            });

            return person;
        }),
})