import * as cloudinary from 'cloudinary';
// import { v2 as cloudinary } from 'cloudinary';
import path from "node:path"
import dotenv from "dotenv"
dotenv.config({ path: path.resolve("./src/config/.env.dev") })


    cloudinary.v2.config({
        cloud_name: process.env.cloud_name,
        secure: true,
        api_key: process.env.api_key,
        api_secret: process.env.api_secret
    });


export default cloudinary.v2
