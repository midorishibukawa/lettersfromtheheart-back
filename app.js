import express from "express";
import cors from "cors";
import fs from "fs";
import { v4 as uuid } from "uuid";
import pgPromise from "pg-promise";
import e from "express";

const app = express();
const port = 3000;
const db = pgPromise()("postgres://postgres:postgres@localhost:5432/postgres");
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send({ texto: "hello world" }));

app.post("/letter", (req, res) => {
  const letter = req.body;
  const buffer = fs.readFileSync("users.db.json", "utf8");
  const db = JSON.parse(buffer);
  const userDB = checkIfEmailExist(db, letter.from);
  if (!userDB) {
    res.status(400);
    res.send({ msg: "Usuário não encontrado" });
  }
  fs.readFile("letters.db.json", (error, answer) => {
    const letters = error ? {} : JSON.parse(answer);
    const id = uuid();
    letters[id] = letter;
    fs.writeFile("letters.db.json", JSON.stringify(letters), (err, ans) => {
      res.send({ msg: "Carta enviada com sucesso!", id });
    });
  });
});

app.get("/letter", (req, res) => {
  const id = req.query.id;
  fs.readFile("letters.db.json", (error, answer) => {
    if (error) {
      res.status(500);
      res.send({ msg: "Sistema temporariamente indisponível" });
      return;
    }
    const db = JSON.parse(answer);
    const letter = db[id];
    if (!letter) {
      res.status(404);
      res.send({ msg: "Carta não encontrada" });
      return;
    }
    res.send(letter);
  });
});

app.post("/sign-up", async (req, res) => {
  const user = req.body;
  try {
    await db.none(
      'insert into public.users (username, email, "password") values (${user}, ${email}, ${password});',
      user
    );
    res.send({ msg: "Usuário cadastrado com sucesso" });
  } catch (e) {
    console.log(e)
    res.status(400);
    res.send({ msg: "Usuário já cadastrado" });
  }
});

app.post("/sign-in", (req, res) => {
  const user = req.body;
  console.log(user);
  // fs.readFile("db.json", (error, answer) => {
  //   console.log("assíncrono")
  //   const db = JSON.parse(answer)
  //   const userDB = checkIfEmailExist(db, user.email)
  //   if (!userDB) {
  //     res.status(404);
  //     res.send("Usuário não cadastrado")
  //   } else if (user.password !== userDB.password) {
  //     res.status(400);
  //     res.send("Senha incorreta")
  //   } else {
  //     res.send("Login aprovado")
  //   }

  // })
  // console.log("sincrono")
  const buffer = fs.readFileSync("users.db.json", "utf8");
  console.log(buffer);
  const db = JSON.parse(buffer);
  const userDB = checkIfEmailExist(db, user.email);
  if (!userDB) {
    res.status(404);
    res.send({ msg: "Usuário não cadastrado" });
  } else if (user.password !== userDB.password) {
    res.status(400);
    res.send({ msg: "Senha incorreta" });
  } else {
    res.send({ msg: "Login aprovado" });
  }
  console.log("2");
});

app.listen(port, () => console.log("funcionou"));

function checkIfExists(users, newUser) {
  return users.some(
    (user) => user.user === newUser.user || user.email === newUser.email
  );
}

function checkIfEmailExist(users, email) {
  return users.find((user) => user.email === email);
}
