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
    password: "admin",
    email: "admin@email.com",
    firstname: "Minad",
    lastname: "Adminovic",
    isAdmin: true
})
