import React, { useState, useEffect } from 'react';
import { vendorService, uploadService } from '../../services/api.js';
import { Store, Image, UploadCloud, CheckCircle, AlertCircle, Save } from 'lucide-react';

export const StoreSetup = () => {
  const [store, setStore] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [logo, setLogo] = useState('');
  const [banner, setBanner] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const res = await vendorService.getMyStore();
        if (res.success && res.data.store) {
          const s = res.data.store;
          setStore(s);
          setName(s.name || '');
          setDescription(s.description || '');
          setLogo(s.logo || '');
          setBanner(s.banner || '');
          setContactEmail(s.contactEmail || '');
          setContactPhone(s.contactPhone || '');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load store profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchStore();
  }, []);

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    setError('');
    if (type === 'logo') setUploadingLogo(true);
    if (type === 'banner') setUploadingBanner(true);

    try {
      // 1. Ask backend for presigned S3 upload URL
      const presignedRes = await uploadService.getPresignedUrl(file.name, file.type);
      if (presignedRes.success && presignedRes.data) {
        const { uploadUrl, fileUrl } = presignedRes.data;

        // 2. Upload directly to S3 via PUT
        await uploadService.uploadDirectToS3(uploadUrl, file);

        // 3. Update state with resulting permanent image reference
        if (type === 'logo') setLogo(fileUrl);
        if (type === 'banner') setBanner(fileUrl);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Image upload failed.');
    } finally {
      if (type === 'logo') setUploadingLogo(false);
      if (type === 'banner') setUploadingBanner(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      const res = await vendorService.updateMyStore({
        name,
        description,
        logo,
        banner,
        contactEmail,
        contactPhone,
      });

      if (res.success) {
        setMessage('Store profile updated successfully!');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update store settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Store Profile Customization
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-2">Store Branding & Details</h1>
          <p className="text-sm text-slate-500">
            Customize your storefront appearance, logo, banner, and customer contact information.
          </p>
        </div>

        {message && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center space-x-2 text-sm text-emerald-700">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-sm text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Banner Upload / Preview */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Store Banner Image
            </label>
            <div className="relative w-full h-36 bg-slate-100 rounded-xl overflow-hidden border-2 border-dashed border-slate-200 flex items-center justify-center group">
              {banner ? (
                <img src={banner} alt="Banner Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center text-slate-400">
                  <Image className="w-8 h-8 mx-auto mb-1" />
                  <span className="text-xs">No banner uploaded</span>
                </div>
              )}
              <label className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-medium cursor-pointer transition">
                <UploadCloud className="w-5 h-5 mr-1.5" />
                <span>{uploadingBanner ? 'Uploading...' : 'Upload S3 Banner'}</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, 'banner')}
                  disabled={uploadingBanner}
                />
              </label>
            </div>
          </div>

          {/* Logo Upload / Preview */}
          <div className="flex items-center space-x-4">
            <div className="relative w-20 h-20 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 flex items-center justify-center group flex-shrink-0">
              {logo ? (
                <img src={logo} alt="Logo Preview" className="w-full h-full object-cover" />
              ) : (
                <Store className="w-8 h-8 text-slate-400" />
              )}
              <label className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] cursor-pointer transition text-center p-1">
                <span>{uploadingLogo ? '...' : 'Change'}</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, 'logo')}
                  disabled={uploadingLogo}
                />
              </label>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-800">Store Logo</h4>
              <p className="text-xs text-slate-500">Square JPEG/PNG/WEBP recommended. Direct upload to AWS S3.</p>
            </div>
          </div>

          {/* Name & Slug */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Store Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Store Slug
              </label>
              <input
                type="text"
                disabled
                value={store?.slug || ''}
                className="w-full px-3.5 py-2.5 border border-slate-200 bg-slate-50 rounded-lg text-sm text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Contact Email
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Contact Phone
              </label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-sm transition shadow-sm flex items-center space-x-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
