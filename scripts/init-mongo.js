db.createUser(
{
    user: "admin",
    pwd: "admin",
    roles: [
      { role: "readWrite", db: "library" }
    ]
});

db.users.insert({
    username: "Admin",
    password: "$2b$10$kgfanuzauAUAhhCYL1wOe.q/1uA9G/9Yls1p/V8gE3wNKRIKi1ysm",
    email: "admin@email.com",
    firstname: "Minad",
    lastname: "Adminovic",
    role: "ADMIN",
});

db.users.insert({
    username: "libraria4life",
    password: "$2b$10$kgfanuzauAUAhhCYL1wOe.q/1uA9G/9Yls1p/V8gE3wNKRIKi1ysm",
    email: "lib@email.com",
    firstname: "Lib",
    lastname: "Raryan",
    role: "LIBRARIAN"
});
