import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { v4 as uuidv4 } from 'uuid';


export const dbRouter = createTRPCRouter( {
    createTrip: publicProcedure
        .input(
            z.object({
                tripName: z.string(),
                destination: z.string(),
                startDate: z.string(),
                endDate: z.string(),
            })
        )
        .mutation(async ({input, ctx}) => {
            const {tripName, destination, startDate, endDate} = input;

            const newTrip = await ctx.db.trip.create({
                data: {
                  tripId: String(uuidv4()),
                  tripName,
                  destination,
                  startDate,
                  endDate,
                  messages: [],
                  backendMessages: [],
                  historyString: "",
                },
              });

            return newTrip;

        }),
    saveAssistant: publicProcedure
        .input(
            z.object({
                  tripId: z.string(),
                  messages: z.any(),
                  backendMessages: z.any(),
                  historyString: z.string(),
                  events: z.any(),
                  changed: z.boolean(),
            })
        )
        .mutation (async ({input, ctx}) => {
            const {tripId, messages, backendMessages, historyString, events, changed} = input;

            const saveAssistant = await ctx.db.trip.update({
                where: {tripId},
                data: {
                    messages,
                    backendMessages,
                    historyString,
                    events,
                    changed,
                },
            });

            return saveAssistant;
        }),
    getAssistantData: publicProcedure
        .input(
            z.string()
        ).query (async ({input, ctx}) => {
            const AssistantData = await ctx.db.trip.findUnique({
                where: {
                    tripId: input,
                },
                select: {
                    messages: true,
                    backendMessages: true,
                    historyString: true,
                    events: true,
                    changed: true,
                },
            });

            return AssistantData;

        }),
    getTrips: publicProcedure.query(async ({ ctx }) => {
        // Fetch all baseIds for the current user from the database
        const trips = await ctx.db.trip.findMany({
            select: {
                tripId: true,
                tripName: true,
            },
        });
        // Return a list of baseIds
        return trips;
        }),
    createPlan: publicProcedure
        .input(
            z.object({
                tripId: z.string(),
                planName: z.string(),
                planType: z.string(),
                date: z.string(),
                colour: z.string(),
                startTime: z.string(),
                endTime: z.string(),
                additional: z.record(z.any())
            })
        )
        .mutation (async ({input, ctx}) => {
            const {tripId, planName, planType, date, colour, startTime, endTime, additional} = input;

            const newPlan = await ctx.db.plan.create({
                data: {
                  tripId,
                  planId: String(uuidv4()),
                  planName,
                  planType,
                  date,
                  colour,
                  startTime,
                  endTime,
                  additional,
                },
              });

            return newPlan;
        }),
    createPlans: publicProcedure
        .input(
            z.object({
                tripId: z.string(),
                plans: z.array(
                    z.object({
                        planName: z.string(),
                        planType: z.string(),
                        date: z.string(),
                        colour: z.string(),
                        startTime: z.string(),
                        endTime: z.string(),
                    })
                )
            })
        )
        .mutation (async ({input, ctx}) => {
            const {tripId, plans} = input;

            // const createdPlans = await Promise.all(
            //     plans.map(async (plan) => {
            //         await ctx.db.plan.create({
            //             data: {
            //                 tripId,
            //                 planId: String(uuidv4()),
            //                 planName: plan.planName,
            //                 planType: plan.planType,
            //                 date: plan.date,
            //                 colour: plan.colour,
            //                 startTime: plan.startTime,
            //                 endTime: plan.endTime,
            //                 additional: {},
            //             },
            //         });

            //         return plan;
            //     })
            // )

            const createdPlans = await ctx.db.plan.createMany({
                data: plans.map((plan) => ({
                    tripId,
                    planId: String(uuidv4()),
                    planName: plan.planName,
                    planType: plan.planType,
                    date: plan.date,
                    colour: plan.colour,
                    startTime: plan.startTime,
                    endTime: plan.endTime,
                    additional: {},

                })),
            });

            return createdPlans;
        }),
    getPlans: publicProcedure
        .input(
            z.string()
        )
        .query(async ({ctx, input}) => {
            const plans = await ctx.db.plan.findMany({
                where: {
                    tripId: input,
                },
                select: {
                    planId: true,
                    planName: true,
                    colour: true,
                    planType: true,
                    date: true,
                    startTime: true,
                    endTime: true,
                    additional: true,
                },
            });

            return plans
        }),
    deletePlan: publicProcedure
        .input(
        z.object({
            planId: z.string(), // planId is required for deletion
        })
        )
        .mutation(async ({ input, ctx }) => {
        const { planId } = input;

        // Check if the plan exists and belongs to the current user
        const existingPlan = await ctx.db.plan.findFirst({
            where: {
                planId,
            },
        });

        if (!existingPlan) {
            throw new Error("Plan not found or you do not have access.");
        }

        // Delete the plan from the database
        await ctx.db.plan.delete({
            where: { planId },
        });

        return { message: "Plan deleted successfully" };
        }),
    deletePlans: publicProcedure
        .input(
            z.string()
        )
        .mutation(async ({input, ctx}) => {
            const tripId = input;

            const deletedPlans = await ctx.db.plan.deleteMany({
                where: {
                    tripId,
                },
            });

            return deletedPlans;
        }),
    updatePlan: publicProcedure
        .input(
            z.object({
                tripId: z.string(),
                planId: z.string(),
                planName: z.string(),
                planType: z.string(),
                date: z.string(),
                colour: z.string(),
                startTime: z.string(),
                endTime: z.string(),
                additional: z.record(z.any())
            })
        )
        .mutation (async ({input, ctx}) => {
            const {tripId, planId, planName, planType, date, colour, startTime, endTime, additional} = input;

            const updatePlan = await ctx.db.plan.update({
                where: {planId},
                data: {
                    tripId,
                    planId,
                    planName,
                    planType,
                    date,
                    colour,
                    startTime,
                    endTime,
                    additional,
                },
            });

            return updatePlan;
        }),

})