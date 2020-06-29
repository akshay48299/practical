/**
 * Created by Akshay Sangani.
 * User: theta-ubuntu-1
 * Date: 13/5/19
 * Time: 3:23 PM
 */
let mongoose = require('mongoose');
let fs = require('fs');
let async = require('async');
let path = require('path');
let slugs = require("slugs");
let sharp = require('sharp');
let Helper = require('../../../_helper/Helper');
let PhotoHelper = require('../../../_helper/PhotoHelper');
let constants = require('../../../Utils/ModelConstants');
let varConst = require('../../../Utils/Constants');
let stringConstants = require('../../../Utils/StringConstants');
let responseHandler = require('../../../Utils/ResponseHandler');

//Models
let ServicePhotoModel = mongoose.model(constants.ServicePhotoModel);
let PhotosModel = mongoose.model(constants.PhotosModel);

let ServicePhotoCtrl = {

  createServicePhoto: function (request, response, next) {

    let input = request.body;

    if(Helper.isNotEmpty(input.words)) {
      let servicePhotoModel = new ServicePhotoModel();
      servicePhotoModel.words = JSON.parse(input.words);
      servicePhotoModel.save(function (error, result) {
        if (error) responseHandler.sendSuccess(response, error, error.name);

        request.body.servicePhotoId = result.id;
        next();
      });
    } else {
      responseHandler.sendSuccess(response, "", "Words is required");
    }
  },

  updateServicePhoto: function (request, response, next) {

    let input = request.body;

    ServicePhotoModel.findOne({_id: input.servicePhotoId}, function (err, servicePhotoModel) {
      if (err) {
        responseHandler.sendInternalServerError(response, err, err.name);
      } else if (!servicePhotoModel) {
        responseHandler.sendSuccess(response, "", "Service photo not found.");
      } else if(!Helper.isNotEmpty(input.words)) {
        responseHandler.sendSuccess(response, "", "Words is required");
      } else {
        servicePhotoModel.words = JSON.parse(input.words);
        servicePhotoModel.save(function (error, result) {
          if (error) responseHandler.sendSuccess(response, error, error.name);

          request.body.oldPhotoId = result.photo;
          next();
        });
      }
    });
  },

  uploadPhoto: function (request, response, next) {

    let input = request.body;

    if (request.file) {
      let photosModel = new PhotosModel;
      photosModel.originalName = request.file.originalname;
      photosModel.fileName = request.file.filename;
      photosModel.thumbnail = "thumbnail_" + request.file.filename;
      photosModel.thumbnailPath = request.file.destination + "/" + "thumbnail_" + request.file.filename;
      photosModel.destination = request.file.destination;
      photosModel.path = request.file.path;
      photosModel.size = request.file.size;
      photosModel.save((err, photo) => {
        if (err) responseHandler.sendSuccess(response, err, err.name);

        fs.copyFile(photo.path, photo.thumbnailPath, (err) => {
          sharp(photo.path).resize(240,371).toBuffer(function(err, buffer) {
            if (err) responseHandler.sendInternalServerError(response, err, err.name);

            fs.writeFile(photo.thumbnailPath, buffer, function(e) {
              ServicePhotoModel.findOne({_id: input.servicePhotoId}, function (err, servicePhotoModel) {
                if (err) responseHandler.sendInternalServerError(response, err, err.name);

                servicePhotoModel.photo = photo.id;
                servicePhotoModel.save((err, result) => {
                  if (err) responseHandler.sendSuccess(response, err, err.name);

                  next();
                });
              });
            });
          });
        });
      });
    } else {
      next();
    }
  },

  unlinkPhoto: function (request, response, next) {

    let input = request.body;

    if (request.file) {
      PhotosModel.findOne({'_id': input.oldPhotoId}, function (err, photoModel) {
        if (err) responseHandler.sendInternalServerError(response, err, err.name);
        if (!photoModel) {
          next();
        } else {
          UserProfileModel.find({'summaryHistory': { $in: [input.oldPhotoId]}}, function (err, checkPhoto) {
            if (err) {
              responseHandler.sendInternalServerError(response, err, err.name);
            } else if (checkPhoto && checkPhoto.length > 0) {
              next();
            } else {
              PhotoHelper.deleteFiles([photoModel.path, photoModel.thumbnailPath], function(err) {
                if (err) {
                  responseHandler.sendInternalServerError(response, err, err.name);
                } else {
                  photoModel.remove();
                  next();
                }
              });
            }
          });
        }
      });
    } else {
      next();
    }
  },

  servicePhotoFinalInfo: function(request, response) {

    let input = request.body;

    ServicePhotoModel.findOne({"_id": input.servicePhotoId}).deepPopulate('photo').exec(function (err, result) {
        if (err) responseHandler.sendInternalServerError(response, err, err.name);

        responseHandler.sendSuccess(response, result, "");
    });
  },

  deleteServicePhoto: function (request, response, next) {

    let params = request.params;

    ServicePhotoModel.findOne({_id: params.servicePhotoId, 'isDeleted': varConst.NOT_DELETED}, function (err, servicePhotoModel) {
      if (err) {
        responseHandler.sendInternalServerError(response, err, err.name);
      } else if (!servicePhotoModel) {
        responseHandler.sendSuccess(response, "", "Service photo not found.");
      } else {
        servicePhotoModel.isDeleted = varConst.DELETED;
        servicePhotoModel.save(function (error, result) {
          if (err) {
            responseHandler.sendSuccess(response, err, err.name);
          } else {
            responseHandler.sendSuccess(response, "Record Deleted successfully");
          }
        });
      }
    });
  },

  allServicePhoto: function (request, response) {

    let input = request.body;
    let params = request.query;

    let isPagination = (params.isPagination == true) ? true : false;
    let pageNo = Helper.isNotEmpty(params.pageNo) ? params.pageNo : 1;
    let pageSize = Helper.isNotEmpty(params.pageSize) ? parseInt(params.pageSize) : varConst.PAGE_SIZE;
    let query = {'isDeleted': varConst.NOT_DELETED};

    async.parallel({
        count: function (callback) {
            ServicePhotoModel.countDocuments(query).exec(function (err, result) {
                if (err) responseHandler.sendInternalServerError(response, err, err.name);

                callback(err, result);
            });
        },
        list: function (callback) {
            if (isPagination) {
                ServicePhotoModel.find(query).deepPopulate('photo').limit(pageSize).skip((pageNo - 1) * pageSize).sort('-createdAt').exec(function (err, result) {
                    if (err) responseHandler.sendInternalServerError(response, err, err.name);

                    callback(err, result);
                });
            } else {
                ServicePhotoModel.find(query).deepPopulate('photo').sort('-createdAt').exec(function (err, result) {
                    if (err) responseHandler.sendInternalServerError(response, err, err.name);

                    callback(err, result);
                });
            }
        },
    }, function (err, results) {
        if (err) responseHandler.sendInternalServerError(response, err, err.name);

        let json = {
            "total": results.count,
            "list": results.list,
        };
        responseHandler.sendSuccess(response, json);
    });
  },
};

module.exports = ServicePhotoCtrl;
