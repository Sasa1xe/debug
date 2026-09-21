import express from "express";
import { createDB } from "../db.js";
import { validateBody } from "../validation Middlewares/validateBody.js";
import { AuthorsSchema } from "../schemas/Authors.Schema.js";

export const AuthorsRouter = express.Router();
const db = createDB();

/*
---------------------------------Create a User----------------------------------------
0. (middleware) validateBody runs first, checks req.body vs schema, blocks bad payload before handler runs
1. Grab validated payload from req
2. Insert new record, DB assigns id internally
3. Confirm creation (no record/id sent back here)
--------------------------------------------------------------------------------------
*/
AuthorsRouter.post("/", validateBody(AuthorsSchema), async (req, res) => {
  const authorData = req.body;

  await db.create("authors", authorData);

  return res.status(201).json({
    message: "author created successfully",
  });
});

/*
------------------------------GET All Authors-----------------------------------
1. Fetch full authors arr from DB
2. Grab ?search= query param, e.g. /authors?search=ahmed
3. If search param present, filter path
4. Keep authors whose name starts w search str (case-insensitive)
5. Return filtered list, exit early
6. No search -> return full unfiltered list
--------------------------------------------------------------------------------
*/
AuthorsRouter.get("/", async (req, res) => {
  const authors = await db.getAll("authors");

  const search = req.query.search;

  if (search) {
    const filteredAuthors = authors.filter((author) =>
      author.name.toLowerCase().startsWith(search.toLowerCase()),
    );
    return res.json({
      data: filteredAuthors,
    });
  }

  return res.json({
    data: authors,
  });
});

/*
------------------------GET a specific author by his ID-------------------------------
1. Grab id from URL path, fetch single record from DB
2. Not found -> 404, stop
3. Found -> return record
--------------------------------------------------------------------------------------
*/
AuthorsRouter.get("/:author_id", async (req, res) => {
  const author = await db.getById("authors", req.params.author_id);

  if (!author) {
    return res.status(404).json({
      message: "author not found",
    });
  }

  return res.json({
    data: author,
  });
});

/*
---------------------------------Update Author----------------------------------------
1- Grab target id from URL
2- Existence check before update attempt
3- if not then the Author is not found
4- Validated body -> new field vals
-Collecting the Body
5- Merge updates into existing record (id preserved internally)
6- Re-fetch record post-update (update fn returns nothing)// 5. Update fn doesn't send back data, so fetch the updated author again      
7- Confirm success + send updated record
--------------------------------------------------------------------------------------
*/
// Update Author
AuthorsRouter.patch(
  "/:author_id",
  validateBody(AuthorsSchema),
  async (req, res) => {
    // 1- Grab target id from URL
    const id = req.params.author_id;
    // 2- Existence check before update attempt
    const author = await db.getById("authors", id);
    if (!author) {
      // 3- if not then the Author is not found
      return res.status(404).json({
        message: "author not found",
      });
    }
    // 4- Validated body -> new field vals
    //    -Collecting the Body
    const updateData = req.body;
    // 5- Merge updates into existing record (id preserved internally)
    await db.update("authors", id, updateData);
    const newAuthor = await db.getById("authors", id);

    // 6- Re-fetch record post-update (update fn returns nothing)// 5. Update fn doesn't send back data, so fetch the updated author again
    return res.status(200).json({
      message: "author updated successfully",
      data: newAuthor,
    });
  },
);

/*
-------------Delete Author-------------
// 1. Grab target id from URL
// 2. Existence check before delete attempt
// 3. Not found -> 404, stop
// 4. Remove record from DB
// 5. 204 = no content status (std for delete)
// 6. Manually end response w body str (note: 204 + body unconventional)
---------------------------------------
*/

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

  res.status(204).json({
    message: "author deleted successfully",
  });
});
