const nodeCron = require('node-cron');
const { Checkout, Book, checkoutStatus } = require('../database/models');
const db = require('../database/db');

const timeLimit = 2592000; // 30 days
// const testTimeLiimt = 5;

nodeCron.schedule('* 0 1 * * *', async () => {
  try {
    const promises = [];
    const checkoutList = await Checkout.find({ status: checkoutStatus.checkedout });
    const today = Math.floor(Date.now() / 1000);
    for (const c of checkoutList) {
      const takenOut = Math.floor(c.createdAt / 1000);
      if (today - takenOut >= timeLimit) {
        c.fine += 300;
        promises.push(c.save());
      }
    }
    await Promise.all(promises);
  } catch (err) {
    console.log(`Cron job error: Error: ${err.message}`);
  }
});

nodeCron.schedule('* 0 1 * * *', async () => {
  try {
    const checkoutList = await Checkout.find({ status: checkoutStatus.pending });
    const takenOut = Math.floor(c.createdAt / 1000);
    const today = Math.floor(Date.now() / 1000);

    for (const c of checkoutList) {
      if (today - takenOut >= timeLimit) {
        const session = await db.startSession();
        try {
          const book = await Book.findOne({ _id: c.book });
          book.quantityCurrent++;

          session.startTransaction();

          await book.save({ session });
          await c.deleteOne({ session });

          await session.commitTransaction();
        } catch (err) {
          await session.abortTransaction();
        } finally {
          session.endSession();
        }
      }
    }
  } catch (err) {
    console.log(`Cron job error: Error: ${err.message}`);
  }
});
