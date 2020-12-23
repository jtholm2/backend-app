"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//const { request } = require('express');
//const { BlobServiceClient, ContainerClient, BlockBlobClient, BlobClient } = require('@azure/storage-blob');
//import BlobServiceClient from '@azure/storage-blob';
//import Connection from 'tedious';
//import Request from 'tedious';
//const fs = require('fs');
const fs_1 = __importDefault(require("fs"));
//const express = require('express');
const express_1 = __importDefault(require("express"));
const app = express_1.default();
//const path = require('path');
const path_1 = __importDefault(require("path"));
//const fetch = require("node-fetch");
const node_fetch_1 = __importDefault(require("node-fetch"));
//const { SSL_OP_EPHEMERAL_RSA } = require('constants');
//import { SSL_OP_EPHEMERAL_RSA } from 'constants';
const port = process.env.PORT;
app.use(express_1.default.json());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});
app.get('/iss', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield node_fetch_1.default("http://api.open-notify.org/iss-now.json");
    const data = yield response.json();
    //const { latitude, longitude } = data["iss_position"];
    //const timestamp = data["timestamp"];
    // const config = {
    //     authentication: {
    //       options: {
    //         userName: "", //enter username
    //         password: ""//enter password
    //       },
    //       type: "default"
    //     },
    //     server: "",//enter SQL server address
    //     options: {
    //       database: "",//enter database name
    //       encrypt: true
    //     }
    //   };
    // const connection = new Connection(config);
    // // Attempt to connect and execute queries if connection goes through
    // connection.on("connect", err => {
    // if (err) {
    //     console.error(err.message);
    // } else {
    //     queryDatabase();
    // }
    // });
    // function queryDatabase() {
    //     const request = new Request(
    //         `INSERT INTO dbo.issGeoData (timestamp, latitude, longitude) VALUES(${timestamp},${latitude},${longitude})`, function(err, rowCount) {
    //             if(err) {
    //                 console.log(err);
    //             } else {
    //                 console.log(rowCount + ' rows');
    //             }
    //         }
    //     );
    //     request.on('row', function(columns) {
    //         columns.forEach(function(column) {
    //             console.log(column.value);
    //         });
    //     });
    //     connection.execSql(request);
    //}
    res.json(data);
}));
app.post('/azurestorage', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const fileName = req.body.fileName;
    if (fileName === 'blank') {
        res.json({ "html": { "h1": "<h1>You need to select a file from the drop down.</h1>" } });
    }
    else if (fs_1.default.existsSync(path_1.join(__dirname,'..', 'storedfiles', `./${fileName}`))) {
        const rawdata = fs_1.default.readFileSync(path_1.join(__dirname,'..', 'storedfiles', `./${fileName}`));
        const testData = JSON.parse(rawdata.toString());
        console.log("data is about to send\n");
        res.json(testData);
    } //else {
    //     console.log(`${fileName}`)
    //     const blobServiceClient = BlobServiceClient.fromConnectionString("");//update
    //     const containerClient = blobServiceClient.getContainerClient("");//update
    //     containerClient.getBlockBlobClient(fileName).downloadToFile(`./${fileName}`);
    //     while(!fs.existsSync(`./${fileName}`)){
    //         await new Promise(resolve => setTimeout(resolve, 500));
    //     }
    //     let rawdata = fs.readFileSync(`./${fileName}`);
    //     let testData = JSON.parse(rawdata);
    //     console.log("data is about to send\n");
    //     res.json(testData);
    // }
}));
app.get('kassiendpoint', (req, res) => {
    res.sendFile(path_1.default.join(path_1.join(__dirname,'..', 'public', 'Kassi.html')));
});
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
//# sourceMappingURL=server.js.map