const Book = require('../database/models/bookModel');
const Comment = require('../database/models/commentModel');
const Genre = require('../database/models/genreModel');
const dbConnection = require('../database/db');

async function saveBook(req, res) {
    try{
        const book = new Book({
            title: req.body.title,
            author: req.body.author,
            dateOfPublishing: req.body.dateOfPublishing,
            pageCount: req.body.pageCount,
            quantityMax: req.body.quantityMax,
            quantityCurrent: req.body.quantityMax,
            imageUrl: req.body.imageUrl,
            description: req.body.description,
            genre: req.body.genre
        });
        await book.save();
        res.json({message: "New book saved!"});
    }catch(err){
        res.status(500).json({message: 'Failed to save new book!Error: ' + err.message});
    }
}

async function deleteBook(req, res){
    const session = await dbConnection.startSession();
    try{
        const book = await Book.findOne({ _id: req.params.id});
        if(!book) return res.status(404).json({message: `An error occurred while deleting book! Book with id: ${req.params.id} does not exist.`});
        if(book.quantityMax === book.quantityCurrent){ 
            session.startTransaction();

            await book.deleteOne({session});

            const comments = await Comment.find({ bookId: req.params.id });
            for(let i = 0; i < comments.length; i++ ){
                await c.deleteOne({session});
            }

            await session.commitTransaction();
        }
        else return res.status(500).json({message: 'Cannot deleted book! Copies of the book have been checked out.'});

        res.json({message: 'Book deleted!'});
    }catch(err){
        await session.abortTransaction();
        res.status(500).json({message: 'An error occurred while deleting book! Error: ' + err.message});
    }finally{
        session.endSession();
    }
}

async function updateBook(req, res){
    try{
        const book = await Book.findOne({ _id: req.body._id});
        if(!book) return res.status(404).json({message: `An error occurred while updating a book! Book with id ${req.body.id} does not exist.`});
        
        book.title = req.body.title;
        book.description = req.body.description;
        book.pageCount = req.body.pageCount;
        book.author = req.body.author;
        book.dateOfPublishing = req.body.dateOfPublishing;
        book.quantityMax = req.body.quantityMax;
        book.imageUrl = req.body.imageUrl;
        book.genre = req.body.genre;

        await book.save();
        res.json({message: 'Book updated!'});
    }catch(err){
        res.status(500).json({message: 'An error occurred while updating book! Error: ' + err.message});
    }
}

async function findBookById(req, res){
    try{
        let book = await Book.findOne({ _id: req.params.id});
        if(!book) return res.status(404).json({message: `An error occurred while finding book! Book with id ${req.params.id} does not exist!`});

        let rating = 0;
        if(book.rating.ratingCount !== 0) 
            rating = book.rating.ratingSum/book.rating.ratingCount;
        res.send({
            _id: book._id,
            author: book.author,
            description: book.description,
            pageCount: book.pageCount,
            quantityMax: book.quantityMax,
            quantityCurrent: book.quantityCurrent,
            title: book.title,
            genre: book.genre,
            imageUrl: book.imageUrl,
            dateOfPublishing: book.dateOfPublishing,
            rating: rating
        });
    }catch(err){
        res.status(500).json({message: 'An error occurred while finding book! Error: ' + err.message});
    }
}

async function filterBooks(req, res){
    try{
        let limit = Number(req.query.size)+1;
        let skip = (Number(req.query.page)-1)*Number(req.query.size);

        let bookList = []
        if(req.query.genre === undefined || req.query.genre === ''){
            bookList = await Book.find({
                title: new RegExp(req.query.title, 'i'),
                author: new RegExp(req.query.author, 'i'),
            })
                .limit(limit)
                .skip(skip)
                .sort({title: 1});
        }else{
            bookList = await Book.find({
                title: new RegExp(req.query.title, 'i'),
                author: new RegExp(req.query.author, 'i'),
                genre: {$in: req.query.genre.split(',')} 
            })
                .limit(limit)
                .skip(skip)
                .sort({title: 1});
        }

        let hasNext = false;
        if(bookList.length === limit){
            hasNext = true;
            bookList.splice(bookList.length-1, 1);
        }

        let returnList = []
        bookList.forEach(book =>{
            let rating = 0;
            if(book.rating.ratingCount !== 0) rating = book.rating.ratingSum/book.rating.ratingCount;
            returnList.push({
                _id: book._id,
                author: book.author,
                description: book.description,
                pageCount: book.pageCount,
                quantityMax: book.quantityMax,
                quantityCurrent: book.quantityCurrent,
                title: book.title,
                genre: book.genre,
                imageUrl: book.imageUrl,
                dateOfPublishing: book.dateOfPublishing,
                rating: rating
            });
        });
        
        res.send({
            hasNext: hasNext,
            books: returnList
        });
    }catch(err){
        res.status(500).json({message: 'An error occurred while finding book! Error: ' + err.message});
    }
}

