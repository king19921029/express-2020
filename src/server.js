const express = require('express');
const app = express();
require('express-async-errors');
const path = require("path");
const helmet = require("helmet");
app.use(helmet());

// app.disable('x-powered-by');

import morgan from 'morgan';
import {logger} from './utils/logger';
app.use(morgan(":date[iso] :remote-addr :method :url :status :user-agent",{stream:logger.stream}))


// 解析body
import bodyParser from 'body-parser';
app.use(bodyParser.json({limit: '100mb'}));
// 解析文本格式
app.use(bodyParser.urlencoded({limit: '100mb', extended: true})); 

// 跨域
if (app.get('env') === 'development') {
    app.use(function (req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', req.get('Origin') || '');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Allow-Headers', 'Authorization,x-requested-with');
        res.setHeader('Access-Control-Allow-Methods', 'POST, GET');
        if (req.method == 'OPTIONS') {
            res.send(200);
        }
        else {
            next();
        }
    });
}
app.use(express.static(__dirname + '/static'))
app.get('/', function (req, res){
    res.sendFile(path.resolve(__dirname, 'static', 'index.html'))
})

import {serverIndex} from "./app"; 
app.use("/api",serverIndex)






app.listen(3000, ()=>{
    console.log(app.get('env'))
    console.log('Server is running at http://localhost:3000')
})






