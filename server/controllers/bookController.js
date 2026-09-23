const Book = require('../models/Book');
const BookCopy = require('../models/BookCopy');
const inventoryService = require('../services/inventoryService');
const cacheService = require('../services/cacheService');

// @desc    Get all books with advanced search, multi-filters, sorting, and pagination
// @route   GET /api/books
// @access  Public
const getAllBooks = async (req, res, next) => {
  try {
    const {
      search,
      category,
      author,
      minRating,
      minPrice,
      maxPrice,
      availability,
      language,
      publicationYear,
      sortBy = 'newest',
      page = 1,
      limit = 12
    } = req.query;

    const pageNumber = Math.max(1, parseInt(page, 10));
    const pageSize = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNumber - 1) * pageSize;

    // Cache key for unauthenticated or generic search queries
    const cacheKey = `books:${JSON.stringify(req.query)}`;
    const cachedData = await cacheService.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    let filter = { status: 'AVAILABLE' };

    // 1. Full-text or Regex Search across Title, Author, Description, Tags
    if (search && search.trim()) {
      filter.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { author: { $regex: search.trim(), $options: 'i' } },
        { isbn: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { tags: { $in: [new RegExp(search.trim(), 'i')] } }
      ];
    }

    // 2. Filters
    if (category && category !== 'All') {
      filter.category = category;
    }
    if (author) {
      filter.author = { $regex: author.trim(), $options: 'i' };
    }
    if (minRating) {
      filter.averageRating = { $gte: Number(minRating) };
    }
    if (language && language !== 'All') {
      filter.language = language;
    }
    if (publicationYear) {
      filter.publicationYear = Number(publicationYear);
    }

    // Price range
    if (minPrice || maxPrice) {
      filter.rentalPrice = {};
      if (minPrice) filter.rentalPrice.$gte = Number(minPrice);
      if (maxPrice) filter.rentalPrice.$lte = Number(maxPrice);
    }

    // Availability filter
    if (availability === 'in_stock') {
      filter.availableCopies = { $gt: 0 };
    } else if (availability === 'out_of_stock') {
      filter.availableCopies = 0;
    }

    // 3. Sorting
    let sortCriteria = {};
    switch (sortBy) {
      case 'price_asc':
        sortCriteria = { rentalPrice: 1 };
        break;
      case 'price_desc':
        sortCriteria = { rentalPrice: -1 };
        break;
      case 'rating':
        sortCriteria = { averageRating: -1, numReviews: -1 };
        break;
      case 'most_rented':
      case 'popularity':
        sortCriteria = { rentalCount: -1, averageRating: -1 };
        break;
      case 'newest':
      default:
        sortCriteria = { createdAt: -1 };
        break;
    }

    // Execute query with count for pagination
    const [books, totalCount] = await Promise.all([
      Book.find(filter)
        .sort(sortCriteria)
        .skip(skip)
        .limit(pageSize),
      Book.countDocuments(filter)
    ]);

    const result = {
      success: true,
      books,
      pagination: {
        page: pageNumber,
        limit: pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
        hasNextPage: pageNumber * pageSize < totalCount,
        hasPrevPage: pageNumber > 1
      }
    };

    // Cache results for 60 seconds
    await cacheService.set(cacheKey, result, 60);

    res.json(result);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single book by ID
// @route   GET /api/books/:id
// @access  Public
const getBookById = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    // Increment view counter asynchronously
    Book.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } }).exec();

    // Fetch physical copies overview
    const copies = await BookCopy.find({ book: req.params.id }).select('copyId condition status location');

    res.json({
      success: true,
      book,
      copies
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get categories with book count distribution
// @route   GET /api/books/categories
// @access  Public
const getCategories = async (req, res, next) => {
  try {
    const cached = await cacheService.get('books:categories');
    if (cached) return res.json(cached);

    const categories = await Book.aggregate([
      { $match: { status: 'AVAILABLE' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const result = {
      success: true,
      categories: categories.map(c => ({ name: c._id, count: c.count }))
    };

    await cacheService.set('books:categories', result, 300);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// @desc    Create new book (Admin only)
// @route   POST /api/books
// @access  Private/Admin
const createBook = async (req, res, next) => {
  try {
    const {
      title,
      author,
      isbn,
      category,
      publisher,
      publicationYear,
      language,
      description,
      coverImage,
      rentalPrice,
      securityDeposit,
      rentalDurationDays,
      totalCopies,
      tags
    } = req.body;

    const book = await Book.create({
      title,
      author,
      isbn,
      category,
      publisher,
      publicationYear,
      language: language || 'English',
      description,
      coverImage,
      rentalPrice: Number(rentalPrice),
      securityDeposit: Number(securityDeposit) || 100,
      rentalDurationDays: Number(rentalDurationDays) || 14,
      totalCopies: Number(totalCopies) || 5,
      availableCopies: Number(totalCopies) || 5,
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : [])
    });

    // Auto-seed physical copies for the book
    await inventoryService.syncBookCopies(book._id);

    // Invalidate cache
    await cacheService.invalidatePattern('books:*');

    res.status(201).json({ success: true, book });
  } catch (error) {
    next(error);
  }
};

// @desc    Update book (Admin only)
// @route   PUT /api/books/:id
// @access  Private/Admin
const updateBook = async (req, res, next) => {
  try {
    let book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    const updatedBook = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    // If totalCopies was modified, sync physical copies
    if (req.body.totalCopies !== undefined) {
      await inventoryService.syncBookCopies(updatedBook._id);
    }

    await cacheService.invalidatePattern('books:*');

    res.json({ success: true, book: updatedBook });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete book (Admin only)
// @route   DELETE /api/books/:id
// @access  Private/Admin
const deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    book.status = 'DISCONTINUED';
    await book.save();

    await cacheService.invalidatePattern('books:*');

    res.json({ success: true, message: 'Book discontinued successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllBooks,
  getBookById,
  getCategories,
  createBook,
  updateBook,
  deleteBook
};
