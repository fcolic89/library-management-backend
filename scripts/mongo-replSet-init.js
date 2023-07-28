const config = {
    "_id": "replica-set-name",
    "version": 1,
    "members": [
        {
            "_id": 0,
            "host": "mongo:27017",
            "priority": 1
        }
    ]
};
rs.initiate(config, { force: true });
rs.status();
