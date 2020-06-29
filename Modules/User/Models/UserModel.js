/**
 * Created by Akshay Sangani.
 * User: theta-ubuntu-1
 * Date: 07/06/19
 * Time: 1:20 PM
 */
let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let constants = require('../../../Utils/ModelConstants');
let deepPopulate = require('mongoose-deep-populate')(mongoose);
let varConst = require('../../../Utils/Constants');
let schema = new Schema({

    firstName: {type: String},
    lastName: {type: String},
    email: {type: String, index: true, format: 'email'},
    role: {type: String, required: true, ref: constants.RolesModel},
    photo: {type: String, ref: constants.PhotosModel},
    password: {type: String},
    passwordResetToken: {type: String},
    phone: {type: String},
    dateOfBirth: {type: String}, //(MM/DD/YYYY)
    gender: {type: Number, default: false}, //0=not specified, 1=male, 2=female
    isVerified: {type: Number, default: varConst.ACTIVE},  //0=no, 1=yes
    isActive: {type: Number, default: varConst.ACTIVE},  //0=no, 1=yes
    isResetPassword: {type: Number, default: varConst.INACTIVE},  //0=no, 1=yes
    isDeleted: {type: Number, default: varConst.NOT_DELETED}  //0=no, 1=yes
}, {
    collection: constants.UserModel, autoIndex: true, timestamps: true, usePushEach: true,
    toObject: {
        transform: function (doc, obj) {
            obj.id = obj._id;
            delete obj._id;
        }
    },
    toJSON: {
        transform: function (doc, obj) {
            obj.id = obj._id;
            delete obj._id;
        }
    }
});
schema.plugin(deepPopulate);
mongoose.model(constants.UserModel, schema);
