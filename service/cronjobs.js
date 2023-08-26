const nodeCron = require('node-cron');
const Checkout = require('../database/models/checkOutModel');
const Book = require('../database/models/bookModel');
const db = require('../database/db');

const timeLimit = 2592000; //30 days
// const testTimeLiimt = 5;

nodeCron.schedule('* 0 1 * * *', async function(){
    try{
        const checkoutList = await Checkout.find({ status: 'CHECKEDOUT' });
        let takenOut = Math.floor(c.createdAt / 1000);
        let today = Math.floor(Date.now() / 1000);
        for(const c of checkoutList){ 
            if(today - takenOut >= timeLimit){
                c.fine +=300;
                await c.save();
            }
        }
    }catch(err){
            console.log('Cron job error: Error: ' + err.message);
    }
});

nodeCron.schedule('* 0 1 * * *', async function(){
    try{
        const checkoutList = await Checkout.find({ status: 'PENDING' });
        let takenOut = Math.floor(c.createdAt / 1000);
        let today = Math.floor(Date.now() / 1000);

        for(const c of checkoutList){
            if(today - takenOut >= timeLimit){
                const session = await db.startSession();
                try{
                    const book = await Book.findOne({ _id: c.book });
                    book.quantityCurrent++;
                    
                    session.startTransaction();

                    await book.save({session});
                    await c.deleteOne({session});

                    await session.commitTransaction();
                }catch(err){
                    await session.abortTransaction();
                }finally{
                    session.endSession();
                }
            }
        }
    }catch(err){
            console.log('Cron job error: Error: ' + err.message);
    }
});
