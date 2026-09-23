const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Listing = require('../models/Listing');

dotenv.config({ path: require('path').resolve(__dirname, '../.env') });

const samplePeerListings = [
  // NOTES
  {
    title: 'Operating Systems Complete Handwritten Lecture Notes (Prof. Sharma CSE)',
    description: 'Detailed, chapter-by-chapter handwritten notes covering CPU Scheduling, Process Synchronization, Semaphores, Deadlocks, Virtual Memory, and File Systems. Includes diagrams and past viva questions.',
    category: 'Notes',
    type: 'Donate',
    price: 0,
    condition: 'Good',
    location: 'Campus Central Library Block B',
    image: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&q=80&w=600',
    status: 'Available',
    ownerEmail: 'priya@university.edu'
  },
  {
    title: 'Data Structures & Algorithms Handwritten Sheet + 150 LeetCode Patterns',
    description: 'Clean spiral-bound DSA notes with visual diagrams for Trees, Graphs, Dynamic Programming, Two-pointer techniques, and Greedy algorithms. Perfect for campus placements and semester exams.',
    category: 'Notes',
    type: 'Donate',
    price: 0,
    condition: 'New',
    location: 'Hostel 5 Common Study Room',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600',
    status: 'Available',
    ownerEmail: 'aarav@university.edu'
  },
  {
    title: 'Database Management Systems (DBMS) Comprehensive Class Notes & SQL Queries',
    description: 'Covers Relational Algebra, ER Modeling, Normalization up to BCNF, ACID properties, Concurrency Control, and complex SQL query examples with output tables.',
    category: 'Notes',
    type: 'Donate',
    price: 0,
    condition: 'Good',
    location: 'Main CSE Department Block A',
    image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=600',
    status: 'Available',
    ownerEmail: 'manshi@gmail.com'
  },
  {
    title: 'Computer Networks (CN) Protocol Flowcharts & GATE Quick-Revision Notes',
    description: 'Summary of Tanenbaum & Kurose textbook: OSI vs TCP/IP, Sliding Window Protocols, IPv4/IPv6 subnetting formulas, Routing Algorithms (Dijkstra, Bellman-Ford), and TCP handshake.',
    category: 'Notes',
    type: 'Donate',
    price: 0,
    condition: 'Good',
    location: 'North Campus Reading Room',
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=600',
    status: 'Available',
    ownerEmail: 'sneha@university.edu'
  },
  {
    title: 'Machine Learning & Deep Learning Formula Sheet & PyTorch Cheatsheet',
    description: 'Concise review of Supervised vs Unsupervised ML, Linear & Logistic Regression derivations, SVM kernels, Decision Trees, Backpropagation formulas, and CNN architectures.',
    category: 'Notes',
    type: 'Donate',
    price: 0,
    condition: 'New',
    location: 'AI Lab Block 3, Desk 12',
    image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=600',
    status: 'Available',
    ownerEmail: 'aarav@university.edu'
  },
  {
    title: 'Compiler Design Complete Handwritten Notes (Lex, Yacc & Parsing Tables)',
    description: 'Step-by-step guidance on Lexical Analysis, LL(1) and LR(1) Parser Table construction, Operator Precedence, Syntax-Directed Translation, and Three-Address Code generation.',
    category: 'Notes',
    type: 'Donate',
    price: 0,
    condition: 'Good',
    location: 'Student Activity Center Desk 2',
    image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=600',
    status: 'Available',
    ownerEmail: 'rohan@university.edu'
  },
  {
    title: 'Discrete Mathematics & Graph Theory Theorem Proofs & Summary',
    description: 'Propositional logic, Set theory, Relations, Pigeonhole principle, Recurrence relations, Graph isomorphism, and Euler/Hamiltonian path theorem proofs neatly written.',
    category: 'Notes',
    type: 'Donate',
    price: 0,
    condition: 'Good',
    location: 'Central Library 1st Floor',
    image: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=600',
    status: 'Available',
    ownerEmail: 'manshi@gmail.com'
  },

  // PYQs (Previous Year Questions)
  {
    title: 'DBMS End-Semester Question Papers with Solved Answer Keys (2019–2024)',
    description: 'Complete collection of the last 5 years of university semester examination question papers for Database Management Systems, featuring step-by-step solutions for ER normalization and relational calculus.',
    category: 'PYQ',
    type: 'Donate',
    price: 0,
    condition: 'New',
    location: 'CSE Dept Ground Floor Notice Board Area',
    image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=600',
    status: 'Available',
    ownerEmail: 'priya@university.edu'
  },
  {
    title: 'Operating Systems Mid-Sem & End-Sem Solved Papers (Last 5 Years)',
    description: 'Actual university exam papers with model answers for Banker\'s Algorithm, Page Replacement problems (FIFO, LRU, Optimal), and Disk Scheduling algorithms (SSTF, SCAN, C-LOOK).',
    category: 'PYQ',
    type: 'Donate',
    price: 0,
    condition: 'Good',
    location: 'Hostel 3 Common Room',
    image: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?auto=format&fit=crop&q=80&w=600',
    status: 'Available',
    ownerEmail: 'aarav@university.edu'
  },
  {
    title: 'Engineering Mathematics III Solved Question Bank (All 5 Units)',
    description: 'Solved papers covering Laplace Transforms, Fourier Series, Partial Differential Equations, Complex Integration, and Probability Distributions. Solved step-by-step.',
    category: 'PYQ',
    type: 'Donate',
    price: 0,
    condition: 'New',
    location: 'Campus Central Library Desk 4',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=600',
    status: 'Available',
    ownerEmail: 'manshi@gmail.com'
  },
  {
    title: 'Computer Organization & Architecture (COA) Past 4 Years Exam Papers Solved',
    description: 'Fully answered numericals on Cache Mapping (Direct, Associative, Set-Associative), Booth\'s Multiplication, Pipelining hazards, and Microprogrammed Control Units.',
    category: 'PYQ',
    type: 'Donate',
    price: 0,
    condition: 'Good',
    location: 'ECE Seminar Hall Entrance',
    image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&q=80&w=600',
    status: 'Available',
    ownerEmail: 'rohan@university.edu'
  },
  {
    title: 'Object-Oriented Programming (Java & C++) Previous Years Exam Papers & Solutions',
    description: 'Covers Polymorphism, Inheritance, Exception Handling, Multi-threading code snippets, and Java Collections Framework questions with commented Java source code.',
    category: 'PYQ',
    type: 'Donate',
    price: 0,
    condition: 'Good',
    location: 'Student Activity Center Block 1',
    image: 'https://images.unsplash.com/photo-1532012164546-f432f2e37b73?auto=format&fit=crop&q=80&w=600',
    status: 'Available',
    ownerEmail: 'sneha@university.edu'
  },

  // PEER STUDENT BOOKS
  {
    title: 'Operating System Concepts (Silberschatz, Galvin & Gagne, 9th Edition)',
    description: 'Original dinosaur textbook in good physical condition. Used for 1 semester. Very clean with minimal pencil markings. Ideal for 4th semester CSE/IT students.',
    category: 'Book',
    type: 'Rent',
    price: 35,
    condition: 'Good',
    location: 'Boys Hostel 4, Room 218',
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600',
    status: 'Available',
    ownerEmail: 'aarav@university.edu'
  },
  {
    title: 'Introduction to Algorithms (CLRS 3rd Edition - Paperback)',
    description: 'The definitive textbook on algorithms by Cormen, Leiserson, Rivest, and Stein. Complete with all chapters intact, stiff binding, and clear print.',
    category: 'Book',
    type: 'Rent',
    price: 50,
    condition: 'Good',
    location: 'CSE Block B Library Gate',
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600',
    status: 'Available',
    ownerEmail: 'manshi@gmail.com'
  },
  {
    title: 'Database System Concepts (Korth & Sudarshan, 6th Edition)',
    description: 'Free donation for junior students! A classic reference textbook for relational database design, query processing, and transaction management.',
    category: 'Book',
    type: 'Donate',
    price: 0,
    condition: 'Fair',
    location: 'North Campus Gate 1',
    image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=600',
    status: 'Available',
    ownerEmail: 'priya@university.edu'
  }
];

