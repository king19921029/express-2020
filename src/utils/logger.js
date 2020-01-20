"use strict";
import fs from "fs";
import {createLogger,format,transports} from "winston";
fs.exists( __dirname + '/../../logs/all.log', function(exists) {
    console.log(exists ? "已存在" : "创建成功");
  });
let logger = createLogger({
    level: 'http',
    handleExceptions: true,
    json: true,
    transports: [
        // 可以定义多个文件，主要输出的info里面的文件
        new transports.File({
            level: 'http',
            filename: __dirname + '/../../logs/all.log',
            maxsize: 52428800,
            maxFiles: 50,
            tailable: true,
            format:format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' })
            }),
        new transports.Console({
            level: 'debug',
            prettyPrint: true,
            colorize: true
        })
    ],
});

logger.stream = {
    write: function(message, encoding){
        logger.http(message);
    }
};

export {logger};