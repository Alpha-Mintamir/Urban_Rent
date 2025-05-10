import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axiosInstance from '@/utils/axios';
import Spinner from '@/components/ui/Spinner';
import { useLanguage } from '@/providers/LanguageProvider';
import { Shield, Upload, AlertCircle, CheckCircle, X, FileText } from 'lucide-react';
import AccountNav from '@/components/ui/AccountNav';

const BrokerVerificationPage = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState('pending'); // 'pending', 'verified', 'rejected', 'not_submitted'
  const [documentFile, setDocumentFile] = useState(null);
  const [documentPreview, setDocumentPreview] = useState(null);
  const [formData, setFormData] = useState({
    issuingAuthority: '',
    documentNumber: '',
    issueDate: '',
    additionalInfo: ''
  });
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    const fetchVerificationStatus = async () => {
      try {
        setLoading(true);
        
        // Make actual API call to get verification status
        const { data } = await axiosInstance.get('/broker/verification/status');
        console.log('Fetched verification status:', data);
        
        // Set verification status from API response
        setVerificationStatus(data.status || 'not_submitted');
        
        // If status is rejected, set the rejection reason
        if (data.status === 'rejected' && data.rejection_reason) {
          setRejectionReason(data.rejection_reason);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching verification status:', error);
        
        // If 404 error (broker record not found), set status to not_submitted
        if (error.response?.status === 404) {
          setVerificationStatus('not_submitted');
        } else {
          toast.error(t('errorFetchingStatus', 'Failed to fetch verification status'));
        }
        
        setLoading(false);
      }
    };
    
    fetchVerificationStatus();
  }, [t]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast.error(t('onlyImagesAllowed', 'Only image files are allowed'));
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error(t('fileTooLarge', 'File is too large. Maximum size is 5MB'));
      return;
    }
    
    setDocumentFile(file);
    
    // Create a preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setDocumentPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!documentFile) {
      toast.error(t('documentRequired', 'Please upload a document'));
      return;
    }
    
    if (!formData.issuingAuthority || !formData.documentNumber) {
      toast.error(t('requiredFields', 'Please fill in all required fields'));
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Create form data for file upload
      const fileFormData = new FormData();
      fileFormData.append('document', documentFile);
      fileFormData.append('issuingAuthority', formData.issuingAuthority);
      fileFormData.append('documentNumber', formData.documentNumber);
      if (formData.issueDate) fileFormData.append('issueDate', formData.issueDate);
      if (formData.additionalInfo) fileFormData.append('additionalInfo', formData.additionalInfo);
      
      console.log('Submitting verification with document:', documentFile.name);
      
      // Make the actual API call
      const response = await axiosInstance.post('/broker/verification/submit', fileFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('Verification submission response:', response.data);
      
      toast.success(t('verificationSubmitted', 'Verification request submitted successfully'));
      setVerificationStatus('pending');
      setSubmitting(false);
      
      // Refresh the page after 2 seconds to show updated status
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error('Error submitting verification:', error);
      const errorMessage = error.response?.data?.message || t('errorSubmittingVerification', 'Failed to submit verification request');
      toast.error(errorMessage);
      setSubmitting(false);
    }
  };

  const getStatusDisplay = () => {
    switch (verificationStatus) {
      case 'verified':
        return {
          icon: <CheckCircle className="h-16 w-16 text-green-500" />,
          title: t('verified', 'Verified'),
          description: t('verifiedDescription', 'Your broker verification has been approved. You now have full access to all broker features.'),
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };
      
      case 'rejected':
        return {
          icon: <X className="h-16 w-16 text-red-500" />,
          title: t('rejected', 'Rejected'),
          description: t('rejectedDescription', 'Your verification request was rejected. Please review the reason below and resubmit with the required changes.'),
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
      
      case 'pending':
        return {
          icon: <AlertCircle className="h-16 w-16 text-yellow-500" />,
          title: t('pending', 'Pending Review'),
          description: t('pendingDescription', 'Your verification request is currently under review. This process typically takes 1-3 business days.'),
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200'
        };
      
      case 'not_submitted':
      default:
        return {
          icon: <Shield className="h-16 w-16 text-blue-500" />,
          title: t('notSubmitted', 'Not Submitted'),
          description: t('notSubmittedDescription', 'Submit your verification documents to access all broker features.'),
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        };
    }
  };

  const status = getStatusDisplay();

  if (loading) {
    return (
      <div className="min-h-screen pt-20">
        <AccountNav />
        <div className="flex justify-center items-center min-h-[60vh]">
          <Spinner size="large" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <AccountNav />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-blue-600 sm:text-4xl">
            {t('brokerVerification', 'Broker Verification')}
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            {t('brokerVerificationSubtitle', 'Verify your identity to access all broker features')}
          </p>
        </div>

        {/* Status Card */}
        <div className={`p-6 mb-8 rounded-xl ${status.bgColor} border ${status.borderColor}`}>
          <div className="flex flex-col sm:flex-row items-center">
            <div className="mb-4 sm:mb-0 sm:mr-6">{status.icon}</div>
            <div>
              <h2 className={`text-xl font-bold ${status.color}`}>{status.title}</h2>
              <p className="text-gray-700">{status.description}</p>
              
              {verificationStatus === 'rejected' && rejectionReason && (
                <div className="mt-3 p-3 bg-red-100 rounded-lg">
                  <h3 className="font-semibold text-red-700">{t('rejectionReason', 'Reason for Rejection')}:</h3>
                  <p className="text-red-800">{rejectionReason}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Only show the form if status is 'not_submitted' or 'rejected' */}
        {(verificationStatus === 'not_submitted' || verificationStatus === 'rejected') && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-blue-500 to-blue-700 text-white">
              <h2 className="text-xl font-bold flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                {t('submitVerification', 'Submit Verification Documents')}
              </h2>
              <p className="text-blue-100 text-sm mt-1">
                {t('verificationFormSubtitle', 'Please provide clear, legible images of your official documents')}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">
                  {t('documentUpload', 'Document Upload')} *
                </label>
                <div className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center 
                  ${documentPreview ? 'border-blue-300 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}>
                  
                  {documentPreview ? (
                    <div className="text-center">
                      <img 
                        src={documentPreview} 
                        alt="Document preview" 
                        className="max-h-64 max-w-full mb-4 rounded-lg shadow-md" 
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setDocumentFile(null);
                          setDocumentPreview(null);
                        }}
                        className="text-red-500 hover:text-red-700 font-medium"
                      >
                        {t('removeDocument', 'Remove document')}
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-12 w-12 text-gray-400 mb-2" />
                      <p className="text-gray-700 font-medium mb-1">{t('dragOrClick', 'Drag file here or click to upload')}</p>
                      <p className="text-gray-500 text-sm mb-4">{t('acceptedFileTypes', 'JPG, PNG, or PDF up to 5MB')}</p>
                      <label className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors duration-150">
                        {t('browseFiles', 'Browse Files')}
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={handleFileChange}
                        />
                      </label>
                    </>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {t('documentHelp', 'Upload a clear photo of your broker license, ID card, or official certification')}
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  {t('issuingAuthority', 'Issuing Authority')} *
                </label>
                <input
                  type="text"
                  name="issuingAuthority"
                  value={formData.issuingAuthority}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={t('issuingAuthorityPlaceholder', 'e.g. Real Estate Commission')}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    {t('documentNumber', 'Document Number')} *
                  </label>
                  <input
                    type="text"
                    name="documentNumber"
                    value={formData.documentNumber}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={t('documentNumberPlaceholder', 'e.g. LIC-12345678')}
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    {t('issueDate', 'Issue Date')}
                  </label>
                  <input
                    type="date"
                    name="issueDate"
                    value={formData.issueDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">
                  {t('additionalInfo', 'Additional Information')}
                </label>
                <textarea
                  name="additionalInfo"
                  value={formData.additionalInfo}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={t('additionalInfoPlaceholder', 'Any additional details you would like to provide...')}
                ></textarea>
              </div>

              <div className="flex items-center justify-between mt-8">
                <p className="text-sm text-gray-500">
                  <span className="text-red-500">*</span> {t('requiredFields', 'Required fields')}
                </p>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors duration-150 flex items-center 
                    ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {submitting && <Spinner size="small" className="mr-2" />}
                  {submitting 
                    ? t('submitting', 'Submitting...') 
                    : t('submitVerification', 'Submit Verification')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* If already verified, show benefits */}
        {verificationStatus === 'verified' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-blue-600 mb-4">{t('verifiedBrokerBenefits', 'Verified Broker Benefits')}</h2>
            <ul className="space-y-3">
              {[
                t('benefit1', 'Higher visibility in property listings'),
                t('benefit2', 'Access to premium broker tools and analytics'),
                t('benefit3', 'Lower platform fees on transactions'),
                t('benefit4', 'Priority customer support')
              ].map((benefit, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* If pending, show waiting message */}
        {verificationStatus === 'pending' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-blue-600 mb-4">{t('whatToExpect', 'What to Expect')}</h2>
            <ul className="space-y-4">
              <li className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-200 flex items-center justify-center mr-3 mt-1">
                  <span className="text-blue-700 font-bold text-sm">1</span>
                </div>
                <p>{t('step1', 'Our verification team will review your submitted documents (typically within 1-3 business days)')}</p>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-200 flex items-center justify-center mr-3 mt-1">
                  <span className="text-blue-700 font-bold text-sm">2</span>
                </div>
                <p>{t('step2', 'You will be notified by email once your verification is complete')}</p>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-200 flex items-center justify-center mr-3 mt-1">
                  <span className="text-blue-700 font-bold text-sm">3</span>
                </div>
                <p>{t('step3', 'If there are any issues, we will contact you with specific requests for additional information')}</p>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrokerVerificationPage; 