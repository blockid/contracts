const { getNameHash } = require('../../utils/ens');

module.exports = {
  ensRoot: {
    name: 'blockid.test',
    nameHash: getNameHash('blockid.test'),
  },
};
