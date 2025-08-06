'use client'

import { useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'

interface FeatureRequest {
  id: string
  title: string
  description: string
  category: string
  priority: string
  votes: number
  status: 'submitted' | 'reviewing' | 'planned' | 'in-progress' | 'completed' | 'declined'
  submittedBy: string
  submittedAt: string
  estimatedTimeline?: string
}

export default function FeatureRequests() {
  const [activeTab, setActiveTab] = useState<'browse' | 'submit'>('browse')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('votes')
  
  const [newRequest, setNewRequest] = useState({
    title: '',
    description: '',
    category: 'enhancement',
    priority: 'medium',
    useCases: '',
    alternatives: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Mock data - in real app this would come from API
  const [features, setFeatures] = useState<FeatureRequest[]>([
    {
      id: '1',
      title: 'Expense Categories Auto-Suggestions',
      description: 'Automatically suggest expense categories based on transaction descriptions using ML',
      category: 'enhancement',
      priority: 'high',
      votes: 47,
      status: 'planned',
      submittedBy: 'Rajesh K.',
      submittedAt: '2024-01-15',
      estimatedTimeline: 'Q2 2024'
    },
    {
      id: '2',
      title: 'Dark Mode Support',
      description: 'Add dark mode theme for better viewing experience in low light conditions',
      category: 'ui-ux',
      priority: 'medium',
      votes: 32,
      status: 'in-progress',
      submittedBy: 'Priya S.',
      submittedAt: '2024-01-10',
      estimatedTimeline: 'Q1 2024'
    },
    {
      id: '3',
      title: 'Mobile App for iOS and Android',
      description: 'Native mobile applications for better mobile experience and offline access',
      category: 'new-feature',
      priority: 'high',
      votes: 89,
      status: 'reviewing',
      submittedBy: 'Amit P.',
      submittedAt: '2024-01-20'
    },
    {
      id: '4',
      title: 'Integration with Indian Banks APIs',
      description: 'Direct integration with major Indian banks for automatic transaction import',
      category: 'integration',
      priority: 'high',
      votes: 156,
      status: 'planned',
      submittedBy: 'Kavitha M.',
      submittedAt: '2024-01-05',
      estimatedTimeline: 'Q3 2024'
    },
    {
      id: '5',
      title: 'Investment Comparison Tool',
      description: 'Compare different investment options side by side with projections',
      category: 'new-feature',
      priority: 'medium',
      votes: 23,
      status: 'submitted',
      submittedBy: 'Suresh D.',
      submittedAt: '2024-01-25'
    },
    {
      id: '6',
      title: 'Bulk Transaction Import from Excel',
      description: 'Enhanced CSV/Excel import with better mapping and validation',
      category: 'enhancement',
      priority: 'medium',
      votes: 41,
      status: 'completed',
      submittedBy: 'Neha T.',
      submittedAt: '2023-12-15'
    }
  ])

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
    'reviewing': 'bg-yellow-100 text-yellow-800',
    'planned': 'bg-blue-100 text-blue-800',
    'in-progress': 'bg-purple-100 text-purple-800',
    'completed': 'bg-green-100 text-green-800',
    'declined': 'bg-red-100 text-red-800'
  }

  const priorityColors = {
    'low': 'text-green-600',
    'medium': 'text-yellow-600',
    'high': 'text-red-600'
  }

  const filteredFeatures = features
    .filter(feature => selectedCategory === 'all' || feature.category === selectedCategory)
    .sort((a, b) => {
      if (sortBy === 'votes') return b.votes - a.votes
      if (sortBy === 'recent') return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      if (sortBy === 'priority') {
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        return priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder]
      }
      return 0
    })

  const handleVote = (featureId: string) => {
    setFeatures(prev => prev.map(feature => 
      feature.id === featureId 
        ? { ...feature, votes: feature.votes + 1 }
        : feature
    ))
    toast.success('Vote recorded! Thank you for your feedback.')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const newFeature: FeatureRequest = {
        id: Date.now().toString(),
        title: newRequest.title,
        description: newRequest.description,
        category: newRequest.category,
        priority: newRequest.priority,
        votes: 1,
        status: 'submitted',
        submittedBy: 'You',
        submittedAt: new Date().toISOString().split('T')[0]
      }
      
      setFeatures(prev => [newFeature, ...prev])
      toast.success('Feature request submitted successfully!')
      
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
    } catch (error) {
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
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Browse Requests
              </button>
              <button
                onClick={() => setActiveTab('submit')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'submit'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Submit Request
              </button>
            </nav>
          </div>

          {activeTab === 'browse' ? (
            <div className="p-6">
              {/* Filters */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
                <div className="flex flex-wrap gap-2">
                  {categories.map(category => (
                    <button
                      key={category.value}
                      onClick={() => setSelectedCategory(category.value)}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        selectedCategory === category.value
                          ? 'bg-blue-100 text-blue-800'
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
                          <span>By {feature.submittedBy}</span>
                          <span>•</span>
                          <span>{new Date(feature.submittedAt).toLocaleDateString()}</span>
                          {feature.estimatedTimeline && (
                            <>
                              <span>•</span>
                              <span className="text-blue-600 font-medium">ETA: {feature.estimatedTimeline}</span>
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
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Guidelines for Feature Requests</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-medium text-blue-900 mb-2">✅ Good Requests</h4>
              <ul className="space-y-1 text-blue-800">
                <li>• Clear, specific descriptions</li>
                <li>• Explain the business value</li>
                <li>• Provide use cases</li>
                <li>• Consider implementation complexity</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-900 mb-2">📝 What Happens Next</h4>
              <ul className="space-y-1 text-blue-800">
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
