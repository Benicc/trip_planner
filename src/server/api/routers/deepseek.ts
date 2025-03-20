import axios from "axios";
import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
  } from "~/server/api/trpc";

import { z } from "zod";
import OpenAI from "openai";
import { TRPCError } from "@trpc/server";


const openai = new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY, // Ensure your API key is set in .env
    baseURL: "https://api.deepseek.com", // Some APIs may require a custom base URL
  });
  
export const callDeepSeek = async (prompt: string) => {
    try {
      const response = await openai.chat.completions.create({
        model: "deepseek-chat", // Check if this model is supported
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      });
  
      return response.choices[0]?.message.content;
    } catch (error) {
      console.error("DeepSeek API Error:", error);
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Failed to fetch from DeepSeek.",
        cause: error,
      });
    }
  };

export const deepseekRouter = createTRPCRouter({
  getResponse: publicProcedure
    .input(z.string()) // Input should be a string (user's prompt)
    .query(async ({ input }) => {
      return await callDeepSeek(input);
    }),
});

export default deepseekRouter;

