let express = require('express');
let app = express.Router();
app.use('/apidoc', express.static('apidoc'));
app.use('/admin', express.static('admin'));
app.use('/api/v1/user', require('./modules/user/userRoute'));
app.use('/api/v1/subject', require('./modules/subject/subjectRoute'));
app.use('/api/v1/class', require('./modules/class/classRoute'));
app.use('/api/v1/standard', require('./modules/standard/standardRoute'));
app.use('/api/v1/school', require('./modules/school/schoolRoute'));
app.use('/api/v1/parent', require('./modules/parent/parentRoute'));
app.use('/api/v1/student', require('./modules/student/studentRoute'));
app.use('/api/v1/homework', require('./modules/home-work/homeWorkRoute'));
app.use('/api/v1/parent/homework', require('./modules/parent-home-work/parentHomeworkRoute'));
app.use('/api/v1/attendance', require('./modules/attendance/attendanceRoute'));
app.use('/api/v1/leave', require('./modules/leave/leaveRoute'));
app.use('/api/v1/event', require('./modules/event/eventRoute'));
app.use('/api/v1/holiday', require('./modules/holiday/holidayRoute'));
app.use('/api/v1/breakfast', require('./modules/breakfast/breakfastRoute'));
app.use('/api/v1/dailytimetable', require('./modules/daily-time-table/dailyTimeTableRoute'));
app.use('/api/v1/notification', require('./modules/notification/notificationRoute'));
app.use('/api/v1/examtype', require('./modules/exam-type/examTypeRoute'));
app.use('/api/v1/examtimetable', require('./modules/exam-time-table/examTimeTableRoute'));
app.use('/api/v1/draftUser', require('./modules/draft/draftRoute'));
app.all('/*', function(req, res) {
    return errorUtil.notFound(res, req);
});
module.exports = app;