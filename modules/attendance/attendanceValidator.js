let validator = {};
validator.getAttendanceValidator = (req, type) => {
    let input = {
        create: {
            studentId: ["notEmpty", req.t("INVALID‌‌‌‌_SELECT_FIELD", { FIELD: "student" })],
            classId: ["notEmpty", req.t("INVALID‌‌‌‌_SELECT_FIELD", { FIELD: "class" })],
            attendanceDate: ["notEmpty", req.t("INVALID‌‌‌‌_SELECT_FIELD", { FIELD: "attendance date" })],
            status: ["isValidEnum", req.t("STATUS_NOT_VALID"), ["A", "P", "L"]],
        },
        statusChange: {
            attendanceId: ["isInt", req.t("FIELD_REQUIRED", { FIELD: "Home work id" })],
            status: ["isValidEnum", req.t("STATUS_NOT_VALID"), ["A", "P", "L"]],
        },
        update: {
            attendanceId: ["isInt", req.t("FIELD_REQUIRED", { FIELD: "Home work id" })],
        }
    };
    return input[type];
}

module.exports = validator;