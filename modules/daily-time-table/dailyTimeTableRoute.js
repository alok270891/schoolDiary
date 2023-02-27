//Dependencies
const auth = require('../../helper/auth');
const express = require('express');
const dailyTimeTableCtr = require('./dailyTimeTableController');
const dailyTimeTableMiddleware = require('./dailyTimeTableMiddleware');
let dailyTimeTableRouter = express.Router();


//dailyTimeTable create
let createdailyTimeTableMiddleware = [
    auth.isAuthenticatedUser,
    dailyTimeTableMiddleware.validateInput('create'),
    dailyTimeTableMiddleware.teacherIdExists,
    dailyTimeTableCtr.create
];
dailyTimeTableRouter.post('/create', createdailyTimeTableMiddleware);

//dailyTimeTable udpate

let updatedailyTimeTableMiddleware = [
    auth.isAuthenticatedUser,
    dailyTimeTableMiddleware.dailyTimeTableIdExists,
    dailyTimeTableMiddleware.teacherIdExists,
    dailyTimeTableCtr.update
];
dailyTimeTableRouter.post('/update', updatedailyTimeTableMiddleware);

//get dailyTimeTable list for customer
let dailyTimeTableListCustomerMiddleware = [
    auth.isAuthenticatedUser,
    dailyTimeTableCtr.dailyTimeTableList
];
dailyTimeTableRouter.post('/list', dailyTimeTableListCustomerMiddleware);

let deleteMiddleware = [
    auth.isAuthenticatedUser,
    dailyTimeTableMiddleware.validateInput('delete'),
    dailyTimeTableMiddleware.dailyTimeTableIdExists,
    dailyTimeTableCtr.delete
];
dailyTimeTableRouter.post('/delete', deleteMiddleware);

module.exports = dailyTimeTableRouter;