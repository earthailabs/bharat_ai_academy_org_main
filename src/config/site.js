export const SITE = {
  name: import.meta.env.VITE_SITE_NAME || 'Bharat AI Academy',
  url: import.meta.env.VITE_SITE_URL || 'https://bharataiacademy.org',
  whatsappNumber: import.meta.env.VITE_WHATSAPP_NUMBER || '919350019794',
  whatsappGroup: import.meta.env.VITE_WHATSAPP_GROUP_INVITE || 'https://chat.whatsapp.com/replace-me',
  contactPhone: import.meta.env.VITE_CONTACT_PHONE || '+91 93500 19794',
  contactPhoneTel: import.meta.env.VITE_CONTACT_PHONE_TEL || '+919350019794',
  contactEmail: import.meta.env.VITE_CONTACT_EMAIL || 'hello@bharataiacademy.org',
  // Razorpay key retained for future re-enable of payments. Frontend flow currently bypassed.
  razorpayKeyId: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_replace_me',
  location: 'Charkhi Dadri, Haryana, India',
  logo: '/logo.png',
};

export function whatsappLink(message = '') {
  const text = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${SITE.whatsappNumber}${text}`;
}

export function telLink() {
  return `tel:${SITE.contactPhoneTel}`;
}
