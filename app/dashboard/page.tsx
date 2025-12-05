'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Plus, Filter, RefreshCw, LogOut, Edit, Trash2, X } from 'lucide-react'
import toast from 'react-hot-toast'

interface Booking {
  rowIndex: number
  bookingName: string
  contactNumber: string
  year: string
  january: number
  february: number
  march: number
  april: number
  may: number
  june: number
  july: number
  august: number
  september: number
  october: number
  november: number
  december: number
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null)
  
  // Filters
  const [filterName, setFilterName] = useState('')
  const [filterContact, setFilterContact] = useState('')
  const [filterYear, setFilterYear] = useState('')
  
  // Form state
  const [formData, setFormData] = useState<Omit<Booking, 'rowIndex'>>({
    bookingName: '',
    contactNumber: '',
    year: new Date().getFullYear().toString(),
    january: 0,
    february: 0,
    march: 0,
    april: 0,
    may: 0,
    june: 0,
    july: 0,
    august: 0,
    september: 0,
    october: 0,
    november: 0,
    december: 0,
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchBookings()
    }
  }, [status, router])

  useEffect(() => {
    applyFilters()
  }, [bookings, filterName, filterContact, filterYear])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/bookings')
      if (res.ok) {
        const data = await res.json()
        setBookings(data)
      } else {
        toast.error('Failed to load bookings')
      }
    } catch (error) {
      toast.error('Error loading bookings')
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...bookings]
    
    if (filterName) {
      filtered = filtered.filter(b => b.bookingName === filterName)
    }
    if (filterContact) {
      filtered = filtered.filter(b => b.contactNumber === filterContact)
    }
    if (filterYear) {
      filtered = filtered.filter(b => b.year === filterYear)
    }
    
    setFilteredBookings(filtered)
  }

  const handleOpenModal = (booking?: Booking) => {
    if (booking) {
      setEditingBooking(booking)
      const { rowIndex, ...rest } = booking
      setFormData(rest)
    } else {
      setEditingBooking(null)
      setFormData({
        bookingName: '',
        contactNumber: '',
        year: new Date().getFullYear().toString(),
        january: 0,
        february: 0,
        march: 0,
        april: 0,
        may: 0,
        june: 0,
        july: 0,
        august: 0,
        september: 0,
        october: 0,
        november: 0,
        december: 0,
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingBooking(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingBooking) {
        // Update
        const res = await fetch('/api/bookings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rowIndex: editingBooking.rowIndex,
            ...formData,
          }),
        })
        
        if (res.ok) {
          toast.success('Booking updated successfully')
          fetchBookings()
          handleCloseModal()
        } else {
          toast.error('Failed to update booking')
        }
      } else {
        // Add new
        const res = await fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
        
        if (res.ok) {
          toast.success('Booking added successfully')
          fetchBookings()
          handleCloseModal()
        } else {
          toast.error('Failed to add booking')
        }
      }
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  const handleDelete = async (rowIndex: number) => {
    if (!confirm('Are you sure you want to delete this booking?')) return
    
    try {
      const res = await fetch(`/api/bookings?rowIndex=${rowIndex}`, {
        method: 'DELETE',
      })
      
      if (res.ok) {
        toast.success('Booking deleted successfully')
        fetchBookings()
      } else {
        toast.error('Failed to delete booking')
      }
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  const handleLogout = async () => {
    const { signOut } = await import('next-auth/react')
    signOut({ callbackUrl: '/login' })
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  const uniqueNames = Array.from(new Set(bookings.map(b => b.bookingName))).sort()
  const uniqueContacts = Array.from(new Set(bookings.map(b => b.contactNumber))).sort()
  const uniqueYears = Array.from(new Set(bookings.map(b => b.year))).sort()

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Booking Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome, {session?.user?.name}</p>
          </div>
          <button
            onClick={handleLogout}
            className="btn-secondary flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        {/* Actions and Filters */}
        <div className="card mb-6">
          <div className="flex flex-wrap gap-4 mb-4">
            <button
              onClick={() => handleOpenModal()}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Booking
            </button>
            <button
              onClick={fetchBookings}
              className="btn-secondary flex items-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Refresh
            </button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter className="w-4 h-4 inline mr-1" />
                Booking Name
              </label>
              <select
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                className="input-field"
              >
                <option value="">All Bookings</option>
                {uniqueNames.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter className="w-4 h-4 inline mr-1" />
                Contact Number
              </label>
              <select
                value={filterContact}
                onChange={(e) => setFilterContact(e.target.value)}
                className="input-field"
              >
                <option value="">All Contacts</option>
                {uniqueContacts.map(contact => (
                  <option key={contact} value={contact}>{contact}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter className="w-4 h-4 inline mr-1" />
                Year
              </label>
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="input-field"
              >
                <option value="">All Years</option>
                {uniqueYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          {(filterName || filterContact || filterYear) && (
            <button
              onClick={() => {
                setFilterName('')
                setFilterContact('')
                setFilterYear('')
              }}
              className="mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-600">
          Showing <span className="font-semibold">{filteredBookings.length}</span> of{' '}
          <span className="font-semibold">{bookings.length}</span> bookings
        </div>

        {/* Table */}
        <div className="card overflow-x-auto max-h-[500px] overflow-y-auto">
          <table className="w-full min-w-max">
            <thead className="bg-primary-600 text-white">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Booking Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Contact</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Year</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Jan</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Feb</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Mar</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Apr</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">May</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Jun</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Jul</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Aug</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Sep</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Oct</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Nov</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Dec</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredBookings.map((booking) => (
                <tr key={booking.rowIndex} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{booking.bookingName}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{booking.contactNumber}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-primary-600">{booking.year}</td>
                  <td className="px-4 py-3 text-sm text-center">{booking.january || '-'}</td>
                  <td className="px-4 py-3 text-sm text-center">{booking.february || '-'}</td>
                  <td className="px-4 py-3 text-sm text-center">{booking.march || '-'}</td>
                  <td className="px-4 py-3 text-sm text-center">{booking.april || '-'}</td>
                  <td className="px-4 py-3 text-sm text-center">{booking.may || '-'}</td>
                  <td className="px-4 py-3 text-sm text-center">{booking.june || '-'}</td>
                  <td className="px-4 py-3 text-sm text-center">{booking.july || '-'}</td>
                  <td className="px-4 py-3 text-sm text-center">{booking.august || '-'}</td>
                  <td className="px-4 py-3 text-sm text-center">{booking.september || '-'}</td>
                  <td className="px-4 py-3 text-sm text-center">{booking.october || '-'}</td>
                  <td className="px-4 py-3 text-sm text-center">{booking.november || '-'}</td>
                  <td className="px-4 py-3 text-sm text-center">{booking.december || '-'}</td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleOpenModal(booking)}
                        className="text-primary-600 hover:text-primary-700 p-1"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(booking.rowIndex)}
                        className="text-red-600 hover:text-red-700 p-1"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredBookings.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No bookings found. Add your first booking to get started!
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingBooking ? 'Edit Booking' : 'Add New Booking'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Booking Name *
                  </label>
                  <input
                    type="text"
                    value={formData.bookingName}
                    onChange={(e) => setFormData({ ...formData, bookingName: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Number *
                  </label>
                  <input
                    type="text"
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Year *
                  </label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="input-field"
                    min="2020"
                    max="2030"
                    required
                  />
                </div>

                {['january', 'february', 'march', 'april', 'may', 'june',
                  'july', 'august', 'september', 'october', 'november', 'december'].map((month) => (
                  <div key={month}>
                    <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                      {month}
                    </label>
                    <input
                      type="number"
                      value={formData[month as keyof typeof formData] as number}
                      onChange={(e) => setFormData({
                        ...formData,
                        [month]: parseInt(e.target.value) || 0
                      })}
                      className="input-field"
                      min="0"
                    />
                  </div>
                ))}
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingBooking ? 'Update Booking' : 'Add Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}