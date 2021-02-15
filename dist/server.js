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
const storage_blob_1 = require("@azure/storage-blob");
const fs_1 = __importDefault(require("fs"));
//import * as appinsights from 'applicationinsights';
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const port = process.env.PORT;
const app = express_1.default();
app.use(express_1.default.json());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
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
app.get('/iss', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield node_fetch_1.default("http://api.open-notify.org/iss-now.json");
    const data = yield response.json();
    res.json(data);
}));
app.post('/azurestorage', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const fileName = req.body.fileName;
    if (fileName === 'blank') {
        res.json({ "html": { "h1": "<h1>You need to select a file from the drop down.</h1>" } });
    }
    else if (fs_1.default.existsSync(path_1.default.join(__dirname, '..', 'storedfiles', `${fileName}`))) {
        const rawdata = fs_1.default.readFileSync(path_1.default.join(__dirname, '..', 'storedfiles', `${fileName}`));
        const testData = JSON.parse(rawdata.toString());
        res.json(testData);
    }
    else {
        const blobServiceClient = storage_blob_1.BlobServiceClient.fromConnectionString("DefaultEndpointsProtocol=https;AccountName=jtholmeswebappstorage;AccountKey=x1/LjGRM4BAKzWsioaRKVbcCI/lfrnIvyUHS0bipK7kg+zfdqiC0tKgMiQsA+dOQS9D/nsT5xsfjk1g1aRudqQ==;EndpointSuffix=core.windows.net");
        const containerClient = blobServiceClient.getContainerClient("json-retrieval-html-render");
        containerClient.getBlockBlobClient(fileName).downloadToFile(path_1.default.join(__dirname, '..', 'storedfiles', `${fileName}`));
        while (!fs_1.default.existsSync(path_1.default.join(__dirname, '..', 'storedfiles', `${fileName}`))) {
            yield new Promise(resolve => setTimeout(resolve, 500));
        }
        const rawdata = fs_1.default.readFileSync(path_1.default.join(__dirname, '..', 'storedfiles', `${fileName}`));
        const testData = JSON.parse(rawdata.toString());
        res.json(testData);
    }
}));
app.post('/rpi', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const method = req.body.text;
    console.log(req.body.text);
    const iotHubUrl = "https://jt-iot-hub.azure-devices.net/twins/rpi4-test-jt/methods?api-version=2018-06-30";
    const accessSignature = 'SharedAccessSignature sr=jt-iot-hub.azure-devices.net&sig=JSadXucZaGxcdw85YEux%2FEZ02YBDXU6B0tZ5neFxSaI%3D&se=1613431482&skn=iothubowner';
    let data = { "type": "message", "text": `Method call didn't work` };
    if (method === '<at>rpi</at> start') {
        node_fetch_1.default(iotHubUrl, {
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
}));
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
//# sourceMappingURL=server.js.map