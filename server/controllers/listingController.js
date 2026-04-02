const Listing = require('../models/Listing');

// @route   GET /api/listings
const getAllListings = async (req, res) => {
  try {
    const { category, type, status, search, minPrice, maxPrice } = req.query;

    let filter = {};

    if (category) filter.category = category;
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (search) filter.title = { $regex: search, $options: 'i' };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const listings = await Listing.find(filter)
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });

    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/listings/:id
const getListingById = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate('owner', 'name email');

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    res.json(listing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   POST /api/listings  (protected)
const createListing = async (req, res) => {
  try {
    const { title, description, category, type, price, condition, location, image } = req.body;

    const listing = await Listing.create({
      title,
      description,
      category,
      type,
      price: type === 'Donate' ? 0 : price,
      condition,
      location,
      image,
      owner: req.user._id     // comes from auth middleware
    });

    res.status(201).json(listing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/listings/user/:userId  (protected)
const getUserListings = async (req, res) => {
  try {
    const listings = await Listing.find({ owner: req.params.userId })
      .sort({ createdAt: -1 });

    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   DELETE /api/listings/:id  (protected)
const deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Only owner can delete
    if (listing.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this listing' });
    }

    await listing.deleteOne();
    res.json({ message: 'Listing deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   PATCH /api/listings/:id/status  (protected)
const updateListingStatus = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (listing.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    listing.status = req.body.status;
    await listing.save();

    res.json(listing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllListings,
  getListingById,
  createListing,
  getUserListings,
  deleteListing,
  updateListingStatus
};