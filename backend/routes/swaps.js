const express = require('express');
const { body, validationResult } = require('express-validator');
const Event = require('../models/Event');
const SwapRequest = require('../models/SwapRequest');
const auth = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/swaps/swappable-slots
// @desc    Get all swappable slots from other users
// @access  Private
router.get('/swappable-slots', auth, async (req, res) => {
  try {
    const slots = await Event.find({
      status: 'SWAPPABLE',
      userId: { $ne: req.user._id }
    })
      .populate('userId', 'name email')
      .sort({ startTime: 1 });
    
    res.json(slots);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/swaps/swap-request
// @desc    Create a swap request
// @access  Private
router.post('/swap-request', [
  auth,
  body('mySlotId').notEmpty().withMessage('mySlotId is required'),
  body('theirSlotId').notEmpty().withMessage('theirSlotId is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { mySlotId, theirSlotId } = req.body;

    // Fetch both slots
    const mySlot = await Event.findById(mySlotId);
    const theirSlot = await Event.findById(theirSlotId);

    if (!mySlot || !theirSlot) {
      return res.status(404).json({ message: 'One or both slots not found' });
    }

    // Verify ownership
    if (mySlot.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You do not own the offered slot' });
    }

    // Cannot swap with yourself
    if (theirSlot.userId.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot swap with your own slot' });
    }

    // Verify both slots are SWAPPABLE
    if (mySlot.status !== 'SWAPPABLE') {
      return res.status(400).json({ message: 'Your slot must be SWAPPABLE' });
    }

    if (theirSlot.status !== 'SWAPPABLE') {
      return res.status(400).json({ message: 'Target slot is not available for swap' });
    }

    // Create swap request
    const swapRequest = new SwapRequest({
      requesterSlotId: mySlotId,
      targetSlotId: theirSlotId,
      requesterId: req.user._id,
      targetUserId: theirSlot.userId
    });

    // Update both slots to SWAP_PENDING
    mySlot.status = 'SWAP_PENDING';
    theirSlot.status = 'SWAP_PENDING';

    await Promise.all([
      swapRequest.save(),
      mySlot.save(),
      theirSlot.save()
    ]);

    const populatedRequest = await SwapRequest.findById(swapRequest._id)
      .populate('requesterSlotId')
      .populate('targetSlotId')
      .populate('requesterId', 'name email')
      .populate('targetUserId', 'name email');

    res.status(201).json(populatedRequest);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/swaps/requests/incoming
// @desc    Get incoming swap requests
// @access  Private
router.get('/requests/incoming', auth, async (req, res) => {
  try {
    const requests = await SwapRequest.find({
      targetUserId: req.user._id,
      status: 'PENDING'
    })
      .populate('requesterSlotId')
      .populate('targetSlotId')
      .populate('requesterId', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/swaps/requests/outgoing
// @desc    Get outgoing swap requests
// @access  Private
router.get('/requests/outgoing', auth, async (req, res) => {
  try {
    const requests = await SwapRequest.find({
      requesterId: req.user._id
    })
      .populate('requesterSlotId')
      .populate('targetSlotId')
      .populate('targetUserId', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/swaps/swap-response/:requestId
// @desc    Respond to a swap request (accept or reject)
// @access  Private
router.post('/swap-response/:requestId', [
  auth,
  body('accepted').isBoolean().withMessage('accepted must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { accepted } = req.body;
    const swapRequest = await SwapRequest.findById(req.params.requestId)
      .populate('requesterSlotId')
      .populate('targetSlotId');

    if (!swapRequest) {
      return res.status(404).json({ message: 'Swap request not found' });
    }

    // Verify user is the target user
    if (swapRequest.targetUserId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to respond to this swap' });
    }

    // Cannot respond to already processed requests
    if (swapRequest.status !== 'PENDING') {
      return res.status(400).json({ message: 'Swap request has already been processed' });
    }

    if (accepted) {
      // ACCEPT: Exchange ownership of the slots
      swapRequest.status = 'ACCEPTED';
      
      const requesterSlot = swapRequest.requesterSlotId;
      const targetSlot = swapRequest.targetSlotId;

      // Exchange user IDs
      const tempUserId = requesterSlot.userId;
      requesterSlot.userId = targetSlot.userId;
      targetSlot.userId = tempUserId;

      // Set both slots back to BUSY
      requesterSlot.status = 'BUSY';
      targetSlot.status = 'BUSY';

      await Promise.all([
        swapRequest.save(),
        requesterSlot.save(),
        targetSlot.save()
      ]);
    } else {
      // REJECT: Set status back to SWAPPABLE
      swapRequest.status = 'REJECTED';
      
      const requesterSlot = swapRequest.requesterSlotId;
      const targetSlot = swapRequest.targetSlotId;

      requesterSlot.status = 'SWAPPABLE';
      targetSlot.status = 'SWAPPABLE';

      await Promise.all([
        swapRequest.save(),
        requesterSlot.save(),
        targetSlot.save()
      ]);
    }

    const updatedRequest = await SwapRequest.findById(swapRequest._id)
      .populate('requesterSlotId')
      .populate('targetSlotId')
      .populate('requesterId', 'name email')
      .populate('targetUserId', 'name email');

    res.json(updatedRequest);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
