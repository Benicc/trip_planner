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
                plans: z.array(z.object({}))
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
                },
              });

            return newTrip;

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
    
})