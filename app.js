import express from "express";
import cors from "cors";
import fs from "fs";
import { v4 as uuid } from "uuid";
import pgPromise from "pg-promise";
import e from "express";

const getLetters = async (id) => {
  try {
    if (id) {
    return await db.manyOrNone("SELECT  l.id, u.username as from_user, l.reply_to, l.text FROM public.letters l LEFT JOIN public.users u ON l.from_user = u.id WHERE l.id = $1", id)
    // return await db.manyOrNone("select * from public.letters where id = $1", id)
    }
    return await db.manyOrNone("select * from public.letters where reply_to is null")
  } catch (e) {
    console.log(e);
    return null
  }
}

const app = express();
const port = 3000;
const db = pgPromise()("postgres://postgres:postgres@localhost:5432/postgres");
app.use(cors());
app.use(express.json());

// app.post("/letter", (req, res) => {
//   const letter = req.body;
//   const buffer = fs.readFileSync("users.db.json", "utf8");
//   const db = JSON.parse(buffer);
//   const userDB = checkIfEmailExist(db, letter.from);
//   if (!userDB) {
//     res.status(400);
//     res.send({ msg: "Usuário não encontrado" });
//   }
//   fs.readFile("letters.db.json", (error, answer) => {
//     const letters = error ? {} : JSON.parse(answer);
//     const id = uuid();
//     letters[id] = letter;
//     fs.writeFile("letters.db.json", JSON.stringify(letters), (err, ans) => {
//       res.send({ msg: "Carta enviada com sucesso!", id });
//     });
//   });
// });

app.post("/letter", async (req, res) => {
  const letter = req.body;
  console.log(letter);
  try {
    const query = letter.reply_to
      ? "insert into public.letters (from_user, text, reply_to) values (${from_user}, ${text}, ${reply_to}) returning id;"
      : "insert into public.letters (from_user, text) values (${from_user}, ${text}) returning id;";
    const id = await db.one(query, letter, exemplo);
    res.send({ msg: "Carta enviada com sucesso", id});
  } catch (e) {
    console.log(e);
    res.status(418);
    res.send({ msg: "I'm a teapot" });
  }
});

function exemplo(l) {
  return l.id
}

app.get("/letter", async (req, res) => {
  const id = req.query.id;
  const letters = await getLetters(id);
  if (letters === null) {
  res.status(400);
  res.send({ msg: "Ocorreu um erro ao consultar a carta"})
  return
}
  if (letters.length == 0) {
  res.status(404);
  res.send({ msg: "Nenhuma carta encontrada"});
  return
  } 
  res.send(letters)
});

app.get("/letter/replies", async (req, res) => {
  const id = req.query.id;
  try {
    const letters = await db.manyOrNone("select * from public.letters where reply_to = $1", id)
    res.send(letters)
  } catch (e) {
    console.log(e);
    res.status(400);
    res.send({ msg: "Erro na consulta de carta."})
  }
});

app.post("/sign-up", async (req, res) => {
  const user = req.body;
  console.log(user);
  try {
    await db.none(
      'insert into public.users (username, email, "password") values (${user}, ${email}, ${password});',
      user
    );
    res.send({ msg: "Usuário cadastrado com sucesso" });
  } catch (e) {
    console.log(e);
    res.status(400);
    res.send({ msg: "Usuário já cadastrado" });
  }
});

app.post("/sign-in", async (req, res) => {
  const user = req.body;
  try {
    const userDB = await db.oneOrNone(
      "select * from public.users where email = ${email} and password = ${password}",
      user
    );
    if (!userDB) {
      res.status(404);
      res.send({ msg: "Usuário não cadastrado" });
    } else if (user.password !== userDB.password) {
      res.status(400);
      res.send({ msg: "Senha incorreta" });
    } else {
      res.send({ msg: "Login aprovado" , user: userDB});
    }
  } catch (e) {
    res.status(500);
    res.send({ msg: "Serviço temporariamente indisponível" });
  }
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
