// @flow

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

export function findByIds(
  collection: any,
  ids: Array<any> = [],
  authQuery?: any = {}
): any {
  const baseQuery = { _id: { $in: ids } };
  const finalQuery = { ...baseQuery, ...authQuery };
  return collection
    .find(finalQuery)
    .toArray()
    .then(docs => {
      const idMap = {};
      docs.forEach(d => {
        idMap[d._id] = d;
      });
      return ids.map(id => idMap[id]);
    });
}
