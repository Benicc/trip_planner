import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
  } from "~/server/api/trpc";
import axios from 'axios';
import { z } from 'zod';

const callOllama = async (prompt: string) => {
  try {
    // Assuming Ollama server is running locally at 'http://localhost:PORT'
    const response = await axios.post('http://192.168.1.105:5000/query', {    //http://127.0.0.1:5000/query
        q:prompt,
    });

    console.log(response.data)
    return response.data; // Return the response from Ollama
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Axios-specific error handling
      console.error('Axios error:', error.response?.status, error.response?.data);
      console.error('Axios error message:', error.message);
    } else {
      // Generic error handling
      console.error('Error:', error);
    }
    throw new Error('Failed to connect to Ollama server');
  }
};


// Define the router with a mutation to handle prompt input
export const ollamaRouter = createTRPCRouter({
  getResponse: publicProcedure
    .input(z.string()) // Input should be a string (user's prompt)
    .query(async ({ input }) => {
      return await callOllama(input);
    }),
});

export default ollamaRouter;
