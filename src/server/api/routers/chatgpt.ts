import axios from "axios";
import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
  } from "~/server/api/trpc";

import { z } from "zod";
import OpenAI from "openai";
import { TRPCError } from "@trpc/server";

function stripCodeFences(text: string): string {
  return text.replace(/```json\s*([\s\S]*?)```/, '$1').trim();
}


const openai = new OpenAI({
    apiKey: process.env.CHATGPT_API_KEY, // Ensure your API key is set in .env
    baseURL: "https://api.openai.com/v1/", // Some APIs may require a custom base URL
  });
  
export const callChatGPT = async (prompt: string) => {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // Check if this model is supported
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      });
  
      return response.choices[0]?.message.content;
    } catch (error) {
      console.error("OpenAI API Error:", error);
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Failed to fetch from OpenAI.",
        cause: error,
      });
    }
  };

export const GPTRouter = createTRPCRouter({
  getResponse: publicProcedure
    .input(z.string()) // Input should be a string (user's prompt)
    .query(async ({ input }) => {
      const resp = await callChatGPT(input);
      return stripCodeFences(resp ?? "");
    }),
});

export default GPTRouter;

