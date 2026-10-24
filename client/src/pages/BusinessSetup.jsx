import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { businessApi } from '../services/api'
import { generateSlug, isValidUrl } from '../utils/helpers'
import { Button } from '../components'

export default function BusinessSetup() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const params = useParams()
  const isEditing = !!params.id
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    address: '',
    phone: '',
    google_review_url: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [slug, setSlug] = useState('')
  const [businessId, setBusinessId] = useState(null)
  const [savedReviewUrl, setSavedReviewUrl] = useState('')
  const [testingLink, setTestingLink] = useState(false)

  useEffect(() => {
    if (isEditing) {
      loadBusiness(params.id)
    } else {
      loadExistingBusiness()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, params.id])

  const loadExistingBusiness = async () => {
    try {
      const businesses = await businessApi.getAll()
      if (businesses.length > 0) {
        const biz = businesses[0]
        setBusinessId(biz.id)
        setFormData({
          name: biz.name,
          category: biz.category,
          address: biz.address,
          phone: biz.phone || '',
          google_review_url: biz.google_review_url,
        })
        setSavedReviewUrl(biz.google_review_url)
        setSlug(biz.slug)
      }
      // No business found is expected for new users - not an error
    } catch (err) {
      // Only log unexpected errors, not 404/empty responses
      if (err.message && !err.message.includes('404')) {
        console.error('Failed to load business:', err)
      }
    }
  }

  const loadBusiness = async (id) => {
    setLoading(true)
    try {
      const biz = await businessApi.get(id)
      setBusinessId(biz.id)
      setFormData({
        name: biz.name,
        category: biz.category,
        address: biz.address,
        phone: biz.phone || '',
        google_review_url: biz.google_review_url,
      })
      setSavedReviewUrl(biz.google_review_url)
      setSlug(biz.slug)
    } catch (err) {
      setErrors({ general: err.message })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
    if (name === 'name') {
      setSlug(generateSlug(value))
    }
  }

  const handleTestLink = () => {
    const url = formData.google_review_url.trim()
    if (!url) {
      setErrors({ google_review_url: 'Enter a URL first to test' })
      return
    }
    if (!isValidUrl(url)) {
      setErrors({ google_review_url: 'Please enter a valid URL' })
      return
    }
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Business name is required'
    if (!formData.category.trim()) newErrors.category = 'Category is required'
    if (!formData.address.trim()) newErrors.address = 'Address is required'
    if (!formData.google_review_url.trim()) {
      newErrors.google_review_url = 'Google Review URL is required'
    } else if (!isValidUrl(formData.google_review_url)) {
      newErrors.google_review_url = 'Please enter a valid URL'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    
    setSubmitting(true)
    try {
      const data = {
        ...formData,
        slug: slug || generateSlug(formData.name),
      }
      
      if (businessId) {
        await businessApi.update(businessId, data)
      } else {
        const result = await businessApi.create(data)
        setBusinessId(result.id)
        setSavedReviewUrl(result.google_review_url)
      }
      navigate('/dashboard')
    } catch (err) {
      setErrors({ general: err.message })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-white border-t-transparent"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-heading-lg font-bold text-white">{isEditing ? 'Edit Business' : 'Create Your Business'}</h1>
        <p className="text-[var(--text-muted)]">
          {isEditing ? 'Update your business information' : 'Add your business details to get started with Ratevo'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-6">
        {errors.general && (
          <div className="p-3 bg-[var(--error-bg)] border border-[var(--error-border)] rounded-xl text-[var(--error)] text-sm" role="alert">
            {errors.general}
          </div>
        )}

        <div>
          <label htmlFor="name" className="label">Business Name <span className="text-[var(--error)]">*</span></label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={formData.name}
            onChange={handleChange}
            className="input"
            placeholder="e.g., Swastik Hospital"
            disabled={submitting}
          />
          {errors.name && <p className="mt-1 text-sm text-[var(--error)]">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="category" className="label">Category <span className="text-[var(--error)]">*</span></label>
          <select
            id="category"
            name="category"
            required
            value={formData.category}
            onChange={handleChange}
            className="input"
            disabled={submitting}
          >
            <option value="">Select category</option>
            <option value="Hospital">Hospital</option>
            <option value="Clinic">Clinic</option>
            <option value="Restaurant">Restaurant</option>
            <option value="Cafe">Cafe</option>
            <option value="Hotel">Hotel</option>
            <option value="Spa">Spa</option>
            <option value="Salon">Salon</option>
            <option value="Gym">Gym</option>
            <option value="Retail">Retail Store</option>
            <option value="Automotive">Automotive</option>
            <option value="Professional Services">Professional Services</option>
            <option value="Other">Other</option>
          </select>
          {errors.category && <p className="mt-1 text-sm text-[var(--error)]">{errors.category}</p>}
        </div>

        <div>
          <label htmlFor="address" className="label">Address <span className="text-[var(--error)]">*</span></label>
          <textarea
            id="address"
            name="address"
            required
            rows={2}
            value={formData.address}
            onChange={handleChange}
            className="input"
            placeholder="Full address including city"
            disabled={submitting}
          />
          {errors.address && <p className="mt-1 text-sm text-[var(--error)]">{errors.address}</p>}
        </div>

        <div>
          <label htmlFor="phone" className="label">Phone (optional)</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            className="input"
            placeholder="+1 (555) 123-4567"
            disabled={submitting}
          />
        </div>

        <div>
          <label htmlFor="google_review_url" className="label">Google Review URL <span className="text-[var(--error)]">*</span></label>
          <div className="flex gap-2">
            <input
              id="google_review_url"
              name="google_review_url"
              type="url"
              required
              value={formData.google_review_url}
              onChange={handleChange}
              className="input flex-1"
              placeholder="https://maps.app.goo.gl/... or https://g.page/.../review"
              disabled={submitting}
            />
            <Button
              type="button"
              variant="secondary"
              onClick={handleTestLink}
              disabled={testingLink || submitting || !formData.google_review_url.trim()}
            >
              {testingLink ? 'Testing...' : 'Test Link'}
            </Button>
          </div>
          {errors.google_review_url && <p className="mt-1 text-sm text-[var(--error)]">{errors.google_review_url}</p>}
          <p className="mt-1 text-sm text-[var(--text-subtle)]">
            Paste a Google Maps link (e.g., https://maps.app.goo.gl/...) or the &ldquo;Ask for reviews&rdquo; link from Google Business Profile (https://g.page/.../review).
            Maps links are automatically converted to a review link.
          </p>
        </div>

        {savedReviewUrl && (
          <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
            <p className="text-sm text-white">
              <strong>Saved review link:</strong>{' '}
              <a href={savedReviewUrl} target="_blank" rel="noopener noreferrer" className="underline hover:opacity-70 mono">
                {savedReviewUrl}
              </a>
            </p>
          </div>
        )}

        <div className="pt-4 border-t border-[var(--border)]">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="submit"
              variant="primary"
              width="full"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Business')}
            </Button>
            <Button
              type="button"
              variant="secondary"
              width="full"
              onClick={() => navigate('/dashboard')}
              disabled={submitting}
            >
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}