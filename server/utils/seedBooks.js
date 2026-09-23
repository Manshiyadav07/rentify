const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Book = require('../models/Book');
const BookCopy = require('../models/BookCopy');
const Review = require('../models/Review');
const inventoryService = require('../services/inventoryService');

dotenv.config({ path: require('path').resolve(__dirname, '../.env') });

const sampleBooks = [
  // TECHNOLOGY
  {
    title: 'Atomic Habits: An Easy & Proven Way to Build Good Habits & Break Bad Ones',
    author: 'James Clear',
    isbn: '978-0735211292',
    category: 'Self-Help',
    publisher: 'Avery',
    publicationYear: 2018,
    language: 'English',
    description: 'No matter your goals, Atomic Habits offers a proven framework for improving--every day. James Clear, one of the world\'s leading experts on habit formation, reveals practical strategies that will teach you exactly how to form good habits, break bad ones, and master the tiny behaviors that lead to remarkable results.',
    coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800',
    rentalPrice: 60,
    securityDeposit: 150,
    rentalDurationDays: 14,
    totalCopies: 8,
    availableCopies: 8,
    averageRating: 4.8,
    numReviews: 28,
    tags: ['habits', 'productivity', 'psychology', 'self-improvement', 'mindset'],
    featured: true,
    rentalCount: 42
  },
  {
    title: 'Designing Data-Intensive Applications',
    author: 'Martin Kleppmann',
    isbn: '978-1449373320',
    category: 'Technology',
    publisher: "O'Reilly Media",
    publicationYear: 2017,
    language: 'English',
    description: 'Data is at the center of many challenges in system design today. Difficult issues need to be figured out, such as scalability, consistency, reliability, efficiency, and maintainability. In this practical and comprehensive guide, author Martin Kleppmann helps you navigate this diverse landscape.',
    coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800',
    rentalPrice: 90,
    securityDeposit: 250,
    rentalDurationDays: 14,
    totalCopies: 6,
    availableCopies: 6,
    averageRating: 4.9,
    numReviews: 35,
    tags: ['system design', 'distributed systems', 'databases', 'architecture', 'scalability'],
    featured: true,
    rentalCount: 58
  },
  {
    title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    author: 'Robert C. Martin',
    isbn: '978-0132350884',
    category: 'Technology',
    publisher: 'Prentice Hall',
    publicationYear: 2008,
    language: 'English',
    description: 'Even bad code can function. But if code isn\'t clean, it can bring a development organization to its knees. Every year, countless hours and significant resources are lost because of poorly written code. But it doesn\'t have to be that way.',
    coverImage: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&q=80&w=800',
    rentalPrice: 75,
    securityDeposit: 200,
    rentalDurationDays: 14,
    totalCopies: 5,
    availableCopies: 5,
    averageRating: 4.7,
    numReviews: 19,
    tags: ['programming', 'software engineering', 'refactoring', 'craftsmanship', 'best practices'],
    featured: true,
    rentalCount: 31
  },
  {
    title: 'System Design Interview – An Insider\'s Guide',
    author: 'Alex Xu',
    isbn: '979-8664653403',
    category: 'Technology',
    publisher: 'Independently Published',
    publicationYear: 2020,
    language: 'English',
    description: 'System design interview questions are the most difficult to tackle of all technical interview questions. This book provides a step-by-step framework for how to tackle a system design question. It includes many real-world system design questions with clear diagrammatic solutions.',
    coverImage: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&q=80&w=800',
    rentalPrice: 80,
    securityDeposit: 200,
    rentalDurationDays: 14,
    totalCopies: 7,
    availableCopies: 7,
    averageRating: 4.8,
    numReviews: 24,
    tags: ['system design', 'interviews', 'architecture', 'cloud', 'backend'],
    featured: true,
    rentalCount: 45
  },
  {
    title: 'The Pragmatic Programmer: Your Journey to Mastery',
    author: 'David Thomas, Andrew Hunt',
    isbn: '978-0135957059',
    category: 'Technology',
    publisher: 'Addison-Wesley',
    publicationYear: 2019,
    language: 'English',
    description: 'The Pragmatic Programmer is one of those rare tech books you\'ll read, re-read, and read again over the years. Whether you\'re new to the field or an experienced practitioner, you\'ll come away each time with fresh insights.',
    coverImage: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=800',
    rentalPrice: 70,
    securityDeposit: 180,
    rentalDurationDays: 14,
    totalCopies: 4,
    availableCopies: 4,
    averageRating: 4.8,
    numReviews: 15,
    tags: ['career', 'programming', 'pragmatism', 'software craft'],
    featured: false,
    rentalCount: 22
  },

  // BUSINESS & FINANCE
  {
    title: 'The Psychology of Money: Timeless lessons on wealth, greed, and happiness',
    author: 'Morgan Housel',
    isbn: '978-0857197689',
    category: 'Business',
    publisher: 'Harriman House',
    publicationYear: 2020,
    language: 'English',
    description: 'Doing well with money isn\'t necessarily about what you know. It\'s about how you behave. And behavior is hard to teach, even to really smart people. Money—investing, personal finance, and business decisions—is typically taught as a math-based field, where data and formulas tell us exactly what to do.',
    coverImage: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&q=80&w=800',
    rentalPrice: 55,
    securityDeposit: 140,
    rentalDurationDays: 14,
    totalCopies: 10,
    availableCopies: 10,
    averageRating: 4.9,
    numReviews: 40,
    tags: ['money', 'finance', 'investing', 'psychology', 'wealth'],
    featured: true,
    rentalCount: 65
  },
  {
    title: 'Zero to One: Notes on Startups, or How to Build the Future',
    author: 'Peter Thiel, Blake Masters',
    isbn: '978-0804139298',
    category: 'Business',
    publisher: 'Crown Business',
    publicationYear: 2014,
    language: 'English',
    description: 'The great secret of our time is that there are still uncharted frontiers to explore and new inventions to create. In Zero to One, legendary entrepreneur and investor Peter Thiel shows how we can find singular ways to create those new things.',
    coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800',
    rentalPrice: 50,
    securityDeposit: 120,
    rentalDurationDays: 14,
    totalCopies: 5,
    availableCopies: 5,
    averageRating: 4.6,
    numReviews: 18,
    tags: ['startups', 'entrepreneurship', 'innovation', 'business', 'venture capital'],
    featured: false,
    rentalCount: 29
  },
  {
    title: 'Rich Dad Poor Dad: What the Rich Teach Their Kids About Money',
    author: 'Robert T. Kiyosaki',
    isbn: '978-1612680194',
    category: 'Business',
    publisher: 'Plata Publishing',
    publicationYear: 2017,
    language: 'English',
    description: 'Rich Dad Poor Dad is Robert\'s story of growing up with two dads — his real father and the father of his best friend, his rich dad — and the ways in which both men shaped his thoughts about money and investing.',
    coverImage: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=800',
    rentalPrice: 45,
    securityDeposit: 100,
    rentalDurationDays: 14,
    totalCopies: 6,
    availableCopies: 6,
    averageRating: 4.5,
    numReviews: 30,
    tags: ['finance', 'cashflow', 'real estate', 'assets', 'mindset'],
    featured: false,
    rentalCount: 38
  },

  // SELF HELP & PSYCHOLOGY
  {
    title: 'Deep Work: Rules for Focused Success in a Distracted World',
    author: 'Cal Newport',
    isbn: '978-1455586691',
    category: 'Self-Help',
    publisher: 'Grand Central Publishing',
    publicationYear: 2016,
    language: 'English',
    description: 'Deep work is the ability to focus without distraction on a cognitively demanding task. It\'s a skill that allows you to quickly master complicated information and produce better results in less time. Deep work will make you better at what you do and provide the sense of true fulfillment.',
    coverImage: 'https://images.unsplash.com/photo-1506784365847-bbad939e9335?auto=format&fit=crop&q=80&w=800',
    rentalPrice: 50,
    securityDeposit: 130,
    rentalDurationDays: 14,
    totalCopies: 6,
    availableCopies: 6,
    averageRating: 4.7,
    numReviews: 22,
    tags: ['focus', 'productivity', 'career', 'study', 'flow'],
    featured: true,
    rentalCount: 36
  },
  {
    title: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    isbn: '978-0374533557',
    category: 'Psychology',
    publisher: 'Farrar, Straus and Giroux',
    publicationYear: 2011,
    language: 'English',
    description: 'In the international bestseller, Thinking, Fast and Slow, Daniel Kahneman, the renowned psychologist and winner of the Nobel Prize in Economics, takes us on a groundbreaking tour of the mind and explains the two systems that drive the way we think.',
    coverImage: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&q=80&w=800',
    rentalPrice: 65,
    securityDeposit: 160,
    rentalDurationDays: 14,
    totalCopies: 4,
    availableCopies: 4,
    averageRating: 4.6,
    numReviews: 16,
    tags: ['cognitive science', 'biases', 'decision making', 'behavioral economics'],
    featured: false,
    rentalCount: 19
  },

  // NON-FICTION & SCIENCE
  {
    title: 'Sapiens: A Brief History of Humankind',
    author: 'Yuval Noah Harari',
    isbn: '978-0062316097',
    category: 'Non-Fiction',
    publisher: 'Harper',
    publicationYear: 2015,
    language: 'English',
    description: 'From a renowned historian comes a groundbreaking narrative of humanity\'s creation and evolution—a #1 international bestseller—that explores the ways in which biology and history have defined us and enhanced our understanding of what it means to be "human."',
    coverImage: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&q=80&w=800',
    rentalPrice: 65,
    securityDeposit: 150,
    rentalDurationDays: 14,
    totalCopies: 8,
    availableCopies: 8,
    averageRating: 4.8,
    numReviews: 32,
    tags: ['history', 'anthropology', 'evolution', 'humanity', 'society'],
    featured: true,
    rentalCount: 52
  },
  {
    title: 'A Brief History of Time',
    author: 'Stephen Hawking',
    isbn: '978-0553380163',
    category: 'Science',
    publisher: 'Bantam Books',
    publicationYear: 1998,
    language: 'English',
    description: 'A landmark volume in science writing by one of the great minds of our time, Stephen Hawking\'s book explores such profound questions as: How did the universe begin—and what made its start possible? Does time always flow forward? Is the universe unending?',
    coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800',
    rentalPrice: 55,
    securityDeposit: 130,
    rentalDurationDays: 14,
    totalCopies: 5,
    availableCopies: 5,
    averageRating: 4.7,
    numReviews: 14,
    tags: ['physics', 'cosmology', 'astronomy', 'universe', 'black holes'],
    featured: false,
    rentalCount: 18
  },

  // FICTION & LITERATURE
  {
    title: '1984',
    author: 'George Orwell',
    isbn: '978-0451524935',
    category: 'Fiction',
    publisher: 'Signet Classic',
    publicationYear: 1950,
    language: 'English',
    description: 'Written more than 70 years ago, 1984 was George Orwell\'s chilling prophecy about the future. And while 1984 has come and gone, his dystopian vision of a government that will do anything to control the narrative is timelier than ever.',
    coverImage: 'https://images.unsplash.com/photo-1495640388908-05fa85288e61?auto=format&fit=crop&q=80&w=800',
    rentalPrice: 40,
    securityDeposit: 90,
    rentalDurationDays: 14,
    totalCopies: 7,
    availableCopies: 7,
    averageRating: 4.8,
    numReviews: 29,
    tags: ['dystopian', 'classic', 'politics', 'surveillance', 'philosophy'],
    featured: true,
    rentalCount: 47
  },
  {
    title: 'The Alchemist',
    author: 'Paulo Coelho',
    isbn: '978-0062315007',
    category: 'Fiction',
    publisher: 'HarperOne',
    publicationYear: 1993,
    language: 'English',
    description: 'Paulo Coelho\'s masterpiece tells the mystical story of Santiago, an Andalusian shepherd boy who yearns to travel in search of a worldly treasure. His quest will lead him to riches far different—and far more satisfying—than he ever imagined.',
    coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800',
    rentalPrice: 35,
    securityDeposit: 80,
    rentalDurationDays: 14,
    totalCopies: 8,
    availableCopies: 8,
    averageRating: 4.6,
    numReviews: 26,
    tags: ['allegory', 'destiny', 'dreams', 'journey', 'inspiration'],
    featured: false,
    rentalCount: 41
  },
  {
    title: 'Dune',
    author: 'Frank Herbert',
    isbn: '978-0441172719',
    category: 'Fiction',
    publisher: 'Ace Books',
    publicationYear: 1965,
    language: 'English',
    description: 'Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, heir to a noble family tasked with ruling an inhospitable world where the only thing of value is the "spice" melange, a drug capable of extending life and enhancing consciousness.',
    coverImage: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=800',
    rentalPrice: 50,
    securityDeposit: 120,
    rentalDurationDays: 14,
    totalCopies: 6,
    availableCopies: 6,
    averageRating: 4.7,
    numReviews: 20,
    tags: ['sci-fi', 'space opera', 'politics', 'ecology', 'epic'],
    featured: true,
    rentalCount: 35
  },
  {
    title: 'Project Hail Mary',
    author: 'Andy Weir',
    isbn: '978-0593135204',
    category: 'Fiction',
    publisher: 'Ballantine Books',
    publicationYear: 2021,
    language: 'English',
    description: 'Ryland Grace is the sole survivor on a desperate, last-chance mission—and if he fails, humanity and the earth itself are doomed. Except right now, he doesn\'t know that. He can\'t even remember his own name, let alone the nature of his assignment or how to complete it.',
    coverImage: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=800',
    rentalPrice: 60,
    securityDeposit: 140,
    rentalDurationDays: 14,
    totalCopies: 5,
    availableCopies: 5,
    averageRating: 4.9,
    numReviews: 18,
    tags: ['sci-fi', 'space', 'survival', 'science', 'humor'],
    featured: false,
    rentalCount: 27
  },
  {
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    isbn: '978-0060935467',
    category: 'Literature',
    publisher: 'Harper Perennial',
    publicationYear: 1960,
    language: 'English',
    description: 'The unforgettable novel of a childhood in a sleepy Southern town and the crisis of conscience that rocked it, To Kill a Mockingbird became an instant bestseller and a critical success when it was first published in 1960.',
    coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800',
    rentalPrice: 40,
    securityDeposit: 90,
    rentalDurationDays: 14,
    totalCopies: 5,
    availableCopies: 5,
    averageRating: 4.8,
    numReviews: 21,
    tags: ['classic', 'justice', 'coming-of-age', 'literature', 'american'],
    featured: false,
    rentalCount: 25
  },
  {
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    isbn: '978-0743273565',
    category: 'Literature',
    publisher: 'Scribner',
    publicationYear: 1925,
    language: 'English',
    description: 'The Great Gatsby, F. Scott Fitzgerald\'s third book, stands as the supreme achievement of his career. First published in 1925, this quintessential novel of the Jazz Age has been acclaimed by generations of readers.',
    coverImage: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&q=80&w=800',
    rentalPrice: 35,
    securityDeposit: 80,
    rentalDurationDays: 14,
    totalCopies: 6,
    availableCopies: 6,
    averageRating: 4.5,
    numReviews: 17,
    tags: ['classic', 'jazz age', 'wealth', 'tragedy', 'american dream'],
    featured: false,
    rentalCount: 30
  }
];

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/rentify';
    console.log(`[Seed] Connecting to MongoDB at ${mongoUri}...`);
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB.');

    // 1. Ensure Admin Account
    // Elevate user manshi@gmail.com to admin if present
    const existingManshi = await User.findOne({ email: 'manshi@gmail.com' });
    if (existingManshi) {
      existingManshi.role = 'admin';
      await existingManshi.save();
      console.log('[Seed] Updated manshi@gmail.com role to: ADMIN');
    }

    // Also ensure admin@rentify.com exists
    let adminUser = await User.findOne({ email: 'admin@rentify.com' });
    if (!adminUser) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      adminUser = await User.create({
        name: 'Rentify Admin',
        email: 'admin@rentify.com',
        password: hashedPassword,
        role: 'admin',
        phone: '+91 9876543210',
        address: { city: 'Bengaluru', state: 'Karnataka', zipCode: '560001', country: 'India' }
      });
      console.log('[Seed] Created default admin account: admin@rentify.com (password: admin123)');
    }

    // 2. Seed Books
    console.log('[Seed] Checking catalog books...');
    for (const bookData of sampleBooks) {
      let book = await Book.findOne({ title: bookData.title });
      if (!book) {
        book = await Book.create(bookData);
        console.log(`[Seed] Inserted book: "${book.title}"`);
      } else {
        // Update cover and fields
        Object.assign(book, bookData);
        await book.save();
      }

      // Generate physical copies
      await inventoryService.syncBookCopies(book._id);
    }

    // 3. Seed Sample Verified Reviews for popular books
    const sampleReviews = [
      {
        bookTitle: 'Atomic Habits: An Easy & Proven Way to Build Good Habits & Break Bad Ones',
        rating: 5,
        title: 'Life changing habits guide!',
        comment: 'Rented this for 2 weeks and finished it cover to cover. The 2-minute rule completely transformed my morning routine. Highly recommended to rent!'
      },
      {
        bookTitle: 'Designing Data-Intensive Applications',
        rating: 5,
        title: 'The bible for backend engineering',
        comment: 'Essential reading for any distributed systems engineer. Clean physical copy arrived in great condition from Rentify.'
      },
      {
        bookTitle: 'The Psychology of Money: Timeless lessons on wealth, greed, and happiness',
        rating: 5,
        title: 'Wisdom on every page',
        comment: 'No complicated math formulas, just profound insights on human behavior and wealth generation. Great book rental experience.'
      }
    ];

    const reviewer = existingManshi || adminUser;
    for (const rev of sampleReviews) {
      const targetBook = await Book.findOne({ title: rev.bookTitle });
      if (targetBook) {
        const existingRev = await Review.findOne({ user: reviewer._id, book: targetBook._id });
        if (!existingRev) {
          await Review.create({
            user: reviewer._id,
            book: targetBook._id,
            rating: rev.rating,
            title: rev.title,
            comment: rev.comment,
            isVerifiedRental: true
          });
          console.log(`[Seed] Added verified review for: "${targetBook.title}"`);
        }
      }
    }

    console.log('\n[Seed] Database seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
