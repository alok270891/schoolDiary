const leaveModel = require('./leaveModel');
const utils = require('../../helper/utils');
const config = require('../../config/config');
const waterfall = require('async-waterfall');
let leaveCtr = {};

leaveCtr.create = (req, res) => {
    let input = req.body;
    let loginUser = req.authUser;

    waterfall([
        (callback) => {
            let leaveData = {
                classId: input.classId,
                startDate: input.startDate,
                endDate: input.endDate,
                reason: input.reason,
                schoolId: loginUser.schoolId
            };
            if (input.studentId) {
                leaveData['studentId'] = input.studentId;
            } else {
                leaveData['teacherId'] = loginUser.id;
            }
            leaveModel.createleave(leaveData, (leaveMaster) => {
                callback(null, leaveMaster);
            }, (error) => {
                console.log(error);
                callback(error);
            });
        }
    ], (err, leavedetails) => {
        if (err) {
            return res.status(400).json({ "message": err, data: [], status: false });
        } else {
            let response = {
                "data": leavedetails,
                "message": req.t("LEAVE_CREATED"),
                status: true
            }
            return res.status(200).json(response);
        }
    });
}

leaveCtr.update = (req, res) => {
    let input = req.body;
    let loginUser = req.authUser;
    if (
        (input.status === 'Approve' || input.status === 'Reject') && loginUser &&
        loginUser.userRole && loginUser.userRole === 3 && req.leaveDetails && req.leaveDetails.teacherId
    ) {
        return res.status(400).json({ "message": req.t("NOT_APPROVE_LEAVE", { FIELD: input.status }), data: [], status: false });
    }
    let myClass = [];
    console.log(loginUser.userclasses, 'loginUser.userclasses')
    if (loginUser && loginUser.userclasses) {
        myClass = loginUser.userclasses.some(item => item.classId == req.leaveDetails.classId);
    }
    if (loginUser && loginUser.userRole && loginUser.userRole === 3 && !myClass) {
        return res.status(400).json({ "message": req.t("NOT_APPROVE_LEAVE_OTHER_CLASS", { FIELD: input.status }), data: [], status: false });
    }
    waterfall([
        (callback) => {
            let leaveData = {};
            if (input.reason) {
                leaveData['reason'] = input.reason;
            }
            if (input.endDate) {
                leaveData['endDate'] = input.endDate;
            }
            if (input.startDate) {
                leaveData['startDate'] = input.startDate;
            }
            if (input.status) {
                leaveData['status'] = input.status;
            }

            leaveModel.updateleave(leaveData, { id: input.leaveId }, (leaveDetail) => {
                callback(null);
            }, (err) => {
                console.log(err);
                callback(err);
            });
        }
    ], (err) => {
        if (err) {
            return res.status(400).json({ "message": err });
        } else {
            let response = {
                "data": { "leaveId": input.leaveId },
                "message": req.t("LEAVE_UPDATED")
            }
            return res.status(200).json(response);
        }
    });
}

leaveCtr.leaveList = (req, res) => {
    let input = req.body;
    let limit = config.MAX_RECORDS;
    let searchName = '';
    let loginUser = req.authUser;
    let pg = 0;
    if (utils.isDefined(req.body.pg) && (parseInt(req.body.pg) > 1)) {
        pg = parseInt(req.body.pg - 1) * limit;
    } else {
        if (req.body.pg == -1) {
            pg = 0;
            limit = null;
        }
    }
    let filter = { schoolId: loginUser.schoolId };
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
        filter['status'] = input.status;
    }
    if (!utils.empty(input.endDate) && !utils.empty(input.startDate)) {
        filter['$or'] = [{ endDate: { "$between": [input.startDate, input.endDate] } }, { startDate: { "$between": [input.startDate, input.endDate] } }]
    } else if (!utils.empty(input.endDate)) {
        filter['endDate'] = input.endDate;
    } else if (!utils.empty(input.startDate)) {
        filter['startDate'] = input.startDate;
    }
    if (loginUser.userRole && loginUser.userRole === 2) {
        filter['teacherId'] = { $ne: null };
    } else if (loginUser.userRole) {
        if (input.myleave == 1) {
            filter['teacherId'] = loginUser.id;
        } else {
            if (loginUser && loginUser.userclasses && loginUser.userclasses.length > 0) {
                let classIds = loginUser.userclasses.map(item => item.classId);
                filter['classId'] = { $in: classIds };
                filter['teacherId'] = null;
            }
        }
    } else if (loginUser.userRole !== 1) {
        filter['studentId'] = loginUser.students[0].id;
    }
    leaveModel.getleaveList(filter, searchName, pg, limit, (total, data) => {
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

leaveCtr.getleaveDetails = (req, res) => {
    return res.status(200).json({ "data": req.leave });
}

module.exports = leaveCtr;