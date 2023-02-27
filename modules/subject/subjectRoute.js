//Dependencies
const auth = require('../../helper/auth');
const express = require('express');
const subjectCtr = require('./subjectController');
const subjectMiddleware = require('./subjectMiddleware');
let subjectRouter = express.Router();


//subject create
let createsubjectMiddleware = [
    auth.isAuthenticatedUser,
    subjectMiddleware.validateInput('create'),
    subjectMiddleware.subjectExists,
    subjectCtr.create
];
subjectRouter.post('/create', createsubjectMiddleware);

//subject udpate

let updatesubjectMiddleware = [
    auth.isAuthenticatedUser,
    subjectMiddleware.subjectIdExists,
    subjectMiddleware.subjectExists,
    subjectCtr.update
];
subjectRouter.post('/update', updatesubjectMiddleware);

//get subject list for customer
let subjectListCustomerMiddleware = [
    auth.isAuthenticatedUser,
    subjectCtr.subjectList
];
subjectRouter.post('/subjectList', subjectListCustomerMiddleware);

let statusChangeMiddleware = [
    auth.isAuthenticatedUser,
    subjectMiddleware.validateInput('statusChange'),
    subjectMiddleware.subjectIdExists,
    subjectCtr.statusChange
];
subjectRouter.post('/statusChange', statusChangeMiddleware);

module.exports = subjectRouter;