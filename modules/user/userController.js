const jwt = require("../../helper/jwt");
const userModel = require("./userModel");
const parentModel = require("../parent/parentModel");
const schoolModel = require("../school/schoolModel");
const utils = require("../../helper/utils");
const userUtil = require("./userHelper");
const Sequelize = require("sequelize");
const waterfall = require("async-waterfall");
const userInstallations = require("./installationModel");
const userTokenModel = require("./userTokenModel");
const subjectModel = require("./userSubjectModel");
const classModel = require("./userClassModel");
const notificationUtils = require("../../helper/notificationUtils");
const XLSX = require("xlsx");
let jwt2 = require("jwt-simple");
const classModel2 = require("../../modules/class/classModel");
const subjectModel2 = require("../../modules/subject/subjectModel");
const { where } = require("sequelize");

let userCtr = {};
let userArr = [];

userCtr.getFields = (type) => {
  let common = [
    "id",
    "firstName",
    "lastName",
    "mobileNo",
    "email",
    "lastLoggedIn",
    "status",
    "userRole",
    "schoolId",
    "schoolName",
    "profilePic",
    "birthOfDate",
    "address",
    "experience",
    "gender",
    "userclasses",
    "userSubjects",
    "school",
    "students",
  ];
  switch (type) {
    case "login":
      common = common.concat(["secretToken"]);
      break;
  }
  return common;
};

