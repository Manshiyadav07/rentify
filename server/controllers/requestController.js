const Request = require('../models/Request');
const Listing = require('../models/Listing');

// POST /api/requests
const createRequest = async (req, res) => {
  try {
    const { listingId, message, rentalDays } = req.body;

    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });

    if (listing.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "You can't request your own listing" });
    }

    const existing = await Request.findOne({
      listing: listingId,
      requester: req.user._id
    });
    if (existing) {
      return res.status(400).json({ message: 'You already sent a request for this listing' });
    }

    // Only validate rentalDays for Rent type
    if (listing.type === 'Rent' && (!rentalDays || rentalDays < 1)) {
      return res.status(400).json({ message: 'Please specify rental duration in days' });
    }

    const request = await Request.create({
      listing: listingId,
      requester: req.user._id,
      owner: listing.owner,
      message,
      rentalDays: listing.type === 'Rent' ? rentalDays : null
    });

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/requests/owner
const getOwnerRequests = async (req, res) => {
  try {
    const requests = await Request.find({ owner: req.user._id })
      .populate('listing', 'title category type price')
      .populate('requester', 'name email')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/requests/my
const getMyRequests = async (req, res) => {
  try {
    const requests = await Request.find({ requester: req.user._id })
      .populate('listing', 'title category type price status')
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/requests/:id — Accept sets startDate and returnDate
const updateRequestStatus = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    if (request.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    request.status = req.body.status;

    // Set dates when accepted
    if (req.body.status === 'Accepted' && request.rentalDays) {
      request.startDate = new Date()
      const returnDate = new Date()
      returnDate.setDate(returnDate.getDate() + request.rentalDays)
      request.returnDate = returnDate
    }

    await request.save();

    if (req.body.status === 'Accepted') {
      await Listing.findByIdAndUpdate(request.listing, { status: 'Taken' });
      await Request.updateMany(
        { listing: request.listing, _id: { $ne: request._id }, status: 'Pending' },
        { status: 'Rejected' }
      );
    }

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/requests/check/:listingId
const checkRequest = async (req, res) => {
  try {
    const request = await Request.findOne({
      listing: req.params.listingId,
      requester: req.user._id
    });
    res.json({
      requested: !!request,
      status: request?.status || null,
      rentalDays: request?.rentalDays || null,
      returnDate: request?.returnDate || null,
      startDate: request?.startDate || null
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createRequest,
  getOwnerRequests,
  getMyRequests,
  updateRequestStatus,
  checkRequest
};