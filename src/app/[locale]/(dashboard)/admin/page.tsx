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
  RefreshCw,
  Save,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { routing } from '@/i18n/routing';
import {
  PageHeader,
  StatCard,
  Card,
  Modal,
  FilterBar,
  Input,
  Select,
  Button,
} from '@/components/ui';

interface AdminPageProps {
  params: Promise<{ locale: string }>;
}

interface Stats {
  totalUsers: number;
  totalMembers: number;
  approvedMembers: number;
  pendingMembers: number;
  adminCount: number;
  lastUpdated: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  createdAt: string;
  lastSignInAt: string | null;
  imageUrl: string;
}

export default function AdminPage({ params }: AdminPageProps) {
  const { locale } = useParams();
  const { isAdmin, canAssignRoles, roleId } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  // Real-time data state
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Edit Modal State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<string>('');
  const [newStatus, setNewStatus] = useState<string>('active');
  const [isSaving, setIsSaving] = useState(false);

  const roles = getRolesOrderedByLevel();

  // Fetch stats and users
  async function fetchData() {
    try {
      setRefreshing(true);

      const [statsRes, usersRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/users'),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users || []);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  async function handleDeleteUser(userId: string) {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Optimistic UI update
        setUsers(users.filter(u => u.id !== userId));
        // Refresh stats in background
        fetchData();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('An error occurred while deleting the user');
    }
  }

  function openEditModal(user: User) {
    setEditingUser(user);
    setNewRole(user.role === 'nouveau_membre' ? 'membre' : user.role);
    setNewStatus(user.status);
  }

  function closeEditModal() {
    setEditingUser(null);
    setNewRole('');
    setNewStatus('active');
    setIsSaving(false);
  }

  async function handleSaveUser() {
    if (!editingUser) return;

    try {
      setIsSaving(true);

      const requests: Promise<Response>[] = [];

      const normalizedEditingRole = editingUser.role === 'nouveau_membre' ? 'membre' : editingUser.role;
      const roleChanged = newRole !== normalizedEditingRole;
      const statusChanged = newStatus !== editingUser.status;

      if (!roleChanged && !statusChanged) {
        closeEditModal();
        return;
      }

      if (roleChanged) {
        requests.push(
          fetch(`/api/admin/users/${editingUser.id}/role`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roleId: newRole }),
          })
        );
      }

      if (statusChanged) {
        requests.push(
          fetch(`/api/admin/users/${editingUser.id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ memberStatus: newStatus }),
          })
        );
      }

      if (requests.length === 0) {
        closeEditModal();
        return;
      }

      const results = await Promise.all(requests);
      const failed = results.find((r) => !r.ok);
      if (failed) {
        const error = await failed.json();
        alert(error.error || 'Failed to update user');
        return;
      }

      setUsers(users.map(u =>
        u.id === editingUser.id ? { ...u, role: newRole, status: newStatus } : u
      ));
      closeEditModal();
      fetchData();
    } catch (error) {
      console.error('Error updating user:', error);
      alert('An error occurred while updating the user');
    } finally {
      setIsSaving(false);
    }
  }

  // Filter users based on search and role
  const filteredUsers = users.filter(user => {
    const matchesSearch = searchQuery === '' ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = !selectedRole || user.role === selectedRole;

    return matchesSearch && matchesRole;
  });

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
      membre: 'text-brand-400 bg-blue-400/10 border-blue-400/20',
    };
    return colors[roleId] || 'text-gray-400 bg-gray-400/10 border-gray-400/20';
  };

  return (
    <PermissionGate
      permission="dashboard.admin"
      fallback={
        <div className="flex flex-col items-center justify-center py-20">
          <Shield className="w-16 h-16 text-muted mb-4" />
          <h2 className="text-xl font-semibold text-primary mb-2">Access Denied</h2>
          <p className="text-secondary text-center max-w-md">
            You don&apos;t have permission to access this page. Only administrators can view this section.
          </p>
        </div>
      }
    >
      <div className="space-y-6">
        <PageHeader
          title="Administration"
          description={
            stats
              ? `Gérez les utilisateurs et leurs rôles. Dernière mise à jour: ${new Date(stats.lastUpdated).toLocaleTimeString()}`
              : 'Gérez les utilisateurs et leurs rôles.'
          }
          actions={
            <Button
              variant="secondary"
              size="sm"
              onClick={fetchData}
              disabled={refreshing}
              title="Actualiser"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          }
        />

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-12 h-12 border-2 border-default border-t-brand-500 rounded-full" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Users" value={stats?.totalUsers || 0} icon={Users} />
            <StatCard
              label="Active"
              value={stats?.approvedMembers || 0}
              icon={Check}
              iconClassName="text-brand-600"
            />
            <StatCard
              label="Pending"
              value={stats?.pendingMembers || 0}
              icon={Filter}
              iconClassName="text-amber-600"
              iconBgClassName="bg-amber-500/10"
            />
            <StatCard
              label="Admins"
              value={stats?.adminCount || 0}
              icon={Shield}
              iconClassName="text-purple-600"
              iconBgClassName="bg-purple-500/10"
            />
          </div>
        )}

        <Card>
          <h2 className="text-lg font-semibold text-primary mb-4">Hiérarchie des Rôles</h2>
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
        </Card>

        <Card padding="none">
          <div className="p-6 border-b border-subtle">
            <FilterBar className="border-0 p-0 bg-transparent rounded-none">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                <Input
                  placeholder="Rechercher un utilisateur..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select
                value={selectedRole || ''}
                onChange={(e) => setSelectedRole(e.target.value || null)}
                className="sm:w-48"
              >
                <option value="">Tous les rôles</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name[locale as 'en' | 'fr'] || role.name.en}
                  </option>
                ))}
              </Select>
            </FilterBar>
          </div>

          <div className="overflow-x-auto p-6 pt-0">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-default">
                  <th className="pb-3 text-secondary text-sm font-medium">User</th>
                  <th className="pb-3 text-secondary text-sm font-medium">Rôle</th>
                  <th className="pb-3 text-secondary text-sm font-medium">Statut</th>
                  <th className="pb-3 text-secondary text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-subtle">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-muted">
                      {loading ? 'Chargement...' : 'Aucun utilisateur trouvé'}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const Icon = getRoleIcon(user.role);
                    return (
                      <tr key={user.id} className="hover:bg-card">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-card-muted flex items-center justify-center overflow-hidden">
                              {user.imageUrl ? (
                                <img src={user.imageUrl} alt={user.name} className="w-full h-full object-cover" />
                              ) : (
                                <UserCog className="w-5 h-5 text-secondary" />
                              )}
                            </div>
                            <div>
                              <p className="text-primary font-medium">{user.name}</p>
                              <p className="text-muted text-sm">{user.email}</p>
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
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${user.status === 'active'
                            ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}>
                            {user.status === 'active' ? (
                              <Check className="w-3 h-3" />
                            ) : (
                              <Clock className="w-3 h-3" />
                            )}
                            {user.status === 'active'
                              ? (locale === 'fr' ? 'Actif' : 'Active')
                              : user.status === 'pending'
                                ? (locale === 'fr' ? 'En essai' : 'Trial')
                                : user.status}
                          </span>
                        </td>
                        <td className="py-4">
                          <PermissionGate permission="admin.roles.assign">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openEditModal(user)}
                                className="p-2 rounded-lg hover:bg-card-muted text-secondary hover:text-primary transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <PermissionGate permission="admin.users.manage">
                                <button
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="p-2 rounded-lg hover:bg-red-500/10 text-secondary hover:text-red-400 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </PermissionGate>
                            </div>
                          </PermissionGate>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Modal
          open={!!editingUser}
          onClose={closeEditModal}
          title="Modifier l'utilisateur"
          footer={
            <>
              <Button variant="secondary" onClick={closeEditModal}>
                Annuler
              </Button>
              <Button
                onClick={handleSaveUser}
                disabled={
                  isSaving ||
                  (!!editingUser && newRole === editingUser.role && newStatus === editingUser.status)
                }
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Sauvegarder
                  </>
                )}
              </Button>
            </>
          }
        >
          {editingUser ? (
            <>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-card-muted flex items-center justify-center overflow-hidden">
                  {editingUser.imageUrl ? (
                    <img src={editingUser.imageUrl} alt={editingUser.name} className="w-full h-full object-cover" />
                  ) : (
                    <UserCog className="w-6 h-6 text-secondary" />
                  )}
                </div>
                <div>
                  <h4 className="text-primary font-medium text-lg">{editingUser.name}</h4>
                  <p className="text-muted text-sm">{editingUser.email}</p>
                </div>
              </div>

              <Select
                label={locale === 'fr' ? 'Statut adhésion' : 'Membership status'}
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                <option value="pending">{locale === 'fr' ? 'En essai' : 'Trial'}</option>
                <option value="active">{locale === 'fr' ? 'Actif (membre validé)' : 'Active (validated)'}</option>
                <option value="approved">{locale === 'fr' ? 'Approuvé' : 'Approved'}</option>
              </Select>

              <Select label="Rôle" value={newRole} onChange={(e) => setNewRole(e.target.value)}>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name[locale as 'en' | 'fr'] || role.name.en} (Lv.{role.level})
                  </option>
                ))}
              </Select>
            </>
          ) : null}
        </Modal>
      </div>
    </PermissionGate>
  );
}

