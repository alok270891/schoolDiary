let validator = {};
validator.getHolidayValidator = (req, type) => {
    let input = {
        create: {
            holidayDate: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "holiday date" })],
            holidayName: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "holiday name" })]
        },
        statusChange: {
            holidayId: ["isInt", req.t("FIELD_REQUIRED", { FIELD: "holiday id" })],
            status: ["isValidEnum", req.t("STATUS_NOT_VALID"), ["ACTIVE", "INACTIVE"]],
        },
    };
    return input[type];
}

module.exports = validator;