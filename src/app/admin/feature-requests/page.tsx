'use client'

import { useUser } from '@clerk/nextjs'
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
  isPublic: boolean
  adminNotes?: string
  estimatedTimeline?: string
  user?: {
    name: string
    email: string
  }
  createdAt: string
  updatedAt: string
}

export default function AdminFeatureRequests() {
  const { user } = useUser()
  const [featureRequests, setFeatureRequests] = useState<FeatureRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<FeatureRequest | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [updating, setUpdating] = useState(false)

  const [updateForm, setUpdateForm] = useState({
    status: '',
    isPublic: false,
    adminNotes: '',
    estimatedTimeline: ''
  })

  // Simple admin check
  const isAdmin = user?.emailAddresses?.[0]?.emailAddress === 'lifeofram86@gmail.com'

  useEffect(() => {
    if (isAdmin) {
      fetchFeatureRequests()
    }
  }, [isAdmin])

  const fetchFeatureRequests = async () => {
    try {
      const response = await fetch('/api/admin/feature-requests')
      if (response.ok) {
        const data = await response.json()
        setFeatureRequests(data.featureRequests)
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

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRequest) return

    setUpdating(true)
    try {
      const response = await fetch('/api/admin/feature-requests', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedRequest.id,
          ...updateForm,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        toast.success('Feature request updated successfully')
        setShowModal(false)
        setSelectedRequest(null)
        fetchFeatureRequests() // Refresh the list
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to update feature request')
      }
    } catch (error) {
      console.error('Error updating feature request:', error)
      toast.error('Failed to update feature request')
    } finally {
      setUpdating(false)
    }
  }

  const openModal = (request: FeatureRequest) => {
    setSelectedRequest(request)
    setUpdateForm({
      status: request.status,
      isPublic: request.isPublic,
      adminNotes: request.adminNotes || '',
      estimatedTimeline: request.estimatedTimeline || ''
    })
    setShowModal(true)
  }

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

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin: Feature Requests</h1>
          <p className="text-gray-600">Manage and approve feature requests from users</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading feature requests...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Votes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Public
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {featureRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{request.title}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {request.description}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{request.user?.name || 'Anonymous'}</div>
                        <div className="text-sm text-gray-500">{request.user?.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[request.status]}`}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${priorityColors[request.priority as keyof typeof priorityColors]}`}>
                          {request.priority.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {request.votes}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          request.isPublic ? 'bg-green-100 text-gray-700' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {request.isPublic ? 'Public' : 'Private'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => openModal(request)}
                          className="text-gray-700 hover:text-gray-700"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {featureRequests.length === 0 && (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No feature requests yet</h3>
                <p className="text-gray-600">Feature requests will appear here when users submit them.</p>
              </div>
            )}
          </div>
        )}

        {/* Modal */}
        {showModal && selectedRequest && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Edit Feature Request: {selectedRequest.title}
                </h3>
                
                <form onSubmit={handleUpdate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={updateForm.status}
                      onChange={(e) => setUpdateForm(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="submitted">Submitted</option>
                      <option value="reviewing">Reviewing</option>
                      <option value="approved">Approved</option>
                      <option value="planned">Planned</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="declined">Declined</option>
                    </select>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isPublic"
                      checked={updateForm.isPublic}
                      onChange={(e) => setUpdateForm(prev => ({ ...prev, isPublic: e.target.checked }))}
                      className="mr-2"
                    />
                    <label htmlFor="isPublic" className="text-sm font-medium text-gray-700">
                      Make public (visible to all users)
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Admin Notes (Optional)
                    </label>
                    <textarea
                      value={updateForm.adminNotes}
                      onChange={(e) => setUpdateForm(prev => ({ ...prev, adminNotes: e.target.value }))}
                      rows={3}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Internal notes or public feedback..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estimated Timeline (Optional)
                    </label>
                    <input
                      type="text"
                      value={updateForm.estimatedTimeline}
                      onChange={(e) => setUpdateForm(prev => ({ ...prev, estimatedTimeline: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Q2 2024, Next month, etc."
                    />
                  </div>

                  <div className="flex justify-end space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={updating}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {updating ? 'Updating...' : 'Update'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
      <Toaster position="top-right" />
    </div>
  )
}