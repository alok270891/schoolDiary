//Dependencies
const auth = require('../../helper/auth');
const express = require('express');
const eventCtr = require('./eventController');
const eventMiddleware = require('./eventMiddleware');
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart();
let eventRouter = express.Router();


//event create
let createeventMiddleware = [
    multipartMiddleware,
    auth.isAuthenticatedUser,
    eventMiddleware.validateInput('create'),
    eventCtr.create
];
eventRouter.post('/create', createeventMiddleware);

//event udpate

let updateeventMiddleware = [
    multipartMiddleware,
    auth.isAuthenticatedUser,
    eventMiddleware.eventIdExists,
    eventCtr.update
];
eventRouter.post('/update', updateeventMiddleware);

//get event list for customer
let eventListCustomerMiddleware = [
    auth.isAuthenticatedUser,
    eventCtr.eventList
];
eventRouter.post('/list', eventListCustomerMiddleware);

let statusChangeMiddleware = [
    auth.isAuthenticatedUser,
    eventMiddleware.validateInput('statusChange'),
    eventMiddleware.eventIdExists,
    eventCtr.statusChange
];
eventRouter.post('/statusChange', statusChangeMiddleware);

let uploadeventfileMiddleware = [
    multipartMiddleware,
    auth.isAuthenticatedUser,
    eventMiddleware.eventIdExists,
    eventCtr.uploadeventfile
];
eventRouter.post('/uploadeventfile', uploadeventfileMiddleware);

module.exports = eventRouter;