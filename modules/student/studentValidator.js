let validator = {};
validator.getStudentValidator = (req, type) => {
    let input = {
        create: {
            firstName: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "First name" })],
            lastName: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "Last name" })],
            classId: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "Class" })],
            grNumber: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "Gr number" })],
            rollNumber: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "Roll number" })],
            joiningDate: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "Joining date" })],
            parentFirstName: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "Parent first name" })],
            parentLastName: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "Parent last name" })],
            parentEmail: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "Parent email" })],
            parentMobileNo: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "Parent mobile number" })],
            parentAddress: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "Parent address" })]
        },
        statusChange: {
            studentId: ["isInt", req.t("FIELD_REQUIRED", { FIELD: "student id" })],
            status: ["isValidEnum", req.t("STATUS_NOT_VALID"), ["ACTIVE", "INACTIVE"]],
        },
        update: {
            studentId: ["isInt", req.t("FIELD_REQUIRED", { FIELD: "student id" })],
            parentId: ["isInt", req.t("FIELD_REQUIRED", { FIELD: "parent id" })],
        },
        getresult: {
            examTimeTableId: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "examTimeTable id" })],
        },
        sampleresult: {
            examTimeTableId: ["isInt", req.t("FIELD_REQUIRED", { FIELD: "examTimeTable id" })],
        },
        addstudentresult: {
            examTimeTableId: ["isInt", req.t("FIELD_REQUIRED", { FIELD: "examTimeTable id" })],
        },
        updateresult: {
            marks: ["isInt", req.t("FIELD_REQUIRED", { FIELD: "marks" })],
            subjectresultsId: ["isInt", req.t("FIELD_REQUIRED", { FIELD: "subject results id" })],
        }
    };
    return input[type];
}

module.exports = validator;