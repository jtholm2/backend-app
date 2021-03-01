import { BlobServiceClient } from '@azure/storage-blob';
import fs from 'fs';
import express from 'express';
import path from 'path';
import fetch from 'node-fetch';
import xmlParser from 'xml2json';
const port = process.env.PORT;
const app = express();

app.use(express.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type')
    next();
});

app.get('/iss', async (req, res) => {
    const response = await fetch("http://api.open-notify.org/iss-now.json");
    const data = await response.json();
    res.json(data);
});

app.get('/wifisurvey', async (req, res) => {
    const blobServiceClient = BlobServiceClient.fromConnectionString(`${process.env.RPI_STORAGE}`);
    const containerClient = blobServiceClient.getContainerClient("rpi-kmls");
    containerClient.getBlockBlobClient('testEndputOutput-01.log.csv.kml').downloadToFile(path.join(__dirname, '..', 'storedfiles', 'testEndputOutput-01.log.csv.kml'));
    while (!fs.existsSync(path.join(__dirname, '..', 'storedfiles', 'testEndputOutput-01.log.csv.kml'))) {
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    const xml_string = fs.readFileSync(path.join(__dirname, '..', 'storedfiles', 'testEndputOutput-01.log.csv.kml'), 'utf8');
    const jsonString = xmlParser.toJson(xml_string);
    res.json(jsonString);
});

app.post('/azurestorage', async (req, res) => {
    const fileName = req.body.fileName;
    if(fileName === 'blank'){
        res.json({"html": {"h1": "<h1>You need to select a file from the drop down.</h1>"}})
    } else if(fs.existsSync(path.join(__dirname, '..', 'storedfiles', `${fileName}`))){
        const rawdata = fs.readFileSync(path.join(__dirname, '..', 'storedfiles', `${fileName}`));
        const testData = JSON.parse(rawdata.toString());
        res.json(testData);
     } else {
         const blobServiceClient = BlobServiceClient.fromConnectionString("{enter storage account connection string here}");
         const containerClient = blobServiceClient.getContainerClient("{enter container here}");

         containerClient.getBlockBlobClient(fileName).downloadToFile(path.join(__dirname, '..', 'storedfiles', `${fileName}`));

         while(!fs.existsSync(path.join(__dirname, '..', 'storedfiles', `${fileName}`))){
             await new Promise(resolve => setTimeout(resolve, 500));
         }

        const rawdata = fs.readFileSync(path.join(__dirname, '..', 'storedfiles', `${fileName}`));
        const testData = JSON.parse(rawdata.toString());
        res.json(testData);
    }
});

app.post('/rpi', async (req, res) => {
    const method = req.body.text;
    console.log(req.body.text);
    const iotHubUrl = "https://{url for your IoT Hub}/twins/{device id}/methods?api-version=2018-06-30";
    const accessSignature = '{SAS token for rpi device }';//az iot hub generate-sas-token -d {device_id} -n {iothub_name}
    let data = { "type": "message", "text": `Method call didn't work` };
    if (method.indexOf('start') !== -1) {
        fetch(iotHubUrl, {
            method: "POST",
            body: JSON.stringify({
                "methodName": "method1",
                "responseTimeoutInSeconds": 200,
                "payload": "screen -d -m sudo airodump-ng --gpsd -w testEndointOutput --output-type csv wlan1mon"
            }),
            headers: {
                'Authorization': accessSignature,
                'Content-Type': 'application/json'
            }
        })
            .then(response => response.json())
            .then(json => console.log(json));
        data = { "type": "message", "text": `Program started successfully` };
    }
    else if (method.indexOf('stop') !== -1) {
        fetch(iotHubUrl, {
            method: "POST",
            body: JSON.stringify({
                "methodName": "method1",
                "responseTimeoutInSeconds": 200,
                "payload": "sudo pkill airodump-ng"
            }),
            headers: {
                'Authorization': accessSignature,
                'Content-Type': 'application/json'
            }
        })
            .then(response => response.json())
            .then(json => console.log(json));
        data = { "type": "message", "text": `Program stopped successfully` };
    }
    else if (method.indexOf('upload') !== -1) {
        fetch(iotHubUrl, {
            method: "POST",
            body: JSON.stringify({
                "methodName": "method1",
                "responseTimeoutInSeconds": 200,
                "payload": "screen -d -m python3 csv-xml.py testEndpointOutput-01.log.csv"
            }),
            headers: {
                'Authorization': accessSignature,
                'Content-Type': 'application/json'
            }
        })
            .then(response => response.json())
            .then(json => console.log(json));
        data = { "type": "message", "text": `Program uploaded data successfully` };
    }
    res.send(data);
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});