/**
 * Created by Akshay Sangani.
 * User: theta-ubuntu-1
 * Date: 17/5/19
 * Time: 3:54 PM
 */
let path = require('path');
let multer = require('multer');
let crypto = require('crypto-random-string');
let VerifyToken = require('../../auth/VerifyToken');
let VerifySuperAdmin = require('../../auth/VerifySuperAdmin');
let cron = require('node-cron');
let backup = require('../../Configs/mongodb_backup.js');

let UserController = require('./Controllers/UserController');
let ServicePhotoController = require('./Controllers/ServicePhotoController');

/*Cronjob for database backup - every day at 12:00 AM*/
cron.schedule('0 0 0 * * *', () => {
    backup.dbAutoBackUp();
});

let uploadService = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'uploads/services')
        },
        filename: function (req, file, cb) {
            cb(null, crypto({length: 64}).toString('hex') + path.extname(file.originalname))
        }
    }),
});

let userUpload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'uploads/profile')
        },
        filename: function (req, file, cb) {
            cb(null, crypto({length: 64}).toString('hex') + path.extname(file.originalname))
        }
    }),
    /*Particular validation for files*/
    /*fileFilter: function (req, file, callback) {
        let ext = path.extname(file.originalname);
        if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg' && ext !== '.doc' && ext !== '.docx' && ext !== '.pdf') {
            return callback(new Error('Only images, pdf and doc are allowed'))
        }
        callback(null, true)
    }*/
});

/* Add here the all the routes for the user */
module.exports = function (router) {
    /* REST API */

    /*Mobile side & Admin side*/
    router.post('/api/signup', UserController.signup, UserController.uploadDefaultPhoto, UserController.signupInfo);
    router.post('/api/login', UserController.login, UserController.addDeviceInfo, UserController.finalInfo);
    router.post('/api/logout', VerifyToken, UserController.logout);
    router.post('/api/updateProfile', VerifyToken, userUpload.single('image'), VerifyToken, UserController.editProfile, UserController.unlinkProfilePic, UserController.uploadPhoto, UserController.userFinalRes);
    router.post('/api/changePassword', VerifyToken, UserController.changePassword);
    router.post('/api/forgotPassword', UserController.forgotPassword);
    router.post('/api/resetPassword', UserController.resetPassword);

    //service photo
    router.post('/api/servicePhoto', uploadService.single('image'), ServicePhotoController.createServicePhoto, ServicePhotoController.uploadPhoto, ServicePhotoController.servicePhotoFinalInfo);
    router.put('/api/servicePhoto', uploadService.single('image'), ServicePhotoController.updateServicePhoto, ServicePhotoController.unlinkPhoto, ServicePhotoController.uploadPhoto, ServicePhotoController.servicePhotoFinalInfo);
    router.delete('/api/servicePhoto/:servicePhotoId', ServicePhotoController.deleteServicePhoto, ServicePhotoController.servicePhotoFinalInfo);
    router.get('/api/servicePhoto', ServicePhotoController.allServicePhoto);

    //Remove database and setup fresh database with default migration
    router.get('/api/removeDatabase', VerifySuperAdmin, UserController.removeDatabase);
    router.get('/api/getAllBackupDatabaseList', UserController.getAllBackupDatabaseList);
    router.get('/api/applyOldDatabase/:dbName', UserController.applyOldDatabase);
    router.get('/api/removeDatabaseBackup/:dbName', UserController.removeDatabaseBackup);
};
