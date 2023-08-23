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
    username: "regularUser",
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
db.genres.insertOne({
    name: "Fantasy"
});
db.genres.insertOne({
    name: "Adventure"
});
db.genres.insertOne({
    name: "Mystery"
});

// db.books.insertOne({
//     title: "",
//     author: "",
//     dateOfPublishing: "",
//     pageCount: ,
//     quantityMax: ,
//     quantityCurrent: ,
//     imageUrl: "",
//     description: "",
//     genre: [""],
// });

db.books.insertOne({
    title: "Life of Pi",
    author: "Yann Martel",
    dateOfPublishing: "2011-9-11",
    pageCount: 460,
    quantityMax: 20,
    quantityCurrent: 20,
    imageUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1631251689i/4214.jpg",
    description: "Life of Pi is a fantasy adventure novel by Yann Martel published in 2001. The protagonist, Piscine Molitor \"Pi\" Patel, a Tamil boy from Pondicherry, explores issues of spirituality and practicality from an early age. He survives 227 days after a shipwreck while stranded on a boat in the Pacific Ocean with a Bengal tiger named Richard Parker.",
    genre: ["Fiction", "Adventure"],
});
db.books.insertOne({
    title: "The Curious Incident of the Dog in the Night-Time",
    author: "Mark Haddon",
    dateOfPublishing: "2003-7-31",
    pageCount: 226,
    quantityMax: 15,
    quantityCurrent: 15,
    imageUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1479863624i/1618.jpg",
    description: "Christopher John Francis Boone knows all the countries of the world and their capitals and every prime number up to 7,057. He relates well to animals but has no understanding of human emotions. He cannot stand to be touched. And he detests the color yellow. This improbable story of Christopher’s quest to investigate the suspicious death of a neighborhood dog makes for one of the most captivating, unusual, and widely heralded novels in recent years.",
    genre: ["Fiction", "Mystery"],
});
db.books.insertOne({
    title: "The Girl with the Dragon Tattoo",
    author: "Stieg Larsson, Reg Keeland",
    dateOfPublishing: "2005-8-1",
    pageCount: 480,
    quantityMax: 50,
    quantityCurrent: 50,
    imageUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1684638853i/2429135.jpg",
    description: "Harriet Vanger, a scion of one of Sweden’s wealthiest families disappeared over forty years ago. All these years later, her aged uncle continues to seek the truth. He hires Mikael Blomkvist, a crusading journalist recently trapped by a libel conviction, to investigate. He is aided by the pierced and tattooed punk prodigy Lisbeth Salander. Together they tap into a vein of unfathomable iniquity and astonishing corruption.",
    genre: ["Fiction", "Mystery"],
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
