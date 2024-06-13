const multer = require('multer');
const { v4: uuidv4 }= require('uuid');
const path = require('path');

const storage= multer.diskStorage({
    destination: (req, file, cb)=>{
        cb(null, './public/images/uploads')  //the folder where the files will be stored
    },
    filename: (req,file,cb)=>{
        const uniqueFilename = uuidv4(); //generate a uniquefilename
        cb(null, uniqueFilename+path.extname(file.originalname));   //use the unique file ame for the uload file
    }
});

const upload = multer({ storage: storage });
module.exports = upload;