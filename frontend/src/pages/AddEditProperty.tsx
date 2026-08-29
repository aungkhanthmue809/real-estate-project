import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, X, MapPin, FileText, Home, Map, Camera, Building2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useProperties } from '../contexts/PropertiesContext';
import { YANGON_TOWNSHIPS, FEATURES_EN } from '../data/myanmarProperties';
import { resolvePropertyTownship } from '../utils/township';
import type { OwnershipType, Property, PropertyRequest, PropertyType, SaleStatus, User } from '../types';

const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: 'APARTMENT', label: 'Apartment' },
  { value: 'HOUSE', label: 'House' },
  { value: 'CONDO', label: 'Condo' },
  { value: 'LAND', label: 'Land' },
  { value: 'TOWNHOUSE', label: 'Townhouse' },
];

const OWNERSHIP_TYPES: { value: OwnershipType; label: string }[] = [
  { value: 'FREEHOLD', label: 'Freehold' },
  { value: 'LEASEHOLD', label: 'Leasehold' },
  { value: 'GOVERNMENT', label: 'Government Grant' },
  { value: 'PERMIT', label: 'Permit Land' },
  { value: 'OTHER', label: 'Other' },
];

const BEDROOM_OPTIONS = [0, 1, 2, 3, 4, 5, 6, 7, 8];
const BATHROOM_OPTIONS = [0, 1, 2, 3, 4, 5, 6];
const PARKING_OPTIONS = [0, 1, 2, 3, 4, 5];

interface FormData {
  title: string;
  propertyType: PropertyType | '';
  status: SaleStatus;
  price: string;
  bedrooms: number;
  bathrooms: number;
  parking: number | '';
  yearBuilt: string;
  area: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  township: string;
  description: string;
  features: string[];
  imageUrl: string;
  additionalImages: string[];
  ownershipType: OwnershipType | '';
  contactPhone: string;
  contactEmail: string;
  hasGrant: boolean;
  hasPermit: boolean;
  latitude: number | null;
  longitude: number | null;
  plotDimension: string;
  landShape: string;
  roadWidth: string;
}

const INITIAL_FORM: FormData = {
  title: '',
  propertyType: '',
  status: 'FOR_SALE',
  price: '',
  bedrooms: 2,
  bathrooms: 1,
  parking: 1,
  yearBuilt: '',
  area: '',
  streetAddress: '',
  city: 'Yangon',
  state: 'Yangon Region',
  zipCode: '',
  township: '',
  description: '',
  features: [],
  imageUrl: '',
  additionalImages: [],
  ownershipType: '',
  contactPhone: '',
  contactEmail: '',
  hasGrant: false,
  hasPermit: false,
  latitude: null,
  longitude: null,
  plotDimension: '',
  landShape: '',
  roadWidth: '',
};

function formFromProperty(p: Property, user: User | null): FormData {
  const tw = resolvePropertyTownship(p);
  return {
    title: p.title,
    propertyType: p.propertyType,
    status: p.status,
    price: String(p.price),
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    parking: p.parking ?? '',
    yearBuilt: p.yearBuilt == null ? '' : String(p.yearBuilt),
    area: String(p.area),
    streetAddress: p.streetAddress?.trim() ? p.streetAddress : p.location,
    city: p.city ?? 'Yangon',
    state: p.stateRegion ?? 'Yangon Region',
    zipCode: p.zipCode ?? '',
    township: tw ? tw.id : '',
    description: p.description,
    features: [...(p.features ?? [])],
    imageUrl: p.imageUrl ?? '',
    additionalImages: [],
    ownershipType: p.ownershipType ?? '',
    contactPhone: p.ownerPhone || user?.phone || '',
    contactEmail: user?.email || '',
    hasGrant: p.hasGrant ?? false,
    hasPermit: p.hasPermit ?? false,
    latitude: p.latitude ?? null,
    longitude: p.longitude ?? null,
    plotDimension: '',
    landShape: '',
    roadWidth: '',
  };
}

