export function userButtonProps(locale: string) {
  return {
    afterSignOutUrl: `/${locale}`,
    userProfileMode: 'navigation' as const,
    userProfileUrl: `/${locale}/settings`,
  };
}
