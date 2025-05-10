// Removed dotenv require and environment variable checks
const OpenAI = require('openai');
const Review = require('../models/Review'); // Assuming Review model path
const User = require('../models/User'); // For reviewer names, if needed (though not used in current prompt)
const { Sequelize } = require('sequelize'); // For aggregate functions like AVG

// WARNING: Hardcoding API keys is insecure and not recommended for production.
// This is for temporary testing purposes as per user request.
const GEMINI_API_KEY = 'AIzaSyAkfJpF6ZdjEapZYuf6La2LBf_KNdYM5rA';

const openAI = new OpenAI({
  apiKey: GEMINI_API_KEY, // Using the hardcoded key
  baseURL: 'https://generativelanguage.googleapis.com/v1beta',
});

exports.generatePropertySummary = async (req, res) => {
  const { systemPrompt, userPrompt: initialUserPrompt, propertyId } = req.body;

  if (!systemPrompt || !initialUserPrompt || !propertyId) {
    return res.status(400).json({ message: 'Missing systemPrompt, userPrompt, or propertyId in request body' });
  }

  try {
    let reviewsText = "No reviews available for this property.";
    let averageRating = null;

    try {
      const reviews = await Review.findAll({
        where: { property_id: propertyId },
        attributes: ['rating', 'comment', 'created_at'],
        order: [['created_at', 'DESC']],
        limit: 10 // Limit to most recent 10 reviews to keep prompt size reasonable
      });

      if (reviews && reviews.length > 0) {
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        averageRating = (totalRating / reviews.length).toFixed(1);

        reviewsText = `Average Rating: ${averageRating} stars from ${reviews.length} review(s).\nRecent Reviews:\n`;
        reviewsText += reviews.map(review => 
          `- Rating: ${review.rating}/5, Comment: \"${review.comment ? review.comment.substring(0, 150) + (review.comment.length > 150 ? '...' : '') : 'No comment text'}\"`
        ).join('\n');
      } else {
        reviewsText = "Currently, there are no reviews for this property.";
      }
    } catch (reviewError) {
      console.error('Error fetching reviews:', reviewError);
      reviewsText = "Could not fetch review information at this time.";
    }

    const finalUserPrompt = `${initialUserPrompt}\n\nProperty Reviews Summary:\n${reviewsText}`;

    const result = await openAI.chat.completions.create({
      model: 'gemini-1.5-flash',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: finalUserPrompt }
      ]
    });

    if (result.choices && result.choices.length > 0 && result.choices[0].message) {
      res.json({ summary: result.choices[0].message.content });
    } else {
      console.error('Invalid response structure from Gemini API:', result);
      throw new Error('Invalid response structure from AI');
    }

  } catch (error) {
    console.error('Error calling Gemini API or processing request:', error.message);
    const clientErrorMessage = 'Failed to generate AI summary due to a server error.';
    res.status(500).json({ message: clientErrorMessage });
  }
}; 