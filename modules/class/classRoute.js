//Dependencies
const auth = require('../../helper/auth');
const express = require('express');
const classCtr = require('./classController');
const classMiddleware = require('./classMiddleware');
let classRouter = express.Router();


//class create
let createclassMiddleware = [
    auth.isAuthenticatedUser,
    classMiddleware.validateInput('create'),
    classMiddleware.classExists,
    classMiddleware.standardIdExists,
    classCtr.create
];
classRouter.post('/create', createclassMiddleware);

//class udpate

let updateclassMiddleware = [
    auth.isAuthenticatedUser,
    classMiddleware.classIdExists,
    classMiddleware.classExists,
    classMiddleware.standardIdExists,
    classCtr.update
];
classRouter.post('/update', updateclassMiddleware);

//get class list for customer
let classListCustomerMiddleware = [
    auth.isAuthenticatedUser,
    classCtr.classList
];
classRouter.post('/classList', classListCustomerMiddleware);

let statusChangeMiddleware = [
    auth.isAuthenticatedUser,
    classMiddleware.validateInput('statusChange'),
    classMiddleware.classIdExists,
    classCtr.statusChange
];
classRouter.post('/statusChange', statusChangeMiddleware);

module.exports = classRouter;