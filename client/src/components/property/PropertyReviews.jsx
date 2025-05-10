import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks';
import { toast } from 'react-toastify';
import { useLanguage } from '@/providers/LanguageProvider';

// Hardcoded API URL
const API_URL = 'https://urban-rent.onrender.com';

const PropertyReviews = ({ propertyId, propertyStatus }) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Check if property is rented
  const isRented = propertyStatus === 'rented';

  // Debug user object
  useEffect(() => {
    console.log('User object in PropertyReviews:', user);
  }, [user]);

  // Check if user is a tenant (role === 1)
  const isTenant = user && user.role === 1;

  // Fetch reviews and average rating
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const [reviewsRes, ratingRes] = await Promise.all([
          fetch(`${API_URL}/reviews/properties/${propertyId}/reviews`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            credentials: 'include'
          }).then(res => {
            if (!res.ok) {
              throw new Error(`HTTP error! Status: ${res.status}`);
            }
            return res.json();
          }),
          fetch(`${API_URL}/reviews/properties/${propertyId}/average-rating`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            credentials: 'include'
          }).then(res => {
            if (!res.ok) {
              throw new Error(`HTTP error! Status: ${res.status}`);
            }
            return res.json();
          })
        ]);
        setReviews(reviewsRes);
        setAvgRating(Number(ratingRes.avgRating));
        setTotalReviews(Number(ratingRes.totalReviews));
      } catch (error) {
        console.error('Error fetching reviews:', error);
        toast.error(language === 'am' ? 'ግምገማዎችን ማግኘት አልተቻለም' : 'Failed to load reviews');
      } finally {
        setLoading(false);
      }
    };

    if (propertyId) {
      fetchReviews();
    }
  }, [propertyId, language]);

  // Handle review submission with direct fetch instead of axios
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!userRating) {
      toast.error(language === 'am' ? 'እባክዎ ደረጃ ይምረጡ' : 'Please select a rating');
      return;
    }

    try {
      setSubmitting(true);
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('You must be logged in to submit a review');
        return;
      }
      
      console.log('Submitting review with token:', token);
      
      // Use fetch directly instead of axios
      const response = await fetch(`${API_URL}/reviews/properties/${propertyId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          rating: userRating,
          comment: reviewText.trim() || null
        }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Error response:', errorData);
        try {
          const jsonError = JSON.parse(errorData);
          throw new Error(jsonError.message || 'Failed to submit review');
        } catch (e) {
          throw new Error('Failed to submit review');
        }
      }
      
      // Refresh reviews after submission
      const [reviewsRes, ratingRes] = await Promise.all([
        fetch(`${API_URL}/reviews/properties/${propertyId}/reviews`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          credentials: 'include'
        }).then(res => {
          if (!res.ok) {
            throw new Error(`HTTP error! Status: ${res.status}`);
          }
          return res.json();
        }),
        fetch(`${API_URL}/reviews/properties/${propertyId}/average-rating`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          credentials: 'include'
        }).then(res => {
          if (!res.ok) {
            throw new Error(`HTTP error! Status: ${res.status}`);
          }
          return res.json();
        })
      ]);
      
      setReviews(reviewsRes);
      setAvgRating(Number(ratingRes.avgRating));
      setTotalReviews(Number(ratingRes.totalReviews));
      
      // Reset form
      setUserRating(0);
      setReviewText('');
      
      toast.success(language === 'am' ? 'ግምገማዎ ተልኳል' : 'Your review has been submitted');
    } catch (error) {
      console.error('Error submitting review:', error);
      const errorMessage = error.message || (language === 'am' ? 'ግምገማን ማስገባት አልተቻለም' : 'Failed to submit review');
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D746B7]"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      {/* Overall Rating Section */}
      <div className="border-b pb-6 mb-6">
        <h2 className="text-2xl font-bold mb-4">
          {language === 'am' ? 'ግምገማዎች እና ደረጃዎች' : 'Reviews & Ratings'}
        </h2>
        <div className="flex items-center gap-4">
          <div className="text-4xl font-bold text-[#D746B7]">
            {avgRating}
          </div>
          <div>
            <div className="flex text-2xl text-yellow-400 mb-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star}>
                  {star <= Math.round(avgRating) ? '★' : '☆'}
                </span>
              ))}
            </div>
            <div className="text-gray-500">
              {totalReviews} {language === 'am' ? 'ግምገማዎች' : 'reviews'}
            </div>
          </div>
        </div>
      </div>

      {/* Review Form - Only show for tenants */}
      {user ? (
        isTenant ? (
          isRented ? (
            <div className="border-b pb-6 mb-6">
              <p className="text-center text-gray-600">
                {language === 'am' 
                  ? 'ንብረቱ ተከራይቷል። ግምገማዎች አይፈቀዱም።' 
                  : 'This property is rented. Reviews are not allowed.'}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmitReview} className="border-b pb-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">
                {language === 'am' ? 'ግምገማዎን ያካፍሉ' : 'Share Your Review'}
              </h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'am' ? 'ደረጃ' : 'Rating'}*
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setUserRating(star)}
                      className={`text-3xl transition-colors ${
                        star <= userRating ? 'text-yellow-400' : 'text-gray-300'
                      } hover:text-yellow-500`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'am' ? 'ግምገማ' : 'Review'}
                </label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-[#D746B7] focus:border-[#D746B7] min-h-[100px]"
                  placeholder={language === 'am' ? 'ስለ ቤቱ ያለዎትን አስተያየት ይጻፉ...' : 'Write your thoughts about the property... (optional)'}
                />
              </div>
              <button
                type="submit"
                disabled={submitting || !userRating}
                className="bg-[#D746B7] text-white px-6 py-2 rounded-lg hover:bg-[#c13da3] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting
                  ? (language === 'am' ? 'በመላክ ላይ...' : 'Submitting...')
                  : (language === 'am' ? 'ግምገማ ላክ' : 'Submit Review')}
              </button>
            </form>
          )
        ) : (
          <div className="border-b pb-6 mb-6">
            <p className="text-center text-gray-600">
              {language === 'am' 
                ? 'ግምገማዎችን መስጠት የሚችሉት ተከራዮች ብቻ ናቸው።' 
                : 'Only tenants can submit reviews for properties.'}
            </p>
          </div>
        )
      ) : (
        <div className="border-b pb-6 mb-6">
          <p className="text-center text-gray-600">
            {language === 'am' 
              ? 'ግምገማ ለመስጠት እባክዎ ' 
              : 'Please '}
            <a href="/login" className="text-[#D746B7] hover:underline">
              {language === 'am' ? 'ይግቡ' : 'login'}
            </a>
            {language === 'am' ? '' : ' to leave a review'}
          </p>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">
          {language === 'am' ? 'የተጠቃሚዎች ግምገማዎች' : 'User Reviews'}
        </h3>
        {reviews.length === 0 ? (
          <p className="text-center text-gray-500 py-4">
            {language === 'am' 
              ? 'እስካሁን ምንም ግምገማ የለም። የመጀመሪያው ሆነው ግምገማ ይስጡ!' 
              : 'No reviews yet. Be the first to review!'}
          </p>
        ) : (
          reviews.map((review) => (
            <div key={review.review_id} className="border-b last:border-b-0 pb-4 last:pb-0">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="font-medium">{review.User?.name || 'Anonymous'}</span>
                  <div className="flex text-yellow-400 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star}>
                        {star <= review.rating ? '★' : '☆'}
                      </span>
                    ))}
                  </div>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(review.created_at).toLocaleDateString()}
                </span>
              </div>
              {review.comment && (
                <p className="text-gray-700 mt-2">{review.comment}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PropertyReviews;
