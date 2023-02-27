const homeWorkModel = require('./homeWorkModel');
const commentModel = require('./commentModel');
const homeWorkUtil = require('./homeWorkHelper');
const homeWorkdocumentModel = require('./homeWorkFileModel');
const homeworkstatusModel = require('./homeworkStatusModel');
const notificationModel = require('../notification/notificationModel');
const studentModel = require('../student/studentModel');
const utils = require('../../helper/utils');
const config = require('../../config/config');
const notificationUtils = require('../../helper/notificationUtils');
const userInstallations = require('../user/installationModel');
const waterfall = require('async-waterfall');
let homeWorkCtr = {};

homeWorkCtr.create = (req, res) => {
    console.log("file check before waterfall====", req.files)
    let input = req.body;
    let loginUser = req.authUser;
    // let myClass = loginUser.userclasses.some(item => item.classId == input.classId);
    // if (loginUser && loginUser.userRole && loginUser.userRole === 3 && !myClass) {
    //     return res.status(400).json({ "message": req.t("NOT_APPROVE_LEAVE_OTHER_CLASS", { FIELD: "add homework" }), data: [], status: false });
    // }
    if (loginUser && loginUser.userRole && loginUser.userRole === 1 && utils.empty(input.schoolId)) {
        return res.status(400).json({ "message": req.t("INVALID‌‌‌‌_SELECT_FIELD", { FIELD: "School" }), data: [], status: false });
    }
    waterfall([
        (callback) => {
            if (!utils.empty(req.files) && !utils.empty(req.files.document)) {
                homeWorkUtil.savehomeWorkImage(req.files, null, (error, imagepath) => {
                    if (!utils.empty(error)) {
                        callback(error, "");
                    } else {
                        callback(null, imagepath);
                    }
                });
            } else {
                callback(null, null);
            }
        },
        (image, callback) => {
            let createData = {
                subjectId: input.subjectId,
                classId: input.classId,
                title: input.title,
                deadlineDate: input.deadlineDate,
                startDate: input.startDate,
                teacherId: loginUser.id,
                schoolId: (loginUser && loginUser.userRole && loginUser.userRole === 1) ? input.schoolId : loginUser.schoolId
            };
            if (input.description) {
                createData['description'] = input.description;
            }
            homeWorkModel.createhomwWork(createData, (homeworkDetails) => {
                callback(null, homeworkDetails, image);
            }, (error) => {
                callback(error);
            });
        },
        (homeworkDetails, image, callback) => {
            if (image && image.length > 0) {
                let fileData = [];
                image.map(obj => {
                    fileData.push({ homeworkId: homeworkDetails.id, documentFile: obj.name, size: obj.size, mimetype: obj.mimetype });
                    
                });
                homeWorkdocumentModel.createhomeworkdocumentMulti(fileData, (res) => {
                    callback(null, homeworkDetails);
                }, (error) => {
                    callback(error);
                });
            } else {
                callback(null, homeworkDetails);
            }
        },
        (homeworkDetails, callback) => {
            studentModel.getStudentsIds({ classId: input.classId }, (res) => {
                if (res && res.length > 0) {
                    let statusCreateData = [];
                    res.map((obj) => {
                        statusCreateData.push({ homeworkId: homeworkDetails.id, studentId: obj.id });
                    });
                    homeworkstatusModel.createhomeworkstatusMulti(statusCreateData, (res) => {
                        callback(null, homeworkDetails);
                    }, (error) => {
                        callback(error);
                    });
                } else {
                    callback(null, homeworkDetails);
                }
            }, (error) => {
                callback(error);
            });
        },
        (homeworkDetails, callback) => {
            homeWorkModel.gethomwWork({ id: homeworkDetails.id }, (homeWorkDetails) => {
                if (!utils.empty(homeWorkDetails) && homeWorkDetails.length > 0) {
                    callback(null, homeWorkDetails[0].dataValues);
                } else {
                    callback(null, null);
                }
            }, (err) => {
                callback(req.t("DB_ERROR"));
            });
        }
    ], (err, homeWorkDetails) => {
        console.log(err, 'error')
        if (err) {
            return res.status(400).json({ "message": err, data: [], status: false });
        } else {
            let response = {
                "data": homeWorkDetails,
                "message": req.t("HOMEWORK_CREATED"),
                status: true
            }
            homeWorkCtr.sendnotification(input, 'createhomework');
            return res.status(200).json(response);
        }
    });
}

