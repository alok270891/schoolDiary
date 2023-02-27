const studentModel = require("./studentModel");
const studentUtil = require("./studentHelper");
const parentUtil = require("../parent/parentHelper");
const studentSubjectModel = require("./studentSubjectModel");
const parentModel = require("../parent/parentModel");
const userModel = require("../../modules/user/userModel");
const classModel = require("../../modules/class/classModel");
const subjectModel = require("../../modules/subject/subjectModel");
const standardModel = require("../../modules/standard/standardModel");
const draftModel = require("../../modules/draft/draftModel");
const examTimeTablModel = require("../exam-time-table/examTimeTableModel");
const resultModel = require("./resultModel");
const subjectResultModel = require("./subjectResultModel");
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
let studentCtr = {};
let studentArr = [];

studentCtr.exportdata = (req, res) => {
  let token =
    req.body.token ||
    req.query.token ||
    req.headers["auth-token"] ||
    req.headers["authorization"];
  let userID = "";
  if (token) {
    try {
      let decoded = jwt.decode(token, config.SECRET);
      userID = decoded.uid;
      userModel
        .findOne({
          where: {
            id: userID,
          },
        })
        .then((user) => {
          studentModel
            .findAll({
              where: {
                schoolId: user.schoolId,
              },
            })
            .then((students) => {
              let jsonDataStudents = JSON.parse(JSON.stringify(students));
              subjectModel
                .findAll({
                  where: {
                    schoolId: user.schoolId,
                  },
                })
                .then((subjects) => {
                  const jsonDataSubjects = JSON.parse(JSON.stringify(subjects));
                  standardModel
                    .findAll({
                      where: {
                        schoolId: user.schoolId,
                      },
                    })
                    .then((standards) => {
                      const jsonDataStandards = JSON.parse(
                        JSON.stringify(standards)
                      );
                      classModel
                        .findAll({
                          where: {
                            schoolId: user.schoolId,
                          },
                        })
                        .then((classes) => {
                          const jsonDataClasses = JSON.parse(
                            JSON.stringify(classes)
                          );
                          parentModel
                            .findAll({
                              where: {
                                schoolId: user.schoolId,
                              },
                            })
                            .then((parents) => {
                              let jsonDataParents = JSON.parse(
                                JSON.stringify(parents)
                              );
                              let studentTitle = [{ Student_Table: "" }];
                              let firstName = [{ firstName: "" }];
                              let lastName = [{ lastName: "" }];
                              let parentFirstName = [{ parentFirstName: "" }];
                              let parentLastName = [{ parentLastName: "" }];
                              let parentEmail = [{ parentEmail: "" }];
                              let parentMobileNo = [{ parentMobileNo: "" }];
                              let parentAddress = [{ parentAddress: "" }];
                              let gender = [{ gender: "" }];
                              let standardName = [{ standardName: "" }];
                              let className = [{ className: "" }];
                              let subjectName = [{ subjectName: "" }];
                              let medium = [{ medium: "" }];
                              let rollNumber = [{ rollNumber: "" }];
                              let grNumber = [{ grNumber: "" }];
                              let joiningDate = [{ joiningDate: "" }];
                              let wb = XLSX.utils.book_new();
                              let ws = XLSX.utils.json_to_sheet(studentTitle, {
                                origin: "H1",
                              });
                              XLSX.utils.sheet_add_json(ws, firstName, {
                                origin: "A3",
                              });
                              XLSX.utils.sheet_add_json(ws, lastName, {
                                origin: "B3",
                              });
                              XLSX.utils.sheet_add_json(ws, parentFirstName, {
                                origin: "C3",
                              });
                              XLSX.utils.sheet_add_json(ws, parentLastName, {
                                origin: "D3",
                              });
                              XLSX.utils.sheet_add_json(ws, parentEmail, {
                                origin: "E3",
                              });
                              XLSX.utils.sheet_add_json(ws, parentMobileNo, {
                                origin: "F3",
                              });
                              XLSX.utils.sheet_add_json(ws, parentAddress, {
                                origin: "G3",
                              });
                              XLSX.utils.sheet_add_json(ws, gender, {
                                origin: "H3",
                              });
                              XLSX.utils.sheet_add_json(ws, standardName, {
                                origin: "I3",
                              });
                              XLSX.utils.sheet_add_json(ws, className, {
                                origin: "J3",
                              });
                              XLSX.utils.sheet_add_json(ws, subjectName, {
                                origin: "K3",
                              });
                              XLSX.utils.sheet_add_json(ws, medium, {
                                origin: "L3",
                              });
                              XLSX.utils.sheet_add_json(ws, rollNumber, {
                                origin: "M3",
                              });
                              XLSX.utils.sheet_add_json(ws, grNumber, {
                                origin: "N3",
                              });
                              XLSX.utils.sheet_add_json(ws, joiningDate, {
                                origin: "O3",
                              });
                              XLSX.utils.book_append_sheet(wb, ws, "students");
                              XLSX.writeFile(wb, "students.xlsx");
                              res.download("students.xlsx");
                              return res.status(200).json({
                                message:
                                  "your students excel file is generated successfully.",
                                status: true,
                              });
                            });
                        });
                    });
                });
            });
        });
    } catch (err) {
      userID;
    }
  }
};

