'use client';

import { useState, useTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { CATEGORIES } from '@/lib/events/categories';
import { ArrowLeft, Calendar, MapPin, Globe, Image, Users, AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils/cn';

export default function CreateEventPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as string) || 'en';
  const { hasPermission } = useAuth();
  const t = useTranslations('Events');

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    content: '',
    categoryId: CATEGORIES[0]?.id || 'workshop',
    date: '',
    endDate: '',
    location: '',
    isOnline: false,
    onlineLink: '',
    capacity: 50,
    imageUrl: '',
  });

  const canCreate = hasPermission('dashboard.admin');

  if (!canCreate) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <Calendar className="w-16 h-16 text-white/20 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">
          {locale === 'fr' ? 'Accès refusé' : 'Access Denied'}
        </h1>
        <p className="text-white/60 mb-6">
          {locale === 'fr'
            ? 'Vous n\'avez pas la permission de créer des événements.'
            : 'You don\'t have permission to create events.'}
        </p>
        <Link
          href={`/${locale}/events`}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-semibold hover:bg-white/90 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          {locale === 'fr' ? 'Retour aux événements' : 'Back to Events'}
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.title || !form.description || !form.date || !form.location || !form.categoryId) {
      setError(locale === 'fr' ? 'Veuillez remplir tous les champs obligatoires' : 'Please fill in all required fields');
      return;
    }

    if (!form.content) {
      setError(locale === 'fr' ? 'Le contenu détaillé est requis' : 'Detailed content is required');
      return;
    }

    if (form.capacity < 1) {
      setError(locale === 'fr' ? 'La capacité doit être au moins 1' : 'Capacity must be at least 1');
      return;
    }

    const eventDate = new Date(form.date);
    if (isNaN(eventDate.getTime()) || eventDate <= new Date()) {
      setError(locale === 'fr' ? 'La date doit être dans le futur' : 'Date must be in the future');
      return;
    }

    if (form.endDate) {
      const endDate = new Date(form.endDate);
      if (isNaN(endDate.getTime()) || endDate <= eventDate) {
        setError(locale === 'fr' ? 'La date de fin doit être après la date de début' : 'End date must be after start date');
        return;
      }
    }

    startTransition(async () => {
      try {
        const response = await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: form.title,
            description: form.description,
            content: form.content,
            categoryId: form.categoryId,
            date: form.date,
            endDate: form.endDate || undefined,
            location: form.location,
            isOnline: form.isOnline,
            onlineLink: form.isOnline ? form.onlineLink : undefined,
            capacity: form.capacity,
            imageUrl: form.imageUrl || undefined,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to create event');
        }

        const event = await response.json();
        router.push(`/${locale}/events`);
      } catch (err: any) {
        setError(err.message);
      }
    });
  };

  const updateForm = (field: string, value: string | number | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back Link */}
      <Link
        href={`/${locale}/events`}
        className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        {locale === 'fr' ? 'Retour aux événements' : 'Back to Events'}
      </Link>

      <h1 className="text-3xl font-bold text-white mb-8">
        {locale === 'fr' ? 'Créer un événement' : 'Create Event'}
      </h1>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 mb-6">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-white/70 text-sm font-medium mb-2">
            {locale === 'fr' ? 'Titre *' : 'Title *'}
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => updateForm('title', e.target.value)}
            placeholder={locale === 'fr' ? 'Nom de l\'événement' : 'Event name'}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
            required
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-white/70 text-sm font-medium mb-2">
            {locale === 'fr' ? 'Catégorie *' : 'Category *'}
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => updateForm('categoryId', cat.id)}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-medium transition-all border',
                  form.categoryId === cat.id
                    ? 'bg-white/20 text-white border-white/40'
                    : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10'
                )}
              >
                {cat.name[locale as 'en' | 'fr'] || cat.name.en}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-white/70 text-sm font-medium mb-2">
            {locale === 'fr' ? 'Description courte *' : 'Short description *'}
          </label>
          <textarea
            value={form.description}
            onChange={(e) => updateForm('description', e.target.value)}
            placeholder={locale === 'fr' ? 'Brève description de l\'événement' : 'Brief event description'}
            rows={3}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors resize-none"
            required
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-white/70 text-sm font-medium mb-2">
            {locale === 'fr' ? 'Contenu détaillé *' : 'Detailed content *'}
          </label>
          <textarea
            value={form.content}
            onChange={(e) => updateForm('content', e.target.value)}
            placeholder={locale === 'fr' ? 'Description complète, agenda, prérequis...' : 'Full description, agenda, prerequisites...'}
            rows={6}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors resize-none"
            required
          />
        </div>

        {/* Date / End Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              {locale === 'fr' ? 'Date de début *' : 'Start date *'}
            </label>
            <input
              type="datetime-local"
              value={form.date}
              onChange={(e) => updateForm('date', e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-white/30 transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              {locale === 'fr' ? 'Date de fin' : 'End date'}
            </label>
            <input
              type="datetime-local"
              value={form.endDate}
              onChange={(e) => updateForm('endDate', e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-white/30 transition-colors"
            />
          </div>
        </div>

        {/* Location / Online */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <label className="block text-white/70 text-sm font-medium">
              <MapPin className="w-4 h-4 inline mr-1" />
              {locale === 'fr' ? 'Lieu *' : 'Location *'}
            </label>
            <label className="flex items-center gap-2 text-sm text-white/60 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isOnline}
                onChange={(e) => updateForm('isOnline', e.target.checked)}
                className="rounded border-white/20"
              />
              <Globe className="w-4 h-4" />
              {locale === 'fr' ? 'En ligne' : 'Online'}
            </label>
          </div>
          <input
            type="text"
            value={form.location}
            onChange={(e) => updateForm('location', e.target.value)}
            placeholder={form.isOnline
              ? (locale === 'fr' ? 'Ex: Discord, Zoom...' : 'E.g. Discord, Zoom...')
              : (locale === 'fr' ? 'Adresse ou salle' : 'Address or room')}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
            required
          />
          {form.isOnline && (
            <input
              type="url"
              value={form.onlineLink}
              onChange={(e) => updateForm('onlineLink', e.target.value)}
              placeholder={locale === 'fr' ? 'Lien de la réunion' : 'Meeting link'}
              className="w-full mt-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
            />
          )}
        </div>

        {/* Capacity */}
        <div>
          <label className="block text-white/70 text-sm font-medium mb-2">
            <Users className="w-4 h-4 inline mr-1" />
            {locale === 'fr' ? 'Capacité *' : 'Capacity *'}
          </label>
          <input
            type="number"
            value={form.capacity}
            onChange={(e) => updateForm('capacity', parseInt(e.target.value) || 1)}
            min={1}
            max={10000}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-white/30 transition-colors"
            required
          />
        </div>

        {/* Image URL */}
        <div>
          <label className="block text-white/70 text-sm font-medium mb-2">
            <Image className="w-4 h-4 inline mr-1" />
            {locale === 'fr' ? 'URL de l\'image (optionnel)' : 'Image URL (optional)'}
          </label>
          <input
            type="url"
            value={form.imageUrl}
            onChange={(e) => updateForm('imageUrl', e.target.value)}
            placeholder="https://..."
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
          />
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isPending}
            className={cn(
              'flex-1 py-3 rounded-xl font-semibold transition-all',
              'bg-white text-black hover:bg-white/90',
              isPending && 'opacity-50 cursor-not-allowed'
            )}
          >
            {isPending
              ? (locale === 'fr' ? 'Création...' : 'Creating...')
              : (locale === 'fr' ? 'Créer l\'événement' : 'Create Event')}
          </button>
          <Link
            href={`/${locale}/events`}
            className="px-6 py-3 rounded-xl bg-white/5 text-white border border-white/10 hover:bg-white/10 transition-all font-medium"
          >
            {locale === 'fr' ? 'Annuler' : 'Cancel'}
          </Link>
        </div>
      </form>
    </div>
  );
}
