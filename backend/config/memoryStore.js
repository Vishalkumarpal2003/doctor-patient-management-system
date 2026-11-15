const bcrypt = require('bcryptjs');

// Simple unique ID generator mimicking ObjectId
let idCounter = 1;
const generateId = () => {
  const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
  const counter = (idCounter++).toString(16).padStart(16, '0');
  return timestamp + counter;
};

// Check if value matches mongo-like condition
const matchesCondition = (recordVal, condition) => {
  if (condition === undefined || condition === null) {
    return recordVal === condition;
  }

  if (typeof condition === 'object' && condition !== null) {
    if (condition instanceof RegExp) {
      return condition.test(String(recordVal || ''));
    }

    if (condition.$in && Array.isArray(condition.$in)) {
      const stringifiedIn = condition.$in.map(String);
      return stringifiedIn.includes(String(recordVal));
    }

    if (condition.$regex) {
      const reg = new RegExp(condition.$regex, condition.$options || '');
      return reg.test(String(recordVal || ''));
    }

    let matches = true;
    if (condition.$gte !== undefined) {
      matches = matches && Number(recordVal) >= Number(condition.$gte);
    }
    if (condition.$lte !== undefined) {
      matches = matches && Number(recordVal) <= Number(condition.$lte);
    }
    if (condition.$gt !== undefined) {
      matches = matches && Number(recordVal) > Number(condition.$gt);
    }
    if (condition.$lt !== undefined) {
      matches = matches && Number(recordVal) < Number(condition.$lt);
    }
    if (condition.$ne !== undefined) {
      matches = matches && String(recordVal) !== String(condition.$ne);
    }
    return matches;
  }

  return String(recordVal) === String(condition);
};

const matchesFilter = (record, filter = {}) => {
  if (!filter || Object.keys(filter).length === 0) return true;

  if (filter.$or && Array.isArray(filter.$or)) {
    const orMatches = filter.$or.some((subFilter) => matchesFilter(record, subFilter));
    if (!orMatches) return false;
  }

  for (const key of Object.keys(filter)) {
    if (key === '$or') continue;
    const cond = filter[key];
    const val = record[key];

    if (!matchesCondition(val, cond)) {
      return false;
    }
  }

  return true;
};

class MemoryCollection {
  constructor(name, isUser = false) {
    this.name = name;
    this.isUser = isUser;
    this.records = [];
  }

  _wrapDocument(doc) {
    if (!doc) return null;
    const self = this;

    const wrapped = { ...doc };
    wrapped._id = doc._id;
    wrapped.toObject = function () {
      const obj = { ...this };
      delete obj.toObject;
      delete obj.save;
      delete obj.matchPassword;
      return obj;
    };

    if (self.isUser) {
      wrapped.matchPassword = async function (enteredPassword) {
        return await bcrypt.compare(enteredPassword, this.password);
      };
    }

    wrapped.save = async function () {
      const index = self.records.findIndex((r) => String(r._id) === String(this._id));
      if (self.isUser && this.password && !this.password.startsWith('$2')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
      }
      this.updatedAt = new Date();
      if (index !== -1) {
        self.records[index] = { ...this };
      } else {
        self.records.push({ ...this });
      }
      return this;
    };

    return wrapped;
  }

  async create(data) {
    const now = new Date();
    const doc = {
      _id: generateId(),
      isActive: data.isActive !== undefined ? data.isActive : true,
      ...data,
      createdAt: now,
      updatedAt: now,
    };

    if (this.isUser && doc.password) {
      const salt = await bcrypt.genSalt(10);
      doc.password = await bcrypt.hash(doc.password, salt);
    }

    this.records.push(doc);
    return this._wrapDocument(doc);
  }

  async countDocuments(filter = {}) {
    return this.records.filter((r) => matchesFilter(r, filter)).length;
  }

  async distinct(field, filter = {}) {
    const matched = this.records.filter((r) => matchesFilter(r, filter));
    const set = new Set(matched.map((r) => String(r[field])));
    return Array.from(set);
  }

  async deleteMany(filter = {}) {
    if (!filter || Object.keys(filter).length === 0) {
      this.records = [];
      return { deletedCount: this.records.length };
    }
    const before = this.records.length;
    this.records = this.records.filter((r) => !matchesFilter(r, filter));
    return { deletedCount: before - this.records.length };
  }

