const nodeCron = require('node-cron');
const Checkout = require('../database/models/checkOutModel');

const timeLimit = 2592000; //30 days
// const testTimeLiimt = 5;

nodeCron.schedule('* 0 1 * * *', async function(){
    try{
        const checkoutList = await Checkout.find({ returned: false });
        checkoutList.forEach(c =>{
            let takenOut = Math.floor(c.createdAt / 1000);
            let today = Math.floor(Date.now() / 1000);
            
            if(today - takenOut >= timeLimit){
                c.fine +=300;
                c.save();
            }
        });
    }catch(err){
            console.log('Cron job error: Error: ' + err.message);
    }
});
