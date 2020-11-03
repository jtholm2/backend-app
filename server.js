//const { request } = require('express');
const { BlobServiceClient, ContainerClient, BlockBlobClient, BlobClient } = require('@azure/storage-blob');
const { Connection, Request } = require("tedious");
const fs = require('fs');
const express = require('express');
const app = express();
const path = require('path');
const fetch = require("node-fetch");
const { SSL_OP_EPHEMERAL_RSA } = require('constants');
const port = 9000;
app.use(express.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});

app.get('/iss', async (req, res) => {
    const response = await fetch("http://api.open-notify.org/iss-now.json");
    const data = await response.json();
    const { latitude, longitude } = data["iss_position"];
    const timestamp = data["timestamp"];
    
    const config = {
        authentication: {
          options: {
            userName: "", //enter username
            password: ""//enter password
          },
          type: "default"
        },
        server: "",//enter SQL server address
        options: {
          database: "",//enter database name
          encrypt: true
        }
      };

    const connection = new Connection(config);

    // Attempt to connect and execute queries if connection goes through
    connection.on("connect", err => {
    if (err) {
        console.error(err.message);
    } else {
        queryDatabase();
    }
    });

    function queryDatabase() {
        const request = new Request(
            `INSERT INTO dbo.issGeoData (timestamp, latitude, longitude) VALUES(${timestamp},${latitude},${longitude})`, function(err, rowCount) {
                if(err) {
                    console.log(err);
                } else {
                    console.log(rowCount + ' rows');
                }
            }
        );

        request.on('row', function(columns) {
            columns.forEach(function(column) {
                console.log(column.value);
            });
        });

        connection.execSql(request);
    }

    res.json(data);
});

app.get('/storage', async (req, res) => {
    //this currently only works if you have one Blob file in your container!!
    const blobServiceClient = BlobServiceClient.fromConnectionString('[enter your azure storage connection string here]');
    const containerClient = blobServiceClient.getContainerClient("[enter your container name here]");
    
    var testBlob;
    for await (const blob of containerClient.listBlobsFlat()) {
        testBlob = blob.name;
        console.log('\nBlob name=', blob.name);
    }

    containerClient.getBlockBlobClient(testBlob).downloadToFile("./test.json");
    
    await new Promise(resolve => setTimeout(resolve, 2000)); //gives the program time to download the file locally before continuing on

    let rawdata = fs.readFileSync('test.json');
    let testData = JSON.parse(rawdata);
    console.log(`test = ${testData["html"]["h1"]}`);
    res.json(testData);
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
  });