//Dependencies
const auth = require('../../helper/auth');
const express = require('express');
const parentHomeworkCtr = require('./parentHomeworkController');
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart();
let parentHomeworkRouter = express.Router();

//homeWork create
let createparentHomeworkMiddleware = [
    multipartMiddleware,
    auth.isAuthenticatedUser,
    parentHomeworkCtr.create
];
parentHomeworkRouter.post('/create', createparentHomeworkMiddleware);

let homeWorkListCustomerMiddleware = [
    auth.isAuthenticatedUser,
    parentHomeworkCtr.homeWorkList
];
parentHomeworkRouter.post('/list', homeWorkListCustomerMiddleware);

module.exports = parentHomeworkRouter;