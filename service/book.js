const Book = require('../database/models/bookModel');

async function saveBook(req, res) {
    try{
        const book = new Book({
            title: req.body.title,
            author: req.body.author,
            dateOfPublishing: req.body.dateOfPublishing,
            pageCount: req.body.pageCount,
            quantity: req.body.quantity,
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

module.exports = {
    saveBook
};
