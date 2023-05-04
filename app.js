import express from "express"
import cors from "cors"
import fs from "fs"

const app = express()
const port = 3000
app.use(cors())
app.use(express.json())

app.get("/",(req, res) => res.send("hello world"))

app.post("/sign-up",(req, res) => {
    const user = req.body
    fs.readFile("db.json", (error, answer) => {
        const db = JSON.parse(answer)
        if (checkIfExists(db, user)) {
          res.status(400);
          res.send("Usuário já cadastrado")
        } else {
          db.push(user);
          fs.writeFile("db.json", JSON.stringify(db) ,(err, ans) => {
              res.send("Usuário cadastrado com sucesso")
          })
        }
    })
})

app.post("/sign-in", (req, res) => {
  const user = req.body
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
    const buffer = fs.readFileSync("db.json", "utf8")
    console.log("1")
    const db = JSON.parse(buffer)
    const userDB = checkIfEmailExist(db, user.email)
    if (!userDB) {
      res.status(404);
      res.send("Usuário não cadastrado")
    } else if (user.password !== userDB.password) {
      res.status(400);
      res.send("Senha incorreta")
    } else {
      res.send("Login aprovado")
    }
    console.log("2")
})

app.listen(port,()=>console.log("funcionou"))

function checkIfExists(users, newUser) {
    return users.some(
      (user) => user.user === newUser.user || user.email === newUser.email
    );
  }

function checkIfEmailExist(users, email) {
    return users.find(
      (user) => user.email === email 
    );
  }