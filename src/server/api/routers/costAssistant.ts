import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { actionCounters } from "~/utils/actionCounters";
import { set } from "date-fns";
import TripPopup from "~/components/createTrip";
import { v4 as uuidv4 } from 'uuid';


export const costAssistantRouter = createTRPCRouter({
    updateAssistant: publicProcedure
        .input(z.object({
            tripId: z.string(),
            costMessages: z.array(z.any()),
            costBackendMessages: z.array(z.any()),
            costPeople: z.array(z.any()),
            costExpenses: z.array(z.any()),
            costHistoryString: z.string(),
            costChanged: z.boolean(),
        }))
        .mutation(async ({ ctx, input }) => {
            const { tripId, costMessages, costBackendMessages, costPeople, costExpenses, costHistoryString, costChanged } = input;

            const assistant = await ctx.db.trip.update({
                where: {
                    tripId,
                },
                data: {
                    costMessages,
                    costBackendMessages,
                    costPeople,
                    costExpenses,
                    costHistoryString,
                    costChanged,
                },
            });

            return assistant;
        }),
    getAssistantData: publicProcedure
        .input(z.object({
            tripId: z.string(),
        }))
        .query(async ({ ctx, input }) => {
            const { tripId } = input;

            const assistant = await ctx.db.trip.findUnique({
                where: {
                    tripId,
                },
                select: {
                    costMessages: true,
                    costBackendMessages: true,
                    costPeople: true,
                    costExpenses: true,
                    costHistoryString: true,
                    costChanged: true,
                },
            });

            return assistant;
        }),
})