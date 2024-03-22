import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import { furniture_list } from "./public/data/furniture.js";

const app = express();
const port = 3000;

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "furniture",
    password: "110169",
    port: 5432,
});
db.connect();

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

let items = [];

app.get("/", async (req, res) => {
    res.render("index.ejs", {
        furnitureList: furniture_list,
    });
});

app.get("/", async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM items ORDER BY id ASC");
        items = result.rows;
        res.render("index.ejs", {
            savedList: items,
        });
    } catch (err) {
        console.log(err);
    }
});

app.post("/add", async (req, res) => {
    try {
        const {name, description, image, notes, category } = req.body;
        const query = `
            INSERT INTO items (name, description, image, notes, category, saved)
            VALUES ($1, $2, $3, $4, $5, $6)
        `;
        await db.query(query, [name, description, image, notes, category, true]);
        res.redirect("/");
    } catch (err) {
        console.error("Error adding item:", err);
        res.status(500).send("Error adding item to the database");
    }
});

// app.post("/edit", async (req, res) => {
//   const item = req.body.updatedItemTitle;
//   const id = req.body.updatedItemId;

//   try {
//     await db.query("UPDATE items SET title = ($1) WHERE id = $2", [item, id]);
//     res.redirect("/");
//   } catch (err) {
//     console.log(err);
//   }
// });

// app.post("/delete", async (req, res) => {
//   const id = req.body.deleteItemId;
//   try {
//     await db.query("DELETE FROM items WHERE id = $1", [id]);
//     res.redirect("/");
//   } catch (err) {
//     console.log(err);
//   }
// });

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
