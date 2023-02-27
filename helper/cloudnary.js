const cloudinary = require('cloudinary').v2;

const cloud = cloudinary.config({ 
  cloud_name: 'dg4sz43wn', 
  api_key: '396113611584894', 
  api_secret: 'atKyNBh_iEDODlBUL_UHFRQ5Nos',
});

module.exports = cloud;