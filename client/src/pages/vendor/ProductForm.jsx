import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { productService, uploadService } from '../../services/api.js';
import { Package, UploadCloud, X, ArrowLeft, Save, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/Button.jsx';
import { Card } from '../../components/ui/Card.jsx';

const CATEGORIES = [
  'Electronics',
  'Audio & Headphones',
  'Computers & Accessories',
  'Gaming Gear',
  'Wearables',
  'Smart Home',
  'Mobile & Tablets',
];

export const ProductForm = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [images, setImages] = useState([]);
  const [status, setStatus] = useState('active');

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditing) {
      const fetchProduct = async () => {
        try {
          const res = await productService.getProduct(id);
          if (res.success && res.data.product) {
            const p = res.data.product;
            setTitle(p.title);
            setDescription(p.description);
            setCategory(p.category);
            setPrice(p.price);
            setStock(p.stock);
            setImages(p.images || []);
            setStatus(p.status);
          }
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to load product details.');
        } finally {
          setLoading(false);
        }
      };
      fetchProduct();
    }
  }, [id, isEditing]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Image file size must be less than 5MB.');
      return;
    }

    setError('');
    setUploadingImage(true);

    try {
      // 1. Request presigned upload URL from Express backend
      const presignedRes = await uploadService.getPresignedUrl(file.name, file.type);
      if (presignedRes.success && presignedRes.data) {
        const { uploadUrl, fileUrl } = presignedRes.data;

        // 2. Upload file directly to S3
        await uploadService.uploadDirectToS3(uploadUrl, file);

        // 3. Attach image URL to product images list
        setImages((prev) => [...prev, fileUrl]);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload product image to S3.');
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (indexToRemove) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    const payload = {
      title,
      description,
      category,
      price: parseFloat(price),
      stock: parseInt(stock, 10),
      images,
      status,
    };

    try {
      if (isEditing) {
        await productService.updateProduct(id, payload);
      } else {
        await productService.createProduct(payload);
      }
      navigate('/vendor/products');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-main animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <Link
        to="/vendor/products"
        className="inline-flex items-center text-xs font-semibold text-muted hover:text-main transition"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        <span>Back to Product Listings</span>
      </Link>

      <Card className="p-6 sm:p-8 space-y-6">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-main bg-surface-2 px-2.5 py-1 rounded-pill border border-border">
            {isEditing ? 'Edit Product' : 'Add New Product'}
          </span>
          <h1 className="text-2xl font-bold text-main mt-2">
            {isEditing ? `Edit: ${title}` : 'Create Marketplace Product Listing'}
          </h1>
          <p className="text-xs sm:text-sm text-muted">
            Fill in the specifications, set your pricing, inventory count, and upload product images to AWS S3.
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-surface-2 border border-border-strong rounded-control flex items-center space-x-2 text-xs text-main">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
              Product Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Wireless Noise-Cancelling Over-Ear Headphones"
              className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-control text-sm text-main placeholder:text-muted/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-ring transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-control text-sm text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-ring transition"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                Price (INR ₹) *
              </label>
              <input
                type="number"
                required
                min={0}
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="2499.00"
                className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-control text-sm text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-ring transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                Inventory Stock Units *
              </label>
              <input
                type="number"
                required
                min={0}
                step={1}
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="50"
                className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-control text-sm text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-ring transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
              Description *
            </label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Highlight key features, technical specifications, and box contents..."
              className="w-full p-3 bg-surface border border-border rounded-control text-sm text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-ring transition"
            />
          </div>

          {/* S3 Image Direct Upload Dropzone */}
          <div>
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
              Product Images (AWS S3 Direct Upload)
            </label>

            {/* Existing Images Thumbnails */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
              {images.map((imgUrl, idx) => (
                <div key={idx} className="relative group rounded-control overflow-hidden border border-border aspect-square bg-surface-2">
                  <img src={imgUrl} alt={`Product thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1.5 right-1.5 p-1 bg-overlay/80 text-inverse rounded-pill opacity-0 group-hover:opacity-100 transition shadow-xs"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              <label className="border-2 border-dashed border-border hover:border-border-strong rounded-control aspect-square flex flex-col items-center justify-center cursor-pointer transition p-4 text-center bg-surface-2 hover:bg-surface-3">
                <UploadCloud className="w-6 h-6 text-muted mb-1" />
                <span className="text-xs font-semibold text-main">
                  {uploadingImage ? 'Uploading...' : 'Add Image'}
                </span>
                <span className="text-[10px] text-muted mt-0.5">JPEG, PNG up to 5MB</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
              Publishing Status
            </label>
            <div className="flex space-x-4">
              <label className="inline-flex items-center text-sm text-main cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="active"
                  checked={status === 'active'}
                  onChange={() => setStatus('active')}
                  className="mr-2 text-primary focus:ring-ring"
                />
                Active (Published)
              </label>
              <label className="inline-flex items-center text-sm text-main cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="draft"
                  checked={status === 'draft'}
                  onChange={() => setStatus('draft')}
                  className="mr-2 text-primary focus:ring-ring"
                />
                Draft (Hidden)
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-border flex justify-end space-x-3">
            <Link
              to="/vendor/products"
              className="px-5 py-2.5 border border-border rounded-control text-sm font-medium text-main hover:bg-surface-2 transition"
            >
              Cancel
            </Link>
            <Button
              type="submit"
              disabled={saving}
              loading={saving}
            >
              <Save className="w-4 h-4 mr-1.5" />
              <span>{saving ? 'Saving...' : isEditing ? 'Update Product' : 'Create Product'}</span>
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ProductForm;