homeWorkCtr.update = (req, res) => {
    let input = req.body;
    let loginUser = req.authUser;
    let myClass = loginUser.userclasses.some(item => item.classId == input.classId);
    // if (loginUser && loginUser.userRole && loginUser.userRole === 3 && !myClass) {
    //     return res.status(400).json({ "message": req.t("NOT_APPROVE_LEAVE_OTHER_CLASS", { FIELD: "update homework" }), data: [], status: false });
    // }
    waterfall([
        (callback) => {
            if (!utils.empty(req.files) && !utils.empty(req.files.document)) {
                homeWorkUtil.savehomeWorkImage(req.files, null, (error, imagepath) => {
                    if (!utils.empty(error)) {
                        callback(error, "");
                    } else {
                        callback(null, imagepath);
                    }
                });
            } else {
                callback(null, null);
            }
        },
        (image, callback) => {
            let homeWorkData = {};

            if (input.subjectId) {
                homeWorkData['subjectId'] = input.subjectId;
            }
            if (input.classId) {
                homeWorkData['classId'] = input.classId;
            }
            if (input.title) {
                homeWorkData['title'] = input.title;
            }
            if (input.description) {
                homeWorkData['description'] = input.description;
            }
            if (input.deadlineDate) {
                homeWorkData['deadlineDate'] = input.deadlineDate;
            }
            if (input.startDate) {
                homeWorkData['startDate'] = input.startDate;
            }
            if (input.status) {
                homeWorkData['status'] = input.status;
            }
            homeWorkModel.updatehomeWork(homeWorkData, { id: input.homeworkId }, (homeWorkMaster) => {
                callback(null, image);
            }, (error) => {
                console.log(error);
                callback(error);
            });
        },
        (image, callback) => {
            if (image && image.length > 0) {
                let fileData = [];
                image.map(obj => {
                    fileData.push({ homeworkId: input.homeworkId, documentFile: obj.name, size: obj.size, mimetype: obj.mimetype });
                });
                homeWorkdocumentModel.createhomeworkdocumentMulti(fileData, (res) => {
                    callback(null);
                }, (error) => {
                    callback(error);
                });
            } else {
                callback(null);
            }
        },
        (callback) => {
            homeWorkModel.gethomwWork({ id: input.homeworkId }, (homeWorkDetails) => {
                if (!utils.empty(homeWorkDetails) && homeWorkDetails.length > 0) {
                    callback(null, homeWorkDetails[0].dataValues);
                } else {
                    callback(null, null);
                }
            }, (err) => {
                callback(req.t("DB_ERROR"));
            });
        }
    ], (err, homeWorkDetails) => {
        if (err) {
            return res.status(400).json({ "message": err });
        } else {
            let response = {
                "data": homeWorkDetails,
                "message": req.t("HOMEWORK_UPDATED"),
                status: true
            }
            return res.status(200).json(response);
        }
    });
}