  find(filter = {}) {
    const matched = this.records.filter((r) => matchesFilter(r, filter));
    return new MemoryQuery(matched.map((r) => this._wrapDocument(r)), this);
  }

  findOne(filter = {}) {
    const doc = this.records.find((r) => matchesFilter(r, filter));
    return new MemoryQuery(doc ? this._wrapDocument(doc) : null, this, true);
  }

  findById(id) {
    return this.findOne({ _id: String(id) });
  }
}

class MemoryQuery {
  constructor(result, collection, isSingle = false) {
    this._result = result;
    this._collection = collection;
    this._isSingle = isSingle;
  }

  select(fields) {
    if (!fields) return this;

    // In memory store, +field means include hidden fields; since all fields are already present, do nothing
    if (fields.includes('+')) {
      return this;
    }

    const isExclusion = fields.startsWith('-');
    const fieldNames = fields.replace(/[-+]/g, '').split(' ').filter(Boolean);

    const applySelect = (item) => {
      if (!item) return item;
      const copy = { ...item };
      if (isExclusion) {
        fieldNames.forEach((f) => delete copy[f]);
      } else {
        const allowed = { _id: copy._id };
        fieldNames.forEach((f) => {
          if (copy[f] !== undefined) allowed[f] = copy[f];
        });
        return allowed;
      }
      return copy;
    };

    if (this._isSingle) {
      this._result = applySelect(this._result);
    } else if (Array.isArray(this._result)) {
      this._result = this._result.map(applySelect);
    }
    return this;
  }

  sort(sortObj) {
    if (this._isSingle || !Array.isArray(this._result) || !sortObj) return this;
    const [field, direction] = Object.entries(sortObj)[0] || [];
    if (field) {
      this._result.sort((a, b) => {
        const valA = a[field] || '';
        const valB = b[field] || '';
        if (direction === -1) return valA < valB ? 1 : valA > valB ? -1 : 0;
        return valA > valB ? 1 : valA < valB ? -1 : 0;
      });
    }
    return this;
  }

  limit(num) {
    if (Array.isArray(this._result) && typeof num === 'number') {
      this._result = this._result.slice(0, num);
    }
    return this;
  }

  populate(field, selectFields) {
    const memoryStore = getMemoryStore();

    const doPopulate = (doc) => {
      if (!doc || !doc[field]) return doc;
      const foreignId = String(doc[field]._id || doc[field]);

      let foreignDoc = null;
      if (field === 'user' || field === 'patient' || field === 'doctor') {
        foreignDoc = memoryStore.User.records.find((u) => String(u._id) === foreignId);
      } else if (field === 'appointment') {
        foreignDoc = memoryStore.Appointment.records.find((a) => String(a._id) === foreignId);
      }

      if (foreignDoc) {
        let pop = { ...foreignDoc };
        delete pop.password;
        if (selectFields) {
          const allowedFields = selectFields.split(' ').filter(Boolean);
          const filtered = { _id: pop._id };
          allowedFields.forEach((f) => {
            if (pop[f] !== undefined) filtered[f] = pop[f];
          });
          pop = filtered;
        }
        doc[field] = pop;
      }
      return doc;
    };

    if (this._isSingle) {
      this._result = doPopulate(this._result);
    } else if (Array.isArray(this._result)) {
      this._result = this._result.map(doPopulate);
    }

    return this;
  }

  // Promise resolution
  then(resolve, reject) {
    return Promise.resolve(this._result).then(resolve, reject);
  }

  catch(reject) {
    return Promise.resolve(this._result).catch(reject);
  }
}

let storeInstance = null;

const getMemoryStore = () => {
  if (!storeInstance) {
    storeInstance = {
      User: new MemoryCollection('users', true),
      DoctorProfile: new MemoryCollection('doctorprofiles'),
      PatientProfile: new MemoryCollection('patientprofiles'),
      Appointment: new MemoryCollection('appointments'),
      Prescription: new MemoryCollection('prescriptions'),
    };
  }
  return storeInstance;
};

module.exports = {
  getMemoryStore,
  matchesFilter,
};