userCtr.exportdata = (req, res) => {
  console.log("sdfsdfsdf");
  let token =
    req.body.token ||
    req.query.token ||
    req.headers["auth-token"] ||
    req.headers["authorization"];
  let userID = "";
  if (token) {
    try {
      let decoded = jwt2.decode(token, config.SECRET);
      userID = decoded.uid;
      console.log(userID);
      userModel
        .findOne({
          where: {
            id: userID,
          },
        })
        .then((user) => {
          schoolModel
            .findAll({
              //   where: {
              //     id: user.schoolId,
              //   },
            })
            .then((schools) => {
              subjectModel2
                .findAll({
                  //   where: {
                  //     id: user.schoolId,
                  //   },
                })
                .then((subjects) => {
                  classModel2
                    .findAll({
                      //   where: {
                      //     id: user.schoolId,
                      //   },
                    })
                    .then((classes) => {
                      let jsonData = [JSON.parse(JSON.stringify(user))];
                      let jsonData2 = JSON.parse(JSON.stringify(schools));
                      let jsonData3 = JSON.parse(JSON.stringify(subjects));
                      console.log(jsonData3);
                      let jsonData4 = JSON.parse(JSON.stringify(classes));
                      let schoolTitle = [{ School_Table: "" }];

                      let userTitle = [{ User_Table: "" }];
                      let subjectTitle = [{ Subject_Table: "" }];
                      let classTitle = [{ Class_Table: "" }];
                      let medium = [{ medium: "" }];
                      let subjectId = [{ subjectId: "" }];
                      let classId = [{ classId: "" }];
                      let message = [
                        {
                          "Refer the above table to enter data in user table below:":
                            "",
                        },
                      ];
                      jsonData.map((obj) => {
                        delete obj.createdAt;
                        delete obj.updatedAt;
                        delete obj.profilePic;
                        delete obj.id;
                        delete obj.status;
                        delete obj.lastLoggedIn;
                        delete obj.password;
                      });
                      jsonData2.map((obj) => {
                        delete obj.createdAt;
                        delete obj.updatedAt;
                        delete obj.logo;
                        delete obj.status;
                      });
                      jsonData3.map((obj) => {
                        delete obj.createdAt;
                        delete obj.updatedAt;
                        delete obj.status;
                      });
                      jsonData4.map((obj) => {
                        delete obj.createdAt;
                        delete obj.updatedAt;
                        delete obj.status;
                      });

                      let wb = XLSX.utils.book_new();
                      let ws = XLSX.utils.json_to_sheet(jsonData2, {
                        origin: "A3",
                      });
                      XLSX.utils.sheet_add_json(ws, schoolTitle, {
                        origin: "B1",
                      });
                      XLSX.utils.sheet_add_json(ws, jsonData3, {
                        origin: "F3",
                      });
                      XLSX.utils.sheet_add_json(ws, subjectTitle, {
                        origin: "G1",
                      });
                      XLSX.utils.sheet_add_json(ws, jsonData4, {
                        origin: "K3",
                      });
                      XLSX.utils.sheet_add_json(ws, classTitle, {
                        origin: "L1",
                      });
                      XLSX.utils.sheet_add_json(ws, jsonData, {
                        origin: "A16",
                      });
                      XLSX.utils.sheet_add_json(ws, medium, { origin: "K16" });
                      XLSX.utils.sheet_add_json(ws, subjectId, {
                        origin: "L16",
                      });
                      XLSX.utils.sheet_add_json(ws, classId, { origin: "M16" });
                      XLSX.utils.sheet_add_json(ws, userTitle, {
                        origin: "E14",
                      });
                      XLSX.utils.sheet_add_json(ws, message, { origin: "B12" });
                      XLSX.utils.book_append_sheet(wb, ws, "users");
                      XLSX.writeFile(wb, "users.xlsx");
                      res.download("users.xlsx");
                      return res.status(200).json({
                        message:
                          "your users excel file is generated successfully.",
                        status: true,
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

userCtr.download = (req, res) => {
  // const file = `${__dirname}/users.xlsx`;
  const file = `users.xlsx`;
  res.download(file); // Set disposition and send it.
};

userCtr.exceladdUser = (req, res) => {
  let files = req.files;
  var workbook = XLSX.readFile(files.files.path);
  const wsname = workbook.SheetNames[0];
  const ws = workbook.Sheets[wsname];
  let data = XLSX.utils.sheet_to_json(ws, { header: 1 });
  data = data.slice(16);
  console.log("file====", data);
  for (let i = 0; i < data.length; i++) {
    let userData = {
      firstName: "",
      lastName: "",
      birthOfDate: "",
      schoolId: "",
      email: "",
      mobileNo: "",
      userRole: "",
      address: "",
      experience: "",
      gender: "",
      medium: "",
      subjectId: "",
      classId: "",
    };
    userData.schoolId = data[i][0];
    userData.firstName = data[i][1];
    userData.lastName = data[i][2];
    userData.email = data[i][3];
    userData.mobileNo = data[i][4];
    userData.userRole = data[i][5];
    userData.birthOfDate = data[i][6];
    userData.address = data[i][7];
    userData.experience = data[i][8];
    userData.gender = data[i][9];
    userData.medium = data[i][10];
    userData.subjectId = data[i][11];
    userData.classId = data[i][12];
    console.log(typeof userData.firstName);
    // let input = req.body;
    if (userData.firstName === undefined) {
      // if (i === data.length - 1) {
      return res.status(400).json({
        data: null,
        message: "First Name is required.",
        status: false,
      });
      // }
    } else if (userData.lastName === undefined) {
      // if (i === data.length - 1) {
      return res.status(400).json({
        data: null,
        message: "Last Name is required.",
        status: false,
      });
      // }
    } else if (userData.email === undefined) {
      // if (i === data.length - 1) {
      return res.status(400).json({
        data: null,
        message: "Email is required.",
        status: false,
      });
      // }
    } else {
      userModel
        .findOne({
          where: {
            email: userData.email,
          },
        })
        .then((user) => {
          if (user) {
            if (i === data.length - 1) {
              return res.status(400).json({
                data: null,
                message: "User with this email already exists.",
                status: false,
              });
            }
          } else {
            if (userData.subjectId.length > 0 && userData.classId.length > 0) {
              // console.log(studentData.subjectId.split(','))
              userData.subjectId = userData.subjectId.split(",");
              userData.classId = userData.classId.split(",");
            } else if (
              userData.subjectId.length > 0 &&
              !(userData.classId.length > 0)
            ) {
              userData.subjectId = userData.subjectId.split(",");
              let data2 = userData.classId;
              userData.classId = [];
              userData.classId.push(data2);
            } else if (
              !(userData.subjectId.length > 0) &&
              userData.classId.length > 0
            ) {
              userData.classId = userData.classId.split(",");
              let data1 = userData.subjectId;
              userData.subjectId = [];
              userData.subjectId.push(data1);
            } else {
              // console.log(studentData.subjectId)
              let data1 = userData.subjectId;
              let data2 = userData.classId;
              userData.subjectId = [];
              userData.classId = [];
              userData.subjectId.push(data1);
              userData.classId.push(data2);
            }
            let selectFields = userCtr.getFields("login");
            let loginUser = req.authUser;
            if (
              loginUser &&
              loginUser.userRole &&
              loginUser.userRole === 1 &&
              utils.empty(userData.schoolId)
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
                  if (
                    !utils.empty(req.files) &&
                    !utils.empty(req.files.profilePic)
                  ) {
                    userUtil.saveUserImage(
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
                  let userData2 = {
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    email: userData.email,
                    // password: utils.getRandomString(5),
                    password: "123456",
                    schoolId:
                      loginUser &&
                      loginUser.userRole &&
                      loginUser.userRole === 1
                        ? userData.schoolId
                        : loginUser.schoolId,
                  };
                  if (!utils.empty(image)) {
                    userData2.profilePic = image;
                  }
                  if (!utils.empty(userData.mobileNo)) {
                    userData2.mobileNo = userData.mobileNo;
                  }
                  if (!utils.empty(userData.birthOfDate)) {
                    userData2.birthOfDate = userData.birthOfDate;
                  }
                  if (!utils.empty(userData.address)) {
                    userData2.address = userData.address;
                  }
                  if (!utils.empty(userData.experience)) {
                    userData2.experience = userData.experience;
                  }
                  if (!utils.empty(userData.gender)) {
                    userData2.gender = userData.gender;
                  }
                  if (!utils.empty(userData.userRole)) {
                    userData2.userRole = userData.userRole;
                  }
                  userModel.adduser(
                    userData2,
                    (result) => {
                      callback(null, result);
                    },
                    (err) => {
                      console.log(err);
                      callback(err);
                    }
                  );
                },
                (userDetails, callback) => {
                  if (
                    !utils.empty(userData.subjectId) &&
                    typeof userData.subjectId === "object" &&
                    userData.subjectId.length > 0
                  ) {
                    let createData = [];
                    userData.subjectId.map((obj) => {
                      console.log("obj====", obj);
                      createData.push({
                        userId: userDetails.id,
                        subjectId: +obj,
                      });
                    });
                    subjectModel.createUserSubjectMulti(
                      createData,
                      (createDetails) => {
                        callback(null, userDetails);
                      },
                      (error) => {
                        userModel
                          .destroy({ where: { id: userDetails.id } })
                          .then((succ) => {})
                          .catch((err) => {});
                        callback(error);
                      }
                    );
                  } else {
                    callback(null, userDetails);
                  }
                },
                (userDetails, callback) => {
                  if (
                    !utils.empty(userData.classId) &&
                    typeof userData.classId === "object" &&
                    userData.classId.length > 0
                  ) {
                    let createData = [];
                    userData.classId.map((obj) => {
                      createData.push({
                        userId: userDetails.id,
                        classId: +obj,
                      });
                    });
                    classModel.createUserClassMulti(
                      createData,
                      (createDetails) => {
                        callback(null, userDetails);
                      },
                      (error) => {
                        userModel
                          .destroy({ where: { id: userDetails.id } })
                          .then((succ) => {})
                          .catch((err) => {});
                        callback(error);
                      }
                    );
                  } else {
                    callback(null, userDetails);
                  }
                },
                (result, callback) => {
                  userModel.loaduser(
                    { id: result.id },
                    (result1) => {
                      callback(null, result1[0]);
                    },
                    (err) => {
                      callback(err);
                    }
                  );
                },
              ],
              (err, userDetails) => {
                userArr.push(userDetails);
                console.log(userArr);
                if (!utils.empty(err)) {
                  return res.status(500).json({
                    data: [],
                    status: false,
                    message: req.t("DB_ERROR"),
                  });
                } else {
                  let response = {
                    data: [userDetails],
                    message: req.t("RECORD_CREATED"),
                    status: true,
                  };
                  if (i === data.length - 1) {
                    return res.status(200).json({
                      data: userArr,
                      message: req.t("RECORD_CREATED"),
                      status: true,
                    });
                  }
                  // userUtil.sendWelcomeEmail(userDetails.toJSON());
                  // return res.status(200).json(response);
                  // let randomString = utils.getRandomString(2);
                  // let tokenData = {
                  //     "uid": userDetails.get('id'),
                  //     "mobileNo": userDetails.get('mobileNo'),
                  //     userRole: userDetails.get('userRole'),
                  //     randomString: randomString
                  // };
                  // if (!utils.empty(req.body.installationId)) {
                  //     tokenData = _.extend(tokenData, {
                  //         "installationId": parseInt(req.body.installationId),
                  //         randomString: randomString
                  //     });
                  // }
                  // let profilePic = userDetails.toJSON().profilePic;
                  // userUtil.sendWelcomeEmail(userDetails.toJSON());
                  // userDetails = userUtil.userDetail(userDetails.dataValues, selectFields);
                  // // userDetails = userDetails.toJSON();
                  // userDetails["secretToken"] = jwt.createSecretToken(tokenData);
                  // userDetails["profilePic"] = profilePic;
                  // let response = {
                  //     "data": [userDetails],
                  //     "message": req.t('USER_REGISTERED'),
                  //     "status": true
                  // }
                  // if (input.deviceId) {
                  //     userInstallations.setUserInstallation(input.deviceId, userDetails.id, (installationResult) => {});
                  // }
                  // userTokenModel.createuserTokens({
                  //     userId: userDetails.id,
                  //     token: userDetails.secretToken
                  // }, (tokenDetails) => {
                  //     return res.status(200).json(response);
                  // }, (err) => {
                  //     return res.status(500).json({
                  //         data: [],
                  //         status: false,
                  //         message: req.t("DB_ERROR")
                  //     });
                  // });
                }
              }
            );
          }
        });
    }
  }
};

userCtr.login = (req, res) => {
  let input = req.body;
  console.log(input);
  let filter = {};
  if (!!input.schoolId) {
    filter["schoolId"] = input.schoolId;
  }
  filter["$or"] = [];
  if (!!input.email) {
    filter["$or"].push({
      email: input.email,
    });
  }
  if (!!input.mobileNo) {
    filter["$or"].push({
      mobileNo: input.mobileNo,
    });
  }
  userModel.loaduser(
    filter,
    (userData) => {
      if (!utils.empty(userData) && userData.length > 0) {
        let user = userData[0];
        let selectFields = userCtr.getFields("login");
        if (!utils.empty(input.email) && !user.authenticate(input.password)) {
          //user.userRole !== 2 &&
          return res.status(400).json({
            data: [],
            status: false,
            message: req.t("NOT_VALID_EMAIL_PASSWORD"),
          });
        } else if (user.status === "INACTIVE") {
          return res.status(400).json({
            data: [],
            status: false,
            message: req.t("INACTIVE_ACCOUNT"),
          });
        } else {
          let profilePic = user.profilePic;
          let randomString = utils.getRandomString(2);
          let tokenData = {
            uid: user.id,
            email: user.email,
            userRole: user.userRole,
            randomString: randomString,
          };
          if (!utils.empty(input.installationId)) {
            tokenData = {
              uid: user.id,
              email: user.email,
              installationId: input.installationId,
              randomString: randomString,
            };
          }
          let responseData = userUtil.userDetail(user.dataValues, selectFields);
          responseData["secretToken"] = jwt.createSecretToken(tokenData);
          responseData["profilePic"] = profilePic;
          userModel.updateuser(
            {
              lastLoggedIn: Sequelize.fn("NOW"),
            },
            {
              id: user.id,
            },
            (data) => {},
            (err) => {
              console.log("err..", err);
            }
          );
          let response = {
            data: [responseData],
            message: req.t("LOGIN_SUCCESSFUL"),
            status: true,
          };
          if (input.deviceId && input.deviceToken) {
            userInstallations.setUserInstallation(
              input,
              user.id,
              (installationResult) => {},
              (err) => {}
            );
          }
          userTokenModel.createuserTokens(
            {
              userId: responseData.id,
              token: responseData.secretToken,
            },
            (tokenDetails) => {
              return res.status(200).json(response);
            },
            (err) => {
              return res.status(500).json({
                data: [],
                status: false,
                message: req.t("DB_ERROR"),
              });
            }
          );
        }
      } else {
        res.status(400).json({
          data: [],
          status: false,
          message: req.t("NOT_VALID_EMAIL_PASSWORD"),
        });
      }
    },
    (error) => {
      console.log(error);
      return res.status(500).json({
        data: [],
        status: false,
        message: req.t("DB_ERROR"),
      });
    }
  );
};

userCtr.getuserProfile = (req, res) => {
  let userData = req.authUser;
  let selectFields = userCtr.getFields("login");
  let userDetails = userUtil.userDetail(userData, selectFields);
  let response = {
    message: "",
    status: true,
    data: [userDetails],
  };
  return res.status(200).json(response);
};

userCtr.createUser = (req, res) => {
  userModel.getuserByMobileNo(
    req.body.mobileNo,
    (userData) => {
      if (!!userData) {
        userCtr.login(req, res);
      } else {
        userCtr.addUser(req, res);
      }
    },
    (err) => {
      return res.status(500).json({
        data: [],
        status: false,
        message: req.t("DB_ERROR"),
      });
    }
  );
};

userCtr.addUser = (req, res) => {
  let input = req.body;
  let selectFields = userCtr.getFields("login");
  let loginUser = req.authUser;
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
          userUtil.saveUserImage(req.files, null, (error, imagepath) => {
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
        let userData = {
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email,
          password: "123456", //utils.getRandomString(5),
          schoolId:
            loginUser && loginUser.userRole && loginUser.userRole === 1
              ? input.schoolId
              : loginUser.schoolId,
        };
        if (!utils.empty(image)) {
          userData.profilePic = image;
        }
        if (!utils.empty(input.mobileNo)) {
          userData.mobileNo = input.mobileNo;
        }
        if (!utils.empty(input.birthOfDate)) {
          userData.birthOfDate = input.birthOfDate;
        }
        if (!utils.empty(input.address)) {
          userData.address = input.address;
        }
        if (!utils.empty(input.experience)) {
          userData.experience = input.experience;
        }
        if (!utils.empty(input.gender)) {
          userData.gender = input.gender;
        }
        if (!utils.empty(input.userRole)) {
          userData.userRole = input.userRole;
        }
        userModel
          .findOne({
            where: { schoolId: input.schoolId, userRole: input.userRole },
          })
          .then((user) => {
            if (user) {
              res.status(400).send({
                data: null,
                message: "Principal already exist in this school.",
                status: false,
              });
            } else {
              userModel.adduser(
                userData,
                (result) => {
                  callback(null, result);
                },
                (err) => {
                  console.log(err);
                  callback(err);
                }
              );
            }
          });
      },
      (userDetails, callback) => {
        if (
          !utils.empty(input.subjectId) &&
          typeof input.subjectId === "object" &&
          input.subjectId.length > 0
        ) {
          let createData = [];
          input.subjectId.map((obj) => {
            createData.push({
              userId: userDetails.id,
              subjectId: +obj,
            });
          });
          subjectModel.createUserSubjectMulti(
            createData,
            (createDetails) => {
              callback(null, userDetails);
            },
            (error) => {
              userModel
                .destroy({ where: { id: userDetails.id } })
                .then((succ) => {})
                .catch((err) => {});
              callback(error);
            }
          );
        } else {
          callback(null, userDetails);
        }
      },
      (userDetails, callback) => {
        if (
          !utils.empty(input.classId) &&
          typeof input.classId === "object" &&
          input.classId.length > 0
        ) {
          let createData = [];
          input.classId.map((obj) => {
            createData.push({
              userId: userDetails.id,
              classId: +obj,
            });
          });
          classModel.createUserClassMulti(
            createData,
            (createDetails) => {
              callback(null, userDetails);
            },
            (error) => {
              userModel
                .destroy({ where: { id: userDetails.id } })
                .then((succ) => {})
                .catch((err) => {});
              callback(error);
            }
          );
        } else {
          callback(null, userDetails);
        }
      },
      (result, callback) => {
        userModel.loaduser(
          { id: result.id },
          (result1) => {
            callback(null, result1[0]);
          },
          (err) => {
            callback(err);
          }
        );
      },
    ],
    (err, userDetails) => {
      if (!utils.empty(err)) {
        console.log(err);
        return res.status(500).json({
          data: [],
          status: false,
          message: req.t("DB_ERROR"),
        });
      } else {
        let response = {
          data: [userDetails],
          message: req.t("RECORD_CREATED"),
          status: true,
        };
        userUtil.sendWelcomeEmail(userDetails.toJSON());
        return res.status(200).json(response);
        // let randomString = utils.getRandomString(2);
        // let tokenData = {
        //     "uid": userDetails.get('id'),
        //     "mobileNo": userDetails.get('mobileNo'),
        //     userRole: userDetails.get('userRole'),
        //     randomString: randomString
        // };
        // if (!utils.empty(req.body.installationId)) {
        //     tokenData = _.extend(tokenData, {
        //         "installationId": parseInt(req.body.installationId),
        //         randomString: randomString
        //     });
        // }
        // let profilePic = userDetails.toJSON().profilePic;
        // userUtil.sendWelcomeEmail(userDetails.toJSON());
        // userDetails = userUtil.userDetail(userDetails.dataValues, selectFields);
        // // userDetails = userDetails.toJSON();
        // userDetails["secretToken"] = jwt.createSecretToken(tokenData);
        // userDetails["profilePic"] = profilePic;
        // let response = {
        //     "data": [userDetails],
        //     "message": req.t('USER_REGISTERED'),
        //     "status": true
        // }
        // if (input.deviceId) {
        //     userInstallations.setUserInstallation(input.deviceId, userDetails.id, (installationResult) => {});
        // }
        // userTokenModel.createuserTokens({
        //     userId: userDetails.id,
        //     token: userDetails.secretToken
        // }, (tokenDetails) => {
        //     return res.status(200).json(response);
        // }, (err) => {
        //     return res.status(500).json({
        //         data: [],
        //         status: false,
        //         message: req.t("DB_ERROR")
        //     });
        // });
      }
    }
  );
};

userCtr.updateUser = (req, res) => {
  let input = req.body;
  if (utils.empty(input.oldSubjectId)) {
    input.oldSubjectId = [];
  }
  if (utils.empty(input.subjectId)) {
    input.subjectId = [];
  }
  if (utils.empty(input.oldClassId)) {
    input.oldClassId = [];
  }
  if (utils.empty(input.classId)) {
    input.classId = [];
  }
  let userId = req.authUser.id;
  if (!utils.empty(input.userId)) {
    userId = input.userId;
  }
  if (userId === 1) {
    return res.status(500).json({
      data: [],
      status: false,
      message: "Admin info not updated",
    });
  }

  waterfall(
    [
      (callback) => {
        userModel.loaduser(
          { id: userId },
          (userDetail) => {
            callback(null, userDetail[0].dataValues);
          },
          (err) => {
            callback(err);
          }
        );
      },
      (userDetails, callback) => {
        if (!utils.empty(req.files) && !utils.empty(req.files.profilePic)) {
          userUtil.saveUserImage(
            req.files,
            config.SYSTEM_IMAGE_PATH +
              config.USER_IMAGE_PATH +
              userDetails.profilePic,
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
        let userData = {};

        if (!utils.empty(input.firstName)) {
          userData.firstName = input.firstName;
        }
        if (!utils.empty(input.lastName)) {
          userData.lastName = input.lastName;
        }
        if (!utils.empty(input.email)) {
          userData.email = input.email;
        }
        if (!utils.empty(image)) {
          userData.profilePic = image;
        }
        if (!utils.empty(input.mobileNo)) {
          userData.mobileNo = input.mobileNo;
        }
        if (!utils.empty(input.schoolId)) {
          userData.schoolId = input.schoolId;
        }
        if (!utils.empty(input.birthOfDate)) {
          userData.birthOfDate = input.birthOfDate;
        }
        if (!utils.empty(input.address)) {
          userData.address = input.address;
        }
        if (!utils.empty(input.experience)) {
          userData.experience = input.experience;
        }
        if (!utils.empty(input.gender)) {
          userData.gender = input.gender;
        }
        if (!utils.empty(input.status)) {
          userData.status = input.status;
        }
        if (!utils.empty(input.userRole)) {
          userData.userRole = input.userRole;
        }

        userModel.updateuser(
          userData,
          {
            id: userId,
          },
          (userDetail) => {
            callback(null, userDetail);
          },
          (err) => {
            callback(err);
          }
        );
      },
      (userDetail, callback) => {
        let difference = input.oldSubjectId.filter(
          (x) => !input.subjectId.includes(x)
        );
        if (difference && difference.length > 0) {
          subjectModel
            .destroy({
              where: { userId: userId, subjectId: { $in: difference } },
            })
            .then(
              (succ) => {
                callback(null, userDetail);
              },
              (err) => {
                callback(err);
              }
            );
        } else {
          callback(null, userDetail);
        }
      },
      (userDetail, callback) => {
        let diffAdd = input.subjectId.filter(
          (x) => !input.oldSubjectId.includes(x)
        );
        if (diffAdd && diffAdd.length > 0) {
          let createData = [];
          diffAdd.map((obj) => {
            createData.push({
              userId: userId,
              subjectId: obj,
            });
          });
          subjectModel.createUserSubjectMulti(
            createData,
            (createDetails) => {
              callback(null, userDetail);
            },
            (err) => {
              callback(err);
            }
          );
        } else {
          callback(null, userDetail);
        }
      },
      (userDetail, callback) => {
        let difference = input.oldClassId.filter(
          (x) => !input.classId.includes(x)
        );
        if (difference && difference.length > 0) {
          classModel
            .destroy({
              where: { userId: userId, classId: { $in: difference } },
            })
            .then(
              (succ) => {
                callback(null, userDetail);
              },
              (err) => {
                callback(err);
              }
            );
        } else {
          callback(null, userDetail);
        }
      },
      (userDetail, callback) => {
        let diffAdd = input.classId.filter(
          (x) => !input.oldClassId.includes(x)
        );
        if (diffAdd && diffAdd.length > 0) {
          let createData = [];
          diffAdd.map((obj) => {
            createData.push({
              userId: userId,
              classId: obj,
            });
          });
          classModel.createUserClassMulti(
            createData,
            (createDetails) => {
              callback(null, userDetail);
            },
            (err) => {
              callback(err);
            }
          );
        } else {
          callback(null, userDetail);
        }
      },
      (result, callback) => {
        userModel.loaduser(
          { id: userId },
          (result1) => {
            callback(null, result1[0]);
          },
          (err) => {
            callback(err);
          }
        );
      },
    ],
    (err, userDetail) => {
      if (!utils.empty(err)) {
        return res.status(500).json({
          data: [],
          status: false,
          message: req.t("DB_ERROR"),
        });
      } else {
        return res.status(200).json({
          data: [userDetail],
          message: req.t("USER_UPDATED"),
          status: true,
        });
      }
    }
  );
};

userCtr.getUserList = (req, res) => {
  let input = req.body;
  let userId = req.authUser.id;
  let filter = {
    userRole: 3,
  };
  let limit = config.MAX_RECORDS;
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
  if (loginUser && loginUser.userRole && loginUser.userRole === 1) {
    if (!utils.empty(input.schoolId)) {
      filter["schoolId"] = input.schoolId;
    }
  } else {
    filter["schoolId"] = loginUser.schoolId;
  }
  if (!utils.empty(input.status)) {
    filter["status"] = input.status.toUpperCase();
  }
  if (!utils.empty(input.userRole)) {
    filter["userRole"] = input.userRole;
  }
  userModel.getusers(filter, input, pg, limit, (total, users) => {
    if (total > 0) {
      let pages = Math.ceil(total / (limit ? limit : total));
      let pagination = {
        pages: pages ? pages : 1,
        total: total,
        max: limit ? limit : total,
      };
      res.status(200).json({
        pagination: pagination,
        data: users,
      });
    } else {
      res.status(400).json({
        data: [],
        status: false,
        message: req.t("NO_RECORD_FOUND"),
      });
    }
  });
};

userCtr.statusChange = (req, res) => {
  let input = req.body;
  let role = req.authUser.userRole;
  if (!utils.empty(role) && (role == 1 || role == 2)) {
    let updateData = { status: input.status };
    let filter = { id: input.userId };
    userModel.updateuser(
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
  } else {
    return res
      .status(400)
      .json({ data: [], status: false, message: req.t("NOT_AUTHORIZED") });
  }
};

userCtr.installation = (req, res) => {
  let input = req.body;
  let createData = {
    timezone: input.timezone,
    appVersion: input.appVersion,
    buildNumber: input.buildNumber,
    appName: input.appName,
    deviceType: input.deviceType,
    badge: input.badge,
    appIdentifier: input.appIdentifier,
    localeIdentifier: input.localeIdentifier,
    deviceToken: input.deviceToken,
    deviceId: input.deviceId,
  };

  userInstallations.addRecord(
    createData,
    (user) => {
      return res.status(200).json({
        data: [],
        status: true,
        message: req.t("INSTALLATION_SUCCESS"),
      });
    },
    (err) => {
      console.log(err);
      return res.status(500).json({
        data: [],
        status: false,
        message: req.t("DB_ERROR"),
      });
    }
  );
};

userCtr.notification = (req, res) => {
  let input = req.body;
  userCtr.sendNotification(
    input,
    (success) => {
      return res.status(200).json({
        data: [],
        status: true,
        message: req.t("PUSH_NOTIFICATION_SUCCESS"),
      });
    },
    (err, status, msg) => {
      console.log(err);
      return res.status(status).json({
        data: [],
        status: false,
        message: req.t(msg),
      });
    }
  );
};

userCtr.sendNotification = (req, res) => {
  let input = req.body;
  waterfall(
    [
      (callback) => {
        if (input.sendto === "businessowners") {
          businessModel.getBusinessUsers(
            {},
            (result) => {
              let ids = result.map((obj) => obj.userId);
              callback(null, ids);
            },
            (err) => {
              console.log(err);
              callback(err);
            }
          );
        } else {
          callback(null, null);
        }
      },
      (userIds, callback) => {
        if (input.sendto === "selecteduser") {
          callback(null, req.body.userIds);
        } else {
          callback(null, userIds);
        }
      },
      (userIds, callback) => {
        if (input.sendto === "parent") {
          parentModel.getparent(
            {},
            (result) => {
              let ids = result.map((obj) => obj.id);
              callback(null, ids);
            },
            (err) => {
              callback(err);
            }
          );
        } else {
          callback(null, userIds);
        }
      },
      (userIds, callback) => {
        if (input.sendto === "all") {
          userModel.getUsersForNotification(
            {},
            (result) => {
              let ids = result.map((obj) => obj.id);
              callback(null, ids);
            },
            (err) => {
              callback(err);
            }
          );
        } else {
          callback(null, userIds);
        }
      },
      (userIds, callback) => {
        let filter = {};
        if (input.sendto === "parent") {
          filter = { parentId: { $in: userIds } };
        } else {
          filter = { owner: { $in: userIds } };
        }

        userInstallations.loadRecords(
          filter,
          (deviceList) => {
            deviceList = deviceList.map(function (sensor) {
              return sensor.dataValues;
            });
            if (!utils.empty(deviceList) && deviceList.length > 0) {
              deviceList.map((obj) => {
                notificationUtils.sendPushNotification(
                  input,
                  obj.deviceToken,
                  (user) => {},
                  (err) => {}
                );
              });
              callback(null);
            } else {
              callback(null);
            }
          },
          (err) => {
            callback(err);
          }
        );
      },
    ],
    (err) => {
      if (!utils.empty(err)) {
        return res.status(500).json({
          data: [],
          status: false,
          message: req.t("DB_ERROR"),
        });
      } else {
        return res.status(200).json({
          data: [],
          status: true,
          message: req.t("PUSH_NOTIFICATION_SUCCESS"),
        });
      }
    }
  );
};

userCtr.dashboard = (req, res) => {
  userModel.dashboard(
    (totalList) => {
      return res.status(200).json({
        data: [totalList],
        status: true,
        message: "",
      });
    },
    (err) => {
      return res.status(500).json({
        data: [],
        status: false,
        message: req.t("DB_ERROR"),
      });
    }
  );
};

userCtr.sendmsgNotification = (req, res) => {
  let userId = req.authUser.id;
  let input = req.body;
  let message = "";

  waterfall(
    [
      (callback) => {
        let userData = {
          from: userId,
          to: input.userId,
          message: input.message,
          orderId: input.orderId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        messageModel.createmessages(
          userData,
          (result) => {
            if (input.userId === req.order.business.dataValues.userId) {
              message =
                "[" + req.order.trackId + "] " + "You received new message";
            } else {
              message =
                "[" +
                req.order.trackId +
                "] " +
                "New message from " +
                req.order.business.dataValues.nameEn;
            }
            let sendData = { title: "Awani", body: message, order: req.order };
            orderCtr.sendNotification(
              input.userId,
              sendData,
              (success) => {},
              (err, status, msg) => {}
            );
            callback(null, result);
          },
          (err) => {
            console.log(err);
            callback(err);
          }
        );
      },
    ],
    (err) => {
      if (utils.empty(err)) {
        return res.status(200).json({
          data: [],
          status: true,
          message: req.t("MSG_SEND_SUCCESS"),
        });
      } else {
        return res.status(500).json({
          data: [],
          status: false,
          message: err,
        });
      }
    }
  );
};

userCtr.forgotPassword = (req, res) => {
  let input = req.body;
  let getDetails;
  let filter = {};

  if (req.action === "user") {
    getDetails = userModel;
    filter = {
      email: input.email,
      schoolId: input.schoolId,
    };
  } else if (req.action === "parent") {
    getDetails = parentModel;
    filter = {
      email: input.email,
      grNumber: input.grNumber,
    };
  }
  getDetails.loaduser(filter, (userData) => {
    if (!utils.empty(userData) && userData.length > 0) {
      let user = userData[0];
      if (user.userRole === 1) {
        return res.status(400).json({
          data: [],
          status: false,
          message: req.t("EMAIL_NOT_FOUND"),
        });
      } else {
        let pass_ = utils.dataEncrypt(utils.getRandomString(9));
        user.password = pass_;
        userUtil.sendForgotPasswordEmail(user, (err, isEmailSent) => {
          if (isEmailSent == true) {
            let userData = {
              password: pass_,
            };
            getDetails.updateuser(
              userData,
              filter,
              (userDetail) => {
                return res.status(200).json({
                  data: [],
                  status: true,
                  message: req.t("FORGOT_MESSAGE"),
                });
              },
              (err) => {
                return res.status(200).json({
                  data: [],
                  status: false,
                  message: req.t("DB_ERROR"),
                });
              }
            );
          } else {
            return res.status(200).json({
              data: [],
              status: false,
              message: req.t("DB_ERROR"),
            });
          }
        });
      }
    } else {
      return res.status(400).json({
        data: [],
        status: false,
        message: req.t("EMAIL_NOT_FOUND"),
      });
    }
  });
};

userCtr.resetPassword = (req, res) => {
  let input = req.body;
  let userId = req.authUser.id;
  let getDetails;
  if (req.authUser.userRole === 1) {
    return res.status(400).json({
      data: [],
      status: false,
      message: req.t("NOT_AUTHORIZED"),
    });
  } else {
    if (req.action === "user") {
      getDetails = userModel;
    } else if (req.action === "parent") {
      getDetails = parentModel;
    }
    getDetails.getUserById(userId, (user) => {
      if (!user) {
        return res.status(400).json({ message: req.t("NOT_VALID_USER") });
      } else if (!user.authenticate(input.oldPassword)) {
        return res
          .status(400)
          .json({ message: req.t("OLD_PASSWORD_NOT_FOUND") });
      } else {
        let userData = { password: utils.dataEncrypt(input.newPassword) };
        getDetails.updateuser(
          userData,
          { id: userId },
          (userDetail) => {
            return res.status(200).json({ message: req.t("PASSWORD_SET") });
          },
          (err) => {
            console.log(err);
            return res.status(500).json({ message: req.t("DB_ERROR") });
          }
        );
      }
    });
  }
};

module.exports = userCtr;
