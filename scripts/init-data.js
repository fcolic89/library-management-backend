db.users.insertOne({
    username: "Admin",
    password: "$2b$10$kgfanuzauAUAhhCYL1wOe.q/1uA9G/9Yls1p/V8gE3wNKRIKi1ysm",
    email: "admin@email.com",
    firstname: "Minad",
    lastname: "Adminovic",
    role: "ADMIN",
    canComment: false,
    takeBook: false
});

db.users.insertOne({
    username: "libraria4life",
    password: "$2b$10$kgfanuzauAUAhhCYL1wOe.q/1uA9G/9Yls1p/V8gE3wNKRIKi1ysm",
    email: "lib@email.com",
    firstname: "Lib",
    lastname: "Raryan",
    role: "LIBRARIAN",
    canComment: false,
    takeBook: false
});

db.users.insertOne({
    username: "regualrUser",
    password: "$2b$10$kgfanuzauAUAhhCYL1wOe.q/1uA9G/9Yls1p/V8gE3wNKRIKi1ysm",
    email: "reg@email.com",
    firstname: "Reginald",
    lastname: "Userland",
    role: "REGULAR",
    canComment: true,
    takeBook: true
});
db.users.insertOne({
    username: "reg1",
    password: "$2b$10$kgfanuzauAUAhhCYL1wOe.q/1uA9G/9Yls1p/V8gE3wNKRIKi1ysm",
    email: "reg1@email.com",
    firstname: "Reginald1",
    lastname: "Userland1",
    role: "REGULAR",
    canComment: true,
    takeBook: true
});
db.users.insertOne({
    username: "regualrUser2",
    password: "$2b$10$kgfanuzauAUAhhCYL1wOe.q/1uA9G/9Yls1p/V8gE3wNKRIKi1ysm",
    email: "reg2@email.com",
    firstname: "Reginald2",
    lastname: "Userland2",
    role: "REGULAR",
    canComment: true,
    takeBook: true
});
db.users.insertOne({
    username: "regualrUser3",
    password: "$2b$10$kgfanuzauAUAhhCYL1wOe.q/1uA9G/9Yls1p/V8gE3wNKRIKi1ysm",
    email: "reg3@email.com",
    firstname: "Reginald3",
    lastname: "Userland3",
    role: "REGULAR",
    canComment: true,
    takeBook: true
});
db.users.insertOne({
    username: "regualrUser4",
    password: "$2b$10$kgfanuzauAUAhhCYL1wOe.q/1uA9G/9Yls1p/V8gE3wNKRIKi1ysm",
    email: "reg4@email.com",
    firstname: "Reginald4",
    lastname: "Userland4",
    role: "REGULAR",
    canComment: true,
    takeBook: true
});
db.users.insertOne({
    username: "regualrUser5",
    password: "$2b$10$kgfanuzauAUAhhCYL1wOe.q/1uA9G/9Yls1p/V8gE3wNKRIKi1ysm",
    email: "reg5@email.com",
    firstname: "Reginald5",
    lastname: "Userland5",
    role: "REGULAR",
    canComment: true,
    takeBook: true
});
db.users.insertOne({
    username: "regualrUser6",
    password: "$2b$10$kgfanuzauAUAhhCYL1wOe.q/1uA9G/9Yls1p/V8gE3wNKRIKi1ysm",
    email: "reg6@email.com",
    firstname: "Reginald6",
    lastname: "Userland6",
    role: "REGULAR",
    canComment: true,
    takeBook: true
});
db.users.insertOne({
    username: "lib2",
    password: "$2b$10$kgfanuzauAUAhhCYL1wOe.q/1uA9G/9Yls1p/V8gE3wNKRIKi1ysm",
    email: "lib2@email.com",
    firstname: "Lib2",
    lastname: "Raryan2",
    role: "LIBRARIAN",
    canComment: false,
    takeBook: false
});
db.users.insertOne({
    username: "lib3",
    password: "$2b$10$kgfanuzauAUAhhCYL1wOe.q/1uA9G/9Yls1p/V8gE3wNKRIKi1ysm",
    email: "lib3@email.com",
    firstname: "Lib3",
    lastname: "Raryan3",
    role: "LIBRARIAN",
    canComment: false,
    takeBook: false
});

db.genres.insertOne({
    name: "Classic"
});
db.genres.insertOne({
    name: "Comedy"
});
db.genres.insertOne({
    name: "History"
});
db.genres.insertOne({
    name: "Fiction"
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
