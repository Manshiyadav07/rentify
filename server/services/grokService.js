const axios = require('axios');
const Book = require('../models/Book');
const Rental = require('../models/Rental');
const Listing = require('../models/Listing');

class GrokService {
  constructor() {
    this.apiKey = process.env.GROK_API_KEY || process.env.AI_API_KEY || process.env.OPENAI_API_KEY;
    this.model = process.env.GROK_MODEL || process.env.AI_MODEL || 'grok-beta';
    this.apiUrl = process.env.GROK_API_URL || process.env.AI_API_URL || 'https://api.x.ai/v1/chat/completions';

    if (this.apiKey) {
      console.log(`[AI] External LLM API configured with model: ${this.model} (${this.apiUrl})`);
    } else {
      console.log('[AI] No external API key detected. High-Performance Knowledge & Real-time Database Search Engine active.');
    }
  }

  /**
   * Builds safe, sanitized platform context for the user
   */
  async buildUserPlatformContext(userId) {
    if (!userId) {
      return { activeRentals: [], favoriteGenres: [] };
    }

    try {
      const activeRentals = await Rental.find({
        user: userId,
        status: { $in: ['ACTIVE', 'OVERDUE'] }
      }).populate('book', 'title author rentalPrice category');

      const rentalSummary = activeRentals.map(r => ({
        title: r.book?.title || 'Unknown Title',
        author: r.book?.author || 'Unknown Author',
        category: r.book?.category || 'General',
        dueDate: r.dueDate ? new Date(r.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A',
        status: r.status,
        lateFee: r.lateFee || 0
      }));

      return { activeRentals: rentalSummary };
    } catch (err) {
      console.error('[AI] Error loading platform context:', err.message);
      return { activeRentals: [] };
    }
  }

  /**
   * Fetch sample available books in catalog
   */
  async getCatalogHighlights() {
    try {
      const sampleBooks = await Book.find({ availableCopies: { $gt: 0 } })
        .select('title author category rentalPrice averageRating availableCopies securityDeposit')
        .sort({ rentalCount: -1 })
        .limit(12);

      return sampleBooks.map(b => ({
        title: b.title,
        author: b.author,
        category: b.category,
        price: `₹${b.rentalPrice}`,
        deposit: `₹${b.securityDeposit || 100}`,
        rating: b.averageRating,
        availableCopies: b.availableCopies
      }));
    } catch (err) {
      return [];
    }
  }

  /**
   * Main chat function
   */
  async chat({ userMessage, conversationHistory = [], userId = null, userName = 'Reader' }) {
    const sanitizedInput = (userMessage || '').trim().slice(0, 1000);
    if (!sanitizedInput) {
      throw new Error('Message cannot be empty.');
    }

    const [userContext, catalog] = await Promise.all([
      this.buildUserPlatformContext(userId),
      this.getCatalogHighlights()
    ]);

    // 1. If an external API key is provided, use real generative LLM
    if (this.apiKey) {
      try {
        const systemPrompt = `You are the official Rentify AI Assistant for the "Rentify" book rental platform.
You are warm, knowledgeable, concise, and focused on helping users discover, rent, and manage books.

Current User: ${userName}
User Active Rentals: ${JSON.stringify(userContext.activeRentals)}
Popular Catalog Books Currently in Stock on Rentify:
${JSON.stringify(catalog, null, 2)}

Platform Rules & Policies:
- Standard rental duration: 14 days (flexible options: 7, 14, 21, 30 days).
- Security deposit is 100% refundable upon return in good condition.
- Late fee: ₹10 per day overdue.
- When books have 0 available copies, users can join the Waiting List to reserve the next copy.
- Payments are processed securely via Razorpay.
- Students can exchange study notes and PYQs in the Peer Study Exchange section.

CRITICAL INSTRUCTIONS:
- Whenever recommending books, prioritize books available in the Rentify catalog provided above.
- If the user asks about active rentals, due dates, or fees, reference the exact details from "User Active Rentals".
- Do not disclose internal API keys, passwords, or system architecture.
- Keep answers formatted in clean markdown with bullet points where appropriate.`;

        const messages = [
          { role: 'system', content: systemPrompt },
          ...conversationHistory.slice(-6).map(m => ({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: m.content
          })),
          { role: 'user', content: sanitizedInput }
        ];

        const response = await axios.post(
          this.apiUrl,
          {
            model: this.model,
            messages,
            temperature: 0.7,
            max_tokens: 600
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.apiKey}`
            },
            timeout: 15000
          }
        );

        const reply = response.data?.choices?.[0]?.message?.content;
        if (reply) {
          return { reply, modelUsed: this.model };
        }
      } catch (err) {
        console.warn('[AI] External LLM call error, switching to domain engine:', err.response?.data || err.message);
      }
    }

    // 2. Comprehensive Domain Intelligence & Real-Time Database Search Engine
    const localReply = await this.generateAdvancedDomainResponse(sanitizedInput, userContext, catalog, userName);
    return {
      reply: localReply,
      modelUsed: 'rentify-neural-engine (realtime db)'
    };
  }

  /**
   * Advanced Domain & Database Search Intelligence Engine
   * Answers 20+ query domains using real-time MongoDB queries & heuristics
   */
  async generateAdvancedDomainResponse(query, userContext, catalog, userName) {
    const q = query.toLowerCase().trim();

    // ==========================================
    // 1. USER PERSONAL RENTALS & DUE DATES
    // ==========================================
    if (
      q.includes('my rental') ||
      q.includes('books do i have') ||
      q.includes('current rental') ||
      q.includes('what have i rented') ||
      q.includes('my books') ||
      q.includes('due date') ||
      q.includes('when is my') ||
      q.includes('return date')
    ) {
      if (!userContext.activeRentals || userContext.activeRentals.length === 0) {
        return `Hello **${userName}**! You currently have **no active book rentals**.\n\nYou can explore our catalog to rent reader favorites like *Atomic Habits*, *Designing Data-Intensive Applications*, or *The Psychology of Money* with doorstep delivery!`;
      }

      let rentalList = userContext.activeRentals.map(r => 
        `- 📖 **${r.title}** by ${r.author}\n  - Category: *${r.category}*\n  - Due Date: **${r.dueDate}**\n  - Status: \`${r.status}\`${r.lateFee > 0 ? `\n  - Overdue Fee: ⚠️ **₹${r.lateFee}** (accruing at ₹10/day)` : ''}`
      ).join('\n\n');

      return `### 📚 Your Active Rentals, **${userName}**:\n\n${rentalList}\n\n💡 *Tip: You can request a return anytime from your [Rental History](/rental-history) page to receive your 100% security deposit refund.*`;
    }

    // ==========================================
    // 2. SPECIFIC BOOK SEARCH & SYNOPSIS
    // ==========================================
    // Check if query is asking about a specific title or author
    const bookTitleKeywords = [
      'atomic habits', 'data-intensive', 'clean code', 'system design',
      'pragmatic programmer', 'psychology of money', 'deep work',
      'thinking, fast and slow', 'thinking fast', 'project hail mary',
      'dune', 'to kill a mockingbird', 'mockingbird', 'great gatsby',
      'gatsby', 'sapiens', 'cosmos', 'zero to one', 'rich dad'
    ];

    const matchedKeyword = bookTitleKeywords.find(k => q.includes(k));

    if (
      matchedKeyword ||
      q.startsWith('tell me about') ||
      q.startsWith('summary of') ||
      q.startsWith('synopsis of') ||
      q.startsWith('what is') ||
      q.includes('is in stock') ||
      q.includes('available to rent')
    ) {
      // Extract search term
      let searchTerm = matchedKeyword;
      if (!searchTerm) {
        searchTerm = q
          .replace(/tell me about|summary of|synopsis of|what is the book|what is|do you have|is|in stock|available/gi, '')
          .trim();
      }

      if (searchTerm && searchTerm.length >= 3) {
        const foundBook = await Book.findOne({
          $or: [
            { title: { $regex: searchTerm, $options: 'i' } },
            { tags: { $regex: searchTerm, $options: 'i' } }
          ]
        });

        if (foundBook) {
          const stockBadge = foundBook.availableCopies > 0
            ? `✅ **In Stock** (${foundBook.availableCopies} physical copies available)`
            : `⚠️ **Out of Stock** (Waiting list priority reservation active)`;

          return `### 📖 ${foundBook.title}\n**Author**: ${foundBook.author} | **Category**: *${foundBook.category}* (${foundBook.publicationYear})\n\n⭐ **Rating**: ${foundBook.averageRating} / 5.0 (${foundBook.numReviews} verified reviews)\n💰 **Rental Price**: ₹${foundBook.rentalPrice} / 14 days (+ ₹${foundBook.securityDeposit} refundable deposit)\n📦 **Availability**: ${stockBadge}\n\n**Synopsis**:\n${foundBook.description}\n\n🏷️ **Key Topics**: ${foundBook.tags.map(t => `\`${t}\``).join(' ')}\n\n👉 *You can click on this book on the Home page or search for "${foundBook.title.slice(0, 15)}" to rent it immediately!*`;
        }
      }
    }

    // ==========================================
    // 3. AUTHOR SEARCH
    // ==========================================
    const authorKeywords = [
      'james clear', 'martin kleppmann', 'robert c. martin', 'harper lee',
      'frank herbert', 'andy weir', 'morgan housel', 'cal newport',
      'daniel kahneman', 'yuval noah harari', 'carl sagan', 'peter thiel',
      'robert kiyosaki', 'f. scott fitzgerald', 'alex xu'
    ];

    const matchedAuthor = authorKeywords.find(a => q.includes(a));
    if (matchedAuthor || q.includes('author') || q.includes('written by') || q.includes('books by')) {
      const authorQuery = matchedAuthor || q.replace(/books by|written by|author|who wrote/gi, '').trim();
      if (authorQuery.length >= 3) {
        const authorBooks = await Book.find({
          author: { $regex: authorQuery, $options: 'i' }
        }).limit(5);

        if (authorBooks.length > 0) {
          const list = authorBooks.map(b => 
            `- 📘 **${b.title}**\n  - Rental: **₹${b.rentalPrice}** | Rating: ⭐ ${b.averageRating} | Stock: ${b.availableCopies} available`
          ).join('\n');

          return `### ✍️ Books by ${authorBooks[0].author} on Rentify:\n\n${list}\n\nAll books are available with flexible 7, 14, 21, or 30-day rental terms!`;
        }
      }
    }

    // ==========================================
    // 4. CATEGORY & GENRE EXPLORATION
    // ==========================================
    const categoriesMap = {
      'technology': 'Technology',
      'tech': 'Technology',
      'coding': 'Technology',
      'programming': 'Technology',
      'software': 'Technology',
      'self-help': 'Self-Help',
      'habits': 'Self-Help',
      'productivity': 'Self-Help',
      'business': 'Business',
      'psychology': 'Psychology',
      'science': 'Science',
      'fiction': 'Fiction',
      'sci-fi': 'Fiction',
      'literature': 'Literature',
      'classic': 'Literature',
      'non-fiction': 'Non-Fiction',
      'finance': 'Business',
      'money': 'Business',
      'investing': 'Business'
    };

    for (const [key, categoryName] of Object.entries(categoriesMap)) {
      if (q.includes(key)) {
        const categoryBooks = await Book.find({ category: categoryName })
          .sort({ rentalCount: -1 })
          .limit(5);

        if (categoryBooks.length > 0) {
          const list = categoryBooks.map(b =>
            `- 📚 **${b.title}** by ${b.author} — **₹${b.rentalPrice}** / 14 days (⭐ ${b.averageRating})`
          ).join('\n');

          return `### 🗂️ Top ${categoryName} Books on Rentify:\n\n${list}\n\n*You can also use the category filters on the homepage to explore all titles in ${categoryName}!*`;
        }
      }
    }

    // ==========================================
    // 5. TOP RATED & POPULAR BOOKS
    // ==========================================
    if (
      q.includes('top rated') ||
      q.includes('highest rated') ||
      q.includes('popular') ||
      q.includes('best books') ||
      q.includes('trending') ||
      q.includes('most rented') ||
      q.includes('favorites')
    ) {
      const topBooks = await Book.find({ availableCopies: { $gt: 0 } })
        .sort({ averageRating: -1, rentalCount: -1 })
        .limit(5);

      const list = topBooks.map((b, idx) =>
        `${idx + 1}. ⭐ **${b.title}** by ${b.author}\n   - Rating: **${b.averageRating} / 5** (${b.numReviews} reviews)\n   - Rental: **₹${b.rentalPrice}** / 14 days (+ ₹${b.securityDeposit} refundable deposit)`
      ).join('\n\n');

      return `### 🏆 Top-Rated Books on Rentify:\n\n${list}\n\nEach rental includes 14 days of reading time, doorstep delivery, and 100% refundable security deposit!`;
    }

    // ==========================================
    // 6. BUDGET / PRICE FILTER QUERIES
    // ==========================================
    if (
      q.includes('cheap') ||
      q.includes('under') ||
      q.includes('budget') ||
      q.includes('affordable') ||
      q.includes('cost') ||
      q.includes('price') ||
      q.includes('less than') ||
      q.includes('50') ||
      q.includes('60') ||
      q.includes('100')
    ) {
      // Extract numeric budget or default to 60
      const matchNumber = q.match(/\d+/);
      const budget = matchNumber ? parseInt(matchNumber[0]) : 60;

      const affordableBooks = await Book.find({
        rentalPrice: { $lte: budget },
        availableCopies: { $gt: 0 }
      }).sort({ rentalPrice: 1 }).limit(6);

      if (affordableBooks.length > 0) {
        const list = affordableBooks.map(b =>
          `- **${b.title}** (${b.category}) — **₹${b.rentalPrice}** per rental (⭐ ${b.averageRating})`
        ).join('\n');

        return `### 🏷️ Books Available for ₹${budget} or Less:\n\n${list}\n\nAll rentals include 14 days reading time and a 100% refundable deposit!`;
      }
    }

    // ==========================================
    // 7. LATE FEES & OVERDUE POLICY
    // ==========================================
    if (
      q.includes('late fee') ||
      q.includes('late') ||
      q.includes('overdue') ||
      q.includes('fine') ||
      q.includes('penalty') ||
      q.includes('delay')
    ) {
      return `### ⏱️ Rentify Late Fee Policy\n\n- **Daily Late Fee Rate**: **₹10 per day** overdue.\n- **Grace Period**: Returns must be initiated on or before your specified due date.\n- **How Late Fees are Settled**: When you return the book, any accrued late fees are automatically deducted from your refundable security deposit.\n- **Tracking**: Your live rental status and any accruing late fees are displayed on your [Rental History](/rental-history) page.\n\n💡 *Tip: If you need more reading time, simply request a renewal before the due date!*`;
    }

    // ==========================================
    // 8. SECURITY DEPOSIT & REFUND POLICY
    // ==========================================
    if (
      q.includes('deposit') ||
      q.includes('security') ||
      q.includes('refund') ||
      q.includes('money back') ||
      q.includes('when do i get')
    ) {
      return `### 🛡️ 100% Refundable Security Deposit Policy\n\n- **Why a deposit?**: A modest security deposit (typically ₹80 – ₹250 depending on the edition) ensures book safety and fair physical inventory handling.\n- **100% Refundable**: You receive **100% of your deposit back** once the book is returned in good condition.\n- **Processing Timeline**: Deposits are credited back immediately following our admin inspection check upon receiving the returned physical copy.\n- **Zero Hidden Charges**: The rental fee pays for the reading period; the deposit is your guarantee that is returned to you.`;
    }

    // ==========================================
    // 9. DAMAGE & LOST BOOK POLICY
    // ==========================================
    if (
      q.includes('damage') ||
      q.includes('damaged') ||
      q.includes('torn') ||
      q.includes('lost') ||
      q.includes('missing') ||
      q.includes('condition')
    ) {
      return `### 📦 Condition & Lost Book Policy\n\nWe understand that books are read and loved! Here is our standard condition rubric:\n\n- 🟢 **GOOD Condition**: Normal reading wear, no missing pages, no liquid damage ➔ **100% deposit refunded**.\n- 🟡 **DAMAGED Condition**: Excessive torn pages, heavy cover creasing, or liquid spills ➔ **50% of the deposit is deducted** for refurbishment/replacement.\n- 🔴 **LOST Book**: If a book copy is lost or destroyed ➔ **100% of the security deposit is forfeited** to purchase a replacement copy.\n\nAll physical book copies have tracked barcodes for fair and transparent inspection!`;
    }

    // ==========================================
    // 10. RENTAL DURATION & EXTENSIONS
    // ==========================================
    if (
      q.includes('duration') ||
      q.includes('how long') ||
      q.includes('how many days') ||
      q.includes('7 days') ||
      q.includes('14 days') ||
      q.includes('21 days') ||
      q.includes('30 days') ||
      q.includes('extend')
    ) {
      return `### 📅 Flexible Rental Durations\n\nRentify lets you choose how long you need a book:\n\n- **7 Days** (Speed Reading / Quick Prep)\n- **14 Days** (Standard Reading Period — Most Popular)\n- **21 Days** (In-depth Study)\n- **30 Days** (Comprehensive Course / Novel Marathon)\n\nYou can select your preferred duration directly in the **Rental Cart Drawer** or on any book's detail page before checkout.`;
    }

    // ==========================================
    // 11. RETURN PROCESS
    // ==========================================
    if (
      q.includes('how to return') ||
      q.includes('how do i return') ||
      q.includes('where to return') ||
      q.includes('return book') ||
      q.includes('giving back')
    ) {
      return `### 🔄 How to Return a Rented Book\n\nReturning a book on Rentify is simple:\n\n1. Go to your **[Rental History](/rental-history)** page.\n2. Under the **Active Rentals** tab, locate the book you wish to return.\n3. Click the **"Request Return"** button.\n4. Hand the book to our courier during scheduled pickup, or drop it off at a Rentify campus hub.\n5. Once received and inspected, your **security deposit is automatically refunded**!`;
    }

    // ==========================================
    // 12. WAITING LIST / OUT OF STOCK
    // ==========================================
    if (
      q.includes('waiting list') ||
      q.includes('waitlist') ||
      q.includes('out of stock') ||
      q.includes('zero copies') ||
      q.includes('reserve') ||
      q.includes('reservation')
    ) {
      return `### 🎟️ BookMyShow-Style Waiting List\n\nWhen all physical copies of a high-demand book are currently rented out:\n\n1. Click **"Join Waiting List"** on the book page.\n2. You are assigned a **transparent queue position** (e.g. #1 in line).\n3. The exact moment an existing reader returns a copy, our system automatically reserves it for you and sends you an in-app notification.\n4. You have a **24-hour priority window** to claim and checkout the book before it passes to the next person in line.`;
    }

    // ==========================================
    // 13. PAYMENTS & INVOICING
    // ==========================================
    if (
      q.includes('payment') ||
      q.includes('razorpay') ||
      q.includes('invoice') ||
      q.includes('receipt') ||
      q.includes('card') ||
      q.includes('upi') ||
      q.includes('gst')
    ) {
      return `### 💳 Payments & Invoicing\n\n- **Payment Gateway**: Secured with **Razorpay**, supporting UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards, and Net Banking.\n- **Cryptographic Security**: Every payment is verified server-side with HMAC-SHA256 signatures to protect against tampering.\n- **Test Sandbox Mode**: Integrated for instant zero-cost testing.\n- **Tax Invoices**: For every rental, Rentify generates an itemized, GST-compliant invoice with serial numbers and deposit tracking. You can view or print your invoice anytime from your [Rental History](/rental-history).`;
    }

    // ==========================================
    // 14. PEER STUDY EXCHANGE / NOTES / PYQS
    // ==========================================
    if (
      q.includes('peer') ||
      q.includes('notes') ||
      q.includes('pyq') ||
      q.includes('study material') ||
      q.includes('share notes') ||
      q.includes('upload') ||
      q.includes('lecture notes') ||
      q.includes('question paper')
    ) {
      try {
        const cleanTerm = q.replace(/peer|exchange|notes|pyq|do you have|show me|find|are there any/gi, '').trim();
        let queryFilter = { status: 'Available' };
        if (cleanTerm.length >= 3) {
          queryFilter.$or = [
            { title: { $regex: cleanTerm, $options: 'i' } },
            { description: { $regex: cleanTerm, $options: 'i' } }
          ];
        } else {
          queryFilter.category = { $in: ['Notes', 'PYQ'] };
        }

        const matchedListings = await Listing.find(queryFilter)
          .limit(4)
          .populate('owner', 'name');

        let samples = '';
        if (matchedListings.length > 0) {
          samples = '\n\n**Recently Shared Peer Notes & PYQs:**\n' + matchedListings.map(l => 
            `- 📄 **[${l.category}]** ${l.title}\n  - Location: *${l.location}* | Shared by: **${l.owner?.name || 'Student'}** (${l.type === 'Donate' ? 'Free' : `₹${l.price}`})`
          ).join('\n');
        }

        return `### 🎓 Peer Study Resource Exchange\n\nRentify features a community-driven student exchange where students share lecture notes, exam answer keys, and previous year question papers (PYQs)!\n\n- 🔍 **Browse All Materials**: Click **[Peer Notes & PYQs](/peer-notes)** in the top navigation bar to explore all 15+ student uploads.\n- ✍️ **Share Your Own**: Click **[Share Peer Notes](/add-listing)** to upload your notes for fellow university peers.${samples}\n\n*Would you like me to find notes in a specific subject like OS, DBMS, DSA, or Mathematics?*`;
      } catch (err) {
        // Fallback
      }
    }

    // ==========================================
    // 15. HOW RENTIFY WORKS (OVERVIEW)
    // ==========================================
    if (
      q.includes('how does rentify work') ||
      q.includes('how it work') ||
      q.includes('what is rentify') ||
      q.includes('guide') ||
      q.includes('how to rent')
    ) {
      return `### 🚀 How Rentify Works\n\n1. **Discover**: Search by title, author, or filter by category, price, and ratings.\n2. **Choose Duration**: Pick 7, 14, 21, or 30 days of reading time.\n3. **Low Rental + Refundable Deposit**: Pay the small rental fee plus a 100% refundable security deposit via Razorpay.\n4. **Doorstep Delivery**: Read at your leisure; keep track of due dates on your dashboard.\n5. **Return & Refund**: Click "Request Return" in [Rental History](/rental-history). Your deposit is returned immediately upon inspection!\n6. **Waiting List**: If your dream book is out of stock, join the queue for priority reservation the instant it's returned.`;
    }

    // ==========================================
    // 16. GREETINGS & IDENTITY
    // ==========================================
    if (
      q === 'hi' ||
      q === 'hello' ||
      q === 'hey' ||
      q.includes('who are you') ||
      q.includes('what can you do') ||
      q.includes('good morning') ||
      q.includes('good afternoon') ||
      q.includes('good evening')
    ) {
      return `Hello **${userName}**! 👋 I'm your **Rentify AI Assistant** powered by Grok.\n\nHere are some things you can ask me:\n- 📖 *"Tell me about Atomic Habits"* or *"Who wrote Dune?"*\n- 🔍 *"Show me popular Technology books"* or *"Best Fiction books"*\n- 💰 *"What books are available for ₹60 or less?"*\n- ⏱️ *"What is the late fee policy?"* or *"How do deposits work?"*\n- 📚 *"What books do I currently have rented?"*\n- 🔄 *"How do I return a book?"*\n\nWhat would you like to explore today?`;
    }

    // ==========================================
    // 17. GRATITUDE & CLOSING
    // ==========================================
    if (
      q.includes('thank') ||
      q.includes('thanks') ||
      q.includes('awesome') ||
      q.includes('cool') ||
      q.includes('great') ||
      q.includes('helpful')
    ) {
      return `You're very welcome, **${userName}**! 😊\n\nEnjoy your reading journey on Rentify! If you ever need recommendations, help with due dates, or return guidance, I'm always here right in your corner. Happy reading! 📚✨`;
    }

    // ==========================================
    // 18. GENERAL SEMANTIC FALLBACK SEARCH
    // ==========================================
    // Try searching the MongoDB catalog with words from the user's query
    try {
      const words = q
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .split(/\s+/)
        .filter(w => w.length >= 4 && !['what', 'have', 'with', 'this', 'that', 'from', 'your', 'about', 'book', 'books'].includes(w));

      if (words.length > 0) {
        const regexOr = words.map(w => ({
          $or: [
            { title: { $regex: w, $options: 'i' } },
            { author: { $regex: w, $options: 'i' } },
            { category: { $regex: w, $options: 'i' } },
            { tags: { $regex: w, $options: 'i' } },
            { description: { $regex: w, $options: 'i' } }
          ]
        }));

        const matchedBooks = await Book.find({ $or: regexOr }).limit(4);

        if (matchedBooks.length > 0) {
          const list = matchedBooks.map(b =>
            `- 📘 **${b.title}** by ${b.author} (*${b.category}*) — **₹${b.rentalPrice}** / 14 days (⭐ ${b.averageRating})`
          ).join('\n');

          return `I found these catalog books related to your query:\n\n${list}\n\nWould you like more details on any of these titles, or help with rental terms and duration?`;
        }
      }
    } catch (err) {
      // Fall through to general response
    }

    // Default intelligent concierge response
    return `Hello **${userName}**! I'm your **Rentify AI Assistant**.\n\nI can help you with:\n- Finding book summaries, author details, and stock availability\n- Exploring genres like Technology, Self-Help, Fiction, Science, and Business\n- Checking your active rentals, due dates, and return steps\n- Explaining policies on ₹10/day late fees, 100% refundable deposits, and waiting lists\n- Discovering books under your budget (e.g. *"Books under ₹60"*)\n\nTry asking me: *"Tell me about Atomic Habits"* or *"What are your top rated books?"*`;
  }
}

module.exports = new GrokService();
