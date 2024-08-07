const express = require("express");
const app = express();
const pg = require("pg");
const port = "3000";

const client = new pg.Client(
  process.env.DATABASE_URL || "postgress://localhost/acme_flavors_db"
);

app.use(express.json());

// get all flavors
app.get("/api/flavors", async (req, res, next) => {
  try {
    const SQL = `
    SELECT * FROM flavors ORDER BY created_at DESC;
    `;
    const response = await client.query(SQL);
    res.send(response.rows);
  } catch (error) {
    next(error);
  }
});
// get flavor by id
app.get("/api/flavors/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const SQL = `
    SELECT * FROM flavors
    WHERE id=$1;
    `;
    const response = await client.query(SQL, [id]);
    res.send(response.rows[0]);
  } catch (error) {
    next(error);
  }
});
// add new flavor
app.post("/api/flavors", async (req, res, next) => {
  try {
    const name = req.body.name;
    const is_favorite = req.body.is_favorite;
    const SQL = `
    INSERT INTO flavors(name, is_favorite) VALUES($1, $2) RETURNING *;
    `;
    const response = await client.query(SQL, [name, is_favorite]);
    res.send(response.rows[0]);
  } catch (error) {
    next(error);
  }
});
// update flavor
app.put("/api/flavors/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const name = req.body.name;
    const is_favorite = req.body.is_favorite;
    const SQL = `
    UPDATE flavors
    SET name=$1, is_favorite=$2, updated_at=now()
    WHERE id=$3 RETURNING *;
    `;
    const response = await client.query(SQL, [name, is_favorite, id]);
    res.send(response.rows[0]);
  } catch (error) {
    next(error);
  }
});
// delete flavor
app.delete("/api/flavors/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const SQL = `
    DELETE FROM flavors
    WHERE id=$1;
    `;
    const response = await client.query(SQL, [id]);
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
});

const init = async () => {
  await client.connect();
  console.log("server started");
  let SQL = `
  DROP TABLE IF EXISTS flavors;
  CREATE TABLE flavors(
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    is_favorite BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP DEFAULT current_date,
    updated_at TIMESTAMP DEFAULT current_date
  )
  `;
  await client.query(SQL);
  console.log("database seeded");
  SQL = `
  INSERT INTO flavors(name) VALUES ('vanilla');
  INSERT INTO flavors(name, is_favorite) VALUES ('chocolate', true);
  INSERT INTO flavors(name) VALUES ('strawberry');
  INSERT INTO flavors(name, is_favorite) VALUES ('coffee', true);
  INSERT INTO flavors(name) VALUES ('cookies and cream');
  INSERT INTO flavors(name) VALUES ('butter pecan');
  INSERT INTO flavors(name) VALUES ('butterscotch');
  INSERT INTO flavors(name) VALUES ('rocky road');
  INSERT INTO flavors(name) VALUES ('cookie dough');
  INSERT INTO flavors(name) VALUES ('raspberry');
  INSERT INTO flavors(name) VALUES ('birthday cake');
  INSERT INTO flavors(name) VALUES ('moose tracks');
  INSERT INTO flavors(name, is_favorite) VALUES ('mint chocolate chip', true);
  INSERT INTO flavors(name) VALUES ('chocolate chip');
  INSERT INTO flavors(name) VALUES ('banana');
  `;
  await client.query(SQL);
  console.log("database updated");
  app.listen(port, () => {
    console.log("server is running");
  });
};

init();
