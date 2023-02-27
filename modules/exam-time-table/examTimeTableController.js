const examTimeTableModel = require('./examTimeTableModel');
const utils = require('../../helper/utils');
const config = require('../../config/config');
const waterfall = require('async-waterfall');
let examTimeTableCtr = {};

examTimeTableCtr.create = (req, res) => {
    let input = req.body;
    let loginUser = req.authUser;
    waterfall([
        (callback) => {
            if (!utils.empty(input.examTimeTable) && typeof input.examTimeTable === 'object' && input.examTimeTable.length > 0) {
                let createData = [];
                input.examTimeTable.map((obj) => {
                    let examTimeTableData = {
                        examTypeId: obj.examTypeId,
                        subjectId: obj.subjectId,
                        duration: obj.duration,
                        examDate: obj.examDate,
                        classId: obj.classId,
                        name: obj.name,
                        day: obj.day,
                        schoolId: (loginUser && loginUser.userRole && loginUser.userRole === 1) ? obj.schoolId : loginUser.schoolId
                    };
                    if (!utils.empty(obj.examTime)) {
                        examTimeTableData.examTime = obj.examTime;
                    }
                    if (!utils.empty(obj.totalmarks)) {
                        examTimeTableData.totalmarks = obj.totalmarks;
                    }
                    if (!utils.empty(obj.status)) {
                        examTimeTableData.status = obj.status;
                    }
                    createData.push(examTimeTableData);
                });

                examTimeTableModel.createexamTimeTablemulti(createData, (examTimeTableMaster) => {
                    callback(null, examTimeTableMaster);
                }, (error) => {
                    console.log(error);
                    callback(error);
                });
            } else {
                callback(req.t('EXAM_TIME_TABLE_REQUIRED'))
            }
        },
        (examTimeTableId, callback) => {
            let ids = examTimeTableId.map(obj => obj.id);
            examTimeTableModel.getexamTimeTable({ id: ids }, (examTimeTableDetails) => {
                if (!utils.empty(examTimeTableDetails) && examTimeTableDetails.length > 0) {
                    callback(null, examTimeTableDetails);
                } else {
                    callback(null, null);
                }
            }, (err) => {
                callback(req.t('DB_ERROR'));
            });
        }
    ], (err, examTimeTableDetails) => {
        if (err) {
            return res.status(400).json({ "message": err, data: [], status: false });
        } else {
            let response = {
                "data": examTimeTableDetails,
                "message": req.t("EXAM_TIME_TABLE_CREATED"),
                status: true
            }
            return res.status(200).json(response);
        }
    });
}

examTimeTableCtr.update = (req, res) => {
    let input = req.body;
    let examTimeTableId = req.body.examTimeTableId;
    let loginUser = req.authUser;
    waterfall([
        (callback) => {
            let examTimeTableData = {};
            if (!utils.empty(input.examTypeId)) {
                examTimeTableData.examTypeId = input.examTypeId;
            }
            if (!utils.empty(input.day)) {
                examTimeTableData.day = input.day;
            }
            if (!utils.empty(input.subjectId)) {
                examTimeTableData.subjectId = input.subjectId;
            }
            if (!utils.empty(input.classId)) {
                examTimeTableData.classId = input.classId;
            }
            if (!utils.empty(input.name)) {
                examTimeTableData.name = input.name;
            }
            if (!utils.empty(input.totalmarks)) {
                examTimeTableData.totalmarks = input.totalmarks;
            }
            if (!utils.empty(input.duration)) {
                examTimeTableData.duration = input.duration;
            }
            if (!utils.empty(input.examDate)) {
                examTimeTableData.examDate = input.examDate;
            }
            if (!utils.empty(input.status)) {
                examTimeTableData.status = input.status;
            }
            if (!utils.empty(input.examTime)) {
                examTimeTableData.examTime = input.examTime;
            }
            examTimeTableModel.updateexamTimeTable(examTimeTableData, { id: examTimeTableId }, (examTimeTableDetail) => {
                callback(null);
            }, (err) => {
                console.log(err);
                callback(err);
            });
        },
        (callback) => {
            examTimeTableModel.getexamTimeTable({ id: examTimeTableId }, (examTimeTableDetails) => {
                if (!utils.empty(examTimeTableDetails) && examTimeTableDetails.length > 0) {
                    callback(null, examTimeTableDetails[0].dataValues);
                } else {
                    callback(null, null);
                }
            }, (err) => {
                callback(req.t('DB_ERROR'));
            });
        }
    ], (err, examTimeTableDetails) => {
        if (err) {
            return res.status(400).json({ "message": err });
        } else {
            let response = {
                "data": examTimeTableDetails,
                "message": req.t("EXAM_TIME_TABLE_UPDATED")
            }
            return res.status(200).json(response);
        }
    });
}

