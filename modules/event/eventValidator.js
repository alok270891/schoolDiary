let validator = {};
validator.getEventValidator = (req, type) => {
    let input = {
        create: {
            title: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "Title" })],
            description: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "Description" })],
            eventDate: ["notEmpty", req.t("INVALID‌‌‌‌_SELECT_FIELD", { FIELD: "Event date" })],
            eventTime: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "Event time" })],
            location: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "Location" })]
        },
        statusChange: {
            eventId: ["isInt", req.t("FIELD_REQUIRED", { FIELD: "Event id" })],
            status: ["isValidEnum", req.t("STATUS_NOT_VALID"), ['Interested', 'Ignore', 'Going']],
        }
    };
    return input[type];
}

module.exports = validator;