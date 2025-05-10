const Broker = require('../models/Broker');
const User = require('../models/User');
const { uploadToLocalStorage, uploadToCloudinary, deleteFile } = require('../utils/fileUpload');

/**
 * Get verification status for the current broker
 * @route GET /api/broker/verification/status
 * @access Private (Broker only)
 */
exports.getVerificationStatus = async (req, res) => {
  try {
    // Get user ID from auth token
    const userId = req.user.id || req.user.user_id;
    
    // Find broker record
    const broker = await Broker.findByPk(userId, {
      include: [
        {
          model: User,
          attributes: ['name', 'email']
        }
      ]
    });
    
    if (!broker) {
      return res.status(404).json({ message: 'Broker record not found' });
    }
    
    // Return verification status and details
    const response = {
      status: broker.verification_status,
      issuing_authority: broker.issuing_authority,
      document_number: broker.document_number,
      issue_date: broker.issue_date,
      additional_info: broker.additional_info,
      document_url: broker.document_url,
      rejection_reason: broker.rejection_reason,
      submitted_at: broker.submitted_at,
      verified_at: broker.verified_at,
      rejected_at: broker.rejected_at,
      broker_no: broker.broker_no,
      user: {
        name: broker.User.name,
        email: broker.User.email
      }
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error getting broker verification status:', error);
    res.status(500).json({ message: 'Failed to get verification status' });
  }
};

/**
 * Submit broker verification documents
 * @route POST /api/broker/verification/submit
 * @access Private (Broker only)
 */
exports.submitVerification = async (req, res) => {
  try {
    // Get user ID from auth token
    const userId = req.user.id || req.user.user_id;
    
    console.log('Processing verification submission for user ID:', userId);
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    
    // Find broker record or create it
    let [broker, created] = await Broker.findOrCreate({
      where: { user_id: userId },
      defaults: {
        broker_no: Math.floor(10000 + Math.random() * 90000),
        verification_status: 'not_submitted'
      }
    });
    
    if (created) {
      console.log('Created new broker record for user ID:', userId);
    } else {
      console.log('Found existing broker record for user ID:', userId);
    }
    
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'No document uploaded' });
    }
    
    // Extract form data
    const { issuingAuthority, documentNumber, issueDate, additionalInfo } = req.body;
    
    if (!issuingAuthority || !documentNumber) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Handle the file upload to Cloudinary
    let documentUrl;
    try {
      // If broker already has a document, delete it
      if (broker.document_url) {
        await deleteFile(broker.document_url);
      }
      
      // Upload document to Cloudinary
      documentUrl = await uploadToCloudinary(req.file, 'broker-verification');
      if (!documentUrl) {
        throw new Error('Failed to get URL from Cloudinary');
      }
      console.log('Document uploaded successfully to Cloudinary:', documentUrl);
    } catch (uploadError) {
      console.error('File upload error:', uploadError);
      return res.status(500).json({ 
        message: 'File upload failed', 
        error: uploadError.message 
      });
    }
    
    // Update broker record with a direct query to ensure it's saved
    const updateResult = await Broker.update(
      {
        verification_status: 'pending',
        document_url: documentUrl,
        issuing_authority: issuingAuthority,
        document_number: documentNumber,
        issue_date: issueDate || null,
        additional_info: additionalInfo || null,
        submitted_at: new Date(),
        rejection_reason: null,
        verified_at: null,
        rejected_at: null
      },
      {
        where: { user_id: userId }
      }
    );
    
    console.log('Update result:', updateResult);
    
    // Fetch the updated record to confirm changes
    const updatedBroker = await Broker.findByPk(userId);
    console.log('Updated broker record:', updatedBroker.toJSON());
    
    return res.status(201).json({
      message: 'Verification submitted successfully',
      status: 'pending',
      broker: updatedBroker.toJSON()
    });
  } catch (error) {
    console.error('Error in submitVerification:', error);
    return res.status(500).json({ 
      message: 'Failed to submit verification',
      error: error.message 
    });
  }
};

/**
 * Admin: Get all broker verification requests
 * @route GET /api/broker/verification/admin/requests
 * @access Private (Admin only)
 */
exports.getVerificationRequests = async (req, res) => {
  try {
    // Get query params for filtering
    const { status } = req.query;
    
    // Prepare filters
    const filter = {};
    if (status) {
      filter.verification_status = status;
    }
    
    // Find all verification requests with given filter
    const verificationRequests = await Broker.findAll({
      where: filter,
      include: [
        {
          model: User,
          attributes: ['name', 'email', 'phone']
        }
      ],
      order: [['submitted_at', 'DESC']]
    });
    
    res.json(verificationRequests);
  } catch (error) {
    console.error('Error getting verification requests:', error);
    res.status(500).json({ message: 'Failed to get verification requests' });
  }
};

/**
 * Admin: Approve a broker's verification request
 * @route PUT /api/broker/verification/admin/approve/:id
 * @access Private (Admin only)
 */
exports.approveVerification = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the broker record
    const broker = await Broker.findByPk(id);
    
    if (!broker) {
      return res.status(404).json({ message: 'Broker record not found' });
    }
    
    // Ensure the broker has a pending verification
    if (broker.verification_status !== 'pending') {
      return res.status(400).json({ 
        message: 'Cannot approve this verification request',
        details: `Current status is ${broker.verification_status}`
      });
    }
    
    // Update the broker's verification status
    broker.verification_status = 'verified';
    broker.verified_at = new Date();
    broker.rejected_at = null;
    broker.rejection_reason = null;
    
    await broker.save();
    
    res.json({
      message: 'Broker verification approved successfully',
      brokerId: id
    });
  } catch (error) {
    console.error('Error approving broker verification:', error);
    res.status(500).json({ message: 'Failed to approve verification request' });
  }
};

/**
 * Admin: Reject a broker's verification request
 * @route PUT /api/broker/verification/admin/reject/:id
 * @access Private (Admin only)
 */
exports.rejectVerification = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;
    
    if (!rejectionReason) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }
    
    // Find the broker record
    const broker = await Broker.findByPk(id);
    
    if (!broker) {
      return res.status(404).json({ message: 'Broker record not found' });
    }
    
    // Ensure the broker has a pending verification
    if (broker.verification_status !== 'pending') {
      return res.status(400).json({ 
        message: 'Cannot reject this verification request',
        details: `Current status is ${broker.verification_status}`
      });
    }
    
    // Update the broker's verification status
    broker.verification_status = 'rejected';
    broker.rejected_at = new Date();
    broker.verified_at = null;
    broker.rejection_reason = rejectionReason;
    
    await broker.save();
    
    res.json({
      message: 'Broker verification rejected',
      brokerId: id
    });
  } catch (error) {
    console.error('Error rejecting broker verification:', error);
    res.status(500).json({ message: 'Failed to reject verification request' });
  }
}; 