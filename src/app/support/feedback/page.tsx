'use client'

import { useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'

export default function BetaFeedback() {
  const [feedbackData, setFeedbackData] = useState({
    name: '',
    email: '',
    overallRating: 5,
    easeOfUse: 5,
    featureCompleteness: 5,
    performance: 5,
    design: 5,
    wouldRecommend: 'yes',
    favoriteFeatures: '',
    improvements: '',
    missingFeatures: '',
    bugReports: '',
    additionalComments: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success('Thank you for your feedback! Your input is valuable to us.')
      
      // Reset form
      setFeedbackData({
        name: '',
        email: '',
        overallRating: 5,
        easeOfUse: 5,
        featureCompleteness: 5,
        performance: 5,
        design: 5,
        wouldRecommend: 'yes',
        favoriteFeatures: '',
        improvements: '',
        missingFeatures: '',
        bugReports: '',
        additionalComments: ''
      })
    } catch (error) {
      toast.error('Failed to submit feedback. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFeedbackData(prev => ({ ...prev, [name]: value }))
  }

  const handleRatingChange = (category: string, rating: number) => {
    setFeedbackData(prev => ({ ...prev, [category]: rating }))
  }

  const RatingStars = ({ category, value, onChange }: { category: string; value: number; onChange: (rating: number) => void }) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`w-6 h-6 ${
              star <= value ? 'text-yellow-400' : 'text-gray-300'
            } hover:text-yellow-400 transition-colors`}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">({value}/5)</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-medium mb-4">
            🚀 Beta Program
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Beta Feedback</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Help us improve Fire Tracker! Your feedback as a beta user is incredibly valuable and directly influences our development roadmap.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Name (Optional)
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={feedbackData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={feedbackData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="your.email@example.com"
                />
                <p className="text-xs text-gray-500 mt-1">Only if you'd like us to follow up with you</p>
              </div>
            </div>

            {/* Rating Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Rate Your Experience</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Overall Experience
                  </label>
                  <RatingStars
                    category="overallRating"
                    value={feedbackData.overallRating}
                    onChange={(rating) => handleRatingChange('overallRating', rating)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ease of Use
                    </label>
                    <RatingStars
                      category="easeOfUse"
                      value={feedbackData.easeOfUse}
                      onChange={(rating) => handleRatingChange('easeOfUse', rating)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Feature Completeness
                    </label>
                    <RatingStars
                      category="featureCompleteness"
                      value={feedbackData.featureCompleteness}
                      onChange={(rating) => handleRatingChange('featureCompleteness', rating)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Performance & Speed
                    </label>
                    <RatingStars
                      category="performance"
                      value={feedbackData.performance}
                      onChange={(rating) => handleRatingChange('performance', rating)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Design & Interface
                    </label>
                    <RatingStars
                      category="design"
                      value={feedbackData.design}
                      onChange={(rating) => handleRatingChange('design', rating)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Would you recommend Fire Tracker to others?
              </label>
              <div className="flex space-x-4">
                {[
                  { value: 'yes', label: 'Yes, definitely!', color: 'bg-green-500' },
                  { value: 'maybe', label: 'Maybe, with improvements', color: 'bg-yellow-500' },
                  { value: 'no', label: 'No, not in current state', color: 'bg-red-500' }
                ].map((option) => (
                  <label key={option.value} className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="wouldRecommend"
                      value={option.value}
                      checked={feedbackData.wouldRecommend === option.value}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded-full mr-2 ${
                      feedbackData.wouldRecommend === option.value ? option.color : 'bg-gray-300'
                    }`}></div>
                    <span className="text-sm">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Detailed Feedback */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Tell Us More</h3>
              
              <div>
                <label htmlFor="favoriteFeatures" className="block text-sm font-medium text-gray-700 mb-2">
                  What are your favorite features? ⭐
                </label>
                <textarea
                  id="favoriteFeatures"
                  name="favoriteFeatures"
                  rows={3}
                  value={feedbackData.favoriteFeatures}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Which features do you love most and why?"
                />
              </div>

              <div>
                <label htmlFor="improvements" className="block text-sm font-medium text-gray-700 mb-2">
                  What could be improved? 🔧
                </label>
                <textarea
                  id="improvements"
                  name="improvements"
                  rows={3}
                  value={feedbackData.improvements}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="What existing features need improvement?"
                />
              </div>

              <div>
                <label htmlFor="missingFeatures" className="block text-sm font-medium text-gray-700 mb-2">
                  What features are missing? 💡
                </label>
                <textarea
                  id="missingFeatures"
                  name="missingFeatures"
                  rows={3}
                  value={feedbackData.missingFeatures}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="What features would you like to see added?"
                />
              </div>

              <div>
                <label htmlFor="bugReports" className="block text-sm font-medium text-gray-700 mb-2">
                  Any bugs or issues encountered? 🐛
                </label>
                <textarea
                  id="bugReports"
                  name="bugReports"
                  rows={3}
                  value={feedbackData.bugReports}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Describe any bugs, errors, or unexpected behavior"
                />
              </div>

              <div>
                <label htmlFor="additionalComments" className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Comments 💭
                </label>
                <textarea
                  id="additionalComments"
                  name="additionalComments"
                  rows={4}
                  value={feedbackData.additionalComments}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Any other thoughts, suggestions, or feedback you'd like to share?"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-medium py-3 px-8 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Submitting Feedback...
                  </div>
                ) : (
                  'Submit Beta Feedback'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Beta Program Info */}
        <div className="mt-8 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
          <h3 className="text-lg font-semibold text-purple-900 mb-4">Thank You for Being a Beta User! 🙏</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                🎯
              </div>
              <div>
                <div className="font-medium text-purple-900">Direct Impact</div>
                <div className="text-purple-700">Your feedback shapes our roadmap</div>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                🚀
              </div>
              <div>
                <div className="font-medium text-purple-900">Early Access</div>
                <div className="text-purple-700">Get new features first</div>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                ⭐
              </div>
              <div>
                <div className="font-medium text-purple-900">Lifetime Benefits</div>
                <div className="text-purple-700">Special perks as a beta user</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Toaster position="top-right" />
    </div>
  )
}