export function AddEditProperty() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { myProperties, loading: propertiesLoading, addProperty, updateProperty } = useProperties();
  const existing = id ? myProperties.find((p) => String(p.id) === id) : undefined;
  const isEditing = id !== undefined;
  const populatedPropertyId = useRef<string | undefined>(undefined);

  const [currentStep, setCurrentStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<FormData>(() =>
    existing
      ? formFromProperty(existing, user)
      : {
          ...INITIAL_FORM,
          contactPhone: user?.phone || '',
          contactEmail: user?.email || '',
        }
  );

  useEffect(() => {
    if (existing && populatedPropertyId.current !== id) {
      setFormData(formFromProperty(existing, user));
      populatedPropertyId.current = id;
    }
  }, [existing, id, user]);

  const featureLabels = FEATURES_EN;
  const isLand = formData.propertyType === 'LAND';

  const steps = [
    { id: 1, label: 'Basic Info', icon: Home },
    { id: 2, label: 'Location', icon: Map },
    { id: 3, label: 'Details & Features', icon: FileText },
    { id: 4, label: 'Photos & Review', icon: Camera },
  ];

  const updateForm = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    setErrors({});
  };

  const toggleFeature = (feature: string) => {
    updateForm({
      features: formData.features.includes(feature)
        ? formData.features.filter((item) => item !== feature)
        : [...formData.features, feature],
    });
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.title.trim()) newErrors.title = 'Title is required';
      if (!formData.propertyType) newErrors.propertyType = 'Property type is required';
      if (!formData.price || Number(formData.price) <= 0) newErrors.price = 'Price is required';
      if (!formData.area || Number(formData.area) <= 0) newErrors.area = 'Area is required';
      if (formData.yearBuilt) {
        const year = Number(formData.yearBuilt);
        if (!Number.isInteger(year) || year < 1900 || year > 2030) {
          newErrors.yearBuilt = 'Year built must be between 1900 and 2030';
        }
      }
    }

    if (step === 2) {
      if (!formData.township && !existing) newErrors.township = 'Township is required';
      if (!formData.streetAddress.trim()) newErrors.streetAddress = 'Street address is required';
    }

    if (step === 3) {
      if (!formData.description.trim()) newErrors.description = 'Description is required';
      if (formData.description.length > 2000) newErrors.description = 'Description must be under 2000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleFormKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  const jumpToStep = (target: number) => {
    setCurrentStep(target);
    setErrors({});
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  const selectedTownship = YANGON_TOWNSHIPS.find(tw => tw.id === formData.township);

  const handleSubmit = async () => {
    if (isEditing && !existing) {
      setErrors({ submit: 'Property not found or you do not own it.' });
      return;
    }

    if (formData.yearBuilt) {
      const year = Number(formData.yearBuilt);
      if (!Number.isInteger(year) || year < 1900 || year > 2030) {
        setCurrentStep(1);
        setErrors({ yearBuilt: 'Year built must be between 1900 and 2030' });
        return;
      }
    }

    setLoading(true);
    setErrors({});

    try {
      const originalTownship = existing
        ? resolvePropertyTownship(existing)
        : undefined;
      const originalStreetAddress = existing?.streetAddress?.trim() || existing?.location;
      const locationUnchanged = existing
        && formData.streetAddress.trim() === originalStreetAddress
        && formData.township === (originalTownship?.id ?? '');
      const location = locationUnchanged
        ? existing.location
        : [formData.streetAddress.trim(), selectedTownship?.nameEn].filter(Boolean).join(', ');
      const payload: PropertyRequest = {
        title: formData.title,
        description: formData.description,
        price: Number(formData.price) || 0,
        location,
        propertyType: (formData.propertyType || 'APARTMENT') as PropertyType,
        status: formData.status,
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms,
        area: Number(formData.area) || 0,
        parking: formData.parking === '' ? null : Number(formData.parking),
        yearBuilt: formData.yearBuilt === '' ? null : Number(formData.yearBuilt),
        ownershipType: formData.ownershipType || null,
        streetAddress: formData.streetAddress.trim() || null,
        township: selectedTownship?.nameEn ?? existing?.township ?? null,
        city: formData.city.trim() || null,
        stateRegion: formData.state.trim() || null,
        zipCode: formData.zipCode.trim() || null,
        hasGrant: formData.hasGrant,
        hasPermit: formData.hasPermit,
        latitude: formData.latitude,
        longitude: formData.longitude,
        features: formData.features,
        imageUrl: formData.imageUrl,
      };

      if (existing) {
        await updateProperty(existing.id, payload);
      } else {
        await addProperty(payload);
      }

      setSubmitted(true);
    } catch (error) {
      setErrors({
        submit: error instanceof Error
          ? error.message
          : 'Unable to save the property.',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: string): string => {
    const num = Number(price);
    if (isNaN(num)) return price;
    return num.toLocaleString();
  };

  const getProgressTransform = (): string => {
    return `scaleX(${(currentStep - 1) / (steps.length - 1)})`;
  };

  if (submitted) {
    return (
      <div className="form-success">
        <div className="form-success-content">
          <div className="form-success-icon">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h2 className="form-success-title">
            Property Submitted!
          </h2>
          <p className="form-success-desc">
            Your property has been submitted for approval.
          </p>
          <p className="form-success-desc" style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>
            After admin approval, your listing will appear in your ownership records.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              padding: '14px 32px',
              background: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
            }}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="form-page">
      <div className="form-container">
        <button onClick={() => navigate(-1)} className="form-back-btn">
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        <h1 className="form-page-title">
          {isEditing
            ? 'Edit Property'
            : 'Add New Property'}
        </h1>
        <p className="form-page-subtitle">
          Complete the form below to list your property on UrbanNest
        </p>
        {isEditing && !propertiesLoading && !existing && (
          <p className="form-error">
            Property not found or you do not own it.
          </p>
        )}

        <div className="step-indicator">
          <div className="step-indicator-progress" style={{ transform: getProgressTransform() }} />
          {steps.map((step) => (
            <button
              key={step.id}
              type="button"
              onClick={() => jumpToStep(step.id)}
              className="step-item"
              aria-label={step.label}
            >
              <div className={`step-circle ${currentStep > step.id ? 'completed' : currentStep === step.id ? 'active' : ''}`}>
                {currentStep > step.id ? <Check className="w-5 h-5" /> : step.id}
              </div>
              <span className={`step-label ${currentStep >= step.id ? 'active' : ''}`}>
                {step.label}
              </span>
            </button>
          ))}
        </div>

        <div className="form-card">
          <div onKeyDown={handleFormKeyDown}>
            <div className="form-card-body">
              {currentStep === 1 && (
                <div>
                  <div className="form-section-header">
                    <div className="form-section-icon blue">
                      <Home className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="form-section-title">
                        Basic Information
                      </h2>
                      <p className="form-section-desc">
                        Fundamental details about your property
                      </p>
                    </div>
                  </div>

                  <div className="form-field">
                    <label className="form-label">
                      Listing Title <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => updateForm({ title: e.target.value })}
                      className={`form-input ${errors.title ? 'error' : ''}`}
                      placeholder="e.g., Modern Waterfront Residence"
                    />
                    {errors.title && <p className="form-error">{errors.title}</p>}
                  </div>

                  <div className="form-grid-2">
                    <div className="form-field">
                      <label className="form-label">
                        Property Type <span className="required">*</span>
                      </label>
                      <select
                        value={formData.propertyType}
                        onChange={(e) => updateForm({ propertyType: e.target.value as PropertyType })}
                        className={`form-select ${errors.propertyType ? 'error' : ''}`}
                      >
                        <option value="">Select Type</option>
                        {PROPERTY_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                      {errors.propertyType && <p className="form-error">{errors.propertyType}</p>}
                    </div>

                    <div className="form-field">
                      <label className="form-label">
                        Listing Status
                      </label>
                      <div className="status-toggle">
                        <button
                          type="button"
                          onClick={() => updateForm({ status: 'FOR_SALE' })}
                          className={`status-toggle-btn ${formData.status === 'FOR_SALE' ? 'active' : ''}`}
                        >
                          For Sale
                        </button>
                        <button
                          type="button"
                          onClick={() => updateForm({ status: 'FOR_RENT' })}
                          className={`status-toggle-btn ${formData.status === 'FOR_RENT' ? 'active' : ''}`}
                        >
                          For Rent
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="form-field">
                    <label className="form-label">
                      Asking Price (MMK) <span className="required">*</span>
                    </label>
                    <div className="price-input-wrapper">
                      <span className="price-input-prefix">K</span>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => updateForm({ price: e.target.value })}
                        className={`form-input ${errors.price ? 'error' : ''}`}
                        placeholder="0"
                        min="0"
                      />
                    </div>
                    {errors.price && <p className="form-error">{errors.price}</p>}
                  </div>

                  {isLand ? (
                    <div className="form-grid-4">
                      <div className="form-field">
                        <label className="form-label">
                          Land Area <span className="required">*</span>
                        </label>
                        <input
                          type="number"
                          value={formData.area}
                          onChange={(e) => updateForm({ area: e.target.value })}
                          className={`form-input ${errors.area ? 'error' : ''}`}
                          placeholder="e.g., 2400"
                          min="0"
                        />
                        {errors.area && <p className="form-error">{errors.area}</p>}
                      </div>
                      <div className="form-field">
                        <label className="form-label">
                          Plot/Frontage Width
                        </label>
                        <input
                          type="number"
                          value={formData.plotDimension}
                          disabled
                          className="form-input"
                          placeholder="e.g., 20"
                          min="0"
                        />
                      </div>
                      <div className="form-field">
                        <label className="form-label">
                          Land Shape
                        </label>
                        <select
                          value={formData.landShape}
                          disabled
                          className="form-select"
                        >
                          <option value="">Select</option>
                          <option value="RECTANGLE">Rectangular</option>
                          <option value="SQUARE">Square</option>
                          <option value="CORNER">Corner plot</option>
                          <option value="IRREGULAR">Irregular</option>
                        </select>
                      </div>
                      <div className="form-field">
                        <label className="form-label">
                          Road Width (ft)
                        </label>
                        <input
                          type="number"
                          value={formData.roadWidth}
                          disabled
                          className="form-input"
                          placeholder="30"
                          min="0"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="form-grid-4">
                        <div className="form-field">
                          <label className="form-label">
                            Bedrooms
                          </label>
                          <select
                            value={formData.bedrooms}
                            onChange={(e) => updateForm({ bedrooms: Number(e.target.value) })}
                            className="form-select"
                          >
                            {BEDROOM_OPTIONS.map((n) => (
                              <option key={n} value={n}>{n}</option>
                            ))}
                          </select>
                        </div>
                        <div className="form-field">
                          <label className="form-label">
                            Bathrooms
                          </label>
                          <select
                            value={formData.bathrooms}
                            onChange={(e) => updateForm({ bathrooms: Number(e.target.value) })}
                            className="form-select"
                          >
                            {BATHROOM_OPTIONS.map((n) => (
                              <option key={n} value={n}>{n}</option>
                            ))}
                          </select>
                        </div>
                        <div className="form-field">
                          <label className="form-label">
                            Parking
                          </label>
                          <select
                            value={formData.parking}
                            onChange={(e) => updateForm({ parking: e.target.value === '' ? '' : Number(e.target.value) })}
                            className="form-select"
                          >
                            <option value="">Not specified</option>
                            {PARKING_OPTIONS.map((n) => (
                              <option key={n} value={n}>{n}</option>
                            ))}
                          </select>
                        </div>
                        <div className="form-field">
                          <label className="form-label">
                            Year Built
                          </label>
                          <input
                            type="number"
                            value={formData.yearBuilt}
                            onChange={(e) => updateForm({ yearBuilt: e.target.value })}
                            className={`form-input ${errors.yearBuilt ? 'error' : ''}`}
                            placeholder="2024"
                            min="1900"
                            max="2030"
                          />
                          {errors.yearBuilt && <p className="form-error">{errors.yearBuilt}</p>}
                        </div>
                      </div>

                      <div className="form-field">
                        <label className="form-label">
                          Total Area (sqft) <span className="required">*</span>
                        </label>
                        <input
                          type="number"
                          value={formData.area}
                          onChange={(e) => updateForm({ area: e.target.value })}
                          className={`form-input ${errors.area ? 'error' : ''}`}
                          placeholder="e.g., 2400"
                          min="0"
                        />
                        {errors.area && <p className="form-error">{errors.area}</p>}
                      </div>
                    </>
                  )}
                </div>
              )}

              {currentStep === 2 && (
                <div>
                  <div className="form-section-header">
                    <div className="form-section-icon green">
                      <Map className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="form-section-title">
                        Property Location
                      </h2>
                      <p className="form-section-desc">
                        Where is your property located?
                      </p>
                    </div>
                  </div>

                  <div className="form-grid-2">
                    <div className="form-field">
                      <label className="form-label">
                        Township <span className="required">*</span>
                      </label>
                      <select
                        value={formData.township}
                        onChange={(e) => updateForm({ township: e.target.value })}
                        className={`form-select ${errors.township ? 'error' : ''}`}
                      >
                        <option value="">Select Township</option>
                        {YANGON_TOWNSHIPS.map((tw) => (
                          <option key={tw.id} value={tw.id}>
                            {tw.nameEn}
                          </option>
                        ))}
                      </select>
                      {errors.township && <p className="form-error">{errors.township}</p>}
                    </div>

                    <div className="form-field">
                      <label className="form-label">
                        City
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        disabled
                        className="form-input"
                        placeholder="Yangon"
                      />
                    </div>
                  </div>

                  <div className="form-grid-2">
                    <div className="form-field">
                      <label className="form-label">
                        State / Region
                      </label>
                      <input
                        type="text"
                        value={formData.state}
                        disabled
                        className="form-input"
                        placeholder="Yangon Region"
                      />
                    </div>

                    <div className="form-field">
                      <label className="form-label">
                        ZIP Code
                      </label>
                      <input
                        type="text"
                        value={formData.zipCode}
                        onChange={(e) => updateForm({ zipCode: e.target.value })}
                        className="form-input"
                        placeholder="11181"
                      />
                    </div>
                  </div>

                  <div className="form-field">
                    <label className="form-label">
                      Street Address <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.streetAddress}
                      onChange={(e) => updateForm({ streetAddress: e.target.value })}
                      className={`form-input ${errors.streetAddress ? 'error' : ''}`}
                      placeholder="e.g., No. 45, Shwegondine Road"
                    />
                    {errors.streetAddress && <p className="form-error">{errors.streetAddress}</p>}
                  </div>

                  <div className="map-preview">
                    <div className="map-preview-icon">
                      <MapPin className="w-8 h-8" />
                    </div>
                    <p className="map-preview-title">
                      Map Preview
                    </p>
                    <p className="map-preview-desc">
                      Enter your address above to pin the location
                    </p>
                    {formData.township && selectedTownship && (
                      <div className="map-preview-badge">
                        <MapPin className="w-4 h-4" />
                        {selectedTownship.nameEn}, Yangon
                      </div>
                    )}
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div>
                  <div className="form-section-header">
                    <div className="form-section-icon purple">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="form-section-title">
                        Details & Features
                      </h2>
                      <p className="form-section-desc">
                        Describe your property in detail
                      </p>
                    </div>
                  </div>

                  <div className="form-field">
                    <label className="form-label">
                      Property Description <span className="required">*</span>
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => updateForm({ description: e.target.value })}
                      className={`form-textarea ${errors.description ? 'error' : ''}`}
                      placeholder="Describe your property — highlight what makes it special. Mention views, recent renovations, standout features, and neighborhood character."
                      maxLength={2000}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {errors.description && <p className="form-error">{errors.description}</p>}
                      <p className={`form-char-count ${formData.description.length > 1800 ? 'warning' : ''}`} style={{ marginLeft: 'auto' }}>
                        {formData.description.length} / 2000 characters
                      </p>
                    </div>
                  </div>

                  <div className="form-field">
                    <label className="form-label">
                      Ownership Type
                    </label>
                    <select
                      value={formData.ownershipType}
                      onChange={(e) => updateForm({ ownershipType: e.target.value as OwnershipType | '' })}
                      className="form-select"
                    >
                      <option value="">Select Ownership Type</option>
                      {OWNERSHIP_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-field">
                    <label className="form-label">
                      Property Features
                    </label>
                    <div className="feature-tags">
                      {featureLabels.map((label, index) => {
                        const feature = FEATURES_EN[index] ?? label;
                        return (
                          <button
                            key={feature}
                            type="button"
                            onClick={() => toggleFeature(feature)}
                            className={`feature-tag ${formData.features.includes(feature) ? 'active' : ''}`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                    <p className="feature-count">
                      {formData.features.length} features selected
                    </p>
                  </div>

                  <div className="docs-section">
                    <h3 className="docs-title">
                      <FileText className="w-5 h-5" />
                      Documents
                    </h3>
                    <div className="docs-checks">
                      <button
                        type="button"
                        onClick={() => updateForm({ hasGrant: !formData.hasGrant })}
                        className={`doc-check ${formData.hasGrant ? 'is-checked' : ''}`}
                      >
                        <div className={`doc-checkbox ${formData.hasGrant ? 'checked' : ''}`}>
                          {formData.hasGrant && <Check className="doc-check-icon" />}
                        </div>
                        <span className="doc-checkbox-label">
                          <span className="doc-check-title">
                            Has Grant
                          </span>
                          <span className="doc-check-sub">
                            Grant title
                          </span>
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => updateForm({ hasPermit: !formData.hasPermit })}
                        className={`doc-check ${formData.hasPermit ? 'is-checked' : ''}`}
                      >
                        <div className={`doc-checkbox ${formData.hasPermit ? 'checked' : ''}`}>
                          {formData.hasPermit && <Check className="doc-check-icon" />}
                        </div>
                        <span className="doc-checkbox-label">
                          <span className="doc-check-title">
                            Has Permit
                          </span>
                          <span className="doc-check-sub">
                            Building permit
                          </span>
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div>
                  <div className="form-section-header">
                    <div className="form-section-icon orange">
                      <Camera className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="form-section-title">
                        Photos & Review
                      </h2>
                      <p className="form-section-desc">
                        Add a main image URL and review your listing
                      </p>
                    </div>
                  </div>

                  <div className="form-field">
                    <label className="form-label">
                      Main Image
                    </label>
                    <input
                      type="url"
                      className="form-input"
                      placeholder="https://example.com/property.jpg"
                      value={formData.imageUrl}
                      onChange={(e) => updateForm({ imageUrl: e.target.value })}
                    />
                    {formData.imageUrl && (
                      <div className="image-preview">
                        <img src={formData.imageUrl} alt="Preview" />
                        <button
                          type="button"
                          onClick={() => updateForm({ imageUrl: '' })}
                          className="image-preview-remove"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    {errors.imageUrl && <p className="form-error">{errors.imageUrl}</p>}
                  </div>

                  <div className="form-field">
                    <label className="form-label">
                      Additional Images
                    </label>
                    <p className="form-section-desc">
                      The current backend supports one image URL per property.
                    </p>
                  </div>

                  <div className="summary-card" style={{ marginBottom: '16px' }}>
                    <h3 className="summary-title">
                      <Building2 className="w-5 h-5 text-blue-600" />
                      Listing Summary
                    </h3>
                    <div className="summary-grid">
                      <div className="summary-item">
                        <p className="summary-item-label">
                          Title
                        </p>
                        <p className="summary-item-value">
                          {formData.title || '—'}
                        </p>
                      </div>
                      <div className="summary-item">
                        <p className="summary-item-label">
                          Type
                        </p>
                        <p className="summary-item-value">
                          {formData.propertyType
                            ? PROPERTY_TYPES.find(t => t.value === formData.propertyType)?.label
                            : '—'}
                        </p>
                      </div>
                      <div className="summary-item">
                        <p className="summary-item-label">
                          Status
                        </p>
                        <p className="summary-item-value">
                          {formData.status === 'FOR_SALE'
                            ? 'For Sale'
                            : 'For Rent'}
                        </p>
                      </div>
                      <div className="summary-item">
                        <p className="summary-item-label">
                          Price
                        </p>
                        <p className="summary-item-value">
                          {formData.price ? `MMK ${formatPrice(formData.price)}` : '—'}
                        </p>
                      </div>
                      <div className="summary-item">
                        <p className="summary-item-label">
                          Beds / Baths
                        </p>
                        <p className="summary-item-value">
                          {formData.bedrooms} / {formData.bathrooms}
                        </p>
                      </div>
                      <div className="summary-item">
                        <p className="summary-item-label">
                          Area
                        </p>
                        <p className="summary-item-value">
                          {formData.area ? `${formData.area} sqft` : '—'}
                        </p>
                      </div>
                      <div className="summary-item full-width">
                        <p className="summary-item-label">
                          Location
                        </p>
                        <p className="summary-item-value">
                          {selectedTownship
                            ? (selectedTownship.nameEn)
                            : '—'}
                          {formData.city ? `, ${formData.city}` : ''}
                        </p>
                      </div>
                      <div className="summary-item full-width">
                        <p className="summary-item-label">
                          Features
                        </p>
                        <p className="summary-item-value">
                          {formData.features.length} selected
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="contact-card">
                    <h3 className="contact-card-title">
                      Contact Information
                    </h3>
                    <div className="form-grid-2">
                      <div className="form-field" style={{ marginBottom: 0 }}>
                        <label className="form-label">
                          Phone Number <span className="required">*</span>
                        </label>
                        <input
                          type="tel"
                          value={formData.contactPhone}
                          disabled
                          className="form-input"
                          placeholder="09-xxxxxxxxx"
                        />
                      </div>
                      <div className="form-field" style={{ marginBottom: 0 }}>
                        <label className="form-label">
                          Email
                        </label>
                        <input
                          type="email"
                          value={formData.contactEmail}
                          disabled
                          className="form-input"
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {errors.submit && <p className="form-error">{errors.submit}</p>}
            <div className="form-footer">
              {currentStep > 1 ? (
                <button type="button" onClick={handlePrev} className="form-btn-back">
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              ) : (
                <div />
              )}

              {currentStep < 4 ? (
                <button type="button" onClick={handleNext} className="form-btn-next">
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button type="button" onClick={handleSubmit} className="form-btn-submit" disabled={loading || propertiesLoading || (isEditing && !existing)}>
                  {loading ? (
                    <span className="auth-loading" />
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      Submit Listing
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
