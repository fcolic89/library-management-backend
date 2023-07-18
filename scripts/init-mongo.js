db.createUser(
{
    user: "admin",
    pwd: "admin",
    roles: [
      { role: "readWrite", db: "library" }
    ]
})

db.users.insert({
    username: "Admin",
    password: "$2b$10$kgfanuzauAUAhhCYL1wOe.q/1uA9G/9Yls1p/V8gE3wNKRIKi1ysm",
    email: "admin@email.com",
    firstname: "Minad",
    lastname: "Adminovic",
    role: 'ADMIN',
    isDeleted: false
})
