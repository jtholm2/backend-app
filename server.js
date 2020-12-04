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
    res.header('Access-Control-Allow-Headers', 'Content-Type')
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

app.post('/azurestorage', async (req, res) => {
    var fileName = req.body.fileName;
    if(fileName === 'blank'){
        res.json({"html": {"h1": "<h1>You need to select a file from the drop down.</h1>"}})
    } else if(fs.existsSync(`./${fileName}`)){
        let rawdata = fs.readFileSync(`./${fileName}`);
        let testData = JSON.parse(rawdata);
        console.log("data is about to send\n");
        res.json(testData);
    } else {
        console.log(`${fileName}`)
        const blobServiceClient = BlobServiceClient.fromConnectionString("");//update
        const containerClient = blobServiceClient.getContainerClient("");//update

        containerClient.getBlockBlobClient(fileName).downloadToFile(`./${fileName}`);

        while(!fs.existsSync(`./${fileName}`)){
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        let rawdata = fs.readFileSync(`./${fileName}`);
        let testData = JSON.parse(rawdata);
        console.log("data is about to send\n");
        res.json(testData);
    }
});

app.get('/kassiendpoint', (req, res) => {​​​​​
    res.sendFile(path.join(__dirname + '/kassi.html'));
}​​​​​)

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
  });