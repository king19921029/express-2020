import mysql from "mysql2/promise";
import {MysqlUser} from "./constants";
const db_user = mysql.createPool(MysqlUser);


export {db_user}





