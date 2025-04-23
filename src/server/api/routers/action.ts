import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { actionCounters, timetableActionCounters, costActionCounters} from "~/utils/actionCounters";
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
    incrementCost: publicProcedure
        .input(z.object({ tripId: z.string(), type: z.string() }))
        .mutation(({ input }) => {
        const { tripId, type } = input;

        if (!costActionCounters[tripId]) {costActionCounters[tripId] = {};}

        if (type == "AI" || type == "GUI") {
            if (!costActionCounters[tripId][type]) {
                costActionCounters[tripId][type] = 1;
            } else {
                costActionCounters[tripId][type] += 1;
            }  
        }
        return { count: costActionCounters[tripId][type] };
        }), 
    incrementTimetable: publicProcedure
        .input(z.object({ tripId: z.string(), type: z.string() }))
        .mutation(({ input }) => {
        const { tripId, type } = input;

        if (!timetableActionCounters[tripId]) {timetableActionCounters[tripId] = {};}

        if (type == "AI" || type == "GUI") {
            if (!timetableActionCounters[tripId][type]) {
                timetableActionCounters[tripId][type] = 1;
            } else {
                timetableActionCounters[tripId][type] += 1;
            }  
        }
        return { count: timetableActionCounters[tripId][type] };
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
    setCost: publicProcedure
        .input(
            z.object({ 
                tripId: z.string(), 
                type: z.string(), 
                count: z.number() 
            })
        )
        .mutation(({ input }) => {
            const { tripId, type, count } = input;
            if (!costActionCounters[tripId]) {costActionCounters[tripId] = {};}
            if (type == "AI" || type == "GUI") {
                if (!costActionCounters[tripId][type]) {
                    costActionCounters[tripId][type] = count;
                } else {
                    costActionCounters[tripId][type] += count;
                }  
            }

            return { count: costActionCounters[tripId][type] };
        }),
    setTimetable: publicProcedure
        .input(
            z.object({ 
                tripId: z.string(), 
                type: z.string(), 
                count: z.number() 
            })
        )
        .mutation(({ input }) => {
            const { tripId, type, count } = input;
            if (!timetableActionCounters[tripId]) {timetableActionCounters[tripId] = {};}
            if (type == "AI" || type == "GUI") {
                if (!timetableActionCounters[tripId][type]) {
                    timetableActionCounters[tripId][type] = count;
                } else {
                    timetableActionCounters[tripId][type] += count;
                }  
            }

            return { count: timetableActionCounters[tripId][type] };
        })
})