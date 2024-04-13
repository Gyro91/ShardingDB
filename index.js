const express = require("express");
const { Client } = require("pg");
const crypto = require("crypto");
const HashRing = require("hashring"); // Correct import

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

// Define an array of servers or nodes for the HashRing
const servers = ["5432", "5433", "5434"];

// Define options if needed
const options = {};

// Instantiate HashRing with the array of servers, algorithm (optional), and options (optional)
const hr = new HashRing(servers, 'md5', options);

async function connect() {
    await clients['5432'].connect();
    await clients['5433'].connect();
    await clients['5434'].connect();
}

app.get("/:urlId", async (req, res) => {
    const urlId = req.params.urlId;
    const server = hr.get(urlId);
    const result = await clients[server].query(`SELECT * FROM URL_TABLE WHERE URL_ID = $1`, [urlId]);
    if (result.rowCount > 0) {
        const url = result.rows[0].url;
        res.send({
            "urlId": urlId,
            "url": url,
            "server": server
        });
    } else {
        res.sendStatus(404);
    }
});

app.post("/", async (req, res) => {
    const url = req.query.url;
    const hash = crypto.createHash("sha256").update(url).digest("base64");
    const urlId = hash.substr(0, 5);
    const server = hr.get(urlId);
    await clients[server].query("INSERT INTO URL_TABLE (URL, URL_ID) VALUES ($1,$2)", [url, urlId]);
    res.send({
        "urlId": urlId,
        "url": url,
        "server": server
    });
});

connect().then(() => {
    app.listen(8081, () => console.log("Listening on 8081!"));
});
