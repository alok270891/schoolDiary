const schoolModel = require("./schoolModel");
const utils = require("../../helper/utils");
const config = require("../../config/config");
const waterfall = require("async-waterfall");
const user = require("../user/userModel");
const userModel = require("../user/userModel");
let schoolCtr = {};

schoolCtr.create = (req, res) => {
  let input = req.body;

  waterfall(
    [
      (callback) => {
        let schoolData = {
          schoolName: input.schoolName,
          city: input.city,
          address: input.address,
        };
        schoolModel.createschool(
          schoolData,
          (schoolMaster) => {
            callback(null, schoolMaster.id);
          },
          (error) => {
            console.log(error);
            callback(error);
          }
        );
      },
    ],
    (err, schoolId) => {
      if (err) {
        return res.status(400).json({ message: err, data: [], status: false });
      } else {
        let response = {
          data: { schoolId: schoolId },
          message: req.t("SCHOOL_CREATED"),
          status: true,
        };
        return res.status(200).json(response);
      }
    }
  );
};

schoolCtr.update = (req, res) => {
  let input = req.body;
  let schoolId = req.body.schoolId;
  let loginUser = req.authUser;
  waterfall(
    [
      (callback) => {
        let schoolData = {};

        if (!utils.empty(input.schoolName)) {
          schoolData.schoolName = input.schoolName;
        }
        if (!utils.empty(input.city)) {
          schoolData.city = input.city;
        }
        if (!utils.empty(input.address)) {
          schoolData.address = input.address;
        }
        if (!utils.empty(input.status)) {
          schoolData.status = input.status;
          let role = req.authUser.userRole;
          if (!utils.empty(role) && (role == 1 || role == 2)) {
            let updateData = { status: input.status };
            let filter = { schoolId: schoolId };
            userModel.updateuser(
              updateData,
              filter,
              (userUpdate) => {
                console.log(userUpdate);
              },
              (err) => {
                console.log(err);
              }
            );
          }
        }
        schoolModel.updateschool(
          schoolData,
          { id: schoolId },
          (schoolDetail) => {
            callback(null);
          },
          (err) => {
            console.log(err);
            callback(err);
          }
        );
      },
      (callback) => {
        schoolModel.getschool(
          { id: schoolId },
          (schooldetails) => {
            if (!utils.empty(schooldetails) && schooldetails.length > 0) {
              callback(null, schooldetails[0].dataValues);
            } else {
              callback(null, null);
            }
          },
          (err) => {
            callback(req.t("DB_ERROR"));
          }
        );
      },
    ],
    (err, schooldetails) => {
      if (err) {
        return res.status(400).json({ message: err });
      } else {
        let response = {
          data: schooldetails,
          message: req.t("SCHOOL_UPDATED"),
        };
        return res.status(200).json(response);
      }
    }
  );
};

schoolCtr.schoolList = (req, res) => {
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
    if (!utils.empty(req.body.status)) {
      filter["status"] = req.body.status.toUpperCase();
    }
    if (!utils.empty(input.searchName)) {
      searchName = input.searchName;
    }
  }
  schoolModel.getschoolList(
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
      return res
        .status(500)
        .json({ message: req.t("DB_ERROR"), data: [], status: false });
    }
  );
};

schoolCtr.getschoolDetails = (req, res) => {
  return res.status(200).json({ data: req.school });
};

module.exports = schoolCtr;