studentCtr.download = (req, res) => {
  // const file = `${__dirname}/users.xlsx`;
  const file = `students.xlsx`;
  res.download(file); // Set disposition and send it.
};

studentCtr.excelcreate = async (req, res) => {
  let loginUser = req.authUser;
  let draftArr = [];
  let studentArr = [];
  let files = req.files;
  var workbook = XLSX.readFile(files.files.tempFilePath);
  const wsname = workbook.SheetNames[0];
  const ws = workbook.Sheets[wsname];
  let data = XLSX.utils.sheet_to_json(ws, { header: 1 });
  data = data.slice(3);
  for (let i = 0; i < data.length; i++) {
    let studentData = {
      firstName: "",
      lastName: "",
      medium: "",
      grNumber: "",
      rollNumber: "",
      joiningDate: "",
      parentFirstName: "",
      parentLastName: "",
      parentEmail: "",
      parentMobileNo: "",
      parentAddress: "",
      gender: "",
      className: "",
      standardName: "",
      subjectName: "",
    };
    studentData.firstName = data[i][0];
    studentData.lastName = data[i][1];
    studentData.parentFirstName = data[i][2];
    studentData.parentLastName = data[i][3];
    studentData.parentEmail = data[i][4];
    studentData.parentMobileNo = data[i][5];
    studentData.parentAddress = data[i][6];
    studentData.gender = data[i][7];
    studentData.standardName = data[i][8];
    studentData.className = data[i][9];
    studentData.subjectName = data[i][10];
    studentData.medium = data[i][11];
    studentData.rollNumber = data[i][12];
    studentData.grNumber = data[i][13];
    studentData.joiningDate = data[i][14];
    studentData.schoolId = loginUser.schoolId;

    // console.log(studentData);

    if (
      studentData.grNumber === undefined ||
      studentData.rollNumber === undefined ||
      studentData.standardName === undefined ||
      studentData.className === undefined ||
      studentData.subjectName === undefined
    ) {
      draftArr.push(studentData);
      if (i === data.length - 1) {
        for (let j = 0; j < draftArr.length; j++) {
          draftModel.createdraft(draftArr[j]);
          if (j === draftArr.length - 1) {
            return res.status(200).json({
              errorData: draftArr,
              data: studentArr,
              message:
                "User added successfully. Some users were not added. Please check error data response.",
              status: true,
            });
          }
        }
      }
    } else {
      const standardId = await standardModel
        .findOne({
          where: {
            standardName: studentData.standardName,
            schoolId: req.authUser.schoolId,
          },
        })
        .then((standard) => {
          if (standard === null) return;
          return standard.id;
        });
      const classId = await classModel
        .findOne({
          where: {
            standardId: standardId,
            className: studentData.className,
            schoolId: req.authUser.schoolId,
          },
        })
        .then((classes) => {
          if (classes === null) return;
          return classes.id;
        });
      const subjectId = await subjectModel
        .findOne({
          where: {
            subjectName: studentData.subjectName,
            schoolId: req.authUser.schoolId,
          },
        })
        .then((subject) => {
          if (subject === null) return;
          return subject.id;
        });

      if (
        standardId === undefined ||
        classId === undefined ||
        subjectId === undefined
      ) {
        draftArr.push(studentData);
        if (i === data.length - 1) {
          for (let j = 0; j < draftArr.length; j++) {
            draftModel.createdraft(draftArr[j]);
            if (j === draftArr.length - 1) {
              return res.status(200).json({
                errorData: draftArr,
                data: studentArr,
                message:
                  "User added successfully. Some users were not added. Please check error data response.",
                status: true,
              });
            }
          }
        }
      } else {
        // let input = req.body;
        let loginUser = req.authUser;
        let myClass = loginUser.userclasses.some(
          (item) => item.classId == classId
        );
        if (
          loginUser &&
          loginUser.userRole &&
          loginUser.userRole === 3 &&
          !myClass
        ) {
          console.log("myclass====", myClass);
          studentData.schoolId = loginUser.schoolId;
          draftArr.push(studentData);
          if (i === data.length - 1) {
            for (let j = 0; j < draftArr.length; j++) {
              draftModel.createdraft(draftArr[j]);
              if (j === draftArr.length - 1) {
                return res.status(200).json({
                  errorData: draftArr,
                  data: [],
                  message:
                    "User added successfully. Some users were not added. Please check error data response.",
                  status: true,
                });
              }
            }
          }
        } else {
          if (
            loginUser &&
            loginUser.userRole &&
            loginUser.userRole === 1 &&
            utils.empty(studentData.schoolId)
          ) {
            console.log("user====", loginUser);
            return res.status(400).json({
              message: req.t("INVALID‌‌‌‌_SELECT_FIELD", {
                FIELD: "School",
              }),
              data: [],
              status: false,
            });
          }
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
                  firstName: studentData.parentFirstName,
                  lastName: studentData.parentLastName,
                  email: studentData.parentEmail,
                  mobileNo: studentData.parentMobileNo,
                  address: studentData.parentAddress,
                  // password: utils.getRandomString(5),
                  password: "123456",
                  grNumber: studentData.grNumber,
                  schoolId:
                    loginUser && loginUser.userRole && loginUser.userRole === 1
                      ? studentData.schoolId
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
                let studentData2 = {
                  firstName: studentData.firstName,
                  lastName: studentData.lastName,
                  classId: classId,
                  schoolId:
                    loginUser && loginUser.userRole && loginUser.userRole === 1
                      ? studentData.schoolId
                      : loginUser.schoolId,
                  grNumber: studentData.grNumber,
                  rollNumber: studentData.rollNumber,
                  parentId: parentDetails.id,
                  gender: studentData.gender,
                };
                if (studentData.joiningDate) {
                  studentData2["joiningDate"] = studentData.joiningDate;
                }
                if (image) {
                  studentData2["profilePic"] = image;
                }
                studentModel.createstudent(
                  studentData2,
                  (studentMaster) => {
                    console.log("studentData====", studentData2);
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
                  !utils.empty(subjectId) &&
                  typeof subjectId === "object" &&
                  subjectId.length > 0
                ) {
                  let createData = [];
                  subjectId.map((obj) => {
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
                          where: {
                            id: studentDetails.id,
                          },
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
                    callback(null, userDetail[0].dataValues, parentDetails);
                  },
                  (err) => {
                    callback(err);
                  }
                );
              },
            ],
            (err, studentDetails, parentDetails) => {
              studentArr.push(studentDetails);
              if (err) {
                return res.status(400).json({
                  message: err,
                  data: [],
                  status: false,
                });
              } else {
                //   parentUtil.sendWelcomeEmail(parentDetails.toJSON());
                // let response = {
                //   data: studentDetails,
                //   message: req.t("STUDENT_CREATED"),
                //   status: true,
                // };
                if (i === data.length - 1) {
                  for (let j = 0; j < draftArr.length; j++) {
                    draftModel.createdraft(draftArr[j]);
                    if (j === draftArr.length - 1) {
                      return res.status(200).json({
                        errorData: draftArr,
                        data: studentArr,
                        message:
                          "User added successfully. Some users were not added. Please check error data response.",
                        status: true,
                      });
                    }
                  }
                }
              }
            }
          );
        }
      }
    }
  }
};

