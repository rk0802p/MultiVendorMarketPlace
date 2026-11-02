import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productService, reviewService } from '../../services/api.js';
import { useCart } from '../../context/CartContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  Store,
  Package,
  Check,
  ShieldCheck,
  ArrowLeft,
  ShoppingCart,
  Star,
  AlertCircle,
  MessageSquare,
  ThumbsUp,
} from 'lucide-react';

export const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cartError, setCartError] = useState('');
  const [addedMessage, setAddedMessage] = useState(false);
  const [adding, setAdding] = useState(false);

  // Reviews State
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({ totalReviews: 0, averageRating: 0, breakdown: {} });
  const [eligibility, setEligibility] = useState({ canReview: false, hasReviewed: false });
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState('');
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    const fetchProductAndReviews = async () => {
      try {
        const [prodRes, revRes] = await Promise.all([
          productService.getProduct(id),
          reviewService.getProductReviews(id).catch(() => ({ data: { reviews: [], stats: {} } })),
        ]);

        if (prodRes.success && prodRes.data.product) {
          setProduct(prodRes.data.product);
        }
        if (revRes.data) {
          setReviews(revRes.data.reviews || []);
          setReviewStats(revRes.data.stats || { totalReviews: 0, averageRating: 0, breakdown: {} });
        }

        // Check review eligibility if user is logged in as customer
        if (user && user.role === 'customer') {
          try {
            const eligRes = await reviewService.checkEligibility(id);
            if (eligRes.data) {
              setEligibility(eligRes.data);
            }
          } catch (e) {
            console.warn('Could not check review eligibility:', e.message);
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Product not found.');
      } finally {
        setLoading(false);
      }
    };

    fetchProductAndReviews();
  }, [id, user]);

  const handleAddToCart = async () => {
    if (!product) return;
    setCartError('');
    setAdding(true);
    const result = await addToCart(product._id, quantity);
    setAdding(false);
    if (result.success) {
      setAddedMessage(true);
      setTimeout(() => setAddedMessage(false), 4000);
    } else {
      setCartError(result.error);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');
    setReviewMessage('');
    setSubmittingReview(true);

    try {
      const res = await reviewService.submitReview(id, {
        rating: ratingInput,
        comment: commentInput,
      });

      if (res.success) {
        setReviewMessage('Thank you! Your verified review has been published.');
        setCommentInput('');
        setEligibility({ canReview: false, hasReviewed: true });

        // Refresh reviews
        const revRes = await reviewService.getProductReviews(id);
        if (revRes.data) {
          setReviews(revRes.data.reviews || []);
          setReviewStats(revRes.data.stats || { totalReviews: 0, averageRating: 0, breakdown: {} });
        }
      }
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <Package className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Product Not Found</h2>
        <p className="text-sm text-slate-500">{error || 'This product listing may have been archived.'}</p>
        <Link
          to="/products"
          className="inline-block px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
        >
          Return to Catalogue
        </Link>
      </div>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : [];
  const inStock = product.stock > 0;
  const avgRating = reviewStats.averageRating || product.averageRating || 0;
  const totalReviews = reviewStats.totalReviews || product.reviewCount || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <Link
        to="/products"
        className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        <span>Back to Product Catalogue</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm">
        {/* Left Column: Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-square bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 flex items-center justify-center">
            {images.length > 0 ? (
              <img
                src={images[selectedImage]}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <Package className="w-20 h-20 text-slate-300" />
            )}
          </div>

          {images.length > 1 && (
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {images.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition ${
                    selectedImage === idx ? 'border-blue-600 ring-2 ring-blue-500/20' : 'border-slate-200 opacity-70'
                  }`}
                >
                  <img src={imgUrl} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Meta & Purchase Box */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Category & Status Badges */}
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {product.category}
              </span>
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  inStock ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {inStock ? `In Stock (${product.stock} units)` : 'Out of Stock'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {product.title}
            </h1>

            {/* Rating Stars Summary */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${star <= Math.round(avgRating) ? 'fill-current' : 'text-slate-300'}`}
                  />
                ))}
              </div>
              <span className="text-sm font-bold text-slate-900">
                {avgRating > 0 ? avgRating.toFixed(1) : 'New'}
              </span>
              <span className="text-xs text-slate-500">
                ({totalReviews} verified {totalReviews === 1 ? 'review' : 'reviews'})
              </span>
            </div>

            {/* Price Box */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-slate-900">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-slate-500">Includes applicable taxes</span>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Description</h3>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>

            {/* Seller Information Card */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Sold by</span>
                  <h4 className="text-sm font-bold text-slate-900">{product.storeId?.name || 'Verified Marketplace Vendor'}</h4>
                </div>
              </div>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                <span>Verified Seller</span>
              </span>
            </div>
          </div>

          {/* Cart Actions */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            {addedMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Added {quantity} item(s) to your shopping cart!</span>
                </div>
                <Link
                  to="/cart"
                  className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition"
                >
                  View Cart
                </Link>
              </div>
            )}

            {cartError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 font-semibold flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>{cartError}</span>
              </div>
            )}

            <div className="flex items-center space-x-4">
              <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-sm transition"
                >
                  -
                </button>
                <span className="px-4 py-2 text-sm font-semibold text-slate-900">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-sm transition"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!inStock || adding}
                className="flex-1 py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition shadow-sm flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>{adding ? 'Adding...' : inStock ? 'Add to Cart' : 'Out of Stock'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews & Ratings Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Customer Reviews & Ratings</h2>
            <p className="text-xs text-slate-500 mt-1">
              Feedback from verified buyers who purchased this product on TechMart.
            </p>
          </div>

          <div className="flex items-center space-x-4 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-200">
            <div className="text-center">
              <div className="text-2xl font-black text-slate-900">
                {avgRating > 0 ? avgRating.toFixed(1) : '—'}
              </div>
              <div className="flex items-center text-amber-400 justify-center mt-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-3.5 h-3.5 ${s <= Math.round(avgRating) ? 'fill-current' : 'text-slate-300'}`}
                  />
                ))}
              </div>
            </div>
            <div className="border-l border-slate-200 pl-4 text-xs text-slate-500">
              <p className="font-semibold text-slate-800">{totalReviews} Verified Ratings</p>
              <p>100% Genuine Purchases</p>
            </div>
          </div>
        </div>

        {/* Review Submission Form for Verified Buyers */}
        {user && user.role === 'customer' && eligibility.canReview && (
          <form onSubmit={handleReviewSubmit} className="bg-blue-50/50 rounded-2xl border border-blue-200 p-6 space-y-4">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">You are a Verified Buyer! Write a Review:</h3>
            </div>

            {reviewMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{reviewMessage}</span>
              </div>
            )}

            {reviewError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 font-semibold flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span>{reviewError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Overall Rating</label>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRatingInput(star)}
                    className="p-1 hover:scale-110 transition focus:outline-none"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= ratingInput ? 'text-amber-400 fill-current' : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-slate-600 ml-2">({ratingInput} out of 5 stars)</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Your Review</label>
              <textarea
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="Share your detailed experience with this product, build quality, and delivery speed..."
                rows={3}
                className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submittingReview}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm disabled:opacity-50"
            >
              {submittingReview ? 'Submitting...' : 'Post Verified Review'}
            </button>
          </form>
        )}

        {user && user.role === 'customer' && eligibility.hasReviewed && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 flex items-center space-x-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>You have already submitted a verified review for this product. Thank you!</span>
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <MessageSquare className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">No reviews yet for this product.</p>
              <p className="text-xs text-slate-400">
                Verified purchasers will be able to share their review after order fulfillment.
              </p>
            </div>
          ) : (
            reviews.map((rev) => (
              <div key={rev._id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-slate-900">
                      {rev.customerId?.name || 'Verified Customer'}
                    </span>
                    <span className="inline-flex items-center text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <ShieldCheck className="w-3 h-3 mr-0.5" />
                      Verified Purchase
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center text-amber-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3.5 h-3.5 ${s <= rev.rating ? 'fill-current' : 'text-slate-300'}`}
                    />
                  ))}
                </div>

                <p className="text-xs text-slate-700 leading-relaxed">{rev.comment}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