const seedPeerNotes = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/rentify';
    console.log(`[Seed Peer Notes] Connecting to ${mongoUri}...`);
    await mongoose.connect(mongoUri);

    // 1. Ensure student contributor accounts exist
    const studentUsers = [
      { name: 'Priya Patel (IT Sem 6)', email: 'priya@university.edu', role: 'user' },
      { name: 'Aarav Sharma (CSE Sem 7)', email: 'aarav@university.edu', role: 'user' },
      { name: 'Rohan Verma (ECE Sem 5)', email: 'rohan@university.edu', role: 'user' },
      { name: 'Sneha Rao (AI & DS Sem 5)', email: 'sneha@university.edu', role: 'user' }
    ];

    const userMap = {};

    // Get manshi
    const manshi = await User.findOne({ email: 'manshi@gmail.com' });
    if (manshi) {
      userMap['manshi@gmail.com'] = manshi._id;
    }

    const salt = await bcrypt.genSalt(10);
    const defaultPassword = await bcrypt.hash('password123', salt);

    for (const su of studentUsers) {
      let u = await User.findOne({ email: su.email });
      if (!u) {
        u = await User.create({
          name: su.name,
          email: su.email,
          password: defaultPassword,
          role: 'user',
          phone: '+91 9876543210',
          address: { city: 'Bengaluru', state: 'Karnataka', zipCode: '560001', country: 'India' }
        });
        console.log(`[Seed Peer Notes] Created user: ${su.name} (${su.email})`);
      }
      userMap[su.email] = u._id;
    }

    // Default fallback owner
    const fallbackOwner = manshi?._id || Object.values(userMap)[0];

    // 2. Clear previous listings or seed fresh ones
    await Listing.deleteMany({});
    console.log('[Seed Peer Notes] Cleared existing listings.');

    // 3. Insert listings
    for (const item of samplePeerListings) {
      const ownerId = userMap[item.ownerEmail] || fallbackOwner;
      await Listing.create({
        title: item.title,
        description: item.description,
        category: item.category,
        type: item.type,
        price: item.price,
        condition: item.condition,
        location: item.location,
        image: item.image,
        status: item.status,
        owner: ownerId
      });
      console.log(`[Seed Peer Notes] Added: [${item.category}] "${item.title.slice(0, 45)}..."`);
    }

    const totalCount = await Listing.countDocuments();
    console.log(`\n🎉 [Seed Peer Notes] Success! Inserted ${totalCount} peer study notes, PYQs, and textbooks.`);
    process.exit(0);
  } catch (error) {
    console.error('[Seed Peer Notes Error]:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedPeerNotes();
}

module.exports = seedPeerNotes;
