import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks';
import { useLanguage } from '@/providers/LanguageProvider';
import axiosInstance from '@/utils/axios';
import { toast } from 'react-toastify';

const MessageButton = ({ propertyId, ownerId, ownerName, propertyStatus }) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showMessageField, setShowMessageField] = useState(false);
  const [message, setMessage] = useState('');

  // Check if the property is rented
  const isRented = propertyStatus === 'rented';

  // Handle case when user is not logged in
  if (!user) {
    return (
      <button
        onClick={() => navigate('/login')}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-white transition-all hover:bg-primary-dark hover:shadow-md"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
            clipRule="evenodd"
          />
        </svg>
        {language === 'am' ? 'መልዕክት ለመላክ ይግቡ' : 'Login to Message'}
      </button>
    );
  }

  // Don't show button if the user is not a tenant (except admins)
  if (user.role !== 1 && user.role !== 4) {
    return null;
  }

  // Don't show button if the user is trying to message themselves
  if (user.user_id === ownerId) {
    return null;
  }

  // If property is rented, show disabled button
  if (isRented) {
    return (
      <button
        disabled
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-300 py-3 text-gray-500 cursor-not-allowed"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg" 
          className="h-5 w-5" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
          strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        {language === 'am' ? 'ንብረቱ ተከራይቷል' : 'Property is Rented'}
      </button>
    );
  }

  const handleMessageClick = () => {
    setShowMessageField(true);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!message.trim()) {
      toast.error(language === 'am' ? 'እባክዎ መልዕክት ያስገቡ' : 'Please enter a message');
      return;
    }
    
    // Validate property ID and owner ID
    if (!propertyId) {
      toast.error(language === 'am' ? 'የንብረት መታወቂያ አልተገኘም' : 'Property ID is missing');
      return;
    }
    
    if (!ownerId) {
      toast.error(language === 'am' ? 'የባለቤት መታወቂያ አልተገኘም' : 'Owner ID is missing');
      return;
    }
    
    setIsLoading(true);
    try {
      console.log('Sending message to:', { ownerId, propertyId });
      
      // Ensure propertyId is an integer
      const propertyIdInt = parseInt(propertyId, 10);
      
      // Send message directly to the user/message endpoint
      const response = await axiosInstance.post('/users/message', {
        receiver_id: ownerId,
        property_id: propertyIdInt || propertyId, // Use integer if parsed successfully, otherwise use original
        content: message
      });

      toast.success(language === 'am' ? 'መልዕክት በተሳካ ሁኔታ ተልኳል' : 'Message sent successfully');
      
      // Clear the message and hide the field
      setMessage('');
      setShowMessageField(false);
      
      // Navigate to messages page
      navigate('/tenant/messages');
    } catch (error) {
      console.error('Error starting conversation:', error);
      const errorMessage = error.response?.data?.message || 
                          (language === 'am' ? 'መልዕክት መላክ አልተቻለም' : 'Failed to send message');
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {!showMessageField ? (
        <button
          onClick={handleMessageClick}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-white font-medium transition-all hover:bg-primary-dark hover:shadow-md active:scale-[0.98] disabled:opacity-50"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          {language === 'am' ? 'ለባለቤቱ መልዕክት ላክ' : 'Message Owner'}
        </button>
      ) : (
        <div className="mt-4 bg-white rounded-xl p-4 shadow-lg border border-gray-100">
          <div className="flex items-center space-x-2 mb-3">
            <div className="h-2 w-2 bg-primary rounded-full"></div>
            <h3 className="text-gray-700 font-medium">
              {language === 'am' ? 'ለባለቤቱ መልዕክት ላክ' : 'Message Owner'}
            </h3>
          </div>
          
          <form onSubmit={handleSendMessage} className="space-y-4">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={language === 'am' ? 'መልዕክትዎን እዚህ ይጻፉ...' : 'Type your message here...'}
              className="w-full rounded-lg border border-gray-300 p-3 min-h-[120px] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              disabled={isLoading}
              autoFocus
            />
            
            <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowMessageField(false)}
                className="rounded-lg border border-gray-300 px-4 py-2.5 text-gray-700 transition-all hover:bg-gray-50 active:scale-[0.98] disabled:opacity-50 order-2 sm:order-1 w-full sm:w-auto"
                disabled={isLoading}
              >
                {language === 'am' ? 'ይቅር' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="rounded-lg bg-primary px-4 py-2.5 text-white font-medium transition-all hover:bg-primary-dark hover:shadow-sm active:scale-[0.98] disabled:opacity-50 order-1 sm:order-2 flex items-center justify-center gap-2 w-full sm:w-auto"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {language === 'am' ? 'በመላክ ላይ...' : 'Sending...'}
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 rotate-90" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                    {language === 'am' ? 'ላክ' : 'Send'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default MessageButton;