studentCtr.create = (req, res) => {
  let input = req.body;
  let loginUser = req.authUser;
  let myClass = loginUser.userclasses.some(
    (item) => item.classId == input.classId
  );
  if (loginUser && loginUser.userRole && loginUser.userRole === 3 && !myClass) {
    return res.status(400).json({
      message: req.t("NOT_APPROVE_LEAVE_OTHER_CLASS", {
        FIELD: "add student",
      }),
      data: [],
      status: false,
    });
  }
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
  waterfall(
    [
      (callback) => {
        if (!utils.empty(req.files) && !utils.empty(req.files.profilePic)) {
          studentUtil.savestudentImage(req.files, null, (error, imagepath) => {
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
            loginUser && loginUser.userRole && loginUser.userRole === 1
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
          classId: input.classId,
          schoolId:
            loginUser && loginUser.userRole && loginUser.userRole === 1
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
                .destroy({ where: { id: studentDetails.id } })
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
            callback(null, userDetail[0].dataValues, parentDetails);
          },
          (err) => {
            callback(err);
          }
        );
      },
    ],
    (err, studentDetails, parentDetails) => {
      if (err) {
        return res.status(400).json({ message: err, data: [], status: false });
      } else {
        parentUtil.sendWelcomeEmail(parentDetails.toJSON());
        let response = {
          data: studentDetails,
          message: req.t("STUDENT_CREATED"),
          status: true,
        };
        return res.status(200).json(response);
      }
    }
  );
};

studentCtr.update = (req, res) => {
  let input = req.body;
  let studentId = req.body.studentId;
  let loginUser = req.authUser;
  let myClass = loginUser.userclasses.some(
    (item) => item.classId == input.classId
  );
  if (loginUser && loginUser.userRole && loginUser.userRole === 3 && !myClass) {
    return res.status(400).json({
      message: req.t("NOT_APPROVE_LEAVE_OTHER_CLASS", {
        FIELD: "update student",
      }),
      data: [],
      status: false,
    });
  }
  if (utils.empty(input.oldSubjectId)) {
    input.oldSubjectId = [];
  }
  waterfall(
    [
      (callback) => {
        let parentData = {};
        if (input.parentFirstName) {
          parentData["firstName"] = input.parentFirstName;
        }
        if (input.parentLastName) {
          parentData["lastName"] = input.parentLastName;
        }
        if (input.parentEmail) {
          parentData["email"] = input.parentEmail;
        }
        if (input.parentMobileNo) {
          parentData["mobileNo"] = input.parentMobileNo;
        }
        if (input.parentAddress) {
          parentData["address"] = input.parentAddress;
        }
        // if (input.schoolId) {
        //     parentData['schoolId'] = input.schoolId;
        // }
        if (input.grNumber) {
          parentData["grNumber"] = input.grNumber;
        }
        parentModel.updateparent(
          parentData,
          { id: input.parentId },
          (parentDetails) => {
            callback(null);
          },
          (error) => {
            callback(error);
          }
        );
      },
      (callback) => {
        if (!utils.empty(req.files) && !utils.empty(req.files.profilePic)) {
          studentUtil.savestudentImage(
            req.files,
            config.SYSTEM_IMAGE_PATH +
              config.STUDENT_IMAGE_PATH +
              req.studentDetails.profilePic,
            (error, result) => {
              if (!utils.empty(error)) {
                callback(error, "");
              } else {
                callback(null, result);
              }
            }
          );
        } else {
          callback(null, null);
        }
      },
      (image, callback) => {
        let studentData = {};

        if (input.joiningDate) {
          studentData["joiningDate"] = input.joiningDate;
        }
        if (input.firstName) {
          studentData["firstName"] = input.firstName;
        }
        if (input.lastName) {
          studentData["lastName"] = input.lastName;
        }
        if (input.classId) {
          studentData["classId"] = input.classId;
        }
        if (input.schoolId) {
          studentData["schoolId"] = input.schoolId;
        }
        if (input.grNumber) {
          studentData["grNumber"] = input.grNumber;
        }
        if (input.rollNumber) {
          studentData["rollNumber"] = input.rollNumber;
        }
        if (input.gender) {
          studentData["gender"] = input.gender;
        }
        if (image) {
          studentData["profilePic"] = image;
        }
        studentModel.updatestudent(
          studentData,
          { id: input.studentId },
          (studentMaster) => {
            callback(null);
          },
          (error) => {
            console.log(error);
            callback(error);
          }
        );
      },
      (callback) => {
        if (
          !utils.empty(input.oldSubjectId) &&
          typeof input.oldSubjectId === "object" &&
          input.oldSubjectId.length > 0 &&
          !utils.empty(input.subjectId) &&
          typeof input.subjectId === "object" &&
          input.subjectId.length > 0
        ) {
          let difference = input.oldSubjectId.filter(
            (x) => !input.subjectId.includes(x)
          );
          studentSubjectModel
            .destroy({
              where: {
                studentId: input.studentId,
                subjectId: { $in: difference },
              },
            })
            .then(
              (succ) => {
                callback(null);
              },
              (err) => {
                callback(err);
              }
            );
        } else {
          callback(null);
        }
      },
      (callback) => {
        if (
          typeof input.oldSubjectId === "object" &&
          !utils.empty(input.subjectId) &&
          typeof input.subjectId === "object" &&
          input.subjectId.length > 0
        ) {
          let diffAdd = input.subjectId.filter(
            (x) => !input.oldSubjectId.includes(x)
          );
          if (diffAdd && diffAdd.length > 0) {
            let createData = [];
            diffAdd.map((obj) => {
              createData.push({
                studentId: input.studentId,
                subjectId: obj,
              });
            });
            studentSubjectModel.createStudentSubjectMulti(
              createData,
              (createDetails) => {
                callback(null);
              },
              (err) => {
                callback(err);
              }
            );
          } else {
            callback(null);
          }
        } else {
          callback(null);
        }
      },
      (callback) => {
        studentModel.getstudent(
          { id: input.studentId },
          (userDetail) => {
            callback(null, userDetail);
          },
          (err) => {
            callback(err);
          }
        );
      },
    ],
    (err, studentDetail) => {
      if (err) {
        return res.status(400).json({ message: err });
      } else {
        let response = {
          data: studentDetail[0],
          message: req.t("STUDENT_UPDATED"),
          status: true,
        };
        return res.status(200).json(response);
      }
    }
  );
};

studentCtr.studentList = (req, res) => {
  let filter = {};
  let input = req.body;
  let limit = config.MAX_RECORDS;
  let searchName = "";
  let pg = 0;
  let loginUser = req.authUser;
  if (utils.isDefined(req.body.pg) && parseInt(req.body.pg) > 1) {
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
  if (!utils.empty(input.status)) {
    filter["status"] = input.status.toUpperCase();
  }
  if (loginUser && loginUser.userRole && loginUser.userRole === 3) {
    let classIds = loginUser.userclasses.map((item) => item.classId);
    filter["classId"] = !utils.empty(input.classId)
      ? input.classId
      : { $in: classIds };
  } else {
    if (!utils.empty(input.classId)) {
      filter["classId"] = input.classId;
    }
  }
  if (loginUser && loginUser.userRole && loginUser.userRole === 1) {
    if (!utils.empty(input.schoolId)) {
      filter["schoolId"] = input.schoolId;
    }
  } else {
    filter["schoolId"] = loginUser.schoolId;
  }
  if (!utils.empty(input.stdId)) {
    filter["stdId"] = input.stdId;
  }

  studentModel.getstudentList(
    filter,
    searchName,
    pg,
    limit,
    (total, data) => {
      if (total > 0) {
        let pages = Math.ceil(total / (limit ? limit : total));
        let pagination = {
          pages: pages ? pages : 1,
          total: total,
          max: limit ? limit : total,
        };
        return res.status(200).json({
          pagination: pagination,
          data: data,
          message: "",
          status: true,
        });
      } else {
        return res
          .status(200)
          .json({ message: req.t("NO_RECORD_FOUND"), data: [], status: true });
      }
    },
    (err) => {
      console.log(err);
      return res
        .status(500)
        .json({ message: req.t("DB_ERROR"), data: [], status: false });
    }
  );
};

studentCtr.getstudentDetails = (req, res) => {
  return res.status(200).json({ data: req.student });
};

studentCtr.statusChange = async (req, res) => {
  let input = req.body;
  let updateData = { status: input.status };
  let filter = { id: input.studentId };

  console.log(input.studentId);

  const student = await studentModel.findOne({
    where: { id: input.studentId },
  });
  console.log("student====", student.grNumber);
  const grNum = student.grNumber;
  console.log(grNum);
  parentModel.updateparent(
    updateData,
    { grNumber: grNum },
    (userUpdate) => {
      console.log("parent status changed.");
    },
    (err) => {
      console.log(err);
    }
  );
  studentModel.updatestudent(
    updateData,
    filter,
    (userUpdate) => {
      return res
        .status(200)
        .json({ data: [], status: true, message: req.t("STATUS_CHANGE") });
    },
    (err) => {
      console.log(err);
      return res
        .status(500)
        .json({ data: [], status: false, message: req.t("DB_ERROR") });
    }
  );
};

studentCtr.sampleresult = (req, res) => {
  let input = req.body;
  // Add Worksheets to the workbook
  let worksheet = workbookr.addWorksheet("Sheet 1");
  // // Create a reusable style
  let style = workbookr.createStyle({
    font: {
      // color: '#FF0800',
      size: 12,
      bold: true,
    },
    // numberFormat: '$#,##0.00; ($#,##0.00); -'
  });
  worksheet.cell(1, 1).string("Id").style(style);
  worksheet.cell(1, 2).string("First Name").style(style);
  worksheet.cell(1, 3).string("Last Name").style(style);

  waterfall(
    [
      (callback) => {
        examTimeTablModel.getexamTimeTable(
          { id: input.examTimeTableId },
          (examTimeTablDetails) => {
            worksheet
              .cell(1, 4)
              .string(examTimeTablDetails[0].dataValues.subject.subjectName)
              .style(style);
            callback(null, examTimeTablDetails[0]);
          },
          (err) => {
            callback(err);
          }
        );
      },
      (examTimeTablDetails, callback) => {
        studentModel.loaduser(
          { classId: examTimeTablDetails.classId },
          (studentList) => {
            callback(null, studentList);
          },
          (err) => {
            callback(err);
          }
        );
      },
      (studentList, callback) => {
        if (studentList && studentList.length > 0) {
          studentList.map((obj, index) => {
            worksheet.cell(index + 2, 1).number(obj.id);
            worksheet.cell(index + 2, 2).string(obj.firstName);
            worksheet.cell(index + 2, 3).string(obj.lastName);
          });
          workbookr.write("uploads/Excel.xlsx");
          callback(null);
        } else {
          callback(req.t("STUDENT_NOT_FOUND"));
        }
      },
    ],
    (err) => {
      console.log(err, "error");
      if (err) {
        return res.status(400).json({ message: err });
      } else {
        let httptype =
          req.headers.host === "localhost:4000" ? "http://" : "https://";
        let response = {
          data: [],
          filepath: httptype + req.headers.host + "/uploads/Excel.xlsx",
          message: "",
          status: true,
        };
        return res.status(200).json(response);
      }
    }
  );
};

studentCtr.addstudentresult = (req, res) => {
  let input = req.body;
  const workbook = XLSX.readFile(req.files.result.path);
  var sheet_name_list = workbook.SheetNames;
  var xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);

  if (xlData && xlData.length > 0) {
    examTimeTablModel.getexamTimeTable(
      { id: input.examTimeTableId },
      (examTimeTablDetails) => {
        if (xlData[0][examTimeTablDetails[0].dataValues.subject.subjectName]) {
          studentCtr.studentresult(res, req, 0, xlData, examTimeTablDetails[0]);
        } else {
          return res.status(400).json({
            data: [],
            status: false,
            message: "Please add subject marks and than upload",
          });
        }
      },
      (err) => {
        console.log(err);
        return res
          .status(500)
          .json({ data: [], status: false, message: req.t("DB_ERROR") });
      }
    );
  } else {
    return res
      .status(400)
      .json({ data: [], status: false, message: "No data found" });
  }
};

studentCtr.studentresult = (res, req, index, xlData, examTimeTablDetails) => {
  let loginUser = req.authUser;
  let input = req.body;
  if (index > xlData.length - 1) {
    studentCtr.succeddresult(res, req, null);
  }
  let createData = {
    studentId: xlData[index].Id,
    schoolId:
      loginUser && loginUser.userRole && loginUser.userRole === 1
        ? input.schoolId
        : loginUser.schoolId,
    examTimeTableId: input.examTimeTableId,
  };
  resultModel.createresult(
    createData,
    (result) => {
      let createD = {
        resultId: result.id,
        subjectId: examTimeTablDetails.subjectId,
        marks:
          xlData[index][examTimeTablDetails.dataValues.subject.subjectName],
      };
      subjectResultModel.createsubjectResult(
        createD,
        (userUpdate) => {
          index = index + 1;
          studentCtr.studentresult(
            res,
            req,
            index,
            xlData,
            examTimeTablDetails
          );
        },
        (err) => {
          console.log(err);
          studentCtr.succeddresult(res, req, err);
        }
      );
    },
    (err) => {
      console.log(err);
      studentCtr.succeddresult(res, req, err);
    }
  );
};

studentCtr.succeddresult = (res, req, err) => {
  if (err) {
    return res
      .status(500)
      .json({ data: [], status: false, message: req.t("DB_ERROR") });
  } else {
    return res
      .status(200)
      .json({ data: [], status: false, message: "Result upload success" });
  }
};

studentCtr.getresult = (req, res) => {
  let filter = {};
  let input = req.body;
  let limit = config.MAX_RECORDS;
  let searchName = "";
  let pg = 0;
  if (utils.isDefined(req.body.pg) && parseInt(req.body.pg) > 1) {
    pg = parseInt(req.body.pg - 1) * limit;
  } else {
    if (req.body.pg == -1) {
      pg = 0;
      limit = null;
    }
  }
  if (!utils.empty(input.examTimeTableId)) {
    filter["id"] = { $in: input.examTimeTableId };
  }
  if (!utils.empty(input.subjectId)) {
    filter["subjectId"] = input.subjectId;
  }
  if (!utils.empty(input.examTypeId)) {
    filter["examTypeId"] = input.examTypeId;
  }
  if (!utils.empty(input.examDate)) {
    filter["examDate"] = input.examDate;
  }
  if (!utils.empty(input.day)) {
    filter["day"] = input.day;
  }
  if (!utils.empty(req.body.status)) {
    filter["status"] = req.body.status.toUpperCase();
  }
  examTimeTablModel.getexamTimeTableList(
    "result",
    filter,
    searchName,
    pg,
    limit,
    (total, data) => {
      if (total > 0) {
        let pages = Math.ceil(total / (limit ? limit : total));
        let pagination = {
          pages: pages ? pages : 1,
          total: total,
          max: limit ? limit : total,
        };
        return res.status(200).json({
          pagination: pagination,
          data: data,
          message: "",
          status: true,
        });
      } else {
        return res
          .status(200)
          .json({ message: req.t("NO_RECORD_FOUND"), data: [], status: true });
      }
    },
    (err) => {
      console.log(err);
      return res
        .status(500)
        .json({ message: req.t("DB_ERROR"), data: [], status: false });
    }
  );
};

studentCtr.deleteStudentResult = (req, res) => {
  let input = req.body;

  subjectResultModel.destroy({ where: { id: input.subjectresultsId } }).then(
    (succ) => {
      return res
        .status(200)
        .json({ message: req.t("RESULT_DELETE"), data: [], status: true });
    },
    (err) => {
      return res
        .status(500)
        .json({ message: req.t("DB_ERROR"), data: [], status: false });
    }
  );
};

studentCtr.updateStudentResult = (req, res) => {
  let input = req.body;
  subjectResultModel
    .update({ marks: input.marks }, { where: { id: input.subjectresultsId } })
    .then(
      (succ) => {
        return res
          .status(200)
          .json({ message: req.t("RESULT_UPDATE"), data: [], status: true });
      },
      (err) => {
        return res
          .status(500)
          .json({ message: req.t("DB_ERROR"), data: [], status: false });
      }
    );
};

module.exports = studentCtr;
