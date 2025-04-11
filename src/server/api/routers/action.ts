import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { actionCounters } from "~/utils/actionCounters";


export const actionRouter = createTRPCRouter({
    increment: publicProcedure
        .input(z.object({ tripId: z.string(), type: z.string() }))
        .mutation(({ input }) => {
        const { tripId, type } = input;

        if (!actionCounters[tripId]) {actionCounters[tripId] = {};}

        if (type == "AI" || type == "GUI") {
            if (!actionCounters[tripId][type]) {
                actionCounters[tripId][type] = 1;
            } else {
                actionCounters[tripId][type] += 1;
            }  
        }
        return { count: actionCounters[tripId][type] };
        }),
})