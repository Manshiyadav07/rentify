const Book = require('../models/Book');
const BookCopy = require('../models/BookCopy');

class InventoryService {
  // Ensure physical copies exist for a book matching totalCopies
  async syncBookCopies(bookId) {
    const book = await Book.findById(bookId);
    if (!book) throw new Error('Book not found');

    const existingCopies = await BookCopy.find({ book: bookId });
    const neededCopies = book.totalCopies - existingCopies.length;

    if (neededCopies > 0) {
      const newCopies = [];
      for (let i = 1; i <= neededCopies; i++) {
        const copyNum = existingCopies.length + i;
        newCopies.push({
          copyId: `CPY-${book._id.toString().slice(-4).toUpperCase()}-${String(copyNum).padStart(3, '0')}`,
          book: book._id,
          barcode: `BAR-${Date.now()}-${copyNum}`,
          condition: 'GOOD',
          status: 'AVAILABLE',
          location: `Shelf ${(copyNum % 5) + 1}-Section B`
        });
      }
      await BookCopy.insertMany(newCopies);
    }

    // Recalculate available count
    const availableCount = await BookCopy.countDocuments({
      book: bookId,
      status: 'AVAILABLE'
    });

    book.availableCopies = availableCount;
    await book.save();

    return { totalCopies: book.totalCopies, availableCopies: availableCount };
  }

  // Update physical condition of a copy (e.g. after return inspection)
  async updateCopyCondition(copyId, condition, status = 'AVAILABLE', notes = '') {
    const copy = await BookCopy.findOne({ copyId });
    if (!copy) throw new Error(`Copy ${copyId} not found`);

    copy.condition = condition;
    copy.status = status;
    if (notes) copy.notes = notes;
    await copy.save();

    // Recount available copies for the book
    const availableCount = await BookCopy.countDocuments({
      book: copy.book,
      status: 'AVAILABLE'
    });

    await Book.findByIdAndUpdate(copy.book, { availableCopies: availableCount });

    return copy;
  }

  // Get all copies of a book
  async getBookCopies(bookId) {
    return await BookCopy.find({ book: bookId }).sort({ copyId: 1 });
  }
}

module.exports = new InventoryService();
