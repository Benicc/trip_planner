import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { actionCounters } from "~/utils/actionCounters";
import { set } from "date-fns";
import TripPopup from "~/components/createTrip";
import { v4 as uuidv4 } from 'uuid';


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
        .input(z.object({
            people: z.array(z.string()),
            tripId: z.string()
        }))
        .mutation(async ({ ctx, input }) => {
            const { people, tripId } = input;
            const newPeople = await ctx.db.person.createMany({
                data: input.people.map((person) => ({
                    name: person,
                    tripId: tripId,
                    personId: String(uuidv4()),
                })),
            });

            return newPeople;
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
    deletePeople: publicProcedure
        .input(z.array(z.string()))
        .mutation(async ({ ctx, input }) => {
            const person = await ctx.db.person.deleteMany({
                where: {
                    personId: {
                        in: input,
                    },
                },
            });

            return person;
        }),
    updateExpense: publicProcedure
        .input(z.object({
            id: z.string(),
            description: z.string(),
            amount: z.number(),
            paidBy: z.string(),
            sharedWith: z.any(),
        }))
        .mutation(async ({ ctx, input }) => {
            const {id, description, amount, paidBy, sharedWith } = input;

            const expense = await ctx.db.expense.update({
                where: {
                    id,
                },
                data: {
                    description,
                    amount,
                    paidBy,
                    sharedWith,
                },
            });

            return expense;
        }),
})