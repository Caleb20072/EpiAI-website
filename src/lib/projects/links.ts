/** Lien roadmap Google Docs (discoveryUrl) vs démo produit */
export function isRoadmapUrl(url: string): boolean {
  return /docs\.google\.com\/document\//i.test(url);
}

export function discoveryLinkLabel(url: string, locale: 'fr' | 'en'): string {
  if (isRoadmapUrl(url)) {
    return locale === 'fr' ? 'Roadmap' : 'Roadmap';
  }
  return locale === 'fr' ? 'Découvrir' : 'Discovery';
}
