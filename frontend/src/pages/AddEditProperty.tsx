import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Building2, SlidersHorizontal, FileText, Image as ImageIcon } from 'lucide-react';
import { propertyAPI } from '../utils/api';
import type { PropertyType, SaleStatus, Property } from '../types';

const TOWNSHIPS = ['Bahan', 'Dagon', 'Kamaryut', 'Mayangone', 'Hlaing', 'Yankin', 'Tamwe', 'North Okkalapa'];
const PROPERTY_TYPES: PropertyType[] = ['APARTMENT', 'HOUSE', 'CONDO', 'LAND', 'TOWNHOUSE'];

interface FormData {
  title: string;
  listingType: SaleStatus;
  type: PropertyType | '';
  price: string;
  township: string;
  bedrooms: string;
  bathrooms: string;
  sqft: string;
  description: string;
  imageUrl: string;
}

const inputCls =
  'w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition bg-white';
const labelCls = 'block text-sm font-medium text-slate-600 mb-1.5';

export function AddEditProperty() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [currentStep, setCurrentStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<FormData>({
    title: '',
    listingType: 'FOR_SALE',
    type: '',
    price: '',
    township: '',
    bedrooms: '',
    bathrooms: '',
    sqft: '',
    description: '',
    imageUrl: '',
  });

  useEffect(() => {
    if (!id) return;
    propertyAPI
      .getById(Number(id))
      .then((res) => {
        const p: Property = res.data;
        setFormData({
          title: p.title,
          listingType: p.status,
          type: p.propertyType,
          price: String(p.price),
          township: p.location,
          bedrooms: String(p.bedrooms ?? 0),
          bathrooms: String(p.bathrooms ?? 0),
          sqft: String(p.area ?? 0),
          description: p.description,
          imageUrl: p.imageUrl || '',
        });
      })
      .catch(() => {
        setError('Could not load property.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const steps = [
    { id: 1, title: 'Property Info', icon: Building2 },
    { id: 2, title: 'Specifications', icon: SlidersHorizontal },
    { id: 3, title: 'Description', icon: FileText },
    { id: 4, title: 'Media', icon: ImageIcon },
  ];

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    const payload = {
      title: formData.title,
      description: formData.description,
      price: Number(formData.price),
      location: formData.township,
      propertyType: formData.type as PropertyType,
      status: formData.listingType,
      bedrooms: Number(formData.bedrooms) || 0,
      bathrooms: Number(formData.bathrooms) || 0,
      area: Number(formData.sqft) || 0,
      imageUrl: formData.imageUrl,
    };
    try {
      if (isEditing) {
        await propertyAPI.update(Number(id), payload);
      } else {
        await propertyAPI.create(payload);
      }
      setSubmitted(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to save property');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 pt-24 flex items-start justify-center px-4">
        <div className="text-center mt-16 animate-fade-in">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Property {isEditing ? 'Updated' : 'Submitted'}!</h2>
          <p className="text-slate-500">
            {isEditing ? 'Your property has been updated and is pending approval.' : 'Your property has been submitted for approval.'}
          </p>
          <p className="text-sm text-slate-400 mt-2">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-24 flex items-start justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mt-24"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors mb-4">
            <ArrowLeft className="w-5 h-5" /> Back
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">{isEditing ? 'Edit Property' : 'Add New Property'}</h1>
          <p className="text-slate-500 mt-1">Fill in the details to list your property</p>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-6">{error}</div>}

        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1 last:flex-none">
                <div className={`flex items-center gap-2 ${currentStep >= step.id ? 'text-blue-600' : 'text-slate-400'}`}>
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${currentStep >= step.id ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-500'}`}
                  >
                    {currentStep > step.id ? <Check className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
                  </div>
                  <div className="hidden sm:block">
                    <p className="font-semibold text-sm">{step.title}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-3 ${currentStep > step.id ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <form onSubmit={handleSubmit}>
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-slate-800">Property Information</h2>

                <div>
                  <label className={labelCls}>Property Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className={inputCls}
                    placeholder="e.g., Modern Waterfront Residence"
                    required
                  />
                </div>

                <div>
                  <label className={labelCls}>Listing Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, listingType: 'FOR_SALE' })}
                      className={`py-3 rounded-xl border-2 font-semibold transition-colors ${formData.listingType === 'FOR_SALE' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                    >
                      For Sale
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, listingType: 'FOR_RENT' })}
                      className={`py-3 rounded-xl border-2 font-semibold transition-colors ${formData.listingType === 'FOR_RENT' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                    >
                      For Rent
                    </button>
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Property Type</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {PROPERTY_TYPES.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData({ ...formData, type })}
                        className={`p-3 rounded-xl border-2 text-sm font-medium transition-colors ${formData.type === type ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Price (MMK)</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className={inputCls}
                      placeholder="e.g., 500000"
                      required
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Township</label>
                    <select
                      value={formData.township}
                      onChange={(e) => setFormData({ ...formData, township: e.target.value })}
                      className={inputCls}
                      required
                    >
                      <option value="">Select location</option>
                      {TOWNSHIPS.map((town) => (
                        <option key={town} value={town}>{town}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-slate-800">Specifications</h2>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className={labelCls}>Bedrooms</label>
                    <input
                      type="number"
                      value={formData.bedrooms}
                      onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                      className={`${inputCls} text-center`}
                      placeholder="0"
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Bathrooms</label>
                    <input
                      type="number"
                      value={formData.bathrooms}
                      onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                      className={`${inputCls} text-center`}
                      placeholder="0"
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Sq Ft</label>
                    <input
                      type="number"
                      value={formData.sqft}
                      onChange={(e) => setFormData({ ...formData, sqft: e.target.value })}
                      className={`${inputCls} text-center`}
                      placeholder="0"
                      min="0"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-slate-800">Description</h2>

                <div>
                  <label className={labelCls}>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className={`${inputCls} min-h-[150px] resize-y`}
                    placeholder="Describe your property in detail..."
                    required
                  />
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-slate-800">Media</h2>

                <div>
                  <label className={labelCls}>Image URL</label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className={inputCls}
                    placeholder="https://example.com/photo.jpg"
                  />
                </div>

                {formData.imageUrl ? (
                  <div className="rounded-xl overflow-hidden border border-slate-200">
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="w-full h-48 object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-200 rounded-xl h-48 flex flex-col items-center justify-center text-slate-400">
                    <ImageIcon className="w-10 h-10 mb-2" />
                    <p className="text-sm">Paste an image URL above to preview</p>
                  </div>
                )}

                <p className="text-sm text-slate-400 text-center">Image is optional — listings show a default placeholder.</p>
              </div>
            )}

            <div className="flex justify-between mt-8 pt-6 border-t border-slate-100">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="inline-flex items-center gap-2 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Previous
                </button>
              ) : (
                <div></div>
              )}
              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
                >
                  Next <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
                >
                  {submitting ? (
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" /> {isEditing ? 'Update Property' : 'Submit for Approval'}
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
