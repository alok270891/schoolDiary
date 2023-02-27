const parentHomeworkModel = require("./parentHomeworkModel");
const parentHomeworkDocumentModel = require("./parentHomeworkFileMdel");
const homeworkstatusModel = require("../home-work/homeworkStatusModel");
const homeWorkUtil = require("../home-work/homeWorkHelper");
const studentModel = require("../student/studentModel");
const utils = require("../../helper/utils");
const config = require("../../config/config");
const waterfall = require("async-waterfall");
let parentHomeworkCtr = {};

parentHomeworkCtr.create = (req, res) => {
  let fileData = [];
  let input = req.body;
  let loginUser = req.authUser;
  let classId = loginUser.students[0].classId;
  let subjectId = loginUser.students[0].studentSubjects[0].subjectId;
  console.log("classId=====", loginUser.students[0].classId);
  console.log(
    "subjectId=====",
    loginUser.students[0].studentSubjects[0].subjectId
  );
  // let myClass = loginUser.userclasses.some(item => item.classId == input.classId);
  // if (loginUser && loginUser.userRole && loginUser.userRole === 3 && !myClass) {
  //     return res.status(400).json({ "message": req.t("NOT_APPROVE_LEAVE_OTHER_CLASS", { FIELD: "add homework" }), data: [], status: false });
  // }
  waterfall(
    [
      (callback) => {
        if (!utils.empty(req.files) && !utils.empty(req.files.document)) {
          homeWorkUtil.savehomeWorkImage(
            req.files,
            null,
            (error, imagepath) => {
              if (!utils.empty(error)) {
                callback(error, "");
              } else {
                console.log("imagepath====",imagepath)
                callback(null, imagepath);
              }
            }
          );
        } else {
          callback(null, null);
        }
      },
      (image, callback) => {
        let createData = {
          subjectId: subjectId,
          classId: classId,
          parentId: loginUser.id,
          homeworkId: input.homeworkId,
          schoolId: loginUser.schoolId,
        };
        parentHomeworkModel.createhomwWork(
          createData,
          (homeworkDetails) => {
            callback(null, homeworkDetails, image);
          },
          (error) => {
            callback(error);
          }
        );
      },
      (homeworkDetails, image, callback) => {
        if (image && image.length > 0) {
          // let fileData = [];
          image.map((obj) => {
            fileData.push({
              parentHomeworkId: homeworkDetails.id,
              documentFile: obj.name,
              size: obj.size,
              mimetype: obj.mimetype,
            });
          });
          parentHomeworkDocumentModel.createhomeworkdocumentMulti(
            fileData,
            (res) => {
              // console.log("homeworkdetails======", res);
              callback(null, homeworkDetails);
            },
            (error) => {
              callback(error);
            }
          );
        } else {
          callback(null, homeworkDetails);
        }
      },
      (homeworkDetails, callback) => {
        studentModel
          .find({ where: { grNumber: loginUser.grNumber } })
          .then((student) => {
            let updateData = { status: "inReview" };
            let filter = {
              homeworkId: input.homeworkId,
              studentId: student.id,
            };
            homeworkstatusModel.updatehomeworkstatus(
              updateData,
              filter,
              (userUpdate) => {
                console.log(userUpdate);
                callback(null, homeworkDetails);
                // homeWorkCtr.sendnotification(input, 'statusupdatehomework');
                // return res.status(200).json({ data: [], status: true, message: req.t("STATUS_CHANGE") });
              },
              (err) => {
                console.log(err);
                // return res.status(500).json({ data: [], status: false, message: req.t("DB_ERROR") });
              }
            );
          });
      },
      (homeworkDetails, callback) => {
        // console.log("homeworkDetails====", homeworkDetails)
        parentHomeworkModel.gethomwWork(
          { id: homeworkDetails.id },
          (homeWorkDetails) => {
            if (!utils.empty(homeWorkDetails) && homeWorkDetails.length > 0) {
              console.log("asdadasd");
              callback(null, homeWorkDetails[0].dataValues);
            } else {
              callback(null, null);
              console.log("asdadasd");
            }
          },
          (err) => {
            console.log(err);
            callback(req.t("DB_ERROR"));
          }
        );
      },
    ],
    (err, homeWorkDetails, image) => {
      console.log(err, "error");
      if (err) {
        console.log(err);
        return res.status(400).json({ message: err, data: [], status: false });
      } else { 
        const finalFileData = fileData.map((obj) =>{return (
          { 
            parentHomeworkId: obj.parentHomeworkId,
            documentFile: process.env.S3_BASE_URL + 'uploads/homework/' + obj.documentFile,
            size: obj.size,
            mimetype: obj.mimetype
          }
        )} )
        let parentHomeworkData = {
          id: homeWorkDetails.id,
          subjectId: homeWorkDetails.subjectId,
          classId: homeWorkDetails.classId,
          parentId: homeWorkDetails.parentId,
          homeworkId: homeWorkDetails.homeworkId,
          parentHomeworkDocuments: finalFileData,
          status: homeWorkDetails.status,
          createdAt: homeWorkDetails.createdAt,
          updatedAt: homeWorkDetails.updatedAt
        }
        let response = {
          data:  parentHomeworkData,
          message: req.t("HOMEWORK_CREATED"),
          status: true,
        };
        // homeWorkCtr.sendnotification(input, 'createhomework');
        return res.status(200).json(response);
      }
    }
  );
};

