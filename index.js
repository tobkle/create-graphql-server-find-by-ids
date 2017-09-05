"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.findByIds = findByIds;


/** 
 * Finds records by ids (cached with dataloader)
 * returns the record, checks authorization if set
 * enhancement of tmeasday'findByIds
 * @public
 * @param {object} collection - data model type collection
 * @param {array} ids - one or a list of document ids
 * @param {object} authQuery - authorization query to be used to access data
 * @return {array} documents - the found documents with these ids
 */

function findByIds(collection) {
  var ids = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  var authQuery = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var baseQuery = { _id: { $in: ids } };
  var finalQuery = _extends({}, baseQuery, authQuery);
  return collection.find(finalQuery).toArray().then(function (docs) {
    var idMap = {};
    docs.forEach(function (d) {
      idMap[d._id] = d;
    });
    return ids.map(function (id) {
      return idMap[id];
    });
  });
}