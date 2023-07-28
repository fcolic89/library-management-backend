const Book = require('../database/models/bookModel');
const Checkout = require('../database/models/checkOutModel');
const dbConnection = require('../database/db');

async function checkoutBook(req, res){
    const session = await dbConnection.startSession();
    try{
        const book = await Book.findOne({ _id: req.body.bookId });
        if(!book){ 
            return res.status(404).send(`Book with id ${req.body.bookId} not found!`);
        }else if(book.quantityCurrent === 0){ 
            return res.status(403).send('No more copies available!');
        }

        const fined = await Checkout.findOne({ user: req.user.id, fine: {$gt: 0}, returned: null });
        if(fined) return res.status(403).send('Cannot chekout a book while an overdue book is not retured!');

        const checkout = new Checkout({
            user: req.user.id,
            book: req.body.bookId
        });
        session.startTransaction();

        book.quantityCurrent = book.quantityCurrent - 1;
        await book.save({session});

        await checkout.save({session});

        await session.commitTransaction();

        res.send('Book checked out!');
    }catch(err){
        await session.abortTransaction();
        res.status(500).send('An error occurred while checking out a book! Error: ' + err.message);
    }finally{
        session.endSession();
    }
}

async function returnBook(req, res){
    const session = await dbConnection.startSession();
    try{
        const checkout = await Checkout.findOne({ user: req.body.userId, book: req.body.bookId, returned: null });
        if(!checkoutBook) return res.status(400).send('Checkout does not exist!');

        const book = await Book.findOne({ _id: checkout.book });

        session.startTransaction();

        book.quantityCurrent = book.quantityCurrent + 1;
        await book.save({session});

        checkout.returned = Date.now();
        await checkout.save({session});

        await session.commitTransaction();
        res.send('Book returned!');
    }catch(err){
        await session.abortTransaction();
        res.status(500).send('An error occurred while returning a book! Error: ' + err.message);
    }finally{
        session.endSession();
    }
}

async function findCheckouts(req, res){
    try{
        const checkouts = await Checkout.find({
            returned: null
        })
        .limit(req.query.size)
        .skip((req.query.page-1)*req.query.size)
        .populate('user', 'username')
        .populate('book', 'title')
        .exec();

        res.send(checkouts);
    }catch(err){
        res.status(500).send('An error occurred while getting checkout! Error: ' + err.message);
    }
}

module.exports = {
    checkoutBook,
    returnBook,
    findCheckouts
}
