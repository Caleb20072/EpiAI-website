'use client';

import { useAuth } from '@/hooks/useAuth';
import { PermissionGate } from '@/components/shared/PermissionGate';
import { getRolesOrderedByLevel, getRoleName } from '@/lib/roles/utils';
import {
  Users,
  Shield,
  UserCog,
  Crown,
  Building2,
  Award,
  Briefcase,
  GraduationCap,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Check,
  X,
  Clock,
} from 'lucide-react';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { routing } from '@/i18n/routing';

interface AdminPageProps {
  params: Promise<{ locale: string }>;
}

export default function AdminPage({ params }: AdminPageProps) {
  const { locale } = useParams();
  const { isAdmin, canAssignRoles, roleId } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const roles = getRolesOrderedByLevel();

  // Mock users pour demonstration
  const mockUsers = [
    { id: '1', email: 'president@epiai.com', name: 'Jean Dupont', role: 'president', status: 'active' },
    { id: '2', email: 'admin@epiai.com', name: 'Marie Martin', role: 'admin_general', status: 'active' },
    { id: '3', email: 'chef@epiai.com', name: 'Pierre Durand', role: 'chef_pole', status: 'active' },
    { id: '4', email: 'mentor@epiai.com', name: 'Sophie Leblanc', role: 'mentor_senior', status: 'active' },
    { id: '5', email: 'membre@epiai.com', name: 'Lucas Moreau', role: 'membre', status: 'pending' },
  ];

  const getRoleIcon = (roleId: string) => {
    const icons: Record<string, any> = {
      president: Crown,
      admin_general: Shield,
      chef_pole: Building2,
      mentor_senior: Award,
      mentor: GraduationCap,
      chef_equipe: Briefcase,
      membre_equipe: UserCog,
      membre: Users,
      nouveau_membre: Users,
    };
    return icons[roleId] || Users;
  };

  const getRoleColor = (roleId: string) => {
    const colors: Record<string, string> = {
      president: 'text-red-400 bg-red-400/10 border-red-400/20',
      admin_general: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
      chef_pole: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
      mentor_senior: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
      mentor: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20',
      chef_equipe: 'text-teal-400 bg-teal-400/10 border-teal-400/20',
      membre_equipe: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
      membre: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
      nouveau_membre: 'text-gray-400 bg-gray-400/10 border-gray-400/20',
    };
    return colors[roleId] || 'text-gray-400 bg-gray-400/10 border-gray-400/20';
  };

  return (
    <PermissionGate
      permission="dashboard.admin"
      fallback={
        <div className="flex flex-col items-center justify-center py-20">
          <Shield className="w-16 h-16 text-white/20 mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Access Denied</h2>
          <p className="text-white/60 text-center max-w-md">
            You don&apos;t have permission to access this page. Only administrators can view this section.
          </p>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Administration</h1>
            <p className="text-white/60">
              Gérez les utilisateurs et leurs rôles.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Total Users</p>
                <p className="text-2xl font-bold text-white">{mockUsers.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Active</p>
                <p className="text-2xl font-bold text-emerald-400">
                  {mockUsers.filter(u => u.status === 'active').length}
                </p>
              </div>
              <Check className="w-8 h-8 text-emerald-400" />
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Pending</p>
                <p className="text-2xl font-bold text-amber-400">
                  {mockUsers.filter(u => u.status === 'pending').length}
                </p>
              </div>
              <Filter className="w-8 h-8 text-amber-400" />
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Admins</p>
                <p className="text-2xl font-bold text-purple-400">
                  {mockUsers.filter(u => ['president', 'admin_general', 'chef_pole'].includes(u.role)).length}
                </p>
              </div>
              <Shield className="w-8 h-8 text-purple-400" />
            </div>
          </div>
        </div>

        {/* Roles Overview */}
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <h2 className="text-lg font-semibold text-white mb-4">Hiérarchie des Rôles</h2>
          <div className="flex flex-wrap gap-2">
            {roles.map((role) => {
              const Icon = getRoleIcon(role.id);
              return (
                <div
                  key={role.id}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${getRoleColor(role.id)}`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{role.name[locale as 'en' | 'fr'] || role.name.en}</span>
                  <span className="text-xs opacity-60">Lv.{role.level}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Users List */}
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                placeholder="Rechercher un utilisateur..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-white/30"
              />
            </div>
            <select
              value={selectedRole || ''}
              onChange={(e) => setSelectedRole(e.target.value || null)}
              className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-white/30"
            >
              <option value="" className="bg-zinc-900">Tous les rôles</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id} className="bg-zinc-900">
                  {role.name[locale as 'en' | 'fr'] || role.name.en}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-white/10">
                  <th className="pb-3 text-white/60 text-sm font-medium">User</th>
                  <th className="pb-3 text-white/60 text-sm font-medium">Rôle</th>
                  <th className="pb-3 text-white/60 text-sm font-medium">Statut</th>
                  <th className="pb-3 text-white/60 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {mockUsers.map((user) => {
                  const Icon = getRoleIcon(user.role);
                  return (
                    <tr key={user.id} className="hover:bg-white/5">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                            <UserCog className="w-5 h-5 text-white/60" />
                          </div>
                          <div>
                            <p className="text-white font-medium">{user.name}</p>
                            <p className="text-white/40 text-sm">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${getRoleColor(user.role)}`}>
                          <Icon className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            {getRoleName(user.role, locale as 'en' | 'fr')}
                          </span>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          user.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {user.status === 'active' ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}
                          {user.status}
                        </span>
                      </td>
                      <td className="py-4">
                        <PermissionGate permission="admin.roles.assign">
                          <div className="flex items-center gap-2">
                            <button className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors">
                              <Edit className="w-4 h-4" />
                            </button>
                            <PermissionGate permission="admin.users.manage">
                              <button className="p-2 rounded-lg hover:bg-red-500/10 text-white/60 hover:text-red-400 transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </PermissionGate>
                          </div>
                        </PermissionGate>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PermissionGate>
  );
}
