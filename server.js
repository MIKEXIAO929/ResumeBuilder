const express = require("express");
const sqlite3 = require('sqlite3').verbose()
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.post("/generate-resume", (req, res) => {
  const data = req.body;

  res.json({
    success: true,
    message: "Data received successfully",
    yourData: data
  });
});

app.listen(HTTP_PORT,() => {
    console.log('Listening on',HTTP_PORT)
}) 


const dbTrees = new sqlite3.Database('resume.db', (err) => {
    if(err){
        console.error("Error opening database:",err.message)
    } else {
        console.log("Connected to resume.db")
    } 
})