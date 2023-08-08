const Book = require('../database/models/bookModel');
const Checkout = require('../database/models/checkOutModel');
const User = require('../database/models/userModel');
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

        const fined = await Checkout.findOne({ user: req.user.id, fine: {$gt: 0}, returned: false });
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
        const checkout = await Checkout.findOne({ user: req.body.userId, book: req.body.bookId, returned: false });
        if(!checkoutBook) return res.status(400).send('Checkout does not exist!');

        const book = await Book.findOne({ _id: checkout.book });

        session.startTransaction();

        book.quantityCurrent = book.quantityCurrent + 1;
        await book.save({session});

        checkout.returned = true;
        await checkout.save({session});

        await session.commitTransaction();
        res.json({message: 'Book returned!'});
    }catch(err){
        await session.abortTransaction();
        res.status(500).json({message: 'An error occurred while returning a book! Error: ' + err.message});
    }finally{
        session.endSession();
    }
}

async function findCheckouts(req, res){
    try{
        let limit = Number(req.query.size)+1;
        let skip = (Number(req.query.page)-1)*Number(req.query.size);

        let checkouts = [];
        if(req.query.returned){
            checkouts = await Checkout.find({
                returned: req.query.returned
            })
                .limit(limit)
                .skip(skip)
                .populate('user', 'username')
                .populate('book', 'title')
                .select(['user', 'book', 'fine', 'createdAt', 'returned']);
        }else{
            checkouts = await Checkout.find()
                .limit(limit)
                .skip(skip)
                .populate('user', 'username')
                .populate('book', 'title')
                .select(['user', 'book', 'fine', 'createdAt', 'returned']);
        }

        let hasNext = false;
        if(checkouts.length === limit){
            hasNext = true;
            checkouts.splice(genreList.length-1, 1);
        }

        res.json({
            checkouts: checkouts,
            hasNext: hasNext
        });
    }catch(err){
        res.status(500).json({message: 'An error occurred while getting checkout! Error: ' + err.message});
    }
}

async function agregateFines(req, res){
    try{
        let limit = Number(req.query.size)+1;
        let skip = (Number(req.query.page)-1)*Number(req.query.size);

        const fines = await Checkout.aggregate()
            .limit(limit)
            .skip(skip)
            .lookup({from: 'users', localField: 'user', foreignField: '_id', as: 'userLookup'})
            .project({
                username: { $arrayElemAt: ['$userLookup.username', 0]}, 
                userId: { $arrayElemAt: ['$userLookup._id', 0]}, 
                fine: '$fine'
            })
            .group({_id: '$username', finesTotal: { $sum: '$fine' }});

        let hasNext = false;
        if(fines.length === limit){
            hasNext = true;
            fines.splice(genreList.length-1, 1);
        }

        res.send({
            fines: fines,
            hasNext: hasNext
        });
    }catch(err){
        res.status(500).json({message: 'An error occurred while getting agregated fines! Error: ' + err.message});

    }
}

async function userCheckouts(req, res){
    try{
        let limit = Number(req.query.size)+1;
        let skip = (Number(req.query.page)-1)*Number(req.query.size);

        const user = await User.findOne({username: req.params.username});
        if(!user) return res.status(404).json({message: `User with username ${req.params.username} was not found!`});
        
        let checkouts = [];
        const dateSort = req.query.dateRising || 1;

        let fined = {};
        if(req.query.fined === 'true'){
            fined.$gt = 0;
        }else if(req.query.fined === 'false'){
            fined.$eq = 0;
        }else{
            fined.$gt = -1;
        }

        if(req.query.returned){
            checkouts = await Checkout.find({ 
                user: user._id,
                returned: req.query.returned,
                fine: fined
            })
                .limit(limit)
                .skip(skip)
                .populate('user', 'username')
                .populate('book', 'title')
                .select(['user', 'book', 'fine', 'createdAt', 'returned'])
                .sort({createdAt: dateSort});
        }else{
            checkouts = await Checkout.find({ 
                user: user._id,
                fine: fined
            })
                .limit(limit)
                .skip(skip)
                .populate('user', 'username')
                .populate('book', 'title')
                .select(['user', 'book', 'fine', 'createdAt', 'returned'])
                .sort({createdAt: dateSort});
        }

        let hasNext = false;
        if(checkouts.length === limit){
            hasNext = true;
            checkouts.splice(genreList.length-1, 1);
        }

        res.json({
            checkouts: checkouts,
            hasNext: hasNext
        });
    }catch(err){
        res.status(500).json({message: 'An error occurred while getting user checkouts! Error: ' + err.message});
    }
}

async function bookCheckouts(req, res){
    try{
        let limit = Number(req.query.size)+1;
        let skip = (Number(req.query.page)-1)*Number(req.query.size);

        const dateSort = req.query.dateRising || 1;
        let checkouts = [];
        if(req.query.returned){
            checkouts = await Checkout.find({
                book: req.params.bookId,
                returned: req.query.returned
            })
                .limit(limit)
                .skip(skip)
                .populate('user', 'username')
                .populate('book', 'title')
                .select(['user', 'book', 'fine', 'createdAt', 'returned'])
                .sort({createdAt: dateSort});
        }else{
            checkouts = await Checkout.find({
                book: req.params.bookId
            })
                .limit(limit)
                .skip(skip)
                .populate('user', 'username')
                .populate('book', 'title')
                .select(['user', 'book', 'fine', 'createdAt', 'returned'])
                .sort({createdAt: dateSort});
        }
        
        let hasNext = false;
        if(checkouts.length === limit){
            hasNext = true;
            checkouts.splice(genreList.length-1, 1);
        }

        res.json({
            checkouts: checkouts,
            hasNext: hasNext
        });
    }catch(err){
        res.status(500).json({message: 'An error occurred while getting book checkouts! Error: ' + err.message});
    }
}

async function myCheckouts(req, res){
    try{
        let limit = Number(req.query.size)+1;
        let skip = (Number(req.query.page)-1)*Number(req.query.size);

        const user = await User.findOne({username: req.user.username});
        if(!user) return res.status(404).send(`User with username ${req.user.username} was not found!`);
        
        let checkouts = [];
        const dateSort = req.query.dateRising || 1;

        let fined = {};
        if(req.query.fined === 'true'){
            fined.$gt = 0;
        }else if(req.query.fined === 'false'){
            fined.$eq = 0;
        }else{
            fined.$gt = -1;
        }

        if(req.query.returned){
            checkouts = await Checkout.find({ 
                user: user._id,
                returned: req.query.returned,
                fine: fined
            })
                .limit(limit)
                .skip(skip)
                .populate('user', 'username')
                .populate('book', 'title')
                .select(['user', 'book', 'fine', 'createdAt', 'returned'])
                .sort({createdAt: dateSort});
        }else{
            checkouts = await Checkout.find({ 
                user: user._id,
                fine: fined
            })
                .limit(limit)
                .skip(skip)
                .populate('user', 'username')
                .populate('book', 'title')
                .select(['user', 'book', 'fine', 'createdAt', 'returned'])
                .sort({createdAt: dateSort});
        }

        let hasNext = false;
        if(checkouts.length === limit){
            hasNext = true;
            checkouts.splice(genreList.length-1, 1);
        }

        res.json({
            checkouts: checkouts,
            hasNext: hasNext
        });
    }catch(err){
        res.status(500).json({message: 'An error occurred while getting user checkouts! Error: ' + err.message});
    }
}

module.exports = {
    checkoutBook,
    returnBook,
    findCheckouts,
    agregateFines,
    userCheckouts,
    bookCheckouts,
    myCheckouts
}
