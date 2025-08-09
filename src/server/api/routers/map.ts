import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { get } from "http";
import { v4 as uuidv4 } from 'uuid';

export const mapRouter = createTRPCRouter( {
    createMarker: publicProcedure
        .input(z.object({ tripId: z.string(), lat: z.number(), lng: z.number(), label: z.string()}))
        .mutation(async ({ ctx, input }) => {
            const { tripId, lat, lng, label } = input;

            // Ensure the trip exists
            const trip = await ctx.db.trip.findUnique({
                where: { tripId },
            });

            if (!trip) {
                throw new Error("Trip not found");
            }

            // Create the marker
            const marker = await ctx.db.marker.create({
                data: {
                    id: uuidv4(), // Generate a unique ID for the marker
                    tripId,
                    lat,
                    lng,
                    label,
                },
            });

            return marker;
        }
    ),
    getMarkers: publicProcedure
        .input(z.object({ tripId: z.string() }))
        .query(async ({ ctx, input }) => {
            const { tripId } = input;

            // Ensure the trip exists
            const trip = await ctx.db.trip.findUnique({
                where: { tripId },
            });

            if (!trip) {
                throw new Error("Trip not found");
            }

            // Get all markers for the trip
            const markers = await ctx.db.marker.findMany({
                where: { tripId },
            });

            return markers;
        }
    ),
    deleteMarkers: publicProcedure
    .input(z.array(z.string()))
    .mutation(async ({ ctx, input }) => {
        const marker = await ctx.db.marker.deleteMany({
            where: {
                id: {
                    in: input,
                },
            },
        });

        return marker;
    }),
});