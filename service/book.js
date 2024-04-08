/* eslint-disable no-param-reassign */
const mongoose = require('mongoose');
const { Book, Comment, Genre } = require('../database/models');
const dbConnection = require('../config/db');
const { isValidId } = require('../lib/misc');
const error = require('../middleware/errorHandling/errorConstants');

const saveBook = async (req, res) => {
  const {
    title, author, dateOfPublishing, pageCount, quantityMax, quantityCurrent, imageUrl, description, genre,
  } = req.body;

  if (isNaN(new Date(dateOfPublishing))) {
    throw new Error(error.INVALID_VALUE);
  }

  await new Book({
    title,
    author,
    dateOfPublishing,
    pageCount,
    quantityMax,
    quantityCurrent,
    imageUrl,
    description,
    genre,
  }).save();

  return res.json({ message: 'New book saved!' });
};

const deleteBook = async (req, res, next) => {
  const { id: bookId } = req.params;

  if (!isValidId(bookId)) {
    throw new Error(error.INVALID_VALUE);
  }

  const book = await Book.findOne({ _id: bookId }).lean();
  if (!book) {
    throw new Error(error.NOT_FOUND);
  } else if (book.quantityMax !== book.quantityCurrent) {
    throw new Error(error.COPIES_CHECKED_OUT);
  }
  const session = await dbConnection.startSession();
  try {
    session.startTransaction();

    await Promise.all([
      Book.deleteOne({ _id: bookId }, { session }),
      Comment.deleteMany({ bookId }, { session }),
    ]);

    await session.commitTransaction();

    return res.json({ message: 'Book deleted!' });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};

const updateBook = async (req, res) => {
  const {
    _id: bookId, title, description, pageCount, author, dateOfPublishing, quantityMax, imageUrl, genre,
  } = req.body;

  if (!isValidId(bookId)) {
    throw new Error(error.INVALID_VALUE);
  }

  if (isNaN(new Date(dateOfPublishing))) {
    throw new Error(error.INVALID_VALUE);
  }

  const book = await Book.findOne({ _id: bookId }).lean();
  if (!book) {
    throw new Error(error.NOT_FOUND);
  }
  let { quantityCurrent } = book;
  if (quantityMax > book.quantityMax) {
    quantityCurrent += quantityMax - book.quantityMax;
  } else if (quantityMax < book.quantityMax) {
    quantityCurrent -= book.quantityMax - quantityMax;
    if (quantityCurrent < 0) {
      quantityCurrent = 0;
    }
  }

  await Book.updateOne({ _id: bookId }, {
    title, description, pageCount, author, dateOfPublishing, quantityMax, quantityCurrent, imageUrl, genre,
  }).lean();

  if (!book) {
    throw new Error(error.NOT_FOUND);
  }

  return res.json({ message: 'Book updated!' });
};

const findBookById = async (req, res) => {
  const { id: bookId } = req.params;

  if (!isValidId(bookId)) {
    throw new Error(error.INVALID_VALUE);
  }

  const [book, rating] = await Promise.all([
    Book.findOne({ _id: bookId }).lean(),
    Comment.aggregate([
      { $match: { bookId: new mongoose.Types.ObjectId(bookId) } },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          ratingSum: { $sum: '$rating' },
        },
      },
    ]),
  ]);

  if (!book) {
    throw new Error(error.NOT_FOUND);
  }
  if (rating[0] && rating[0].count !== 0) {
    book.rating = Number((rating[0].ratingSum / rating[0].count).toFixed(2));
  } else {
    book.rating = 0;
  }

  return res.send(book);
};

