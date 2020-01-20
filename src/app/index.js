const express = require("express");
const app = express();
import * as constants from "../config/constants";
import jwtFnc from "jsonwebtoken";
import logger from "../utils/logger";
import * as user from "./login";
import  multipart from 'connect-multiparty';
const multipartMiddleware = multipart();
import {db_user} from "../config/db";
// 中间件，处理token
async function checkToken(req,res,next){
    let jwt = req.get('Authorization');
    if(!jwt){
        return res.json(constants.ErrorAuthentication);
    }
    // 解析 jwt.verify
    let jwtArr = jwt.split(" ");
    if(jwtArr.length !== 2 || jwtArr[0] !== 'Bearer'){
        return res.json(constants.ErrorAuthentication)
    }
    try{
        // 解析的时候可以知道token是否过期
        let userData = jwtFnc.verify(jwtArr[1],constants.JwtSecret);
        // 校验用户是否存在
        let [rows,d] = await db_user.execute(`SELECT id FROM user WHERE email = ?`, [userData.user]);
        if(rows.length>0){
            req.jwtUsername = userData.user;
        }else{
            return res.json(constants.ErrorAuthentication)
        }   
    }catch(e){
        return res.json(constants.ErrorToken);
    }
    next();
};



app.get("/get",user.get);
app.post("/login",user.login);
app.post("/upload",checkToken,multipartMiddleware,user.getFileData);
app.post("/user/add",user.addUser);
// 那个接口使用，就在路由后边加上这个中间件，校验通过执行next(),才会往下执行
app.get("/user/query",checkToken,user.userList);




// 处理异常
app.use((err,req,res,next)=>{
    next(err);
})
export {app as serverIndex};
