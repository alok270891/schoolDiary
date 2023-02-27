//Dependencies
const auth = require('../../helper/auth');
const express = require('express');
const parentCtr = require('./parentController');
const userCtr = require('../user/userController');
const parentMiddleware = require('./parentMiddleware');
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart();
let parentRouter = express.Router();


//parent create
let createparentMiddleware = [
    auth.isAuthenticatedUser,
    parentMiddleware.validateInput('create'),
    parentCtr.create
];
parentRouter.post('/create', createparentMiddleware);

let loginparentMiddleware = [
    parentMiddleware.validateInput('login'),
    parentCtr.login
];
parentRouter.post('/login', loginparentMiddleware);

//parent udpate

let updateparentMiddleware = [
    multipartMiddleware,
    auth.isAuthenticatedUser,
    // parentMiddleware.parentIdExists,
    parentCtr.update
];
parentRouter.post('/update', updateparentMiddleware);

//get parent list for customer
let parentListCustomerMiddleware = [
    auth.isAuthenticatedUser,
    parentCtr.parentList
];
parentRouter.post('/list', parentListCustomerMiddleware);

let statusChangeMiddleware = [
    auth.isAuthenticatedUser,
    parentMiddleware.validateInput('statusChange'),
    parentCtr.statusChange
];
parentRouter.post('/statusChange', statusChangeMiddleware);

let forgotPasswordMiddleware = [parentMiddleware.validateInput("forgotPassword"), userCtr.forgotPassword];
parentRouter.post('/forgot-password', forgotPasswordMiddleware);

let resetpasswordMiddleware = [
    auth.isAuthenticatedUser,
    parentMiddleware.validateInput("resetpassword"),
    userCtr.resetPassword
];
parentRouter.post('/resetpassword', resetpasswordMiddleware);


module.exports = parentRouter;