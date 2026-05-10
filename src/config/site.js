export const SITE = {
  name: import.meta.env.VITE_SITE_NAME || 'Bharat AI Academy',
  url: import.meta.env.VITE_SITE_URL || 'https://bharatai.academy',
  whatsappNumber: import.meta.env.VITE_WHATSAPP_NUMBER || '919876543210',
  whatsappGroup: import.meta.env.VITE_WHATSAPP_GROUP_INVITE || 'https://chat.whatsapp.com/replace-me',
  contactPhone: import.meta.env.VITE_CONTACT_PHONE || '+91 98765 43210',
  contactEmail: import.meta.env.VITE_CONTACT_EMAIL || 'hello@bharatai.academy',
  razorpayKeyId: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_replace_me',
  location: 'Charkhi Dadri, Haryana, India',
};

export function whatsappLink(message = '') {
  const text = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${SITE.whatsappNumber}${text}`;
}
