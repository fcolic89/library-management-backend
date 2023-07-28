db.users.insertOne({
    username: "Admin",
    password: "$2b$10$kgfanuzauAUAhhCYL1wOe.q/1uA9G/9Yls1p/V8gE3wNKRIKi1ysm",
    email: "admin@email.com",
    firstname: "Minad",
    lastname: "Adminovic",
    role: "ADMIN",
});

db.users.insertOne({
    username: "libraria4life",
    password: "$2b$10$kgfanuzauAUAhhCYL1wOe.q/1uA9G/9Yls1p/V8gE3wNKRIKi1ysm",
    email: "lib@email.com",
    firstname: "Lib",
    lastname: "Raryan",
    role: "LIBRARIAN"
});

db.users.insertOne({
    username: "regualrUser",
    password: "$2b$10$kgfanuzauAUAhhCYL1wOe.q/1uA9G/9Yls1p/V8gE3wNKRIKi1ysm",
    email: "reg@email.com",
    firstname: "Reginald",
    lastname: "Userland",
    role: "REGULAR"
});

db.createUser(
{
    user: "admin",
    pwd: "admin",
    roles: [
      { role: "readWrite", db: "library" }
    ]
});
db.grantRolesToUser('admin',[{ role: 'root', db: 'admin'}]);
