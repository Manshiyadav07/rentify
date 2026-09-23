import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { User, Mail, Phone, MapPin, Shield, KeyRound, Clock, Heart, Edit3, Check } from 'lucide-react';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const toast = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: {
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      zipCode: user?.address?.zipCode || ''
    }
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  // Sync state if user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          state: user.address?.state || '',
          zipCode: user.address?.zipCode || ''
        }
      });
    }
  }, [user]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const { data } = await axios.put('/api/auth/profile', formData);
      if (data.success) {
        updateUser(data);
        toast.success('Profile updated successfully!');
        setIsEditing(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setSavingPassword(true);
    try {
      const { data } = await axios.put('/api/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });

      if (data.success) {
        toast.success('Password changed successfully!');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      {/* Header Profile Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-extrabold text-2xl shadow-lg shadow-blue-500/20">
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">{user?.name}</h1>
              {user?.role === 'admin' && (
                <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Admin
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
            <p className="text-[11px] text-slate-400 mt-1">Verified Rentify Reader Member</p>
          </div>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
        >
          <Edit3 size={15} /> {isEditing ? 'Cancel Editing' : 'Edit Profile'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left: Profile Details / Edit Form */}
        <div className="md:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <User size={18} className="text-blue-600" /> Personal & Delivery Information
            </h3>

            {isEditing ? (
              <form onSubmit={handleProfileSave} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 9876543210"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <label className="block font-bold text-slate-700 mb-2">Default Delivery Address</label>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Street Address"
                      value={formData.address.street}
                      onChange={(e) => setFormData({ ...formData, address: { ...formData.address, street: e.target.value } })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="City"
                        value={formData.address.city}
                        onChange={(e) => setFormData({ ...formData, address: { ...formData.address, city: e.target.value } })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-blue-500"
                      />
                      <input
                        type="text"
                        placeholder="PIN Code"
                        value={formData.address.zipCode}
                        onChange={(e) => setFormData({ ...formData, address: { ...formData.address, zipCode: e.target.value } })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow-sm transition disabled:opacity-50"
                >
                  {savingProfile ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </form>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                  <Mail size={18} className="text-slate-400" />
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Email</span>
                    <p className="font-semibold text-slate-800">{user?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                  <Phone size={18} className="text-slate-400" />
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Phone</span>
                    <p className="font-semibold text-slate-800">{user?.phone || 'Not set'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                  <MapPin size={18} className="text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Delivery Address</span>
                    <p className="font-semibold text-slate-800">
                      {user?.address?.street ? (
                        <>
                          {user.address.street}, {user.address.city}, {user.address.state} - {user.address.zipCode}
                        </>
                      ) : (
                        'No address saved'
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Change Password */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <KeyRound size={18} className="text-blue-600" /> Security & Password
            </h3>

            <form onSubmit={handlePasswordChange} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={savingPassword}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-xl shadow-sm transition disabled:opacity-50"
              >
                {savingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
