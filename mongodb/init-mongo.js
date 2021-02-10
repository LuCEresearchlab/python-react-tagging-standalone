db.createUser({
    user: 'root',
    pwd: 'toor',
    roles: [
        {
            role: 'readWrite',
            db: 'tagging_db',
        },
    ],
});

db = new Mongo().getDB("tagging_db");

db.createCollection('misconceptions', { capped: false });
db.createCollection('tagged_data', { capped: false });