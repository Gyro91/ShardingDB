const express = require("express");
const { Client } = require("pg");
const crypto = require("crypto");
const ConsistentHash = require("consistent-hash");

const app = express();
const clients = {
    "5432": new Client({
        "host": "localhost",
        "port": "5432",
        "user": "dbuser",
        "password": "dbuser",
        "database": "learndb"
    }),
    "5433": new Client({
        "host": "localhost",
        "port": "5433",
        "user": "dbuser",
        "password": "dbuser",
        "database": "learndb"
    }),
    "5434": new Client({
        "host": "localhost",
        "port": "5434",
        "user": "dbuser",
        "password": "dbuser",
        "database": "learndb"
    })
};

const hr = new ConsistentHash();
hr.add("5432");
hr.add("5433");
hr.add("5434");

async function connect() {
    await clients['5432'].connect();
    await clients['5433'].connect();
    await clients['5434'].connect();
}

app.get("/", (req, res) => {
    res.send({ "hello": "world" });
});

app.post("/", (req, res) => {
    const url = req.query.url;
    const hash = crypto.createHash("sha256").update(url).digest("base64");
    const urlId = hash.substr(0, 5);
    const server = hr.get(urlId);
    res.send({ 
        "urlId": urlId,
        "url": url,
        "server": server
     });
});

connect().then(() => {
    app.listen(8081, () => console.log("Listening on 8081!"));
});
