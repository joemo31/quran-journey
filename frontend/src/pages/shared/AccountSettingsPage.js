import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import { useApi } from '../../hooks/useApi';

export default function AccountSettingsPage() {
  const { user, setUserProfile, refreshUser } = useAuth();
  const { execute, loading } = useApi();

  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    currentPassword: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const load = async () => {
      try {
        const u = await refreshUser();
        setProfileForm((f) => ({
          ...f,
          name: u.name || '',
          email: u.email || '',
          phone: u.phone || '',
          country: u.country || '',
        }));
      } catch {
        if (user) {
          setProfileForm((f) => ({
            ...f,
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            country: user.country || '',
          }));
        }
      }
    };
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const setProfile = (key, value) => setProfileForm((f) => ({ ...f, [key]: value }));

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim()) {
      toast.error('Name is required.');
      return;
    }
    if (!profileForm.currentPassword) {
      toast.error('Enter your current password to save profile changes.');
      return;
    }

    await execute(
      () =>
        authAPI.updateProfile({
          name: profileForm.name.trim(),
          email: profileForm.email.trim(),
          phone: profileForm.phone,
          country: profileForm.country,
          currentPassword: profileForm.currentPassword,
        }),
      {
        successMsg: 'Profile updated.',
        onSuccess: (res) => {
          const updated = res?.data;
          if (updated) setUserProfile(updated);
          setProfileForm((f) => ({ ...f, currentPassword: '' }));
        },
      }
    );
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }

    await execute(
      () =>
        authAPI.updatePassword({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      {
        successMsg: 'Password updated.',
        onSuccess: () =>
          setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' }),
      }
    );
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-primary font-display">Account settings</h2>
        <p className="text-secondary text-sm mt-1">
          Update your name, login email, and password. Your role ({user?.role}) cannot be changed here.
        </p>
      </div>

      <form onSubmit={handleProfileSave} className="card space-y-4">
        <h3 className="font-bold text-primary">Profile</h3>

        <div>
          <label className="label">Full name</label>
          <input
            type="text"
            className="input"
            value={profileForm.name}
            onChange={(e) => setProfile('name', e.target.value)}
            required
          />
        </div>

        <div>
          <label className="label">Login email</label>
          <input
            type="email"
            className="input"
            value={profileForm.email}
            onChange={(e) => setProfile('email', e.target.value)}
            required
          />
          <p className="text-xs text-gray-400 mt-1">This is the email you use to sign in.</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Phone (optional)</label>
            <input
              type="text"
              className="input"
              value={profileForm.phone}
              onChange={(e) => setProfile('phone', e.target.value)}
            />
          </div>
          <div>
            <label className="label">Country (optional)</label>
            <input
              type="text"
              className="input"
              value={profileForm.country}
              onChange={(e) => setProfile('country', e.target.value)}
            />
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <label className="label">Current password (required to save)</label>
          <input
            type="password"
            className="input"
            value={profileForm.currentPassword}
            onChange={(e) => setProfile('currentPassword', e.target.value)}
            placeholder="Enter your current password"
            required
            autoComplete="current-password"
          />
        </div>

        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Saving...' : 'Save profile'}
        </button>
      </form>

      <form onSubmit={handlePasswordSave} className="card space-y-4">
        <h3 className="font-bold text-primary">Change password</h3>

        <div>
          <label className="label">Current password</label>
          <input
            type="password"
            className="input"
            value={passwordForm.currentPassword}
            onChange={(e) =>
              setPasswordForm((f) => ({ ...f, currentPassword: e.target.value }))
            }
            required
            autoComplete="current-password"
          />
        </div>

        <div>
          <label className="label">New password</label>
          <input
            type="password"
            className="input"
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm((f) => ({ ...f, newPassword: e.target.value }))}
            minLength={8}
            required
            autoComplete="new-password"
          />
        </div>

        <div>
          <label className="label">Confirm new password</label>
          <input
            type="password"
            className="input"
            value={passwordForm.confirmPassword}
            onChange={(e) =>
              setPasswordForm((f) => ({ ...f, confirmPassword: e.target.value }))
            }
            minLength={8}
            required
            autoComplete="new-password"
          />
        </div>

        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Updating...' : 'Update password'}
        </button>
      </form>
    </div>
  );
}
