const Book = require('../database/models/bookModel');
const Comment = require('../database/models/commentModel');

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
        if(book.quantityMax === book.quantityCurrent) book.deleteOne();
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

        book.save();
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
        const comment = new Comment({
            author: req.user.username,
            comment: req.body.comment,
        });
        if(req.body.parentComment) comment.parentComment = req.body.parentCommnet;

        await comment.save();
        res.send('Commnet saved!');
    }catch(err){
        res.status(500).send('An error occurred while saving your commnet! Error: ' + err.message);
    } 
}

module.exports = {
    saveBook,
    deleteBook,
    updateBook,
    findBookById,
    filterBooks
};
