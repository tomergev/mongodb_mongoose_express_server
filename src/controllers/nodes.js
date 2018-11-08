const Node = require('../models/Node');

module.exports = {
  async get(req, res, next) {
    try {
      const {
        limit,
        useFake,
      } = req.query;

      const options = {
        ...(limit && { limit: parseInt(limit, 10) }),
      };

      const nodes = await Node[useFake ? 'fake' : 'find'](null, null, options);
      res.json({ nodes });
    } catch (err) {
      next(err);
    }
  },
};
