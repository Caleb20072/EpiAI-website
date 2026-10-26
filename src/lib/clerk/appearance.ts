import type { Appearance } from '@clerk/types';

const navy = '#0d1b4a';
const navyDeep = '#0a1022';
const navyCard = '#131c33';
const navyMuted = '#19233d';
const ink = '#edf0f5';
const inkMuted = '#c3c9d6';
const brand = '#3479f0';
const brandHover = '#2361d6';
const brandSoft = '#86aef6';

export const clerkAppearance: Appearance = {
  variables: {
    colorPrimary: brand,
    colorTextOnPrimaryBackground: '#ffffff',
    colorBackground: navyCard,
    colorInputBackground: navyDeep,
    colorInputText: ink,
    colorText: ink,
    colorTextSecondary: inkMuted,
    colorNeutral: brandSoft,
    colorDanger: '#f87171',
    borderRadius: '0.75rem',
    fontFamily: 'var(--font-plex), ui-sans-serif, system-ui, sans-serif',
  },
  elements: {
    rootBox: 'clerk-shell w-full',
    card: {
      background: navyCard,
      border: '1px solid rgba(134, 174, 246, 0.24)',
      boxShadow: '0 18px 48px -24px rgba(13, 27, 74, 0.9)',
    },
    headerTitle: { color: ink, fontWeight: '600' },
    headerSubtitle: { color: inkMuted },
    socialButtonsBlockButton: {
      background: navyMuted,
      color: ink,
      border: '1px solid rgba(134, 174, 246, 0.28)',
    },
    dividerLine: { background: 'rgba(134, 174, 246, 0.2)' },
    dividerText: { color: inkMuted },
    formFieldLabel: { color: inkMuted },
    formFieldInput: {
      background: navyDeep,
      color: ink,
      borderColor: 'rgba(134, 174, 246, 0.32)',
    },
    formButtonPrimary: {
      background: brand,
      color: '#ffffff',
      fontWeight: '600',
    },
    footerActionLink: { color: brandSoft },
    identityPreviewText: { color: ink },
    identityPreviewEditButton: { color: brandSoft },
    navbar: {
      background: navy,
      border: '1px solid rgba(134, 174, 246, 0.18)',
    },
    navbarButton: { color: inkMuted },
    navbarButtonActive: { color: ink, background: navyMuted },
    profileSection: {
      background: navyMuted,
      border: '1px solid rgba(134, 174, 246, 0.2)',
      boxShadow: 'none',
    },
    profileSectionTitleText: { color: ink },
    profileSectionContent: { color: ink },
    accordionTriggerButton: { color: ink },
    badge: { background: navy, color: brandSoft, borderColor: 'rgba(134, 174, 246, 0.3)' },
    formButtonReset: { color: inkMuted },
    pageScrollBox: { background: 'transparent' },
    page: { background: 'transparent' },
    breadcrumbsItem: { color: inkMuted },
    breadcrumbsItemDivider: { color: inkMuted },
  },
};

export const clerkUserProfileAppearance: Appearance = {
  ...clerkAppearance,
  elements: {
    ...clerkAppearance.elements,
    rootBox: 'clerk-shell w-full',
    card: {
      background: 'transparent',
      border: 'none',
      boxShadow: 'none',
    },
  },
};
