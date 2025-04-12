import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { actionCounters } from "~/utils/actionCounters";
import { set } from "date-fns";


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
    set: publicProcedure
        .input(
            z.object({ 
                tripId: z.string(), 
                type: z.string(), 
                count: z.number() 
            })
        )
        .mutation(({ input }) => {
            const { tripId, type, count } = input;
            if (!actionCounters[tripId]) {actionCounters[tripId] = {};}
            if (type == "AI" || type == "GUI") {
                if (!actionCounters[tripId][type]) {
                    actionCounters[tripId][type] = count;
                } else {
                    actionCounters[tripId][type] += count;
                }  
            }

            return { count: actionCounters[tripId][type] };
        }),
})