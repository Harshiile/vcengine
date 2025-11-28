"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.s3 = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
exports.s3 = new client_s3_1.S3Client({
    region: "ap-south-1",
    credentials: {
        accessKeyId: process.env.ACCESS_KEY,
        secretAccessKey: process.env.SECRET_KEY,
    },
});
