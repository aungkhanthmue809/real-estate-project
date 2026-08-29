import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, X, MapPin, FileText, Home, Map, Camera, Building2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useProperties } from '../contexts/PropertiesContext';
import { YANGON_TOWNSHIPS, FEATURES_EN, FEATURES_MY } from '../data/myanmarProperties';
import type { OwnershipType, Property, PropertyRequest, PropertyType, SaleStatus, User } from '../types';

const PROPERTY_TYPES: { value: PropertyType; labelEn: string; labelMy: string }[] = [
  { value: 'APARTMENT', labelEn: 'Apartment', labelMy: 'အခန်း' },
  { value: 'HOUSE', labelEn: 'House', labelMy: 'အိမ်' },
  { value: 'CONDO', labelEn: 'Condo', labelMy: 'ကွန်ဒို' },
  { value: 'LAND', labelEn: 'Land', labelMy: 'မြေ' },
  { value: 'TOWNHOUSE', labelEn: 'Townhouse', labelMy: 'တိုက်ခန်း' },
];

const OWNERSHIP_TYPES: { value: OwnershipType; labelEn: string; labelMy: string }[] = [
  { value: 'FREEHOLD', labelEn: 'Freehold', labelMy: 'အမြဲတမ်းပိုင်ဆိုင်မှု' },
  { value: 'LEASEHOLD', labelEn: 'Leasehold', labelMy: 'ဌာနခွဲပိုင်ဆိုင်မှု' },
  { value: 'GOVERNMENT', labelEn: 'Government Grant', labelMy: 'အစိုးရ ခွင့်ပြုချက်' },
  { value: 'PERMIT', labelEn: 'Permit Land', labelMy: 'ခွင့်ပြုမြေ' },
  { value: 'OTHER', labelEn: 'Other', labelMy: 'အခြား' },
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

function findTownship(value?: string | null) {
  if (!value) return undefined;
  const normalized = value.trim().toLowerCase();
  return YANGON_TOWNSHIPS.find((township) =>
    township.id.toLowerCase() === normalized
    || township.nameEn.toLowerCase() === normalized
    || township.nameMy === value.trim()
  );
}

function findTownshipFromLocation(location: string) {
  const normalized = location.toLowerCase();
  return YANGON_TOWNSHIPS.find((township) =>
    normalized.includes(township.nameEn.toLowerCase())
    || location.includes(township.nameMy)
  );
}

function formFromProperty(p: Property, user: User | null): FormData {
  const tw = findTownship(p.township) ?? findTownshipFromLocation(p.location);
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
  const { language } = useLanguage();
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

  const featureLabels = language === 'my' ? FEATURES_MY : FEATURES_EN;
  const isLand = formData.propertyType === 'LAND';

  const steps = [
    { id: 1, label: language === 'my' ? 'အခြေခံ အချက်အလက်' : 'Basic Info', icon: Home },
    { id: 2, label: language === 'my' ? 'တည်နေရာ' : 'Location', icon: Map },
    { id: 3, label: language === 'my' ? 'အသေးစိတ်နှင့် လုပ်ဆောင်ချက်များ' : 'Details & Features', icon: FileText },
    { id: 4, label: language === 'my' ? 'ဓာတ်ပုံနှင့် ပြန်လည်သုံးသပ်ခြင်း' : 'Photos & Review', icon: Camera },
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
      if (!formData.title.trim()) newErrors.title = language === 'my' ? 'ခေါင်းစဉ် လိုအပ်သည်' : 'Title is required';
      if (!formData.propertyType) newErrors.propertyType = language === 'my' ? 'အိမ်ခြံမြေ အမျိုးအစား ရွေးပါ' : 'Property type is required';
      if (!formData.price || Number(formData.price) <= 0) newErrors.price = language === 'my' ? 'စျေးနှုန်း ထည့်ပါ' : 'Price is required';
      if (!formData.area || Number(formData.area) <= 0) newErrors.area = language === 'my' ? 'အကျယ်အဝန်း ထည့်ပါ' : 'Area is required';
      if (formData.yearBuilt) {
        const year = Number(formData.yearBuilt);
        if (!Number.isInteger(year) || year < 1900 || year > 2030) {
          newErrors.yearBuilt = language === 'my' ? 'ဆောက်လုပ်သည့်နှစ်ကို 1900 နှင့် 2030 ကြား ထည့်ပါ' : 'Year built must be between 1900 and 2030';
        }
      }
    }

    if (step === 2) {
      if (!formData.township && !existing) newErrors.township = language === 'my' ? 'မြို့နယ် ရွေးပါ' : 'Township is required';
      if (!formData.streetAddress.trim()) newErrors.streetAddress = language === 'my' ? 'လိပ်စာ ထည့်ပါ' : 'Street address is required';
    }

    if (step === 3) {
      if (!formData.description.trim()) newErrors.description = language === 'my' ? 'ဖော်ပြချက် ထည့်ပါ' : 'Description is required';
      if (formData.description.length > 2000) newErrors.description = language === 'my' ? 'ဖော်ပြချက် ၂၀၀၀ စာလုံးထက် မကျော်ရ' : 'Description must be under 2000 characters';
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
      setErrors({ submit: language === 'my' ? 'ပြင်ဆင်ရန် အိမ်ခြံမြေကို ရှာမတွေ့ပါ' : 'Property not found or you do not own it.' });
      return;
    }

    if (formData.yearBuilt) {
      const year = Number(formData.yearBuilt);
      if (!Number.isInteger(year) || year < 1900 || year > 2030) {
        setCurrentStep(1);
        setErrors({ yearBuilt: language === 'my' ? 'ဆောက်လုပ်သည့်နှစ်ကို 1900 နှင့် 2030 ကြား ထည့်ပါ' : 'Year built must be between 1900 and 2030' });
        return;
      }
    }

    setLoading(true);
    setErrors({});

    try {
      const originalTownship = existing
        ? findTownship(existing.township) ?? findTownshipFromLocation(existing.location)
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
          : (language === 'my' ? 'အိမ်ခြံမြေကို သိမ်းဆည်း၍ မရပါ' : 'Unable to save the property.'),
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
            {language === 'my' ? 'အိမ်ခြံမြေ တင်သွင်းပြီးပါပြီ!' : 'Property Submitted!'}
          </h2>
          <p className="form-success-desc">
            {language === 'my' ? 'သင့်အိမ်ခြံမြေကို အတည်ပြုချက်အတွက် တင်သွင်းပြီးပါပြီ။' : 'Your property has been submitted for approval.'}
          </p>
          <p className="form-success-desc" style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>
            {language === 'my' ? 'Admin မှ အတည်ပြုပြီးနောက် သင့်ပိုင်ဆိုင်မှု စာရင်းတွင် ပေါ်လာပါမည်။' : 'After admin approval, your listing will appear in your ownership records.'}
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
            {language === 'my' ? 'ဒက်ရှ်ဘုတ်သို့ သွားရန်' : 'Go to Dashboard'}
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
          {language === 'my' ? 'ဒက်ရှ်ဘုတ်သို့ ပြန်ရန်' : 'Back to Dashboard'}
        </button>

        <h1 className="form-page-title">
          {isEditing
            ? (language === 'my' ? 'အိမ်ခြံမြေ ပြင်ဆင်ပါ' : 'Edit Property')
            : (language === 'my' ? 'အိမ်ခြံမြေအသစ် ထည့်ပါ' : 'Add New Property')}
        </h1>
        <p className="form-page-subtitle">
          {language === 'my'
            ? 'သင့်အိမ်ခြံမြေကို စာရင်းတင်ရန် အောက်ပါဖောင်ကို ဖြည့်ပါ'
            : 'Complete the form below to list your property on UrbanNest'}
        </p>
        {isEditing && !propertiesLoading && !existing && (
          <p className="form-error">
            {language === 'my' ? 'ပြင်ဆင်ရန် အိမ်ခြံမြေကို ရှာမတွေ့ပါ' : 'Property not found or you do not own it.'}
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
                        {language === 'my' ? 'အခြေခံ အချက်အလက်' : 'Basic Information'}
                      </h2>
                      <p className="form-section-desc">
                        {language === 'my' ? 'သင့်အိမ်ခြံမြေ၏ အခြေခံ အချက်အလက်များ' : 'Fundamental details about your property'}
                      </p>
                    </div>
                  </div>

                  <div className="form-field">
                    <label className="form-label">
                      {language === 'my' ? 'ခေါင်းစဉ်' : 'Listing Title'} <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => updateForm({ title: e.target.value })}
                      className={`form-input ${errors.title ? 'error' : ''}`}
                      placeholder={language === 'my' ? 'ဥပမာ - မြို့တော် ကမ်းခြေ နေအိမ်' : 'e.g., Modern Waterfront Residence'}
                    />
                    {errors.title && <p className="form-error">{errors.title}</p>}
                  </div>

                  <div className="form-grid-2">
                    <div className="form-field">
                      <label className="form-label">
                        {language === 'my' ? 'အိမ်ခြံမြေ အမျိုးအစား' : 'Property Type'} <span className="required">*</span>
                      </label>
                      <select
                        value={formData.propertyType}
                        onChange={(e) => updateForm({ propertyType: e.target.value as PropertyType })}
                        className={`form-select ${errors.propertyType ? 'error' : ''}`}
                      >
                        <option value="">{language === 'my' ? 'အမျိုးအစား ရွေးပါ' : 'Select Type'}</option>
                        {PROPERTY_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>
                            {language === 'my' ? type.labelMy : type.labelEn}
                          </option>
                        ))}
                      </select>
                      {errors.propertyType && <p className="form-error">{errors.propertyType}</p>}
                    </div>

                    <div className="form-field">
                      <label className="form-label">
                        {language === 'my' ? 'စာရင်း အမျိုးအစား' : 'Listing Status'}
                      </label>
                      <div className="status-toggle">
                        <button
                          type="button"
                          onClick={() => updateForm({ status: 'FOR_SALE' })}
                          className={`status-toggle-btn ${formData.status === 'FOR_SALE' ? 'active' : ''}`}
                        >
                          {language === 'my' ? 'ရောင်းရန်' : 'For Sale'}
                        </button>
                        <button
                          type="button"
                          onClick={() => updateForm({ status: 'FOR_RENT' })}
                          className={`status-toggle-btn ${formData.status === 'FOR_RENT' ? 'active' : ''}`}
                        >
                          {language === 'my' ? 'ငှားရန်' : 'For Rent'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="form-field">
                    <label className="form-label">
                      {language === 'my' ? 'စျေးနှုန်း (MMK)' : 'Asking Price (MMK)'} <span className="required">*</span>
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
                          {language === 'my' ? 'မြေအကျယ်' : 'Land Area'} <span className="required">*</span>
                        </label>
                        <input
                          type="number"
                          value={formData.area}
                          onChange={(e) => updateForm({ area: e.target.value })}
                          className={`form-input ${errors.area ? 'error' : ''}`}
                          placeholder={language === 'my' ? 'ဥပမာ - 2400' : 'e.g., 2400'}
                          min="0"
                        />
                        {errors.area && <p className="form-error">{errors.area}</p>}
                      </div>
                      <div className="form-field">
                        <label className="form-label">
                          {language === 'my' ? 'ဖေါက်လမ်း နံပါတ်' : 'Plot/Frontage Width'}
                        </label>
                        <input
                          type="number"
                          value={formData.plotDimension}
                          disabled
                          className="form-input"
                          placeholder={language === 'my' ? 'ဥပမာ - 20' : 'e.g., 20'}
                          min="0"
                        />
                      </div>
                      <div className="form-field">
                        <label className="form-label">
                          {language === 'my' ? 'ဖော' : 'Land Shape'}
                        </label>
                        <select
                          value={formData.landShape}
                          disabled
                          className="form-select"
                        >
                          <option value="">{language === 'my' ? 'ရွေးပါ' : 'Select'}</option>
                          <option value="RECTANGLE">{language === 'my' ? 'စတုဂံ' : 'Rectangular'}</option>
                          <option value="SQUARE">{language === 'my' ? 'စတုရန်း' : 'Square'}</option>
                          <option value="CORNER">{language === 'my' ? 'ထောင့်' : 'Corner plot'}</option>
                          <option value="IRREGULAR">{language === 'my' ? 'ပုံစံမမှန်' : 'Irregular'}</option>
                        </select>
                      </div>
                      <div className="form-field">
                        <label className="form-label">
                          {language === 'my' ? 'လမ်းအကျယ် (ပေ)' : 'Road Width (ft)'}
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
                            {language === 'my' ? 'အိပ်ခန်း' : 'Bedrooms'}
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
                            {language === 'my' ? 'ရေချိုခန်း' : 'Bathrooms'}
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
                            {language === 'my' ? 'ကားရပ်နား' : 'Parking'}
                          </label>
                          <select
                            value={formData.parking}
                            onChange={(e) => updateForm({ parking: e.target.value === '' ? '' : Number(e.target.value) })}
                            className="form-select"
                          >
                            <option value="">{language === 'my' ? 'မသတ်မှတ်ရသေး' : 'Not specified'}</option>
                            {PARKING_OPTIONS.map((n) => (
                              <option key={n} value={n}>{n}</option>
                            ))}
                          </select>
                        </div>
                        <div className="form-field">
                          <label className="form-label">
                            {language === 'my' ? 'ဆောက်လုပ်သည့်နှစ်' : 'Year Built'}
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
                          {language === 'my' ? 'အကျယ်အဝန်း (sqft)' : 'Total Area (sqft)'} <span className="required">*</span>
                        </label>
                        <input
                          type="number"
                          value={formData.area}
                          onChange={(e) => updateForm({ area: e.target.value })}
                          className={`form-input ${errors.area ? 'error' : ''}`}
                          placeholder={language === 'my' ? 'ဥပမာ - 2400' : 'e.g., 2400'}
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
                        {language === 'my' ? 'တည်နေရာ' : 'Property Location'}
                      </h2>
                      <p className="form-section-desc">
                        {language === 'my' ? 'သင့်အိမ်ခြံမြေ၏ တည်နေရာ' : 'Where is your property located?'}
                      </p>
                    </div>
                  </div>

                  <div className="form-grid-2">
                    <div className="form-field">
                      <label className="form-label">
                        {language === 'my' ? 'မြို့နယ်' : 'Township'} <span className="required">*</span>
                      </label>
                      <select
                        value={formData.township}
                        onChange={(e) => updateForm({ township: e.target.value })}
                        className={`form-select ${errors.township ? 'error' : ''}`}
                      >
                        <option value="">{language === 'my' ? 'မြို့နယ် ရွေးပါ' : 'Select Township'}</option>
                        {YANGON_TOWNSHIPS.map((tw) => (
                          <option key={tw.id} value={tw.id}>
                            {language === 'my' ? tw.nameMy : tw.nameEn}
                          </option>
                        ))}
                      </select>
                      {errors.township && <p className="form-error">{errors.township}</p>}
                    </div>

                    <div className="form-field">
                      <label className="form-label">
                        {language === 'my' ? 'မြို့' : 'City'}
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
                        {language === 'my' ? 'ပြည်နယ်/ဒေသ' : 'State / Region'}
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
                        {language === 'my' ? 'ZIP Code' : 'ZIP Code'}
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
                      {language === 'my' ? 'လိပ်စာ' : 'Street Address'} <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.streetAddress}
                      onChange={(e) => updateForm({ streetAddress: e.target.value })}
                      className={`form-input ${errors.streetAddress ? 'error' : ''}`}
                      placeholder={language === 'my' ? 'ဥပမာ - အမှတ် ၄၅၊ ရွှေကုန်းဒင်လမ်း' : 'e.g., No. 45, Shwegondine Road'}
                    />
                    {errors.streetAddress && <p className="form-error">{errors.streetAddress}</p>}
                  </div>

                  <div className="map-preview">
                    <div className="map-preview-icon">
                      <MapPin className="w-8 h-8" />
                    </div>
                    <p className="map-preview-title">
                      {language === 'my' ? 'မြေပုံ ကြိုကြည့်' : 'Map Preview'}
                    </p>
                    <p className="map-preview-desc">
                      {language === 'my' ? 'တည်နေရာကို ပြပေးရန် အပေါ်တွင် လိပ်စာ ထည့်ပါ' : 'Enter your address above to pin the location'}
                    </p>
                    {formData.township && selectedTownship && (
                      <div className="map-preview-badge">
                        <MapPin className="w-4 h-4" />
                        {language === 'my' ? selectedTownship.nameMy : selectedTownship.nameEn}, Yangon
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
                        {language === 'my' ? 'အသေးစိတ်နှင့် လုပ်ဆောင်ချက်များ' : 'Details & Features'}
                      </h2>
                      <p className="form-section-desc">
                        {language === 'my' ? 'သင့်အိမ်ခြံမြေကို ပိုမိုဖော်ပြပါ' : 'Describe your property in detail'}
                      </p>
                    </div>
                  </div>

                  <div className="form-field">
                    <label className="form-label">
                      {language === 'my' ? 'ဖော်ပြချက်' : 'Property Description'} <span className="required">*</span>
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => updateForm({ description: e.target.value })}
                      className={`form-textarea ${errors.description ? 'error' : ''}`}
                      placeholder={language === 'my'
                        ? 'သင့်အိမ်ခြံမြေကို ဖော်ပြပါ — ဘာကြောင့် အထူးဖြစ်သည်ကို ပြောပြပါ။ ရှုခင်းများ၊ ပြန်လည်ပြင်ဆင်ထားမှုများ၊ ထင်ရှားသည့် လုပ်ဆောင်ချက်များနှင့် ပတ်ဝန်းကျင် အကြောင်းအရာများကို ထည့်သွင်းပါ။'
                        : 'Describe your property — highlight what makes it special. Mention views, recent renovations, standout features, and neighborhood character.'}
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
                      {language === 'my' ? 'ပိုင်ဆိုင်မှု အမျိုးအစား' : 'Ownership Type'}
                    </label>
                    <select
                      value={formData.ownershipType}
                      onChange={(e) => updateForm({ ownershipType: e.target.value as OwnershipType | '' })}
                      className="form-select"
                    >
                      <option value="">{language === 'my' ? 'ပိုင်ဆိုင်မှု အမျိုးအစား ရွေးပါ' : 'Select Ownership Type'}</option>
                      {OWNERSHIP_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {language === 'my' ? type.labelMy : type.labelEn}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-field">
                    <label className="form-label">
                      {language === 'my' ? 'လုပ်ဆောင်ချက်များ' : 'Property Features'}
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
                      {formData.features.length} {language === 'my' ? 'လုပ်ဆောင်ချက် ရွေးချယ်ထားသည်' : 'features selected'}
                    </p>
                  </div>

                  <div className="docs-section">
                    <h3 className="docs-title">
                      <FileText className="w-5 h-5" />
                      {language === 'my' ? 'စာရွက်စာတမ်းများ' : 'Documents'}
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
                            {language === 'my' ? 'ခွင့်ပြုချက်' : 'Has Grant'}
                          </span>
                          <span className="doc-check-sub">
                            {language === 'my' ? 'ဂရန်ရှိ' : 'Grant title'}
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
                            {language === 'my' ? 'ခွင့်ပြုချက် လိုင်စင်' : 'Has Permit'}
                          </span>
                          <span className="doc-check-sub">
                            {language === 'my' ? 'ဆောက်လုပ်ခွင့်' : 'Building permit'}
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
                        {language === 'my' ? 'ဓာတ်ပုံနှင့် ပြန်လည်သုံးသပ်ခြင်း' : 'Photos & Review'}
                      </h2>
                      <p className="form-section-desc">
                        {language === 'my' ? 'အဓိက ဓာတ်ပုံလင့်ခ်နှင့် နောက်ဆုံး ပြန်လည်သုံးသပ်ပါ' : 'Add a main image URL and review your listing'}
                      </p>
                    </div>
                  </div>

                  <div className="form-field">
                    <label className="form-label">
                      {language === 'my' ? 'အဓိက ဓာတ်ပုံ' : 'Main Image'}
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
                      {language === 'my' ? 'ထပ်ဆင့် ဓာတ်ပုံများ' : 'Additional Images'}
                    </label>
                    <p className="form-section-desc">
                      {language === 'my' ? 'လက်ရှိ backend သည် ဓာတ်ပုံတစ်ပုံလင့်ခ်သာ သိမ်းဆည်းနိုင်သည်။' : 'The current backend supports one image URL per property.'}
                    </p>
                  </div>

                  <div className="summary-card" style={{ marginBottom: '16px' }}>
                    <h3 className="summary-title">
                      <Building2 className="w-5 h-5 text-blue-600" />
                      {language === 'my' ? 'စာရင်း အနှစ်ချုပ်' : 'Listing Summary'}
                    </h3>
                    <div className="summary-grid">
                      <div className="summary-item">
                        <p className="summary-item-label">
                          {language === 'my' ? 'ခေါင်းစဉ်' : 'Title'}
                        </p>
                        <p className="summary-item-value">
                          {formData.title || '—'}
                        </p>
                      </div>
                      <div className="summary-item">
                        <p className="summary-item-label">
                          {language === 'my' ? 'အမျိုးအစား' : 'Type'}
                        </p>
                        <p className="summary-item-value">
                          {formData.propertyType
                            ? (language === 'my'
                                ? PROPERTY_TYPES.find(t => t.value === formData.propertyType)?.labelMy
                                : PROPERTY_TYPES.find(t => t.value === formData.propertyType)?.labelEn)
                            : '—'}
                        </p>
                      </div>
                      <div className="summary-item">
                        <p className="summary-item-label">
                          {language === 'my' ? 'စာရင်း' : 'Status'}
                        </p>
                        <p className="summary-item-value">
                          {formData.status === 'FOR_SALE'
                            ? (language === 'my' ? 'ရောင်းရန်' : 'For Sale')
                            : (language === 'my' ? 'ငှားရန်' : 'For Rent')}
                        </p>
                      </div>
                      <div className="summary-item">
                        <p className="summary-item-label">
                          {language === 'my' ? 'စျေးနှုန်း' : 'Price'}
                        </p>
                        <p className="summary-item-value">
                          {formData.price ? `MMK ${formatPrice(formData.price)}` : '—'}
                        </p>
                      </div>
                      <div className="summary-item">
                        <p className="summary-item-label">
                          {language === 'my' ? 'အိပ်ခန်း / ရေချိုခန်း' : 'Beds / Baths'}
                        </p>
                        <p className="summary-item-value">
                          {formData.bedrooms} / {formData.bathrooms}
                        </p>
                      </div>
                      <div className="summary-item">
                        <p className="summary-item-label">
                          {language === 'my' ? 'အကျယ်အဝန်း' : 'Area'}
                        </p>
                        <p className="summary-item-value">
                          {formData.area ? `${formData.area} sqft` : '—'}
                        </p>
                      </div>
                      <div className="summary-item full-width">
                        <p className="summary-item-label">
                          {language === 'my' ? 'တည်နေရာ' : 'Location'}
                        </p>
                        <p className="summary-item-value">
                          {selectedTownship
                            ? (language === 'my' ? selectedTownship.nameMy : selectedTownship.nameEn)
                            : '—'}
                          {formData.city ? `, ${formData.city}` : ''}
                        </p>
                      </div>
                      <div className="summary-item full-width">
                        <p className="summary-item-label">
                          {language === 'my' ? 'လုပ်ဆောင်ချက်များ' : 'Features'}
                        </p>
                        <p className="summary-item-value">
                          {formData.features.length} {language === 'my' ? 'ခု ရွေးချယ်ထားသည်' : 'selected'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="contact-card">
                    <h3 className="contact-card-title">
                      {language === 'my' ? 'ဆက်သွယ်ရန် အချက်အလက်' : 'Contact Information'}
                    </h3>
                    <div className="form-grid-2">
                      <div className="form-field" style={{ marginBottom: 0 }}>
                        <label className="form-label">
                          {language === 'my' ? 'ဖုန်းနံပါတ်' : 'Phone Number'} <span className="required">*</span>
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
                          {language === 'my' ? 'အီးမေးလ်' : 'Email'}
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
                  {language === 'my' ? 'နောက်သို့' : 'Back'}
                </button>
              ) : (
                <div />
              )}

              {currentStep < 4 ? (
                <button type="button" onClick={handleNext} className="form-btn-next">
                  {language === 'my' ? 'ရှေ့သို့' : 'Continue'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button type="button" onClick={handleSubmit} className="form-btn-submit" disabled={loading || propertiesLoading || (isEditing && !existing)}>
                  {loading ? (
                    <span className="auth-loading" />
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      {language === 'my' ? 'စာရင်းတင်ပါ' : 'Submit Listing'}
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
