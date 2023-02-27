const parentUtil = require("../parent/parentHelper");
const parentModel = require("../parent/parentModel");
const userModel = require("../../modules/user/userModel");
const classModel = require("../../modules/class/classModel");
const subjectModel = require("../../modules/subject/subjectModel");
const standardModel = require("../../modules/standard/standardModel");
const studentModel = require("../../modules/student/studentModel");
const draftModel = require("../../modules/draft/draftModel");
const examTimeTablModel = require("../exam-time-table/examTimeTableModel");
const utils = require("../../helper/utils");
const config = require("../../config/config");
const db = require("../../config/database");
const waterfall = require("async-waterfall");
const XLSX = require("xlsx");
const fs = require("fs");
let jwt = require("jwt-simple");
// Require library
const excelr = require("excel4node");
const excel = require("exceljs");
const jwtUtil = require("../../helper/jwt");
const { GEOMETRY } = require("sequelize");
// Create a new instance of a Workbook class
const workbook = new excel.Workbook();
const workbookr = new excelr.Workbook();
let draftCtr = {};
let studentArr = [];

draftCtr.drafts = [
  (req, res) => {
    try {
      draftModel.findAll({ where: { schoolId: req.authUser.schoolId } }).then((drafts) => {
        res.status(200).send({
          data: drafts,
          message: "All the drafts from the database.",
          status: true,
        });
      });
    } catch (error) {}
  },
];

draftCtr.addDrafts = [
  (req, res) => {
    let input = req.body;
    console.log(input)
    let loginUser = req.authUser;
    // let myClass = loginUser.userclasses.some(
    //   (item) => item.classId == input.classId
    // );
    // if (
    //   loginUser &&
    //   loginUser.userRole &&
    //   loginUser.userRole === 3 &&
    //   !myClass
    // ) {
    //   return res.status(400).json({
    //     message: req.t("NOT_APPROVE_LEAVE_OTHER_CLASS", {
    //       FIELD: "add student",
    //     }),
    //     data: [],
    //     status: false,
    //   });
    // }
    if (
      loginUser &&
      loginUser.userRole &&
      loginUser.userRole === 1 &&
      utils.empty(input.schoolId)
    ) {
      return res.status(400).json({
        message: req.t("INVALID‌‌‌‌_SELECT_FIELD", { FIELD: "School" }),
        data: [],
        status: false,
      });
    }
    standardModel
      .findOne({ where: { standardName: input.standardName, schoolId: loginUser.schoolId } })
      .then((standard) => {
        if (standard) {
          input.standardName = standard.id;
          classModel
            .findOne({
              where: { className: input.className, standardId: standard.id, schoolId: loginUser.schoolId },
            })
            .then((classes) => {
              if (classes) {
                console.log("classId====",classes.id)
                input.className = classes.id;
                subjectModel
                  .findOne({ where: { subjectName: input.subjectName, schoolId: loginUser.schoolId } })
                  .then((subject) => {
                    if (subject) {
                      input.subjectName = subject.id;
                      waterfall(
                        [
                          (callback) => {
                            if (
                              !utils.empty(req.files) &&
                              !utils.empty(req.files.profilePic)
                            ) {
                              studentUtil.savestudentImage(
                                req.files,
                                null,
                                (error, imagepath) => {
                                  if (!utils.empty(error)) {
                                    callback(error, "");
                                  } else {
                                    callback(null, imagepath);
                                  }
                                }
                              );
                            } else {
                              callback(null, null);
                            }
                          },
                          (image, callback) => {
                            let parentData = {
                              firstName: input.parentFirstName,
                              lastName: input.parentLastName,
                              email: input.parentEmail,
                              mobileNo: input.parentMobileNo,
                              address: input.parentAddress,
                              // password: utils.getRandomString(5),
                              password: "123456",
                              grNumber: input.grNumber,
                              schoolId:
                                loginUser &&
                                loginUser.userRole &&
                                loginUser.userRole === 1
                                  ? input.schoolId
                                  : loginUser.schoolId,
                            };
                            parentModel.createparent(
                              parentData,
                              (parentDetails) => {
                                callback(null, image, parentDetails);
                              },
                              (error) => {
                                callback(error);
                              }
                            );
                          },
                          (image, parentDetails, callback) => {
                            let studentData = {
                              firstName: input.firstName,
                              lastName: input.lastName,
                              classId: input.className,
                              schoolId:
                                loginUser &&
                                loginUser.userRole &&
                                loginUser.userRole === 1
                                  ? input.schoolId
                                  : loginUser.schoolId,
                              grNumber: input.grNumber,
                              rollNumber: input.rollNumber,
                              parentId: parentDetails.id,
                              gender: input.gender,
                            };
                            if (input.joiningDate) {
                              studentData["joiningDate"] = input.joiningDate;
                            }
                            if (image) {
                              studentData["profilePic"] = image;
                            }
                            studentModel.createstudent(
                              studentData,
                              (studentMaster) => {
                                callback(null, studentMaster, parentDetails);
                              },
                              (error) => {
                                console.log(error);
                                callback(error);
                              }
                            );
                          },
                          (studentDetails, parentDetails, callback) => {
                            if (
                              !utils.empty(input.subjectId) &&
                              typeof input.subjectId === "object" &&
                              input.subjectId.length > 0
                            ) {
                              let createData = [];
                              input.subjectId.map((obj) => {
                                createData.push({
                                  studentId: studentDetails.id,
                                  subjectId: obj,
                                });
                              });
                              studentSubjectModel.createStudentSubjectMulti(
                                createData,
                                (createDetails) => {
                                  callback(null, studentDetails, parentDetails);
                                },
                                (error) => {
                                  studentModel
                                    .destroy({
                                      where: { id: studentDetails.id },
                                    })
                                    .then((succ) => {})
                                    .catch((err) => {});
                                  callback(error);
                                }
                              );
                            } else {
                              callback(null, studentDetails, parentDetails);
                            }
                          },
                          (studentDetails, parentDetails, callback) => {
                            parentModel.loaduser(
                              { id: parentDetails.id },
                              (result1) => {
                                callback(null, studentDetails, result1[0]);
                              },
                              (err) => {
                                callback(err);
                              }
                            );
                          },
                          (studentDetails, parentDetails, callback) => {
                            studentModel.getstudent(
                              { id: studentDetails.id },
                              (userDetail) => {
                                callback(
                                  null,
                                  userDetail[0].dataValues,
                                  parentDetails
                                );
                              },
                              (err) => {
                                callback(err);
                              }
                            );
                          },
                        ],
                        (err, studentDetails, parentDetails) => {
                          if (err) {
                            return res
                              .status(400)
                              .json({ message: err, data: [], status: false });
                          } else {
                            // parentUtil.sendWelcomeEmail(parentDetails.toJSON());
                            let response = {
                              data: studentDetails,
                              message: "Student added successfully and deleted from draft.",
                              status: true,
                            };
                              draftModel.destroy({
                                where: { id: input.id },
                              });
                              return res.status(200).json(response);
                          
                          }
                        }
                      );
                    } else {
                      return res.status(400).json({
                        message: "Subject not found.",
                        data: null,
                        status: false,
                      });
                    }
                  });
              } else {
                return res.status(400).json({
                  message: "Class not found.",
                  data: null,
                  status: false,
                });
              }
            });
        } else {
          return res.status(400).json({
            message: "Standard not found.",
            data: null,
            status: false,
          });
        }
      });
  },
];

module.exports = draftCtr;
