const { getDBState } = require('../config/db');
const { getMemoryStore } = require('../config/memoryStore');

function createModelProxy(modelName, mongooseModel) {
  function ModelConstructor(data) {
    if (getDBState().isMemory) {
      const store = getMemoryStore()[modelName];
      const doc = { _id: require('crypto').randomBytes(12).toString('hex'), ...data };
      return store._wrapDocument(doc);
    }
    return new mongooseModel(data);
  }

  return new Proxy(ModelConstructor, {
    get(target, prop) {
      if (getDBState().isMemory) {
        const store = getMemoryStore()[modelName];
        if (typeof store[prop] === 'function') {
          return store[prop].bind(store);
        }
        return store[prop];
      }
      return mongooseModel[prop];
    },
    apply(target, thisArg, argumentsList) {
      if (getDBState().isMemory) {
        return ModelConstructor(...argumentsList);
      }
      return mongooseModel(...argumentsList);
    },
  });
}

module.exports = createModelProxy;
