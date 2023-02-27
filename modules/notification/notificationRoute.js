//Dependencies
const auth = require('../../helper/auth');
const express = require('express');
const notificationCtr = require('./notificationController');
const notificationMiddleware = require('./notificationMiddleware');
let notificationRouter = express.Router();


//notification create
let createnotificationMiddleware = [
    auth.isAuthenticatedUser,
    notificationMiddleware.validateInput('create'),
    notificationMiddleware.notificationExists,
    notificationCtr.create
];
notificationRouter.post('/create', createnotificationMiddleware);

//get notification list for customer
let notificationListCustomerMiddleware = [
    auth.isAuthenticatedUser,
    notificationCtr.notificationList
];
notificationRouter.post('/list', notificationListCustomerMiddleware);

let deleteMiddleware = [
    auth.isAuthenticatedUser,
    notificationMiddleware.validateInput('delete'),
    notificationMiddleware.notificationIdExists,
    notificationCtr.delete
];
notificationRouter.post('/delete', deleteMiddleware);

module.exports = notificationRouter;