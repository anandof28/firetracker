'use client'

import { useEffect, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'

interface FeatureRequest {
  id: string
  title: string
  description: string
  category: string
  priority: string
  votes: number
  status: 'submitted' | 'reviewing' | 'approved' | 'planned' | 'in-progress' | 'completed' | 'declined'
  submittedBy?: string
  submittedAt: string
  estimatedTimeline?: string
  adminNotes?: string
  user?: {
    name: string
    email: string
  }
  createdAt: string
  updatedAt: string
}

export default function FeatureRequests() {
  const [activeTab, setActiveTab] = useState<'browse' | 'submit'>('browse')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('votes')
  const [features, setFeatures] = useState<FeatureRequest[]>([])
  const [loading, setLoading] = useState(true)
  
  const [newRequest, setNewRequest] = useState({
    title: '',
    description: '',
    category: 'enhancement',
    priority: 'medium',
    useCases: '',
    alternatives: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch feature requests from API
  useEffect(() => {
    fetchFeatureRequests()
  }, [])

  const fetchFeatureRequests = async () => {
    try {
      const response = await fetch('/api/feature-requests')
      if (response.ok) {
        const data = await response.json()
        setFeatures(data.featureRequests)
      } else {
        toast.error('Failed to load feature requests')
      }
    } catch (error) {
      console.error('Error fetching feature requests:', error)
      toast.error('Failed to load feature requests')
    } finally {
      setLoading(false)
    }
  }



  const categories = [
    { value: 'all', label: 'All Categories', count: features.length },
    { value: 'new-feature', label: 'New Features', count: features.filter(f => f.category === 'new-feature').length },
    { value: 'enhancement', label: 'Enhancements', count: features.filter(f => f.category === 'enhancement').length },
    { value: 'ui-ux', label: 'UI/UX', count: features.filter(f => f.category === 'ui-ux').length },
    { value: 'integration', label: 'Integrations', count: features.filter(f => f.category === 'integration').length },
    { value: 'performance', label: 'Performance', count: features.filter(f => f.category === 'performance').length }
  ]

  const statusColors = {
    'submitted': 'bg-gray-100 text-gray-800',
    'reviewing': 'bg-yellow-100 text-gray-700',
    'approved': 'bg-blue-100 text-gray-700',
    'planned': 'bg-indigo-100 text-gray-700',
    'in-progress': 'bg-purple-100 text-gray-700',
    'completed': 'bg-green-100 text-gray-700',
    'declined': 'bg-red-100 text-gray-700'
  }

  const priorityColors = {
    'low': 'text-gray-700',
    'medium': 'text-gray-700',
    'high': 'text-gray-700'
  }

  const filteredFeatures = features
    .filter(feature => selectedCategory === 'all' || feature.category === selectedCategory)
    .sort((a, b) => {
      if (sortBy === 'votes') return b.votes - a.votes
      if (sortBy === 'recent') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      if (sortBy === 'priority') {
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        return priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder]
      }
      return 0
    })

  const handleVote = async (featureId: string) => {
    try {
      // For now, just show a message - voting endpoint can be implemented later
      toast.success('Thank you for your interest! Feature voting will be available soon.')
    } catch (error) {
      toast.error('Failed to vote. Please try again.')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/feature-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newRequest.title,
          description: newRequest.description,
          category: newRequest.category,
          priority: newRequest.priority,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        toast.success('Feature request submitted successfully! We\'ll review it and get back to you.')
        
        // Reset form
        setNewRequest({
          title: '',
          description: '',
          category: 'enhancement',
          priority: 'medium',
          useCases: '',
          alternatives: ''
        })
        
        setActiveTab('browse')
        // Refresh the list to show new request if it's approved
        fetchFeatureRequests()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to submit feature request')
      }
    } catch (error) {
      console.error('Error submitting feature request:', error)
      toast.error('Failed to submit feature request. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setNewRequest(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Feature Requests</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Help shape the future of Fire Tracker by suggesting new features and voting on existing requests
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('browse')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'browse'
                    ? 'border-blue-500 text-gray-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Browse Requests
              </button>
              <button
                onClick={() => setActiveTab('submit')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'submit'
                    ? 'border-blue-500 text-gray-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Submit Request
              </button>
            </nav>
          </div>

          {activeTab === 'browse' ? (
            <div className="p-6">
              {/* Loading State */}
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-4 text-gray-600">Loading feature requests...</p>
                </div>
              ) : (
                <>
                  {/* Filters */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
                    <div className="flex flex-wrap gap-2">
                      {categories.map(category => (
                        <button
                          key={category.value}
                          onClick={() => setSelectedCategory(category.value)}
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            selectedCategory === category.value
                              ? 'bg-blue-100 text-gray-700'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {category.label} ({category.count})
                        </button>
                      ))}
                    </div>
                    
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="votes">Sort by Votes</option>
                      <option value="recent">Sort by Recent</option>
                      <option value="priority">Sort by Priority</option>
                    </select>
                  </div>

                  {/* Feature List */}
                  {filteredFeatures.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-gray-400 mb-4">
                        <svg className="mx-auto h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No feature requests yet</h3>
                      <p className="text-gray-600 mb-4">Be the first to suggest a new feature!</p>
                      <button
                        onClick={() => setActiveTab('submit')}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Submit First Request
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredFeatures.map((feature) => (
                        <div key={feature.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:border-blue-300 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[feature.status]}`}>
                                  {feature.status.replace('-', ' ')}
                                </span>
                                <span className={`text-sm font-medium ${priorityColors[feature.priority as keyof typeof priorityColors]}`}>
                                  {feature.priority} priority
                                </span>
                              </div>
                              <p className="text-gray-700 mb-3">{feature.description}</p>
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span>By {feature.user?.name || 'Anonymous'}</span>
                                <span>•</span>
                                <span>{formatDate(feature.createdAt)}</span>
                                {feature.estimatedTimeline && (
                                  <>
                                    <span>•</span>
                                    <span className="text-gray-700 font-medium">ETA: {feature.estimatedTimeline}</span>
                                  </>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-3 ml-6">
                              <button
                                onClick={() => handleVote(feature.id)}
                                className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                              >
                                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                </svg>
                                <span className="font-medium">{feature.votes}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                      Feature Title *
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      required
                      value={newRequest.title}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Brief, descriptive title"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={newRequest.category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="new-feature">New Feature</option>
                      <option value="enhancement">Enhancement</option>
                      <option value="ui-ux">UI/UX Improvement</option>
                      <option value="integration">Integration</option>
                      <option value="performance">Performance</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                    Priority Level
                  </label>
                  <div className="flex space-x-4">
                    {['low', 'medium', 'high'].map(priority => (
                      <label key={priority} className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="priority"
                          value={priority}
                          checked={newRequest.priority === priority}
                          onChange={handleInputChange}
                          className="mr-2"
                        />
                        <span className={`text-sm font-medium ${priorityColors[priority as keyof typeof priorityColors]}`}>
                          {priority.charAt(0).toUpperCase() + priority.slice(1)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Detailed Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    required
                    rows={4}
                    value={newRequest.description}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe the feature in detail. What should it do? How should it work?"
                  />
                </div>

                <div>
                  <label htmlFor="useCases" className="block text-sm font-medium text-gray-700 mb-2">
                    Use Cases & Benefits
                  </label>
                  <textarea
                    id="useCases"
                    name="useCases"
                    rows={3}
                    value={newRequest.useCases}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="How would this feature be used? What problems does it solve?"
                  />
                </div>

                <div>
                  <label htmlFor="alternatives" className="block text-sm font-medium text-gray-700 mb-2">
                    Current Alternatives/Workarounds
                  </label>
                  <textarea
                    id="alternatives"
                    name="alternatives"
                    rows={2}
                    value={newRequest.alternatives}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="How do you currently handle this? Any workarounds you use?"
                  />
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setActiveTab('browse')}
                    className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md transition-colors"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Guidelines */}
        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Guidelines for Feature Requests</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">✅ Good Requests</h4>
              <ul className="space-y-1 text-gray-700">
                <li>• Clear, specific descriptions</li>
                <li>• Explain the business value</li>
                <li>• Provide use cases</li>
                <li>• Consider implementation complexity</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">📝 What Happens Next</h4>
              <ul className="space-y-1 text-gray-700">
                <li>• Community votes on requests</li>
                <li>• Team reviews popular requests</li>
                <li>• Requests get prioritized in roadmap</li>
                <li>• You'll be notified of updates</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <Toaster position="top-right" />
    </div>
  )
}
