//Dependencies
const auth = require('../../helper/auth');
const express = require('express');
const schoolCtr = require('./schoolController');
const schoolMiddleware = require('./schoolMiddleware');
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart();
let schoolRouter = express.Router();


//school create
let createschoolMiddleware = [
    multipartMiddleware,
    auth.isAuthenticatedUser,
    schoolMiddleware.validateInput('create'),
    schoolMiddleware.schoolExists,
    schoolCtr.create
];
schoolRouter.post('/create', createschoolMiddleware);

//school udpate

let updateschoolMiddleware = [
    multipartMiddleware,
    auth.isAuthenticatedUser,
    schoolMiddleware.schoolIdExists,
    schoolMiddleware.schoolExists,
    schoolCtr.update
];
schoolRouter.post('/update', updateschoolMiddleware);

//get school list for customer
let schoolListCustomerMiddleware = [
    // auth.isAuthenticatedUser,
    schoolCtr.schoolList
];
schoolRouter.post('/schoolList', schoolListCustomerMiddleware);

module.exports = schoolRouter;