//Dependencies
const auth = require('../../helper/auth');
const express = require('express');
const standardCtr = require('./standardController');
const standardMiddleware = require('./standardMiddleware');
let standardRouter = express.Router();


//standard create
let createstandardMiddleware = [
    auth.isAuthenticatedUser,
    standardMiddleware.validateInput('create'),
    standardMiddleware.standardExists,
    standardCtr.create
];
standardRouter.post('/create', createstandardMiddleware);

//standard udpate

let updatestandardMiddleware = [
    auth.isAuthenticatedUser,
    standardMiddleware.standardIdExists,
    standardMiddleware.standardExists,
    standardCtr.update
];
standardRouter.post('/update', updatestandardMiddleware);

//get standard list for customer
let standardListCustomerMiddleware = [
    auth.isAuthenticatedUser,
    standardCtr.standardList
];
standardRouter.post('/standardList', standardListCustomerMiddleware);


let statusChangeMiddleware = [
    auth.isAuthenticatedUser,
    standardMiddleware.validateInput('statusChange'),
    standardMiddleware.standardIdExists,
    standardCtr.statusChange
];
standardRouter.post('/statusChange', statusChangeMiddleware);

module.exports = standardRouter;