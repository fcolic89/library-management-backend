const Book = require('../database/models/bookModel');
const Comment = require('../database/models/commentModel');
const Checkout = require('../database/models/checkOutModel');
const { checkout } = require('../routes/user');

async function saveBook(req, res) {
    try{
        const book = new Book({
            title: req.body.title,
            author: req.body.author,
            dateOfPublishing: req.body.dateOfPublishing,
            pageCount: req.body.pageCount,
            quantityMax: req.body.quantity,
            quantityCurrent: req.body.quantity,
            imageUrl: req.body.imageUrl,
            description: req.body.description,
            genre: req.body.genre
        });
        await book.save();
        res.send("New book saved!");
    }catch(err){
        res.status(500).send('Failed to save new book!Error: ' + err.message);
    }
}

async function deleteBook(req, res){
    try{
        const book = await Book.findOne({ _id: req.params.id});
        if(!book) return res.status(404).send(`An error occurred while deleting book! Book with id: ${req.params.id} does not exist.`);
        if(book.quantityMax === book.quantityCurrent) await book.deleteOne();
        else return res.status(500).send('Cannot deleted book! Copies of the book have been checked out.');
        res.send('Book deleted!');
    }catch(err){
        res.status(500).send('An error occurred while deleting book! Error: ' + err.message);
    }
}

async function updateBook(req, res){
    try{
        const book = await Book.findOne({ _id: req.body.id});
        if(!book) return res.status(404).send(`An error occurred while updating a book! Book with id ${req.body.id} does not exist.`);
        
        book.title = req.body.title;
        book.description = req.body.description;
        book.pageCount = req.body.pageCount;
        book.author = req.body.author;
        book.dateOfPublishing = req.body.dateOfPublishing;
        book.quantityMax = req.body.quantity;
        book.imageUrl = req.body.imageUrl;

        await book.save();
        res.send('Book updated!');
    }catch(err){
        res.status(500).send('An error occurred while updating book! Error: ' + err.message);
    }
}

async function findBookById(req, res){
    try{
        const book = await Book.findOne({ _id: req.params.id});
        if(!book) res.status(404).send(`An error occurred while find book! Book with id ${req.params.id} does not exist!`);

        res.send(book);
    }catch(err){
        res.status(500).send('An error occurred while find book! Error: ' + err.message);
    }
}

async function filterBooks(req, res){
    try{
        let bookList = []
        if(req.body.genre === undefined || req.body.genre === []){
            bookList = await Book.find({
                title: new RegExp(req.body.title, 'i'),
                author: new RegExp(req.body.author, 'i'),
            });
        }else{
            bookList = await Book.find({
                title: new RegExp(req.body.title, 'i'),
                author: new RegExp(req.body.author, 'i'),
                genre: {$in: req.body.genre} 
            });
        }

        res.send(bookList);
    }catch(err){
        res.status(500).send('An error occurred while find book! Error: ' + err.message);
    }
}

async function addComment(req, res){
    try{
        const book = await Book.find({ _id: req.params.bookId})
        if(!book) return res.status(404).send(`An error occurred while saving your commnet! Error: Book with id: ${req.body.bookId} does not exist`);

        const comment = new Comment({
            bookId: req.params.bookId,             
            author: req.user.username,
            comment: req.body.comment,
            parentCommentId: req.body.parentCommentId
        });
        if(req.body.parentCommentId){
            const parent = await Comment.findOne({ _id: req.body.parentCommentId });
            if(!parent) return res.status(404).send(`An error occurred while saving your commnet! Error: Comment with id: ${req.body.parentCommentId} does not exist`);

            parent.replies = true;
            await parent.save();
        }

        await comment.save();
        res.send('Commnet saved!');
    }catch(err){
        res.status(500).send('An error occurred while saving your commnet! Error: ' + err.message);
    } 
}

async function editComment(req, res){
    try{
        const com = await Comment.findOne({ _id : req.params.commentId });
        if(!com) return res.status(404).send('Cant edit comment! Comment does not exist.');

        com.comment = req.body.comment;
        await com.save();
        res.send('Commend edited!');
    } catch(err){
        res.status(500).send('An error occurred while editing comment! Error: ' + err.message);
    }
}

async function findComments(req, res){
    try{
        let commentList = [];
        if(req.query.replies){
            commentList = await Comment.find({ bookId: req.params.bookId, parentCommentId: req.query.replies})
        }else{
            commentList = await Comment.find({ bookId: req.params.bookId, parentCommentId: null });
        }

        res.send(commentList);
    }catch(err){
        res.status(500).send('An error occurred while getting comments! Error: ' + err.message);
    }
}

async function checkoutBook(req, res){
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
            userId: req.user.id,
            bookId: req.body.bookId
        });

        book.quantityCurrent = book.quantityCurrent - 1;
        book.save();

        await checkout.save();
        res.send('Book checked out!');
    }catch(err){
        res.status(500).send('An error occurred while checking out a book! Error: ' + err.message);
    }
}

async function returnBook(req, res){
    try{
        const checkout = await Checkout.findOne({ userId: req.body.userId, bookId: req.body.bookId, returned: null });
        if(!checkoutBook) return res.status(400).send('Checkout does not exist!');

        const book = await Book.findOne({ _id: checkout.bookId });
        book.quantityCurrent = book.quantityCurrent + 1;
        book.save();

        checkout.returned = Date.now();
        checkout.save();

        res.send('Book returned!');
    }catch(err){
        res.status(500).send('An error occurred while returning a book! Error: ' + err.message);
    }
}

module.exports = {
    saveBook,
    deleteBook,
    updateBook,
    findBookById,
    filterBooks,
    addComment,
    editComment,
    findComments,
    checkoutBook,
    returnBook
};
