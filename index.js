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
    password: "daniellakiray",
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

app.get("/spaces", async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM items ORDER BY id ASC");
        items = result.rows;
        res.render("spaces.ejs", {
            savedList: items,
        });
    } catch (err) {
        console.log(err);
    }
});

app.get('/spaces', function(req, res) {
    res.render("spaces.ejs");
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

app.post("/edit", async (req, res) => {
    const { updatedNotes, updatedCategory, updatedId } = req.body;

    try {
        const query = "UPDATE items SET notes = ($1), category = ($2) WHERE id = $3";
        await db.query(query, [updatedNotes, updatedCategory, updatedId]);
        res.redirect("/spaces");
    } catch (err) {
        console.log(err);
    }
});

app.post("/delete", async (req, res) => {
    try {
        const {deleteItemId} = req.body;
        await db.query("DELETE FROM items WHERE id = $1", [deleteItemId]);
        res.redirect("/spaces");
    } catch (err) {
        console.log(err);
    }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
