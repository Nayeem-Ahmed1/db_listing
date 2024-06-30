const { faker } = require("@faker-js/faker");
const express = require("express");
const mysql = require("mysql2");
const app = express();
const port = 8080;
const path = require("path");
const methodOverride = require("method-override");
const { error } = require("console");
const { v4: uuidv4 } = require("uuid");

app.use(methodOverride("_method"));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "userinfo",
  password: "nayeemdb",
});

let createRandomUser = () => {
  return [
    faker.string.uuid(),
    faker.internet.userName(),
    faker.internet.email(),
    faker.internet.password(),
  ];
};

let query2 = `SELECT count(*) FROM users`;
let query3 = `SELECT * FROM users`;

// let data = [];

// for (let i = 1; i <= 13; i++) {
//   data.push(createRandomUser());
// }

app.listen(port, () => {
  console.log("app is listening to port :", port);
});

app.get("/", (req, res) => {
  try {
    connection.query(query2, (err, result) => {
      if (err) throw err;
      let totalCount = result[0]["count(*)"];
      res.render("home.ejs", { totalCount });
    });
  } catch (err) {
    console.log(err);
  }
});

app.get("/user", (req, res) => {
  try {
    connection.query(query3, (err, result) => {
      if (err) throw err;
      let alluser = result;
      res.render("showuser.ejs", { alluser });
    });
  } catch (err) {
    console.log(err);
  }
});

app.get("/user/:id/edit", (req, res) => {
  let { id } = req.params;
  res.render("edit.ejs", { id });
});

app.patch("/user/:id", (req, res) => {
  let { id } = req.params;
  let { userName: username, password: password } = req.body;
  let query4 = `SELECT password FROM users WHERE user_id = "${id}"`;
  let query5 = `UPDATE users SET userName = "${username}" WHERE user_id = "${id}"`;
  try {
    connection.query(query4, (err, result) => {
      if (err) throw err;
      if (password != result[0]["password"]) {
        res.render("error.ejs");
      } else {
        try {
          connection.query(query5, (err, result) => {
            if (err) throw err;
            res.redirect("/user");
          });
        } catch (err) {
          console.log(err);
        }
      }
    });
  } catch (err) {
    console.log(err);
  }
});

app.get("/user/register", (req, res) => {
  let id = uuidv4();
  res.render("join.ejs", { id });
});

app.post("/user/:id", (req, res) => {
  let { id } = req.params;
  let { userName: username, password: password, email: email } = req.body;

  let q = `INSERT INTO users (user_id , userName , email , password) VALUES ("${id}","${username}","${email}","${password}")`;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      res.redirect("/user");
    });
  } catch (err) {
    console.log(err);
  }
});

app.get("/user/:id/delete", (req, res) => {
  let { id } = req.params;
  res.render("verifydelete.ejs", { id });
});

app.delete("/user/:id", (req, res) => {
  let { id } = req.params;
  let { userName: username, password: password } = req.body;

  let query6 = `DELETE FROM users WHERE user_id = "${id}"`;
  let query7 = `SELECT userName,password FROM users WHERE user_id = "${id}"`;
  try {
    connection.query(query7, (err, result) => {
      if (err) throw err;
      if (
        username === result[0]["userName"] &&
        password === result[0]["password"]
      ) {
        try {
          connection.query(query6, (err, result) => {
            if (err) throw err;
            res.redirect("/user");
          });
        } catch (err) {
          console.log(err);
        }
      } else {
        res.render("error.ejs");
      }
    });
  } catch (err) {
    console.log(err);
  }
});

// connection.end();
