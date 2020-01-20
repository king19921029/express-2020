import {db_user} from "../config/db";
import * as constants from "../config/constants";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import fs from "fs";
import xlsx from "node-xlsx";
async function loginAsync(req,res){
    let email = req.body.username;
    let password = req.body.password;
    if(!email||!password){
        return res.json(Object.assign({},constants.ErrorParam,{data:null}))
    }
    let [result,d] = await db_user.execute(`select password from user where email = ?`,[email]);
    let [algorithm, iterations, salt, hash] = result[0].password.split('$', 4);
    let valid = await comparePassword(password, salt, parseInt(iterations, 10), 32, 'sha256', hash);
    if(valid){
        // 返回token
        const token = jwt.sign({user:req.body.username},constants.JwtSecret,{expiresIn:"10h"});
        res.json(Object.assign({},constants.Success,{data:{token:token}}))
    }else{
        res.json(Object.assign({},constants.ErrorPassword,{data:null}))
    }
}
function comparePassword(password, salt, iterations, keylen, digest, hash) {
    return new Promise(function(resolve, reject) {
        crypto.pbkdf2(password, salt, iterations, keylen, digest, (err, key) => {
            console.log(11,key.toString('base64'))
            if (err) {
                reject(err);
            } else {
                resolve(key.toString('base64') === hash);
            }
        })
    });
}
async function getFileDataAsync(req,res){
    console.log(111,req.jwtUsername,req.files)
    const filePath = req.files.file.path;
    // 读取xlsx文件
    const data = xlsx.parse(req.files.file.path);
    console.log(data[0]["data"][0])
    res.json(Object.assign({},constants.Success,{data:{token:null}}))
}
async function getAsync(req,res){
     res.json(Object.assign({},{msg:"成功",code:0},{data:null}))
     return
}
// 新增用户函数
async function addUserAsync(req,res){
    let realname = req.body.realname;
    let email = req.body.email;
    let password = req.body.password;
    if(!realname||!email||!password){
        res.json(Object.assign({},constants.ErrorParam,{data:null}));
        return 
    }
    let pass = await makePassword(password,'9MnqsfOH',1000,32,'sha256');
    if(pass){
        pass = 'pbkdf2_sha256$'+1000+"$9MnqsfOH$"+pass;
    }
    await db_user.execute(`INSERT INTO user (realname,password,email,is_link) VALUES(?,?,?,?)`,[realname,pass,email,1]);
    res.json(Object.assign({},constants.Success,{data:null}))
}
function makePassword(password, salt, iterations, keylen, digest) {
    return new Promise(function(resolve, reject) {
      crypto.pbkdf2(password, salt, iterations, keylen, digest, (err, key) => {
        if (err) {
          reject(err);
        } else {
          resolve(key.toString('base64'));
        }
      })
    });
}
async function userListAsync(req,res){
    let realname = req.query.realname;
    if(!realname){
        res.json(Object.assign({},constants.ErrorParam,{data:null}));
        return 
    }
    let [rows,d] = await db_user.execute(`SELECT * FROM user WHERE realname = ?`,[realname]);
    res.json(Object.assign({},constants.Success,{data:rows[0]}))
}

// 捕获错误
const wrap = fn => (...args) => fn(...args).catch(e=>{console.log(e)})
let login = wrap(loginAsync);
let getFileData = wrap(getFileDataAsync);
let get = wrap(getAsync);
let addUser = wrap(addUserAsync);
let userList = wrap(userListAsync);
export {login,getFileData,get,addUser,userList}







