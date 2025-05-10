import React, { useEffect, useState } from 'react';
import axiosInstance from '@/utils/axios';
import { useAuth } from '@/hooks';

const ReviewSection = ({ propertyId }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fetchLoading, setFetchLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      setFetchLoading(true);
      const { data } = await axiosInstance.get(`/reviews/properties/${propertyId}/reviews`);
      console.log('Fetched reviews:', data);
      setReviews(data);
      setError('');
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Failed to load reviews');
    } finally {
      setFetchLoading(false);
    }
  };

  const fetchAvgRating = async () => {
    try {
      const { data } = await axiosInstance.get(`/reviews/properties/${propertyId}/average-rating`);
      setAvgRating(Number(data.avgRating));
    } catch (err) {
      console.error('Error fetching average rating:', err);
      setAvgRating(0);
    }
  };

  useEffect(() => {
    if (propertyId) {
      fetchReviews();
      fetchAvgRating();
    }
  }, [propertyId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) {
      setError('Please select a rating');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await axiosInstance.post(`/reviews/properties/${propertyId}/reviews`, { rating, comment });
      setRating(0);
      setComment('');
      await Promise.all([fetchReviews(), fetchAvgRating()]);
      setError('');
    } catch (err) {
      console.error('Error submitting review:', err);
      setError(err.response?.data?.message || 'Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return <div className="mt-8 text-center">Loading reviews...</div>;
  }

  return (
    <section className="mt-8">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-xl font-semibold">Rating:</span>
        <span className="text-yellow-500 text-2xl">{'★'.repeat(Math.round(avgRating))}{'☆'.repeat(5 - Math.round(avgRating))}</span>
        <span className="text-gray-600">({avgRating.toFixed(1)} / 5)</span>
        <span className="ml-2 text-gray-500">{reviews.length} reviews</span>
      </div>

      {/* Review Form */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-6 rounded-lg bg-gray-50 p-4 shadow">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-medium">Your Rating:</span>
            {[1,2,3,4,5].map((star) => (
              <button
                type="button"
                key={star}
                className={`text-2xl ${star <= rating ? 'text-yellow-500' : 'text-gray-300'} hover:text-yellow-400 transition-colors`}
                onClick={() => setRating(star)}
                aria-label={`Rate ${star}`}
              >
                ★
              </button>
            ))}
          </div>
          <textarea
            className="w-full rounded border border-gray-300 p-2 mb-2 focus:border-[#D746B7] focus:outline-none focus:ring-1 focus:ring-[#D746B7]"
            rows="3"
            placeholder="Write your review..."
            value={comment}
            onChange={e => setComment(e.target.value)}
            required
          />
          {error && <div className="mb-2 text-red-500">{error}</div>}
          <button
            type="submit"
            className="rounded bg-[#D746B7] px-4 py-2 font-semibold text-white hover:bg-[#c13da3] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            disabled={loading || !rating}
          >
            {loading ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      ) : (
        <div className="mb-6 text-center p-4 bg-gray-50 rounded-lg">
          Please <a href="/login" className="text-[#D746B7] hover:underline">login</a> to leave a review
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {error && <div className="text-red-500 mb-4">{error}</div>}
        {reviews.length === 0 ? (
          <div className="text-gray-500 text-center p-4">No reviews yet. Be the first to review!</div>
        ) : (
          reviews.map((review) => (
            <div key={review.review_id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-gray-800">{review.User?.name || 'Anonymous'}</span>
                <span className="text-yellow-500">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                <span className="text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString()}</span>
              </div>
              <div className="text-gray-700">{review.comment}</div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default ReviewSection;
