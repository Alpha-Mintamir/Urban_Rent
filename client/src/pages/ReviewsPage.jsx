import React, { useState, useEffect } from 'react';
import axiosInstance from '@/utils/axios';
import AccountNav from '@/components/ui/AccountNav';
import Spinner from '@/components/ui/Spinner';
import { useLanguage } from '@/providers/LanguageProvider';
import { Star, MessageSquare, Home, UserCircle } from 'lucide-react';

const ReviewsPage = () => {
  const { language, t } = useLanguage();
  const [propertiesWithReviews, setPropertiesWithReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOwnerReviews = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await axiosInstance.get('/reviews/owner-reviews');
        console.log('Fetched owner reviews:', data);
        setPropertiesWithReviews(data || []);
      } catch (err) {
        console.error('Error fetching owner reviews:', err);
        setError(t('errorFetchingReviews', 'Failed to fetch reviews. Please try again.'));
        setPropertiesWithReviews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOwnerReviews();
  }, [t]);

  const StarRatingDisplay = ({ rating, size = 5 }) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-${size} w-${size} ${
              i < Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">({Number(rating).toFixed(1)}/5)</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Spinner size="large" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="px-4 pt-20 max-w-5xl mx-auto text-center">
        <AccountNav />
        <p className="text-red-500 bg-red-100 p-4 rounded-md">{error}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <AccountNav />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-gray-800 sm:text-4xl">
            {t('myPropertyReviews', 'My Property Reviews')}
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            {t('reviewsPageSubtitle', 'See what tenants are saying about your properties.')}
          </p>
        </div>

        {propertiesWithReviews.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 text-center">
            <MessageSquare className="h-20 w-20 mx-auto text-[#D746B7] opacity-50 mb-6" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-3">
              {t('noReviewsYet', 'No Reviews Yet')}
            </h2>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              {t('noReviewsYetOwnerMessage', 'You haven\'t received any reviews for your properties. Once tenants review your listings, they will appear here.')}
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {propertiesWithReviews.map((property) => (
              property.reviews && property.reviews.length > 0 ? (
                <div
                  key={property.property_id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden transition-all hover:shadow-2xl"
                >
                  <div className="p-6 bg-gradient-to-r from-[#D746B7] to-[#A03C8E] text-white">
                    <div className="flex items-center space-x-3">
                      <Home className="h-8 w-8 opacity-90" />
                      <h2 className="text-2xl font-bold truncate" title={property.property_name}>
                        {property.property_name}
                      </h2>
                    </div>
                    {property.description && (
                       <p className="text-sm opacity-80 mt-1 truncate" title={property.description}>{property.description}</p>
                    )}
                  </div>
                  
                  {property.reviews.length > 0 ? (
                    <div className="divide-y divide-gray-200">
                      {property.reviews.map((review) => (
                        <div key={review.review_id} className="p-6 hover:bg-gray-50">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center space-x-3">
                                <UserCircle className="h-10 w-10 text-gray-400" />
                                <div>
                                    <p className="font-semibold text-gray-800 text-lg">
                                    {review.User?.name || t('anonymousUser', 'Anonymous User')}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                    {new Date(review.created_at).toLocaleDateString(language, { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                            <StarRatingDisplay rating={review.rating} size={5} />
                          </div>
                          {review.comment && (
                            <p className="text-gray-700 leading-relaxed ml-13  mt-1">
                              {review.comment}
                            </p>
                          )}
                           {!review.comment && (
                            <p className="text-gray-500 italic leading-relaxed ml-13 mt-1">
                              {t('noCommentProvided', 'No comment provided.')}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="p-6 text-gray-500 text-center">
                      {t('noReviewsForThisProperty', 'No reviews yet for this specific property.')}
                    </p>
                  )}
                </div>
              ) : null
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewsPage;
