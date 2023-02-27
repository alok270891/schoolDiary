//Dependencies
const auth = require('../../helper/auth');
const express = require('express');
const attendanceCtr = require('./attendanceController');
const attendanceMiddleware = require('./attendanceMiddleware');
const parentMiddleware = require('../parent/parentMiddleware');
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart();
let attendanceRouter = express.Router();

//attendance create
let createattendanceMiddleware = [
    multipartMiddleware,
    auth.isAuthenticatedUser,
    attendanceCtr.create
];
attendanceRouter.post('/create', createattendanceMiddleware);

//attendance udpate
let updateattendanceMiddleware = [
    multipartMiddleware,
    auth.isAuthenticatedUser,
    attendanceCtr.update
];
attendanceRouter.post('/update', updateattendanceMiddleware);

//get attendance list for customer
let attendanceListCustomerMiddleware = [
    auth.isAuthenticatedUser,
    attendanceCtr.attendanceList
];
attendanceRouter.post('/list', attendanceListCustomerMiddleware);

let statusChangeMiddleware = [
    auth.isAuthenticatedUser,
    attendanceMiddleware.validateInput('statusChange'),
    attendanceCtr.statusChange
];
attendanceRouter.post('/statusChange', statusChangeMiddleware);


module.exports = attendanceRouter;