'use client';

import { useAuth } from '@/hooks/useAuth';
import { getRoleName, getRoleColor } from '@/lib/roles/utils';
import { PermissionGate } from '@/components/shared/PermissionGate';
import { useParams } from 'next/navigation';
import { Link } from '@/i18n/routing';
import {
  Users,
  MessageSquare,
  Calendar,
  FileText,
  Award,
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface DashboardStats {
  members: number;
  discussions: number;
  events: number;
  resources: number;
}

export default function DashboardPage() {
  const params = useParams();
  const locale = (params.locale as string) || 'en';
  const { roleId, role, isAdmin } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const roleName = roleId ? getRoleName(roleId, locale as 'en' | 'fr') : 'Member';
  const roleColor = roleId ? getRoleColor(roleId) : 'text-gray-400';

  // Fetch real-time stats
  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const statsConfig = [
    {
      label: locale === 'fr' ? 'Discussions' : 'Discussions',
      value: stats?.discussions || 0,
      icon: MessageSquare,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10',
    },
    {
      label: locale === 'fr' ? 'Événements' : 'Events',
      value: stats?.events || 0,
      icon: Calendar,
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/10',
    },
    {
      label: locale === 'fr' ? 'Ressources' : 'Resources',
      value: stats?.resources || 0,
      icon: FileText,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-400/10',
    },
    {
      label: locale === 'fr' ? 'Membres' : 'Members',
      value: stats?.members || 0,
      icon: Users,
      color: 'text-amber-400',
      bgColor: 'bg-amber-400/10',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          {locale === 'fr' ? 'Tableau de bord' : 'Dashboard'}
        </h1>
        <p className="text-white/60">
          {locale === 'fr'
            ? 'Bienvenue ! Voici un aperçu de votre activité.'
            : 'Welcome back! Here\'s an overview of your activity.'}
        </p>
      </div>

      {/* Role Badge */}
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10">
        <div className={`p-3 rounded-xl ${role?.color?.replace('text-', 'bg-').replace('400', '400/20') || 'bg-white/10'}`}>
          <Award className={`w-6 h-6 ${role?.color || 'text-white/60'}`} />
        </div>
        <div>
          <p className="text-white/60 text-sm">
            {locale === 'fr' ? 'Votre rôle' : 'Your role'}
          </p>
          <p className={`text-xl font-bold ${roleColor}`}>
            {roleName}
          </p>
        </div>
        {isAdmin && (
          <span className="ml-auto px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-sm font-medium border border-amber-500/30">
            {locale === 'fr' ? 'Administrateur' : 'Administrator'}
          </span>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsConfig.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-2 rounded-xl ${stat.bgColor}`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              {loading ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-white/10 rounded w-16 mb-2"></div>
                  <div className="h-4 bg-white/5 rounded w-20"></div>
                </div>
              ) : (
                <>
                  <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
                  <p className="text-white/60 text-sm">{stat.label}</p>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <h2 className="text-lg font-semibold text-white mb-4">
            {locale === 'fr' ? 'Activité Récente' : 'Recent Activity'}
          </h2>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="w-8 h-8 text-white/20" />
              </div>
              <p className="text-white/40 text-sm">
                {locale === 'fr' ? 'Aucune activité récente' : 'No recent activity'}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <h2 className="text-lg font-semibold text-white mb-4">
            {locale === 'fr' ? 'Actions Rapides' : 'Quick Actions'}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/forum"
              className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-left"
            >
              <MessageSquare className="w-5 h-5 text-blue-400 mb-2" />
              <p className="text-white font-medium text-sm">
                {locale === 'fr' ? 'Nouvelle Discussion' : 'New Discussion'}
              </p>
            </Link>
            <Link
              href="/events"
              className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-left"
            >
              <Calendar className="w-5 h-5 text-purple-400 mb-2" />
              <p className="text-white font-medium text-sm">
                {locale === 'fr' ? 'Créer Événement' : 'Create Event'}
              </p>
            </Link>
            <Link
              href="/resources"
              className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-left"
            >
              <FileText className="w-5 h-5 text-emerald-400 mb-2" />
              <p className="text-white font-medium text-sm">
                {locale === 'fr' ? 'Ajouter Ressource' : 'Add Resource'}
              </p>
            </Link>
            <PermissionGate permission="dashboard.admin">
              <Link
                href="/admin/membership"
                className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-all text-left"
              >
                <Users className="w-5 h-5 text-amber-400 mb-2" />
                <p className="text-white font-medium text-sm">
                  {locale === 'fr' ? 'Gérer Membres' : 'Manage Members'}
                </p>
              </Link>
            </PermissionGate>
          </div>
        </div>
      </div>
    </div>
  );
}
