'use client';

import { useAuth } from '@/hooks/useAuth';
import { getRoleName, getRoleColor } from '@/lib/roles/utils';
import { PermissionGate } from '@/components/shared/PermissionGate';
import { useParams } from 'next/navigation';
import {
  Users,
  MessageSquare,
  Calendar,
  FileText,
  TrendingUp,
  Clock,
  Award,
  Building2,
} from 'lucide-react';

export default function DashboardPage() {
  const params = useParams();
  const locale = (params.locale as string) || 'en';
  const { roleId, role, roleLevel, isAdmin } = useAuth();

  const roleName = roleId ? getRoleName(roleId, locale as 'en' | 'fr') : 'Member';
  const roleColor = roleId ? getRoleColor(roleId) : 'text-gray-400';

  // Stats pour le dashboard
  const stats = [
    {
      label: 'Discussions',
      value: '24',
      change: '+3',
      icon: MessageSquare,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10',
    },
    {
      label: 'Événements',
      value: '8',
      change: '+2',
      icon: Calendar,
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/10',
    },
    {
      label: 'Ressources',
      value: '156',
      change: '+12',
      icon: FileText,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-400/10',
    },
    {
      label: 'Membres',
      value: '48',
      change: '+5',
      icon: Users,
      color: 'text-amber-400',
      bgColor: 'bg-amber-400/10',
    },
  ];

  // Activités récentes (mock)
  const recentActivities = [
    {
      type: 'discussion',
      title: 'Nouvelle discussion sur Transformer Models',
      time: '2 heures',
      user: 'Marie D.',
    },
    {
      type: 'event',
      title: 'Workshop: Introduction au ML',
      time: '1 jour',
      user: 'Admin',
    },
    {
      type: 'resource',
      title: 'Ressource ajoutée: Cours Deep Learning',
      time: '2 jours',
      user: 'Jean P.',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-white/60">
          Welcome back! Here&apos;s an overview of your activity.
        </p>
      </div>

      {/* Role Badge */}
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10">
        <div className={`p-3 rounded-xl ${role?.color?.replace('text-', 'bg-').replace('400', '400/20') || 'bg-white/10'}`}>
          <Award className={`w-6 h-6 ${role?.color || 'text-white/60'}`} />
        </div>
        <div>
          <p className="text-white/60 text-sm">Votre rôle</p>
          <p className={`text-xl font-bold ${roleColor}`}>
            {roleName}
          </p>
        </div>
        {isAdmin && (
          <span className="ml-auto px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-sm font-medium border border-amber-500/30">
            Admin
          </span>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
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
                <span className="text-emerald-400 text-sm font-medium">
                  {stat.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-white/60 text-sm">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <h2 className="text-lg font-semibold text-white mb-4">Activité Récente</h2>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 text-white/60" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{activity.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-white/40 text-sm">{activity.user}</span>
                    <span className="text-white/20">•</span>
                    <span className="text-white/40 text-sm">{activity.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <h2 className="text-lg font-semibold text-white mb-4">Actions Rapides</h2>
          <div className="grid grid-cols-2 gap-3">
            <button className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-left">
              <MessageSquare className="w-5 h-5 text-blue-400 mb-2" />
              <p className="text-white font-medium text-sm">Nouvelle Discussion</p>
            </button>
            <button className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-left">
              <Calendar className="w-5 h-5 text-purple-400 mb-2" />
              <p className="text-white font-medium text-sm">Créer Événement</p>
            </button>
            <button className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-left">
              <FileText className="w-5 h-5 text-emerald-400 mb-2" />
              <p className="text-white font-medium text-sm">Ajouter Ressource</p>
            </button>
            <PermissionGate permission="dashboard.admin">
              <button className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-all text-left">
                <Users className="w-5 h-5 text-amber-400 mb-2" />
                <p className="text-white font-medium text-sm">Gérer Membres</p>
              </button>
            </PermissionGate>
          </div>
        </div>
      </div>
    </div>
  );
}
