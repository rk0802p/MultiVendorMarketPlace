import React from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { ShieldCheck, Users, Store, DollarSign, Activity } from 'lucide-react';

export const AdminDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
            Platform Administration
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            Marketplace Control Center
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Superuser: <strong className="text-slate-700">{user?.email}</strong>. Global commission management, vendor store approvals, and financial ledger monitoring.
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-purple-50 text-purple-700 px-3.5 py-1.5 rounded-lg border border-purple-200 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>Full Admin Access Granted</span>
        </div>
      </div>

      {/* Admin KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Gross Platform GMV</span>
            <p className="text-xl font-bold text-slate-900">₹3,50,000</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Commission (10%)</span>
            <p className="text-xl font-bold text-slate-900">₹35,000</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Stores</span>
            <p className="text-xl font-bold text-slate-900">18</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Approvals</span>
            <p className="text-xl font-bold text-slate-900">3</p>
          </div>
        </div>
      </div>

      {/* Admin Actions Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Pending Vendor Store Applications</h2>
          <div className="space-y-3">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-slate-800 text-sm">Zenith Soundworks</h4>
                <p className="text-xs text-slate-500">Audio gear vendor · Applied today</p>
              </div>
              <span className="text-xs font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                Pending Review
              </span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-slate-800 text-sm">Pixel Perfect Monitors</h4>
                <p className="text-xs text-slate-500">Display hardware · Applied today</p>
              </div>
              <span className="text-xs font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                Pending Review
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Platform Commission Rules</h2>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-sm text-slate-600">
            <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
              <span>Standard Platform Commission:</span>
              <strong className="text-slate-900 font-bold">10.00%</strong>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
              <span>Payout Frequency:</span>
              <strong className="text-slate-900 font-bold">Automated on Delivery</strong>
            </div>
            <div className="flex justify-between items-center py-1">
              <span>Payment Gateway:</span>
              <strong className="text-slate-900 font-bold">Razorpay Route (Test Mode)</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
