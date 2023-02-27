const attendanceModel = require('./attendanceModel');
const utils = require('../../helper/utils');
const config = require('../../config/config');
const waterfall = require('async-waterfall');
const studentModel = require('../student/studentModel');
const notificationModel = require('../notification/notificationModel');
let attendanceCtr = {};

attendanceCtr.create = (req, res) => {
    let input = req.body;
    let loginUser = req.authUser;
    if (!utils.empty(input.student) && typeof input.student === 'object' && input.student.length > 0) {
        let myClass = loginUser.userclasses.some(item => item.classId == input.student[0].classId);
        if (loginUser && loginUser.userRole && loginUser.userRole === 3 && !myClass) {
            return res.status(400).json({ "message": req.t("NOT_APPROVE_LEAVE_OTHER_CLASS", { FIELD: "add attendance" }), data: [], status: false });
        }
        waterfall([
            (callback) => {
                let createData = [];
                input.student.map(obj => {
                    createData.push({
                        studentId: obj.studentId,
                        classId: obj.classId,
                        attendanceDate: obj.attendanceDate,
                        status: obj.status
                    });
                });
                attendanceModel.createattendanceMulti(createData, (details) => {
                    callback(null, details);
                }, (error) => {
                    callback(error);
                });
            }
        ], (err, attendanceDetails) => {
            if (err) {
                return res.status(400).json({ "message": err, data: [], status: false });
            } else {
                attendanceCtr.sendnotification(input);
                let response = {
                    "data": attendanceDetails,
                    "message": req.t("ATTENDANCE_CREATED"),
                    status: true
                }
                return res.status(200).json(response);
            }
        });
    } else {
        let response = {
            "data": [],
            "message": req.t("STUDENT_ARRAY_NOT_VALID"),
            status: true
        }
        return res.status(200).json(response);
    }
}

attendanceCtr.update = (req, res) => {
    let input = req.body;
    let loginUser = req.authUser;
    if (!utils.empty(input.student) && typeof input.student === 'object' && input.student.length > 0) {
        waterfall([
            (callback) => {
                attendanceModel.getattendanceById(input.student[0].id, (attendanceDetails) => {
                    let myClass = loginUser.userclasses.some(item => item.classId == attendanceDetails.classId);
                    if (loginUser && loginUser.userRole && loginUser.userRole === 3 && !myClass) {
                        callback(req.t("NOT_APPROVE_LEAVE_OTHER_CLASS", { FIELD: "add attendance" }));
                    } else {
                        callback(null);
                    }
                }, (error) => {
                    callback(error);
                });
            },
            (callback) => {
                input.student.map(obj => {
                    attendanceModel.updateattendance({ status: obj.status }, { id: obj.id }, (attendanceMaster) => {}, (error) => {});
                });
                callback(null);
            }
        ], (err) => {
            if (err) {
                return res.status(400).json({ "message": req.t("DB_ERROR"), "data": [], status: false });
            } else {
                let response = {
                    "data": [],
                    "message": req.t("ATTENDANCE_UPDATED"),
                    status: true
                }
                return res.status(200).json(response);
            }
        });
    } else {
        let response = {
            "data": [],
            "message": req.t("STUDENT_ARRAY_NOT_VALID"),
            status: true
        }
        return res.status(200).json(response);
    }
}

attendanceCtr.attendanceList = (req, res) => {
    let filter = {};
    let input = req.body;
    let limit = config.MAX_RECORDS;
    let searchName = '';
    let pg = 0;
    let loginUser = req.authUser;
    if (utils.isDefined(req.body.pg) && (parseInt(req.body.pg) > 1)) {
        pg = parseInt(req.body.pg - 1) * limit;
    } else {
        if (req.body.pg == -1) {
            pg = 0;
            limit = null;
        }
    }
    if (loginUser && loginUser.userRole && loginUser.userRole === 3) {
        let classIds = loginUser.userclasses.map(item => item.classId);
        filter["classId"] = (!utils.empty(input.classId)) ? input.classId : { "$in": classIds };
    } else {
        if (!utils.empty(input.classId)) {
            filter['classId'] = input.classId;
        }
    }
    if (!utils.empty(input.searchName)) {
        searchName = input.searchName;
    }
    if (!utils.empty(input.status)) {
        filter['status'] = input.status.toUpperCase();
    }
    if (!utils.empty(input.studentId)) {
        filter['studentId'] = input.studentId;
    }
    if (!utils.empty(input.attendanceDate)) {
        filter['attendanceDate'] = { $eq: input.attendanceDate };
    }
    if (!utils.empty(input.startDate) && !utils.empty(input.endDate)) {
        filter['attendanceDate'] = { $between: [input.startDate, input.endDate] };
    }

    attendanceModel.getAttendanceList(loginUser, filter, searchName, pg, limit, (total, data) => {
        if (total > 0) {
            let pages = Math.ceil(total / ((limit) ? limit : total));
            let pagination = {
                pages: pages ? pages : 1,
                total: total,
                max: (limit) ? limit : total
            };
            return res.status(200).json({ pagination: pagination, data: data, message: '', status: true });
        } else {
            return res.status(200).json({ "message": req.t("NO_RECORD_FOUND"), data: [], status: true });
        }
    }, (err) => {
        return res.status(500).json({ "message": req.t("DB_ERROR"), data: [], status: false });
    });
}

attendanceCtr.getattendanceDetails = (req, res) => {
    return res.status(200).json({ "data": req.attendance });
}

attendanceCtr.statusChange = (req, res) => {
    let input = req.body;
    let updateData = { status: input.status };
    let filter = { id: input.attendanceId };
    attendanceModel.updateattendance(updateData, filter, (userUpdate) => {
        return res.status(200).json({ data: [], status: true, message: req.t("STATUS_CHANGE") });
    }, (err) => {
        console.log(err);
        return res.status(500).json({ data: [], status: false, message: req.t("DB_ERROR") });
    });
}


attendanceCtr.sendnotification = (input, type) => {
    let parentsIds = [];
    let stdsIds = input.student.map(obj => +obj.studentId);
    studentModel.loaduser({ id: { $in: stdsIds } }, (res) => {
        if (res && res.length > 0) {
            res.map((obj) => {
                let data = {
                    parentId: obj.parentId,
                    title: 'New attendance added for date ' + input.student[0].attendanceDate,
                    dateTime: Date.now()
                }
                parentsIds.push(obj.parentId);
                notificationModel.createnotification(data, (res) => {}, (err) => {});
            });
            let filter = {};
            input['title'] = 'Attendance';
            input['body'] = 'New attendance added for date ' + input.student[0].attendanceDate;
            input['sendto'] = 'parent';
            filter = { parentId: { $in: parentsIds } };
            attendanceCtr.sndnotification(input, filter);
        }
    }, (err) => {});
}


attendanceCtr.sndnotification = (input, filter) => {
    userInstallations.loadRecords(filter, (deviceList) => {
        deviceList = deviceList.map(function(sensor) { return sensor.dataValues });
        if (!utils.empty(deviceList) && deviceList.length > 0) {
            deviceList.map((obj) => {
                notificationUtils.sendPushNotification(input, obj.deviceToken, (user) => {}, (err) => {});
            });
        }
    }, (err) => {});
}


module.exports = attendanceCtr;