examTimeTableCtr.examTimeTableList = (req, res) => {
    let loginUser = req.authUser;
    let filter = {};
    let input = req.body;
    let limit = config.MAX_RECORDS;
    let searchName = '';
    let pg = 0;
    if (utils.isDefined(req.body.pg) && (parseInt(req.body.pg) > 1)) {
        pg = parseInt(req.body.pg - 1) * limit;
    } else {
        if (req.body.pg == -1) {
            pg = 0;
            limit = null;
        }
    }
    if (!utils.empty(input.subjectId)) {
        filter['subjectId'] = input.subjectId;
    }
    if (!utils.empty(input.examTypeId)) {
        filter['examTypeId'] = input.examTypeId;
    }
    if (!utils.empty(input.examDate)) {
        filter['examDate'] = input.examDate;
    }
    if (!utils.empty(input.day)) {
        filter['day'] = input.day;
    }
    if (!utils.empty(req.body.status)) {
        filter["status"] = (req.body.status).toUpperCase();
    }
    if (!utils.empty(input.startDate) && !utils.empty(input.endDate)) {
        filter['examDate'] = { $between: [input.startDate, input.endDate] };
    }
    if (loginUser && loginUser.userRole && loginUser.userRole === 1) {
        if (!utils.empty(input.schoolId)) {
            filter["schoolId"] = input.schoolId;
        }
    } else {
        filter["schoolId"] = loginUser.schoolId;
    }
    examTimeTableModel.getexamTimeTableList('list', filter, searchName, pg, limit, (total, data) => {
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


examTimeTableCtr.getresult = (req, res) => {
    let loginUser = req.authUser;
    let filter = {};
    let input = req.body;
    let limit = config.MAX_RECORDS;
    let studentId = 0;
    let pg = 0;
    if (utils.isDefined(req.body.pg) && (parseInt(req.body.pg) > 1)) {
        pg = parseInt(req.body.pg - 1) * limit;
    } else {
        if (req.body.pg == -1) {
            pg = 0;
            limit = null;
        }
    }
    if (loginUser && loginUser.students && loginUser.students.length > 0) {
        studentId = loginUser.students[0].id;
    }
    if (!utils.empty(input.subjectId)) {
        filter['subjectId'] = input.subjectId;
    }
    if (!utils.empty(input.examTypeId)) {
        filter['examTypeId'] = input.examTypeId;
    }
    if (!utils.empty(input.examDate)) {
        filter['examDate'] = input.examDate;
    }
    if (!utils.empty(input.startDate) && !utils.empty(input.endDate)) {
        filter['examDate'] = { $between: [input.startDate, input.endDate] };
    }
    if (!utils.empty(input.id)) {
        filter['id'] = input.id;
    }
    if (!utils.empty(req.body.status)) {
        filter["status"] = (req.body.status).toUpperCase();
    }
    if (loginUser && loginUser.userRole && loginUser.userRole === 1) {
        if (!utils.empty(input.schoolId)) {
            filter["schoolId"] = input.schoolId;
        }
    } else {
        filter["schoolId"] = loginUser.schoolId;
    }

    examTimeTableModel.getexamTimeTableResultList(filter, studentId, (data) => {
        if (data && data.length > 0) {
            let pages = Math.ceil(data.length / ((limit) ? limit : data.length));
            let pagination = {
                pages: pages ? pages : 1,
                total: data.length,
                max: (limit) ? limit : data.length
            };
            return res.status(200).json({ pagination: pagination, data: data, message: '', status: true });
        } else {
            return res.status(200).json({ "message": req.t("NO_RECORD_FOUND"), data: [], status: true });
        }
    }, (err) => {
        return res.status(500).json({ "message": req.t("DB_ERROR"), data: [], status: false });
    });
}

examTimeTableCtr.delete = (req, res) => {
    let input = req.body;
    let role = req.authUser.userRole;
    if (!utils.empty(role)) {
        let filter = { id: input.examTimeTableId };
        examTimeTableModel.deleteexamTimeTable(filter, (userUpdate) => {
            return res.status(200).json({ data: [], status: true, message: req.t("EXAM_TIME_TABLE_DELETE") });
        }, (err) => {
            console.log(err);
            return res.status(500).json({ data: [], status: false, message: req.t("DB_ERROR") });
        });
    } else {
        return res.status(500).json({ data: [], status: false, message: req.t("NOT_AUTHORIZED") });
    }
}

module.exports = examTimeTableCtr;