/**
 * Created by Akshay Sangani.
 * User: theta-ubuntu-1
 * Date: 29/06/20
 * Time: 10:44 AM
 */
let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let constants = require('../../../Utils/ModelConstants');
let deepPopulate = require('mongoose-deep-populate')(mongoose);
let varConst = require('../../../Utils/Constants');
let mongooseValidationErrorTransform = require('mongoose-validation-error-transform');
let schema = new Schema({

  photo: {type: Schema.Types.ObjectId, ref: constants.PhotosModel},
  words: [{
    word: {type: String, required: true},
    percentage: {type: Number, required: true}
  }],
  isActive: {type: Number, default: varConst.ACTIVE},  //0=no, 1=yes
  isDeleted: {type: Number, default: varConst.NOT_DELETED}  //0=no, 1=yes
}, {
    collection: constants.ServicePhotoModel, autoIndex: true, timestamps: true,
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
mongoose.plugin(mongooseValidationErrorTransform, {
  capitalize: true,
  humanize: true,
  transform: function(messages) {
    return messages;
  }
});
mongoose.model(constants.ServicePhotoModel, schema);
