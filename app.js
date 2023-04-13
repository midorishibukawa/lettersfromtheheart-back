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

app.listen(port,()=>console.log("funcionou"))

function checkIfExists(users, newUser) {
    return users.some(
      (user) => user.user === newUser.user || user.email === newUser.email
    );
  }