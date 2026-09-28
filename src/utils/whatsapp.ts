export function getWhatsAppUrl(contact: string = '@md.me', message?: string): string {
  const trimmed = (contact || '@md.me').trim();

  // If already a full URL
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  if (trimmed.startsWith('wa.me/')) {
    return `https://${trimmed}`;
  }

  // If it's a username / user handle (e.g. @md.me or md.me)
  if (trimmed.startsWith('@') || /[a-zA-Z]/.test(trimmed)) {
    return `https://wa.me/${trimmed}`;
  }

  // If it's a phone number
  const cleanDigits = trimmed.replace(/[^0-9]/g, '');
  if (cleanDigits) {
    const query = message ? `?text=${encodeURIComponent(message)}` : '';
    return `https://wa.me/${cleanDigits}${query}`;
  }

  return 'https://wa.me/@md.me';
}