parentHomeworkCtr.homeWorkList = (req, res) => {
  console.log(req.body);
  let loginUser = req.authUser;
  let studentData = [];

  homeworkstatusModel
    .findAll({ where: { homeworkId: req.body.homeworkId } })
    .then((homeworkStatuses) => {
      let studentIds = homeworkStatuses.map((item) => item.studentId);
      studentModel
        .findAll({
          where: { schoolId: loginUser.schoolId, id: { $in: studentIds } },
        })
        .then((students) => {
          parentHomeworkModel
            .findAll({ where: { homeworkId: req.body.homeworkId } })
            .then((parentHomeworks) => {
              if (parentHomeworks.length > 0) {
                for (let i = 0; i < students.length; i++) {
                  for (let k = 0; k < parentHomeworks.length; k++) {

                    if (students[i].parentId === parentHomeworks[k].parentId) {
                      parentHomeworkDocumentModel
                        .findAll({
                          where: { parentHomeworkId: parentHomeworks[k].id },
                        })
                        .then((documents) => {
                          let info = {
                            firstName: students[i].firstName,
                            lastName: students[i].lastName,
                            rollNumber: students[i].rollNumber,
                            status: homeworkStatuses[i].status,
                            documentFiles: documents,
                          };
                          studentData.push(info);
                          console.log(studentData);
                          if (i === students.length - 1) {
                            let newArray = [];
                            let uniqueObject = {};
                            for (let i in studentData) {
                              objTitle = studentData[i]["firstName"];

                              uniqueObject[objTitle] = studentData[i];
                            }

                            for (i in uniqueObject) {
                              newArray.push(uniqueObject[i]);
                            }
                            res.status(200).send({ data: newArray });
                          }
                        });
                    } else {
                      if (homeworkStatuses[i].status === "Pending") {
                        let info = {
                          firstName: students[i].firstName,
                          lastName: students[i].lastName,
                          rollNumber: students[i].rollNumber,
                          status: homeworkStatuses[i].status,
                          documentFiles: "",
                        };
                        studentData.push(info);
                        console.log(studentData);
                        if (i === students.length - 1) {
                          let newArray = [];

                          let uniqueObject = {};

                          for (let i in studentData) {
                            objTitle = studentData[i]["firstName"];

                            uniqueObject[objTitle] = studentData[i];
                          }

                          for (i in uniqueObject) {
                            newArray.push(uniqueObject[i]);
                          }
                          console.log(newArray);
                          res.status(200).send({ data: newArray });
                        }
                      }
                    }
                  }
                }
              } else {
                for (let i = 0; i < students.length; i++) {
                  let info = {
                    firstName: students[i].firstName,
                    lastName: students[i].lastName,
                    rollNumber: students[i].rollNumber,
                    status: homeworkStatuses[i].status,
                    documentFiles: "",
                  };
                  studentData.push(info);
                  if (i === students.length - 1) {
                    res.status(200).send({ data: studentData });
                  }
                }
              }
            });
        });
    });
};

module.exports = parentHomeworkCtr;
