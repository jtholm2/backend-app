import { BlobServiceClient } from '@azure/storage-blob';
import fs from 'fs';
import applicationinsights from 'applicationinsights';
import express from 'express';
import path from 'path';
import fetch from 'node-fetch';
//import { ApplicationInsights } from '@microsoft/applicationinsights-web'
const port = process.env.PORT;
const app = express();

app.use(express.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type')
    next();
});

applicationinsights.setup(`${process.env.instrumentationKey}`)
.setAutoDependencyCorrelation(true)
.setAutoCollectRequests(true)
.setAutoCollectPerformance(true, true)
.setAutoCollectExceptions(true)
.setAutoCollectDependencies(true)
.setAutoCollectConsole(true)
.setUseDiskRetryCaching(true)
.setSendLiveMetrics(false)
.setDistributedTracingMode(applicationinsights.DistributedTracingModes.AI)
.start();
// const appInsights = new ApplicationInsights({ config: {
//     instrumentationKey: `${process.env.instrumentationKey}`
//     /* ...Other Configuration Options... */
//   } });
//   appInsights.loadAppInsights();
//   appInsights.trackPageView();

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

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});