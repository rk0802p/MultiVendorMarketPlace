import React from 'react';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-800">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg border border-slate-200 p-8 text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-2">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          TechMart Multi-Vendor Marketplace
        </h1>
        <p className="text-slate-600 text-base leading-relaxed">
          Full-stack multi-vendor marketplace platform featuring Customer Storefront, Vendor Dashboard, and Admin Control Center.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-left">
          <div className="p-4 rounded-lg bg-blue-50/60 border border-blue-100">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Role 1</span>
            <h3 className="font-semibold text-slate-900 mt-1">Customer</h3>
            <p className="text-xs text-slate-500 mt-1">Browse, search via Elasticsearch, cart via Redis, multi-vendor checkout.</p>
          </div>
          <div className="p-4 rounded-lg bg-emerald-50/60 border border-emerald-100">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Role 2</span>
            <h3 className="font-semibold text-slate-900 mt-1">Vendor</h3>
            <p className="text-xs text-slate-500 mt-1">Store profile, product CRUD, S3 uploads, independent order fulfillment.</p>
          </div>
          <div className="p-4 rounded-lg bg-purple-50/60 border border-purple-100">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600">Role 3</span>
            <h3 className="font-semibold text-slate-900 mt-1">Admin</h3>
            <p className="text-xs text-slate-500 mt-1">Vendor approval, commission management, analytics & marketplace overview.</p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span>Status: Foundation Scaffolded</span>
          <span>Target: Step 1 (Schema & API Plan)</span>
        </div>
      </div>
    </div>
  );
}
