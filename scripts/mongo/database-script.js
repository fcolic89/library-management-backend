/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-console */
/* eslint-disable no-await-in-loop */
const { faker } = require('@faker-js/faker');
const mongoose = require('mongoose');
const brycpt = require('bcrypt');
const _ = require('lodash');
const { MONGODB_URI } = require('../../config/environment');
const {
  Book,
  Checkout,
  checkoutStatus,
  User,
  userRoles,
  Genre,
  Comment,
} = require('../../database/models');

const USER_REG_NUMBER = 50;
const USER_LIB_NUMBER = 5;
const BOOK_NUMBER = 31;
const CHECKOUT_NUMBER = 10;

const generateData = async () => {
  const promises = [];
  const password = brycpt.hashSync('password', 1);

  // Generate regular users
  const userPromises = [];
  for (let i = 0; i < USER_REG_NUMBER; i++) {
    userPromises.push(new User({
      username: faker.internet.userName(),
      email: `reg${i}@email.com`,
      password,
      firstname: faker.person.firstName(),
      lastname: faker.person.lastName(),
      role: userRoles.regular,
    }).save());
  }
  // Generate librarian users
  for (let i = 0; i < USER_LIB_NUMBER; i++) {
    userPromises.push(new User({
      username: faker.internet.userName(),
      email: `lib${i}@email.com`,
      password,
      firstname: faker.person.firstName(),
      lastname: faker.person.lastName(),
      role: userRoles.librarian,
    }).save());
  }
  // Generate admin user
  userPromises.push(new User({
    username: faker.internet.userName(),
    email: 'admin@email.com',
    password,
    firstname: faker.person.firstName(),
    lastname: faker.person.lastName(),
    role: userRoles.admin,
    canComment: false,
    takeBook: false,
  }).save());

  // Generating genres
  const genreList = [
    'Classic',
    'Comedy',
    'History',
    'Fiction',
    'Fantasy',
    'Adventure',
    'Crime',
    'Mystery',
  ];

  genreList.forEach((genre) => {
    promises.push(new Genre({
      name: genre,
    }).save());
  });

  // Generating books
  const bookPromises = [];
  for (let i = 0; i < BOOK_NUMBER; i++) {
    bookPromises.push(new Book({
      title: faker.lorem.words({ max: 4, min: 1 }),
      author: faker.person.fullName(),
      pageCount: faker.number.int({ max: 600, min: 55 }),
      dateOfPublishing: faker.date.past(),
      quantityMax: 15,
      quantityCurrent: 15,
      imageUrl: faker.image.url(),
      description: faker.lorem.paragraph(),
      genre: _.sampleSize(genreList, 3),
    }).save());
  }

  bookPromises.push(new Book({
    title: 'Crime and Punishment',
    author: 'Fyodor Dostoyevvsky',
    pageCount: 671,
    dateOfPublishing: new Date('1886-01-01'),
    quantityMax: 15,
    quantityCurrent: 15,
    imageUrl: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1382846449i/7144.jpg',
    description: 'Raskolnikov, a destitute and desperate former student, wanders through the slums of St Petersburg and commits a random murder without remorse or regret. He imagines himself to be a great man, a Napoleon: acting for a higher purpose beyond conventional moral law. But as he embarks on a dangerous game of cat and mouse with a suspicious police investigator, Raskolnikov is pursued by the growing voice of his conscience and finds the noose of his own guilt tightening around his neck. Only Sonya, a downtrodden sex worker, can offer the chance of redemption.',
    genre: ['Fiction', 'Classic', 'Crime'],
  }).save());

  const [users, books] = await Promise.all([Promise.all(userPromises), Promise.all(bookPromises)]);

  // Generating comments
  books.forEach((book) => {
    const commenters = _.sampleSize(users, 10);
    for (let i = 0; i < 10; i++) {
      if (i < 5) {
        promises.push(new Comment({
          bookId: book._id,
          author: commenters[i]._id,
          rating: 3,
          edited: false,
          comment: faker.lorem.sentence(),
        }).save());
      } else if (i < 7) {
        promises.push(new Comment({
          bookId: book._id,
          author: commenters[i]._id,
          rating: 4,
          edited: false,
          comment: faker.lorem.sentence(),
        }).save());
      } else if (i < 9) {
        promises.push(new Comment({
          bookId: book._id,
          author: commenters[i]._id,
          rating: 5,
          edited: false,
          comment: faker.lorem.sentence(),
        }).save());
      }
    }
  });

  // Generating checkouts
  books.forEach((book) => {
    const checkouters = _.sampleSize(users, CHECKOUT_NUMBER);
    for (let i = 0; i < CHECKOUT_NUMBER; i++) {
      promises.push(new Checkout({
        user: checkouters[i]._id,
        book: book._id,
        find: 0,
        status: checkoutStatus.returned,
      }).save());
    }
  });

  await Promise.all(promises);
};

const args = process.argv.slice(2);
// Main function
(async () => {
  await mongoose.connect(MONGODB_URI, { useUnifiedTopology: true });

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--gen') {
      await generateData();
    } else if (args[i] === '--drop') {
      await mongoose.connection.dropDatabase();
    } else {
      console.log(`Invalid value. There is no option ${args[i]}`);
    }
  }

  await mongoose.disconnect();
})();

mongoose.connection.on('error', (err) => {
  console.log(`Mongoose default connection error: ${err}`);
});
