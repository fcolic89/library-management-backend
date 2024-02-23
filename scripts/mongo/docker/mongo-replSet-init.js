const config = {
  _id: 'r0', // replica set name
  members: [
    { _id: 0, host: 'localhost:27017' },
  ],
};
rs.initiate(config, { force: true });
rs.status();
