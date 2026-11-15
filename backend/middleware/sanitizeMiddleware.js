/**
 * NoSQL Injection Protection Middleware
 * Recursively inspects and sanitizes request bodies, query strings, and params
 * to prevent MongoDB operator injection (such as $gt, $ne, $where).
 */

const cleanObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(cleanObject);
  }

  const cleaned = {};
  for (const [key, val] of Object.entries(obj)) {
    // Strip leading dollar signs or dots which can be used for Mongo operators
    if (key.startsWith('$') || key.includes('.')) {
      continue;
    }
    cleaned[key] = typeof val === 'object' && val !== null ? cleanObject(val) : val;
  }
  return cleaned;
};

const sanitizeInput = (req, res, next) => {
  if (req.body) {
    req.body = cleanObject(req.body);
  }
  if (req.query) {
    req.query = cleanObject(req.query);
  }
  if (req.params) {
    req.params = cleanObject(req.params);
  }
  next();
};

module.exports = sanitizeInput;
