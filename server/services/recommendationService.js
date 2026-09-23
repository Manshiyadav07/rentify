const Book = require('../models/Book');
const Rental = require('../models/Rental');
const Wishlist = require('../models/Wishlist');
const cacheService = require('./cacheService');

class RecommendationService {
  /**
   * Get personalized book recommendations for a user
   * Content-based filtering using genres, authors, tags, and previous history
   */
  async getPersonalizedRecommendations(userId, limit = 8) {
    const cacheKey = `recs:user:${userId}`;
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;

    // 1. Fetch user rentals and wishlist to build preference profile
    const [rentals, wishlist] = await Promise.all([
      Rental.find({ user: userId }).populate('book', 'category author tags'),
      Wishlist.findOne({ user: userId }).populate('books', 'category author tags')
    ]);

    const rentedBookIds = new Set();
    const preferredGenres = new Map();
    const preferredAuthors = new Map();
    const preferredTags = new Set();

    // Ingest rentals (weighted higher)
    rentals.forEach(r => {
      if (r.book) {
        rentedBookIds.add(r.book._id.toString());
        const cat = r.book.category;
        preferredGenres.set(cat, (preferredGenres.get(cat) || 0) + 3);
        const auth = r.book.author;
        preferredAuthors.set(auth, (preferredAuthors.get(auth) || 0) + 4);
        (r.book.tags || []).forEach(tag => preferredTags.add(tag.toLowerCase()));
      }
    });

    // Ingest wishlist
    if (wishlist && wishlist.books) {
      wishlist.books.forEach(b => {
        if (b) {
          rentedBookIds.add(b._id.toString());
          const cat = b.category;
          preferredGenres.set(cat, (preferredGenres.get(cat) || 0) + 2);
          const auth = b.author;
          preferredAuthors.set(auth, (preferredAuthors.get(auth) || 0) + 2);
          (b.tags || []).forEach(tag => preferredTags.add(tag.toLowerCase()));
        }
      });
    }

    // Cold-start fallback: if user has no rentals/wishlist, return popular & highest rated books
    if (preferredGenres.size === 0 && preferredAuthors.size === 0) {
      const topBooks = await Book.find({ status: 'AVAILABLE' })
        .sort({ averageRating: -1, rentalCount: -1 })
        .limit(limit);
      await cacheService.set(cacheKey, topBooks, 180);
      return topBooks;
    }

    // 2. Fetch candidate books not yet rented by user
    const candidates = await Book.find({
      _id: { $nin: Array.from(rentedBookIds) },
      status: 'AVAILABLE'
    }).limit(60);

    // 3. Compute Content Similarity Score for each candidate
    const scoredBooks = candidates.map(book => {
      let score = 0;

      // Genre match score
      if (preferredGenres.has(book.category)) {
        score += preferredGenres.get(book.category) * 2;
      }

      // Author match score
      if (preferredAuthors.has(book.author)) {
        score += preferredAuthors.get(book.author) * 3;
      }

      // Tag overlap score
      if (book.tags && book.tags.length > 0) {
        let tagMatches = 0;
        book.tags.forEach(t => {
          if (preferredTags.has(t.toLowerCase())) tagMatches++;
        });
        score += tagMatches * 1.5;
      }

      // Rating & Popularity boost
      score += (book.averageRating || 0) * 0.5;
      score += Math.log10((book.rentalCount || 0) + 1);

      return { book, score };
    });

    // 4. Sort by score descending and extract top books
    scoredBooks.sort((a, b) => b.score - a.score);
    const recommendations = scoredBooks.slice(0, limit).map(item => item.book);

    // If candidate score pool was too small, backfill with popular books
    if (recommendations.length < limit) {
      const backfills = await Book.find({
        _id: { $nin: [...Array.from(rentedBookIds), ...recommendations.map(b => b._id)] },
        status: 'AVAILABLE'
      }).sort({ averageRating: -1 }).limit(limit - recommendations.length);

      recommendations.push(...backfills);
    }

    await cacheService.set(cacheKey, recommendations, 180);
    return recommendations;
  }

  /**
   * Get related books for a specific book page
   */
  async getRelatedBooks(bookId, limit = 4) {
    const targetBook = await Book.findById(bookId);
    if (!targetBook) return [];

    // Find books in same category or same author, excluding the target book
    const related = await Book.find({
      _id: { $ne: targetBook._id },
      $or: [
        { category: targetBook.category },
        { author: targetBook.author },
        { tags: { $in: targetBook.tags || [] } }
      ],
      status: 'AVAILABLE'
    })
    .sort({ averageRating: -1, rentalCount: -1 })
    .limit(limit);

    return related;
  }
}

module.exports = new RecommendationService();
