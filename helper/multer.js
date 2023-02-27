const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "../uploads/homework");
  },
  filename: function (req, file, cb) {
    // eslint-disable-next-line indent
    // const now = new Date().toISOString();
    // const date = now.replace(/:/g, "-");
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage }).array("document", 10);

module.exports = upload;
