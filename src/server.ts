import { BlobServiceClient } from '@azure/storage-blob';
import fs from 'fs';
//import * as appinsights from 'applicationinsights';
import express from 'express';
import path from 'path';
import fetch from 'node-fetch';
const port = process.env.PORT;
const app = express();

app.use(express.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type')
    next();
});

// appinsights.setup(`${process.env.APPINSIGHTS_INSTRUMENTATIONKEY}`)
// .setAutoDependencyCorrelation(true)
// .setAutoCollectRequests(true)
// .setAutoCollectPerformance(true, true)
// .setAutoCollectExceptions(true)
// .setAutoCollectDependencies(true)
// .setAutoCollectConsole(true)
// .setUseDiskRetryCaching(true)
// .setSendLiveMetrics(false)
// .setDistributedTracingMode(appinsights.DistributedTracingModes.AI)
// .start();

app.get('/iss', async (req, res) => {
    const response = await fetch("http://api.open-notify.org/iss-now.json");
    const data = await response.json();
    res.json(data);
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
         const blobServiceClient = BlobServiceClient.fromConnectionString("DefaultEndpointsProtocol=https;AccountName=jtholmeswebappstorage;AccountKey=x1/LjGRM4BAKzWsioaRKVbcCI/lfrnIvyUHS0bipK7kg+zfdqiC0tKgMiQsA+dOQS9D/nsT5xsfjk1g1aRudqQ==;EndpointSuffix=core.windows.net");
         const containerClient = blobServiceClient.getContainerClient("json-retrieval-html-render");

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
    console.log(req.body.text)
    const iotHubUrl = "https://jt-iot-hub.azure-devices.net/twins/rpi4-test-jt/methods?api-version=2018-06-30";
    const accessSignature = 'SharedAccessSignature sr=jt-iot-hub.azure-devices.net&sig=JSadXucZaGxcdw85YEux%2FEZ02YBDXU6B0tZ5neFxSaI%3D&se=1613431482&skn=iothubowner';
    let data = { "type": "message", "text": `Method call didn't work` };
    if (method === 'start') {
        fetch(iotHubUrl, {
            method: "POST",
            body: JSON.stringify({
                "methodName": "method1",
                "responseTimeoutInSeconds": 200,
                "payload": "sudo airodump-ng wlan1mon"
            }),
            headers: {
                'Authorization': accessSignature,
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(json => console.log(json));
        data = { "type": "message", "text": `Method called successfully` };
    }
    res.send(data);
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});