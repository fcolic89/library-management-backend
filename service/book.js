const Book = require('../database/models/bookModel');
const Comment = require('../database/models/commentModel');
const dbConnection = require('../database/db');

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
    const session = await dbConnection.startSession();
    try{
        const book = await Book.findOne({ _id: req.params.id});
        if(!book) return res.status(404).send(`An error occurred while deleting book! Book with id: ${req.params.id} does not exist.`);
        if(book.quantityMax === book.quantityCurrent){ 
            session.startTransaction();

            await book.deleteOne({session});

            const comments = await Comment.find({ bookId: req.params.id });
            for(let i = 0; i < comments.length; i++ ){
                await c.deleteOne({session});
            }

            await session.commitTransaction();
        }
        else return res.status(500).send('Cannot deleted book! Copies of the book have been checked out.');

        res.send('Book deleted!');
    }catch(err){
        await session.abortTransaction();
        res.status(500).send('An error occurred while deleting book! Error: ' + err.message);
    }finally{
        session.endSession();
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
        if(!book) return res.status(404).send(`An error occurred while finding book! Book with id ${req.params.id} does not exist!`);

        res.send(book);
    }catch(err){
        res.status(500).send('An error occurred while finding book! Error: ' + err.message);
    }
}

async function filterBooks(req, res){
    try{
        let bookList = []
        if(req.query.genre === undefined || req.query.genre === []){
            bookList = await Book.find({
                title: new RegExp(req.query.title, 'i'),
                author: new RegExp(req.query.author, 'i'),
            })
                .limit(req.query.size)
                .skip((req.query.page-1)*req.query.size)
                .sort({title: 1});
        }else{
            bookList = await Book.find({
                title: new RegExp(req.query.title, 'i'),
                author: new RegExp(req.query.author, 'i'),
                genre: {$in: req.query.genre} 
            })
                .limit(req.query.size)
                .skip((req.query.page-1)*req.query.size)
                .sort({title: 1});
        }

        res.send(bookList);
    }catch(err){
        res.status(500).send('An error occurred while finding book! Error: ' + err.message);
    }
}

async function addComment(req, res){
    let parentChange = false;
    let session = await dbConnection.startSession();
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
            if(!parent.replies){
                parent.replies = true;
                parentChange = true;
                await parent.save({session});
            }
        }

        await comment.save({session});

        if(parentChange) await session.commitTransaction();
        res.send('Commnet saved!');
    }catch(err){
        if(parentChange) await session.abortTransaction();
        res.status(500).send('An error occurred while saving your commnet! Error: ' + err.message);
    }finally{
        session.endSession();
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
                .limit(req.query.size)
                .skip((req.query.page-1)*req.query.size);
        }else{
            commentList = await Comment.find({ bookId: req.params.bookId, parentCommentId: null })
                .limit(req.query.size)
                .skip((req.query.page-1)*req.query.size);
        }

        res.send(commentList);
    }catch(err){
        res.status(500).send('An error occurred while getting comments! Error: ' + err.message);
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
};