async function addComment(req, res){
    let session = await dbConnection.startSession();
    try{
        const book = await Book.findOne({ _id: req.params.bookId})
        if(!book) return res.status(404).json({message: `An error occurred while saving your commnet! Error: Book with id: ${req.body.bookId} does not exist`});

        const comment = new Comment({
            bookId: req.params.bookId,             
            author: req.user.username,
            comment: req.body.comment,
            rating: req.body.rating
        });

        session.startTransaction();

        book.rating.ratingSum += comment.rating;
        book.rating.ratingCount++;
        
        let com = await comment.save({session});
        await book.save({session});

        await session.commitTransaction();

        res.json({messsage: com._id});
    }catch(err){
        await session.abortTransaction();
        res.status(500).json({message: 'An error occurred while saving your commnet! Error: ' + err.message});
    }
}

async function replyComment(req, res){
    let session = await dbConnection.startSession();
    try{
        const book = await Book.findOne({ _id: req.params.bookId})
        if(!book) return res.status(404).json({message: `An error occurred while saving your commnet! Error: Book with id: ${req.body.bookId} does not exist`});

        const parentComment = await Comment.findOne({ _id: req.body.parentCommentId });
        if(!parentComment) return res.status(404).json({message: `An error occurred while saving your commnet! Error: Comment with id: ${req.body.parentCommentId} does not exist`});

        const comment = new Comment({
            bookId: req.params.bookId,             
            author: req.user.username,
            comment: req.body.comment,
            parentCommentId: req.body.parentCommentId
        });
        
        session.startTransaction();

        if(!parentComment.replies){
            parentComment.replies = true;
            await parentComment.save({session});
        }
        let com = await comment.save({session});

        await session.commitTransaction();
        
        res.json({message: com._id});
    }catch(err){
        await session.abortTransaction();
        res.status(500).json({message: 'An error occurred while saving your commnet! Error: ' + err.message});
    }
}

async function editComment(req, res){
    try{
        const com = await Comment.findOne({ _id : req.params.commentId });
        if(!com) return res.status(404).json({message: 'Cant edit comment! Comment does not exist.'});

        com.comment = req.body.comment;
        await com.save();
        res.json({message: 'Commend edited!'});
    } catch(err){
        res.status(500).json({message: 'An error occurred while editing comment! Error: ' + err.message});
    }
}

async function findComments(req, res){
    try{
        let limit = Number(req.query.size)+1;
        let skip = (Number(req.query.page)-1)*Number(req.query.size);

        let commentList = [];
        if(req.query.replies){
            commentList = await Comment.find({ bookId: req.params.bookId, parentCommentId: req.query.replies})
                .limit(limit)
                .skip(skip);
        }else{
            commentList = await Comment.find({ bookId: req.params.bookId, parentCommentId: null })
                .limit(limit)
                .skip(skip);
        }
        let hasNext = false;
        if(commentList.length === limit){
            hasNext = true;
            commentList.splice(commentList.length-1, 1);
        }

        res.send({
            hasNext: hasNext,
            comments: commentList
        });
    }catch(err){
        res.status(500).json({message: 'An error occurred while getting comments! Error: ' + err.message});
    }
}

async function getGenre(req, res){
    try{
        let limit = Number(req.query.size)+1;
        let skip = (Number(req.query.page)-1)*Number(req.query.size);

        let genreList = [];
        genreList = await Genre.find()
            .limit(limit)
            .skip(skip);

        let hasNext = false;
        if(genreList.length === limit){
            hasNext = true;
            genreList.splice(genreList.length-1, 1);
        }

        res.send({
            hasNext: hasNext,
            genres: genreList
        });
    }catch(err){
        res.status(500).json({message: 'An error occurred while getting genres! Error: ' + err.message});
    }
}

async function addGenre(req, res){
    try{
        const genre = new Genre({
            name: req.body.name
        });

        await genre.save();
        res.json({message: 'Genre added!'});
    }catch(err){
        res.status(500).json({message: 'An error occurred while adding genre! Error: ' + err.message});
    }
}

async function deleteGenre(req, res){
    const session = await dbConnection.startSession();
    try{
        const genre = await Genre.find({name: req.params.name});
        if(!genre) return res.status(404).json({message: `Genre with name: ${req.params.name} does not exist!`});
        
        session.startTransaction(); 

        await Genre.deleteOne({name: req.params.name}, {session});

        const books = await Book.find({genre: {$in: [req.params.name]}});
        books.forEach(book => async () => {
            for(let i = 0; i < book.genre.length; i++){
                if(book.genre[i] === req.params.name){
                    book.genre.splice(i, 1);
                    await book.save({session});
                    break;
                }
            }
        });
        await session.commitTransaction();
        
        res.json({message: 'Genre deleted!'});
    }catch(err){
        res.status(500).json({message: 'An error occurred while deleting genre! Error: ' + err.message});
        await session.abortTransaction();
    }finally{
        session.endSession();
    }
}


module.exports = {
    saveBook,
    deleteBook,
    updateBook,
    findBookById,
    filterBooks,
    addComment,
    replyComment,
    editComment,
    findComments,
    getGenre,
    addGenre,
    deleteGenre
};
