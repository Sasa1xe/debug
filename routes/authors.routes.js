import express from "express";
import { createDB } from "../db.js";
import { validateBody } from "../validation Middlewares/validateBody.js";
import { AuthorsSchema } from "../schemas/Authors.Schema.js";

export const AuthorsRouter = express.Router();
const db = createDB();

AuthorsRouter.post("/", validateBody(AuthorsSchema), async (req, res) => {
  // 0. (middleware) validateBody runs first, checks req.body vs schema, blocks bad payload before handler runs

  // 1. Grab validated payload from req
  const authorData = req.body;

  // 2. Insert new record, DB assigns id internally
  await db.create("authors", authorData);

  // 3. Confirm creation (no record/id sent back here)
  return res.status(201).json({
    message: "author created successfully",
  });
});

// get all authors
AuthorsRouter.get("/", async (req, res) => {
  // 1. Fetch full authors arr from DB
  const authors = await db.getAll("authors");

  // 2. Grab ?search= query param, e.g. /authors?search=ahmed
  const search = req.query.search;

  // 3. If search param present, filter path
  if (search) {
    // 4. Keep authors whose name starts w search str (case-insensitive)
    const filteredAuthors = authors.filter((author) =>
      author.name.toLowerCase().startsWith(search.toLowerCase()),
    );
    // 5. Return filtered list, exit early
    return res.json({
      data: filteredAuthors,
    });
  }

  // 6. No search -> return full unfiltered list
  return res.json({
    data: authors,
  });
});

// GET a specific author by his ID
AuthorsRouter.get("/:author_id", async (req, res) => {
  // 1. Grab id from URL path, fetch single record from DB
  const author = await db.getById("authors", req.params.author_id);

  // 2. Not found -> 404, stop
  if (!author) {
    return res.status(404).json({
      message: "author not found",
    });
  }

  // 3. Found -> return record
  return res.json({
    data: author,
  });
});


// Update Author
AuthorsRouter.patch(
  "/:author_id",
  validateBody(AuthorsSchema),
  async (req, res) => {
    // 1. Grab target id from URL
    const id = req.params.author_id;
    // 2. Existence check before update attempt
    const author = await db.getById("authors", id);
    //if not then the Author is not found
    if (!author) {
      return res.status(404).json({
        message: "author not found",
      });
    }
    //Collecting the Body
    // 3. Validated body -> new field vals
    const updateData = req.body;

    // 4. Merge updates into existing record (id preserved internally)
    await db.update("authors", id, updateData);

    // 5. Re-fetch record post-update (update fn returns nothing)           // 5. Update fn doesn't send back data, so fetch the updated author again      
    const newAuthor = await db.getById("authors", id);

    // 6. Confirm success + send updated record
    return res.status(200).json({
      message: "author updated successfully",
      data: newAuthor,
    });
  },
);

// Delete Author
AuthorsRouter.delete("/:author_id", async (req, res) => {
  // 1. Grab target id from URL
  const id = req.params.author_id;
  // 2. Existence check before delete attempt
  const author = await db.getById("authors", id);

  // 3. Not found -> 404, stop
  if (!author) {
    return res.status(404).json({
      message: "author not found",
    });
  }

  // 4. Remove record from DB
  await db.delete("authors", id);
  const message = "author deleted successfully";

  // 5. 204 = no content status (std for delete)
  res.status(204);
  // 6. Manually end response w body str (note: 204 + body unconventional)  
  res.json(message);
});
