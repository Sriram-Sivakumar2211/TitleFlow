import React, { useState, useEffect } from 'react';
import { Building2, Search, Plus, MapPin, Hash, Calendar, X, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { Property, PropertyType } from '../types';
import { useAuth } from '../contexts/AuthContext';

export const PropertiesPage: React.FC = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    address_line1: '',
    address_line2: '',
    city: '',
    state: 'OR',
    postal_code: '',
    county: '',
    property_type: 'SINGLE_FAMILY',
    apn_pin: '',
    legal_description: '',
    year_built: '',
  });

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getProperties(search);
      setProperties(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [search]);

  const handleCreateProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setModalLoading(true);
    try {
      await api.createProperty({
        address_line1: formData.address_line1,
        address_line2: formData.address_line2 || undefined,
        city: formData.city,
        state: formData.state,
        postal_code: formData.postal_code,
        county: formData.county || undefined,
        property_type: formData.property_type,
        apn_pin: formData.apn_pin || undefined,
        legal_description: formData.legal_description || undefined,
        year_built: formData.year_built ? parseInt(formData.year_built) : undefined,
      });
      setIsModalOpen(false);
      setFormData({
        address_line1: '',
        address_line2: '',
        city: '',
        state: 'OR',
        postal_code: '',
        county: '',
        property_type: 'SINGLE_FAMILY',
        apn_pin: '',
        legal_description: '',
        year_built: '',
      });
      fetchProperties();
    } catch (err: any) {
      setFormError(err.message || 'Failed to create property');
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Property Registry</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real estate parcels, legal descriptions, and APN records associated with closing transactions.
          </p>
        </div>

        {(user?.role === 'ADMIN' || user?.role === 'CLOSING_AGENT') && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-lg shadow-xs shadow-sky-600/30 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Register Property
          </button>
        )}
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search address, city, county, APN / Parcel ID..."
            className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-xs text-red-700">
          {error}
        </div>
      )}

      {/* Property Cards Grid */}
      {loading ? (
        <div className="py-12 text-center">
          <div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-3 text-xs text-slate-500">Searching property registry...</p>
        </div>
      ) : properties.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-slate-200 text-center">
          <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="mt-3 text-sm font-semibold text-slate-900">No properties found</h3>
          <p className="mt-1 text-xs text-slate-500">Try adjusting your search criteria or register a new property parcel.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {properties.map((prop) => (
            <div key={prop.id} className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600 shrink-0">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 tracking-tight leading-snug">
                        {prop.address_line1}
                      </h3>
                      {prop.address_line2 && (
                        <p className="text-xs text-slate-500">{prop.address_line2}</p>
                      )}
                    </div>
                  </div>
                  <span className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0">
                    {prop.property_type.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center text-slate-600 gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{prop.city}, {prop.state} {prop.postal_code}</span>
                    {prop.county && <span className="text-slate-400">({prop.county})</span>}
                  </div>

                  <div className="flex items-center text-slate-600 gap-1.5 font-mono">
                    <Hash className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>APN: {prop.apn_pin || 'Not assigned'}</span>
                  </div>

                  {prop.year_built && (
                    <div className="flex items-center text-slate-600 gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Built: {prop.year_built}</span>
                    </div>
                  )}
                </div>

                {prop.legal_description && (
                  <div className="mt-3.5 pt-3 border-t border-slate-100">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      Legal Description
                    </span>
                    <p className="text-xs text-slate-600 line-clamp-2 italic leading-relaxed">
                      "{prop.legal_description}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Register Property Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Register New Property Parcel</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateProperty} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase">Street Address *</label>
                <input
                  type="text"
                  required
                  value={formData.address_line1}
                  onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                  placeholder="e.g. 742 Evergreen Terrace"
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase">Apt / Suite / Unit</label>
                <input
                  type="text"
                  value={formData.address_line2}
                  onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
                  placeholder="e.g. Suite 400"
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 uppercase">City *</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Springfield"
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 uppercase">State *</label>
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="OR"
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 uppercase">Zip Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.postal_code}
                    onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                    placeholder="97477"
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase">County</label>
                  <input
                    type="text"
                    value={formData.county}
                    onChange={(e) => setFormData({ ...formData, county: e.target.value })}
                    placeholder="Lane County"
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase">Property Type</label>
                  <select
                    value={formData.property_type}
                    onChange={(e) => setFormData({ ...formData, property_type: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="SINGLE_FAMILY">Single Family Home</option>
                    <option value="CONDOMINIUM">Condominium</option>
                    <option value="TOWNHOUSE">Townhouse</option>
                    <option value="MULTI_FAMILY">Multi-Family</option>
                    <option value="COMMERCIAL">Commercial</option>
                    <option value="VACANT_LAND">Vacant Land</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase">APN / Parcel ID</label>
                  <input
                    type="text"
                    value={formData.apn_pin}
                    onChange={(e) => setFormData({ ...formData, apn_pin: e.target.value })}
                    placeholder="042-881-992-01"
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase">Year Built</label>
                  <input
                    type="number"
                    value={formData.year_built}
                    onChange={(e) => setFormData({ ...formData, year_built: e.target.value })}
                    placeholder="1998"
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase">Legal Description</label>
                <textarea
                  rows={2}
                  value={formData.legal_description}
                  onChange={(e) => setFormData({ ...formData, legal_description: e.target.value })}
                  placeholder="Lot 12, Block 4, Evergreen Hills Subdivision..."
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50"
                >
                  {modalLoading ? 'Registering...' : 'Save Property'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
