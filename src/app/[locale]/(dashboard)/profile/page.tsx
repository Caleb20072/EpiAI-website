'use client';

import { useAuth } from '@/hooks/useAuth';
import { getRoleName, getRoleColor, getRoleLevel } from '@/lib/roles/utils';
import { useParams } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import { routing } from '@/i18n/routing';
import { use } from 'react';
import {
  User,
  Mail,
  Shield,
  Calendar,
  Edit,
  Save,
  X,
} from 'lucide-react';
import { useState } from 'react';

export default function ProfilePage() {
  const params = useParams();
  const locale = (params.locale as string) || routing.defaultLocale;
  const { userId, roleId, role, isAdmin, hasPermission } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const roleName = roleId ? getRoleName(roleId, locale as 'en' | 'fr') : 'Member';
  const roleColor = roleId ? getRoleColor(roleId) : 'text-gray-400';
  const roleLevel = roleId ? getRoleLevel(roleId) : 1;

  // Mock user data
  const userData = {
    email: 'user@example.com',
    joinedAt: '2024-01-15',
    team: 'AI Research',
    pole: 'Machine Learning',
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Profile</h1>
        <p className="text-white/60">
          Gérez vos informations personnelles et vos préférences.
        </p>
      </div>

      {/* Profile Card */}
      <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
              <User className="w-10 h-10 text-white/60" />
            </div>
            <div className="absolute -bottom-2 -right-2">
              <UserButton
                afterSignOutUrl={`/${locale}`}
                appearance={{
                  elements: {
                    avatarBox: 'w-10 h-10 rounded-full border-2 border-zinc-900',
                  },
                }}
              />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white">User</h2>
                <p className="text-white/60">{userData.email}</p>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all text-sm font-medium"
              >
                <Edit className="w-4 h-4" />
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {/* Role Badge */}
            <div className="flex items-center gap-3 mb-6">
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 ${roleColor}`}>
                <Shield className="w-4 h-4" />
                <span className="font-medium">{roleName}</span>
              </span>
              <span className="text-white/40 text-sm">
                Level {roleLevel}
              </span>
              {isAdmin && (
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-medium border border-amber-500/30">
                  Administrator
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Info */}
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Informations Personnelles</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-white/40" />
              <div>
                <p className="text-white/40 text-xs uppercase tracking-wide">Email</p>
                <p className="text-white">{userData.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-white/40" />
              <div>
                <p className="text-white/40 text-xs uppercase tracking-wide">Membre depuis</p>
                <p className="text-white">{userData.joinedAt}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Team Info */}
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Équipe & Pôle</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-white/40" />
              <div>
                <p className="text-white/40 text-xs uppercase tracking-wide">Pôle</p>
                <p className="text-white">{userData.pole}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-white/40" />
              <div>
                <p className="text-white/40 text-xs uppercase tracking-wide">Équipe</p>
                <p className="text-white">{userData.team}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Permissions */}
      <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Permissions</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {role?.permissions.map((permission) => (
            <div
              key={permission}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 text-white/80 text-sm"
            >
              <Shield className="w-4 h-4 text-emerald-400" />
              <span className="capitalize">{permission.replace('.', ': ')}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