homeWorkCtr.homeWorkList = (req, res) => {
    let filter = {};
    let input = req.body;
    let limit = config.MAX_RECORDS;
    let searchName = '';
    let pg = 0;
    let loginUser = req.authUser;
    if (loginUser && loginUser.students && loginUser.students.length > 0) {
        input.studentId = loginUser.students[0].id;
    }
    let classIds;
    if (loginUser && loginUser.userRole && loginUser.userRole !== 1) {
        if (loginUser && loginUser.userclasses && loginUser.userclasses.length > 0) {
            classIds = loginUser.userclasses.map(obj => obj.classId);
            filter['classId'] = { $in: classIds };
        } else {
            return res.status(200).json({ "message": req.t("NO_CLASS_FOUND"), data: [], status: true });
        }
    } else {
        if (loginUser && loginUser.students && loginUser.students.length > 0) {
            filter['classId'] = loginUser.students[0].classId;
        }
    }
    if (utils.isDefined(req.body.pg) && (parseInt(req.body.pg) > 1)) {
        pg = parseInt(req.body.pg - 1) * limit;
    } else {
        if (req.body.pg == -1) {
            pg = 0;
            limit = null;
        }
    }
    if (!utils.empty(input.searchName)) {
        searchName = input.searchName;
    }
    if (loginUser && loginUser.userRole && loginUser.userRole === 1) {
        if (!utils.empty(input.schoolId)) {
            filter["schoolId"] = input.schoolId;
        }
    } else {
        filter["schoolId"] = loginUser.schoolId;
    }
    if (loginUser && loginUser.userRole && loginUser.userRole === 3) {
        let classIds = loginUser.userclasses.map(item => item.classId);
        filter["classId"] = (!utils.empty(input.classId)) ? input.classId : { "$in": classIds };
    } else {
        if (!utils.empty(input.classId)) {
            filter['classId'] = input.classId;
        }
    }
    if (!utils.empty(input.subjectId)) {
        filter['subjectId'] = input.subjectId;
    }
    if (!utils.empty(input.teacherId)) {
        filter['teacherId'] = input.teacherId;
    }
    if (!utils.empty(input.deadlineDate)) {
        filter['deadlineDate'] = input.deadlineDate;
    }
    if (!utils.empty(input.startDate)) {
        filter['startDate'] = input.startDate;
    }
    homeWorkModel.gethomeWorkList(input, filter, searchName, pg, limit, (total, data) => {
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

homeWorkCtr.gethomeWorkDetails = (req, res) => {
    return res.status(200).json({ "data": req.homeWork });
}

homeWorkCtr.statusChange = (req, res) => {
    let input = req.body;
    let updateData = { status: input.status };
    let filter = { homeworkId: input.homeworkId, studentId: input.studentId };
    homeworkstatusModel.updatehomeworkstatus(updateData, filter, (userUpdate) => {
        homeWorkCtr.sendnotification(input, 'statusupdatehomework');
        return res.status(200).json({ data: [], status: true, message: req.t("STATUS_CHANGE") });
    }, (err) => {
        console.log(err);
        return res.status(500).json({ data: [], status: false, message: req.t("DB_ERROR") });
    });
}

homeWorkCtr.addComment = (req, res) => {
    let input = req.body;
    let loginUser = req.authUser;
    if (!loginUser.userRole) {
        let createData = { homeworkId: input.homeworkId, parentId: loginUser.id, comment: input.comment };
        commentModel.createhomeworkcomment(createData, (userUpdate) => {
            return res.status(200).json({ data: userUpdate, status: true, message: req.t("COMMENT_CREATE") });
        }, (err) => {
            console.log(err);
            return res.status(500).json({ data: [], status: false, message: req.t("DB_ERROR") });
        });
    } else {
        return res.status(500).json({ data: [], status: true, message: req.t("PARENT_ADD_COMMENT") });
    }
}

homeWorkCtr.updateComment = (req, res) => {
    let input = req.body;
    let loginUser = req.authUser;
    if (!loginUser.userRole) {
        let createData = { comment: input.comment };
        commentModel.updatehomeworkcomment(createData, { id: input.commentId }, (userUpdate) => {
            return res.status(200).json({ data: userUpdate, status: true, message: req.t("COMMENT_UPDATE") });
        }, (err) => {
            console.log(err);
            return res.status(500).json({ data: [], status: false, message: req.t("DB_ERROR") });
        });
    } else {
        return res.status(500).json({ data: [], status: true, message: req.t("PARENT_ADD_COMMENT") });
    }
}


homeWorkCtr.sendnotification = (input, type) => {
    let parentsIds = [];
    if (type === 'createhomework') {
        studentModel.loaduser({ classId: input.classId }, (res) => {
            if (res && res.length > 0) {
                res.map((obj) => {
                    let data = {
                        parentId: obj.parentId,
                        title: 'New home work added for date ' + input.startDate,
                        dateTime: Date.now()
                    }
                    parentsIds.push(obj.parentId);
                    notificationModel.createnotification(data, (res) => {}, (err) => {});
                });
                let filter = {};
                input['title'] = 'New home work';
                input['body'] = 'New home work added for date ' + input.startDate;
                input['sendto'] = 'parent';
                filter = { parentId: { $in: parentsIds } };
                homeWorkCtr.sndnotification(input, filter);
            }
        }, (err) => {});
    } else if (type === 'statusupdatehomework') {
        homeWorkModel.gethomwWorkForNoti(input, (res) => {
            if (res && res.length > 0) {
                let data = {};
                let workDetails = res[0];
                let filter = {};
                let studentname = '',
                    teacherName = '';
                if (workDetails && workDetails.homeworkstatuses && workDetails.homeworkstatuses.length > 0) {
                    studentname = workDetails.homeworkstatuses[0].student.firstName + " " + workDetails.homeworkstatuses[0].student.lastName;
                }
                if (workDetails & workDetails.user) {
                    teacherName = workDetails.user.firstName + " " + workDetails.user.lastName;
                }
                if (input.status === 'Completed') {
                    data = {
                        userId: res.teacherId,
                        title: "'" + workDetails.title + "'" + ' completed by ' + studentname,
                        dateTime: Date.now()
                    }
                    input['title'] = 'Complete home work';
                    input['body'] = "'" + workDetails.title + "'" + ' completed by ' + studentname;
                    input['sendto'] = 'teacher';
                    filter = { owner: workDetails.teacherId };
                } else if (input.status === 'Reopen' || input.status === 'Accepted') {
                    data = {
                        parentId: workDetails.homeworkstatuses[0].student.parentId,
                        title: "'" + workDetails.title + "' " + input.status + ' by ' + teacherName,
                        dateTime: Date.now()
                    }
                    input['title'] = input.status + ' home work';
                    input['body'] = "'" + workDetails.title + "' " + input.status + ' by ' + teacherName;
                    input['sendto'] = 'parent';
                    filter = { parentId: workDetails.homeworkstatuses[0].student.parentId };
                }
                notificationModel.createnotification(data, (res) => {}, (err) => {});
                homeWorkCtr.sndnotification(input, filter);
            }
        }, (err) => {
            console.log(err)
        });

    }
}


homeWorkCtr.sndnotification = (input, filter) => {
    userInstallations.loadRecords(filter, (deviceList) => {
        deviceList = deviceList.map(function(sensor) { return sensor.dataValues });
        if (!utils.empty(deviceList) && deviceList.length > 0) {
            deviceList.map((obj) => {
                notificationUtils.sendPushNotification(input, obj.deviceToken, (user) => {}, (err) => {});
            });
        }
    }, (err) => {});
}

module.exports = homeWorkCtr;