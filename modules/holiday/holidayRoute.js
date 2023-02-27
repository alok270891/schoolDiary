//Dependencies
const auth = require('../../helper/auth');
const express = require('express');
const holidayCtr = require('./holidayController');
const holidayMiddleware = require('./holidayMiddleware');
let holidayRouter = express.Router();


//holiday create
let createholidayMiddleware = [
    auth.isAuthenticatedUser,
    holidayMiddleware.validateInput('create'),
    holidayMiddleware.holidayExists,
    holidayCtr.create
];
holidayRouter.post('/create', createholidayMiddleware);

//holiday udpate

let updateholidayMiddleware = [
    auth.isAuthenticatedUser,
    holidayMiddleware.holidayIdExists,
    holidayMiddleware.holidayExists,
    holidayCtr.update
];
holidayRouter.post('/update', updateholidayMiddleware);

//get holiday list for customer
let holidayListCustomerMiddleware = [
    auth.isAuthenticatedUser,
    holidayCtr.holidayList
];
holidayRouter.post('/list', holidayListCustomerMiddleware);

let deleteMiddleware = [
    auth.isAuthenticatedUser,
    holidayMiddleware.validateInput('delete'),
    holidayMiddleware.holidayIdExists,
    holidayCtr.delete
];
holidayRouter.post('/delete', deleteMiddleware);

module.exports = holidayRouter;