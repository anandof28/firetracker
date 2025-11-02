'use client'

import { useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    priority: 'medium',
    category: 'general',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [isSubscribing, setIsSubscribing] = useState(false)

  const categories = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'technical', label: 'Technical Issue' },
    { value: 'billing', label: 'Billing & Account' },
    { value: 'feature', label: 'Feature Request' },
    { value: 'bug', label: 'Bug Report' },
    { value: 'data', label: 'Data Import/Export' },
    { value: 'security', label: 'Security Concern' }
  ]

  const priorities = [
    { value: 'low', label: 'Low - General question', color: 'text-gray-700' },
    { value: 'medium', label: 'Medium - Need assistance', color: 'text-gray-700' },
    { value: 'high', label: 'High - Urgent issue', color: 'text-gray-700' },
    { value: 'critical', label: 'Critical - System down', color: 'text-gray-700' }
  ]

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubscribing(true)

    try {
      // Simulate newsletter subscription
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast.success('Successfully subscribed to our newsletter!')
      setNewsletterEmail('')
    } catch (error) {
      toast.error('Subscription failed. Please try again.')
    } finally {
      setIsSubscribing(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const result = await response.json()
      
      toast.success('Your message has been sent successfully! We\'ll get back to you within 24 hours.')
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        priority: 'medium',
        category: 'general',
        message: ''
      })
    } catch (error) {
      toast.error('Failed to send message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Support</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Need help? Our support team is here to assist you with any questions or issues you may have.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name and Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your email address"
                    />
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Brief description of your issue"
                  />
                </div>

                {/* Category and Priority */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {categories.map(category => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                      Priority Level
                    </label>
                    <select
                      id="priority"
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {priorities.map(priority => (
                        <option key={priority.value} value={priority.value}>
                          {priority.label}
                        </option>
                      ))}
                    </select>
                    <p className={`text-sm mt-1 ${priorities.find(p => p.value === formData.priority)?.color}`}>
                      {priorities.find(p => p.value === formData.priority)?.label}
                    </p>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Please provide detailed information about your issue or question..."
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.message.length}/1000 characters
                  </p>
                </div>

                {/* Submit Button */}
                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Sending Message...
                      </div>
                    ) : (
                      'Send Message'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Contact Information */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Newsletter Signup */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Stay Updated</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Get the latest updates, financial tips, and feature announcements delivered to your inbox.
                </p>
                <div className="mb-4 space-y-2">
                  <div className="flex items-center text-xs text-gray-600">
                    <svg className="w-4 h-4 mr-2 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Feature updates & product news
                  </div>
                  <div className="flex items-center text-xs text-gray-600">
                    <svg className="w-4 h-4 mr-2 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Financial planning tips
                  </div>
                  <div className="flex items-center text-xs text-gray-600">
                    <svg className="w-4 h-4 mr-2 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Exclusive beta features
                  </div>
                </div>
                <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                  <div>
                    <input
                      type="email"
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      placeholder="Enter your email address"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      disabled={isSubscribing}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubscribing || !newsletterEmail.trim()}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isSubscribing ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Subscribing...
                      </>
                    ) : (
                      'Subscribe to Updates'
                    )}
                  </button>
                </form>
                <p className="text-xs text-gray-500 mt-3">
                  We respect your privacy. Unsubscribe at any time.
                </p>
              </div>

              {/* Response Times */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Response Times</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">Critical Issues</div>
                      <div className="text-xs text-gray-600">Within 2 hours</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">High Priority</div>
                      <div className="text-xs text-gray-600">Within 6 hours</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">Medium Priority</div>
                      <div className="text-xs text-gray-600">Within 24 hours</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">Low Priority</div>
                      <div className="text-xs text-gray-600">Within 48 hours</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Resources */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Resources</h3>
                <div className="space-y-3">
                  <a href="/support/help-center" className="block text-gray-700 hover:text-gray-700 text-sm">
                    📚 Help Center
                  </a>
                  <a href="/support/feature-requests" className="block text-gray-700 hover:text-gray-700 text-sm">
                    💡 Feature Requests
                  </a>
                  <a href="/support/feedback" className="block text-gray-700 hover:text-gray-700 text-sm">
                    💬 Beta Feedback
                  </a>
                  <a href="/reports" className="block text-gray-700 hover:text-gray-700 text-sm">
                    📊 System Status
                  </a>
                </div>
              </div>

              {/* Beta Notice */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Beta Program</h3>
                <p className="text-sm text-gray-700">
                  As a beta user, you get priority support and direct access to our development team. 
                  Your feedback helps shape the future of Fire Tracker!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Frequently Asked Questions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">How do I reset my password?</h4>
                  <p className="text-sm text-gray-600">
                    Use the "Forgot Password" link on the login page, or contact support if you need assistance.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Can I export my data?</h4>
                  <p className="text-sm text-gray-600">
                    Yes! You can export your data in multiple formats from the Reports section.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Is my financial data secure?</h4>
                  <p className="text-sm text-gray-600">
                    Absolutely. We use bank-level encryption and never store your banking credentials.
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">How do I import transactions?</h4>
                  <p className="text-sm text-gray-600">
                    Use the Import Data feature to upload CSV files from your bank statements.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Why aren't gold rates updating?</h4>
                  <p className="text-sm text-gray-600">
                    We fetch rates from multiple sources. If all sources fail, we use reliable fallback rates.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Can I access Fire Tracker on mobile?</h4>
                  <p className="text-sm text-gray-600">
                    Yes! Fire Tracker is fully responsive and works great on mobile devices.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Toaster position="top-right" />
    </div>
  )
}
