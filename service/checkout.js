const {
  Book, Checkout, User, checkoutStatus,
} = require('../database/models');
const { isValidId } = require('../lib/misc');
const error = require('../middleware/errorHandling/errorConstants');

const dbConnection = require('../config/db');

const checkoutBook = async (req, res, next) => {
  const {
    bookId, userId, checkoutId,
  } = req.body;

  if (!isValidId(bookId) || !isValidId(userId) || !isValidId(checkoutId)) {
    throw new Error(error.INVALID_VALUE);
  }

  const promises = [
    Book.findOne({ _id: bookId }),
    Checkout.findOne({
      user: userId,
      book: bookId,
      $or: [
        { status: checkoutStatus.checkedout },
        { status: checkoutStatus.pending, _id: { $neq: checkoutId } },
      ],
    }).lean(),
    Checkout.findOne({
      user: userId,
      fine: { $gt: 0 },
      status: checkoutStatus.checkedout,
    }).lean(),
  ];
  const [book, existingCheckout, fined] = await Promise.all(promises);

  if (!book) {
    throw new Error(error.NOT_FOUND);
  } else if (!checkoutId && book.quantityCurrent === 0) {
    throw new Error(error.NO_COPIES_LEFT);
  }
  if (fined) {
    throw new Error(error.CHECKOUT_OVERDUE);
  }
  if (existingCheckout) {
    throw new Error(error.CHECKOUT_OR_RESERVED);
  }
  if (checkoutId) {
    const checkout = await Checkout.findOneAndUpdate(
      { _id: checkoutId, status: checkoutStatus.pending },
      { status: checkoutStatus.checkedout },
    )
      .lean();
    if (!checkout) {
      throw new Error(error.NOT_FOUND);
    }

    return res.json({ message: 'Book checked out!' });
  }
  const session = await dbConnection.startSession();
  try {
    const checkout = new Checkout({
      user: req.body.userId,
      book: req.body.bookId,
      status: checkoutStatus.checkedout,
    });

    book.quantityCurrent -= 1;

    session.startTransaction();

    await Promise.all([
      book.save({ session }),
      checkout.save({ session }),
    ]);

    await session.commitTransaction();

    return res.json({ message: 'Book checked out!' });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};

const returnBook = async (req, res, next) => {
  const { userId, bookId } = req.body;

  if (!isValidId(bookId) || !isValidId(userId)) {
    throw new Error(error.INVALID_VALUE);
  }

  const checkout = await Checkout.findOne({ user: userId, book: bookId, status: checkoutStatus.checkedout });
  if (!checkout) {
    throw new Error(error.NOT_FOUND);
  }
  const book = await Book.findOne({ _id: checkout.book });
  if (!book) {
    throw new Error(error.NOT_FOUND);
  }
  const session = await dbConnection.startSession();
  try {
    session.startTransaction();

    book.quantityCurrent += 1;
    checkout.status = checkoutStatus.returned;

    await Promise.all([
      book.save({ session }),
      checkout.save({ session }),
    ]);

    await session.commitTransaction();
    return res.json({ message: 'Book returned!' });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};

const reserveBook = async (req, res, next) => {
  const { bookId } = req.body;
  const promises = [];

  if (!isValidId(bookId)) {
    throw new Error(error.INVALID_VALUE);
  }

  promises.push(Book.findOne({ _id: bookId }));
  promises.push(Checkout.findOne({
    user: req.user.id,
    book: req.body.bookId,
    status: { $in: [checkoutStatus.pending, checkoutStatus.checkedout] },
  }).lean());
  promises.push(Checkout.findOne({
    user: req.user.id,
    fine: { $gt: 0 },
    status: checkoutStatus.checkedout,
  }).lean());
  const [book, existingCheckout, fined] = await Promise.all(promises);

  if (!book) {
    throw new Error(error.NotFound);
  } if (book.quantityCurrent === 0) {
    throw new Error(error.NO_COPIES_LEFT);
  }
  if (existingCheckout) {
    throw new Error(error.CHECKOUT_OR_RESERVED);
  }
  if (fined) {
    throw new Error(error.CHECKOUT_OVERDUE);
  }

  const session = await dbConnection.startSession();
  try {
    const checkout = new Checkout({
      user: req.user.id,
      book: req.body.bookId,
    });

    book.quantityCurrent -= 1;

    session.startTransaction();

    await Promise.all([
      book.save({ session }),
      checkout.save({ session }),
    ]);

    await session.commitTransaction();

    return res.json({ message: 'Book reserved!' });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};

const findCheckouts = async (req, res) => {
  const { status, page = 1, size = 10 } = req.query;

  const limit = Number(size) + 1;
  const skip = (Number(page) - 1) * Number(size);

  if (Number.isNaN(limit) || Number.isNaN(skip)) {
    throw new Error(error.INVALID_VALUE);
  }

  const checkoutFilter = {};
  if (status) {
    if (!Object.values(checkoutStatus).includes(status)) {
      throw new Error(error.INVALID_VALUE);
    } else {
      checkoutFilter.status = status;
    }
  }
  const checkouts = await Checkout.find(checkoutFilter)
    .limit(limit)
    .skip(skip)
    .populate('user', 'username')
    .populate('book', 'title')
    .select(['_id', 'user', 'book', 'fine', 'createdAt', 'status']);

  let hasNext = false;
  if (checkouts.length === limit) {
    hasNext = true;
    checkouts.splice(checkouts.length - 1, 1);
  }

  return res.json({
    checkouts,
    hasNext,
  });
};

const agregateFines = async (req, res) => {
  const { page = 1, size = 10 } = req.query;

  const limit = Number(size) + 1;
  const skip = (Number(page) - 1) * Number(size);

  if (Number.isNaN(limit) || Number.isNaN(skip)) {
    throw new Error(error.INVALID_VALUE);
  }

  const fines = await Checkout.aggregate()
    .limit(limit)
    .skip(skip)
    .lookup({
      from: 'users', localField: 'user', foreignField: '_id', as: 'userLookup',
    })
    .project({
      username: { $arrayElemAt: ['$userLookup.username', 0] },
      userId: { $arrayElemAt: ['$userLookup._id', 0] },
      fine: '$fine',
    })
    .group({ _id: '$username', finesTotal: { $sum: '$fine' } });

  let hasNext = false;
  if (fines.length === limit) {
    hasNext = true;
    fines.splice(fines.length - 1, 1);
  }

  return res.send({
    fines,
    hasNext,
  });
};

const userCheckouts = async (req, res) => {
  const {
    fined, status, page = 1, size = 10,
  } = req.query;
  const { username } = req.params;

  const limit = Number(size) + 1;
  const skip = (Number(page) - 1) * Number(size);

  if (Number.isNaN(limit) || Number.isNaN(skip)) {
    throw new Error(error.INVALID_VALUE);
  }

  const user = await User.findOne({ username }).lean();
  if (!user) {
    throw new Error(error.NOT_FOUND);
  }

  const checkoutFilter = {};
  checkoutFilter.user = user._id;

  if (status) {
    if (!Object.values(checkoutStatus).includes(status)) {
      throw new Error(error.INVALID_VALUE);
    } else {
      checkoutFilter.status = status;
    }
  }

  if (fined === 'true') {
    checkoutFilter.fined = { $gt: 0 };
  } else if (fined === 'false') {
    checkoutFilter.fined = { $eq: 0 };
  } else if (fined) {
    throw new Error(error.INVALID_VALUE);
  }

  const checkouts = await Checkout.find(checkoutFilter)
    .limit(limit)
    .skip(skip)
    .populate('user', 'username')
    .populate('book', 'title')
    .select(['_id', 'user', 'book', 'fine', 'createdAt', 'status'])
    .sort({ createdAt: 1 })
    .lean();

  let hasNext = false;
  if (checkouts.length === limit) {
    hasNext = true;
    checkouts.splice(checkouts.length - 1, 1);
  }

  return res.json({
    checkouts,
    hasNext,
  });
};

const bookCheckouts = async (req, res) => {
  const { status, page = 1, size = 10 } = req.query;
  const { bookId } = req.params;

  if (!isValidId(bookId)) {
    throw new Error(error.INVALID_VALUE);
  }

  const limit = Number(size) + 1;
  const skip = (Number(page) - 1) * Number(size);

  if (Number.isNaN(limit) || Number.isNaN(skip)) {
    throw new Error(error.INVALID_VALUE);
  }

  const book = await Book.findOne({ _id: bookId }).lean();
  if (!book) {
    throw new Error(error.NOT_FOUND);
  }

  const checkoutFilter = {};
  checkoutFilter.user = bookId._id;

  if (status) {
    if (!Object.values(checkoutStatus).includes(status)) {
      throw new Error(error.INVALID_VALUE);
    } else {
      checkoutFilter.status = status;
    }
  }

  const checkouts = await Checkout.find(checkoutFilter)
    .limit(limit)
    .skip(skip)
    .populate('user', 'username')
    .populate('book', 'title')
    .select(['_id', 'user', 'book', 'fine', 'createdAt', 'status'])
    .sort({ createdAt: 1 })
    .lean();

  let hasNext = false;
  if (checkouts.length === limit) {
    hasNext = true;
    checkouts.splice(checkouts.length - 1, 1);
  }

  return res.json({
    checkouts,
    hasNext,
  });
};

const myCheckouts = async (req, res) => {
  const {
    status, fined, page = 1, size = 10,
  } = req.query;
  const { username } = req.user;

  const limit = Number(size) + 1;
  const skip = (Number(page) - 1) * Number(size);

  if (Number.isNaN(limit) || Number.isNaN(skip)) {
    throw new Error(error.INVALID_VALUE);
  }

  const user = await User.findOne({ username }).lean();
  if (!user) {
    throw new Error(error.NOT_FOUND);
  }

  const checkoutFilter = {};
  checkoutFilter.user = user._id;

  if (status) {
    if (!Object.values(checkoutStatus).includes(status)) {
      throw new Error(error.INVALID_VALUE);
    } else {
      checkoutFilter.status = status;
    }
  }

  if (fined === 'true') {
    checkoutFilter.fined = { $gt: 0 };
  } else if (fined === 'false') {
    checkoutFilter.fined = { $eq: 0 };
  } else if (fined) {
    throw new Error(error.INVALID_VALUE);
  }

  const checkouts = await Checkout.find(checkoutFilter)
    .limit(limit)
    .skip(skip)
    .populate('user', 'username')
    .populate('book', 'title')
    .select(['_id', 'user', 'book', 'fine', 'createdAt', 'status'])
    .sort({ createdAt: 1 })
    .lean();

  let hasNext = false;
  if (checkouts.length === limit) {
    hasNext = true;
    checkouts.splice(checkouts.length - 1, 1);
  }

  return res.json({
    checkouts,
    hasNext,
  });
};

module.exports = {
  checkoutBook,
  returnBook,
  reserveBook,
  findCheckouts,
  agregateFines,
  userCheckouts,
  bookCheckouts,
  myCheckouts,
};
