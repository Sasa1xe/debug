import * as z from "zod";

export const AuthorsSchema = z.object({
  name: z
    .string("name must be a string")
    .trim()
    .min(2, "name should be at least 2 charcters"),
    age: z.number("age must be a number").min(18, "min age is 18").max(100,"max age is 100yo"),
  
}); 