const filterBooks = async (req, res) => {
  const {
    title, author, genre, size = 10, page = 1,
  } = req.query;

  const limit = Number(size) + 1;
  const skip = (Number(page) - 1) * Number(size);

  if (Number.isNaN(limit) || Number.isNaN(skip)) {
    throw new Error(error.INVALID_VALUE);
  }
  const bookFilter = {
    title: new RegExp(title, 'i'),
    author: new RegExp(author, 'i'),
  };
  if (genre) {
    bookFilter.genre = { $in: genre.split(',') };
  }

  const books = await Book.find(bookFilter)
    .limit(limit)
    .skip(skip)
    .sort({ title: 1 })
    .lean();

  let hasNext = false;
  if (books.length === limit) {
    hasNext = true;
    books.splice(books.length - 1, 1);
  }

  const bookIndexMap = {};
  books.forEach((book, index) => {
    bookIndexMap[book._id] = index;
    book.rating = 0;
  });

  const bookRatings = await Comment.aggregate([
    {
      $match: {
        bookId: { $in: Object.keys(bookIndexMap).map((id) => new mongoose.Types.ObjectId(id)) },
      },
    },
    {
      $group: {
        _id: '$bookId',
        count: { $sum: 1 },
        ratingSum: { $sum: '$rating' },
      },
    },
  ]);

  bookRatings.forEach((bookRating) => {
    books[bookIndexMap[bookRating._id]].rating = Number((bookRating.ratingSum / bookRating.count).toFixed(2));
  });

  return res.send({
    hasNext,
    books,
  });
};

const addComment = async (req, res) => {
  const { bookId } = req.params;
  const { _id: userId, canComment } = req.user;
  const { comment, rating } = req.body;

  if (!canComment) {
    throw new Error(error.CANT_COMMENT);
  }

  if (!isValidId(bookId)) {
    throw new Error(error.INVALID_VALUE);
  }

  const book = await Book.findOne({ _id: bookId });
  if (!book) {
    throw new Error(error.NOT_FOUND);
  }

  new Comment({
    bookId,
    author: userId,
    comment,
    rating,
  }).save();

  return res.json({ messsage: 'Comment added' });
};

const editComment = async (req, res) => {
  const { commentId } = req.params;
  const { comment: commentText } = req.body;

  const comment = await Book.findOneAndUpdate({ _id: commentId }, { comment: commentText, edited: true }).lean();
  if (!comment) {
    throw new Error(error.NOT_FOUND);
  }

  return res.json({ message: 'Commend edited!' });
};

const findComments = async (req, res) => {
  const { page = 1, size = 10 } = req.query;
  const { bookId } = req.params;

  if (!isValidId(bookId)) {
    throw new Error(error.INVALID_VALUE);
  }

  const limit = Number(size) + 1;
  const skip = (Number(page) - 1) * Number(size);

  if (Number.isNaN(limit) || Number.isNaN(skip)) {
    throw new Error(error.INVALID_VALUE);
  }

  const comments = await Comment.find({ bookId })
    .limit(limit)
    .skip(skip)
    .populate('author', 'username')
    .lean();

  let hasNext = false;
  if (comments.length === limit) {
    hasNext = true;
    comments.splice(comments.length - 1, 1);
  }

  return res.send({
    hasNext,
    comments,
  });
};

const getGenre = async (req, res) => {
  const { page = 1, size = 10 } = req.query;

  const limit = Number(size) + 1;
  const skip = (Number(page) - 1) * Number(size);

  if (Number.isNaN(limit) || Number.isNaN(skip)) {
    throw new Error(error.INVALID_VALUE);
  }

  const genres = await Genre.find()
    .limit(limit)
    .skip(skip);

  let hasNext = false;
  if (genres.length === limit) {
    hasNext = true;
    genres.splice(genres.length - 1, 1);
  }

  return res.send({
    hasNext,
    genres,
  });
};

const addGenre = async (req, res) => {
  const { name } = req.body;

  const genre = new Genre({
    name,
  });

  await genre.save();
  return res.json({ message: 'Genre added!' });
};

const deleteGenre = async (req, res, next) => {
  const { name } = req.params;
  const session = await dbConnection.startSession();
  try {
    const promises = [];
    session.startTransaction();

    promises.push(Genre.deleteOne({ name }, { session }));

    const books = await Book.find({ genre: { $in: [req.params.name] } });
    books.forEach((book) => {
      book.genre.splice(book.genre.indexOf(name), 1);
      promises.push(book.save({ session }));
    });

    const [deleteResult] = await Promise.all(promises);
    if (deleteResult.deletedCount === 0) {
      throw new Error(error.NOT_FOUND);
    }

    await session.commitTransaction();

    return res.json({ message: 'Genre deleted!' });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};

module.exports = {
  saveBook,
  deleteBook,
  updateBook,
  findBookById,
  filterBooks,
  addComment,
  editComment,
  findComments,
  getGenre,
  addGenre,
  deleteGenre,
};
