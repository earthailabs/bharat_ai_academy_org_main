// Single source of truth for program metadata, pricing, and seat counts.
// Update here — propagates through registration, payment, dashboards, admin.

export const PROGRAMS = {
  youth: {
    id: 'youth',
    slug: 'ai-for-youth',
    name: 'AI for Youth',
    short: '8-week offline AI program',
    location: 'Charkhi Dadri, Haryana',
    duration: '8 weeks',
    schedule: 'Mon–Fri, 3 hrs/day',
    seats: 40,
    ageRange: '17+',
    fullPrice: 17000,        // ₹17,000
    reservePrice: 5000,      // ₹5,000 booking
    originalPrice: 84000,
    color: 'blue',
    emoji: '🧑‍💻',
  },
  school: {
    id: 'school',
    slug: 'ai-for-school-students',
    name: 'AI for School Students',
    short: '4-week weekend program',
    location: 'Charkhi Dadri, Haryana',
    duration: '4 weekends (Sat + Sun)',
    schedule: 'Weekends',
    seats: 20,
    ageRange: '10–17',
    fullPrice: 4999,
    reservePrice: 1000,
    originalPrice: null,
    color: 'green',
    emoji: '🏫',
  },
  incubator: {
    id: 'incubator',
    slug: 'ai-startup-incubator',
    name: 'AI Startup Incubator',
    short: 'Funding + mentorship to launch your AI business',
    location: 'Haryana',
    duration: 'Ongoing',
    schedule: 'Application-based',
    seats: null,
    ageRange: '18+',
    fullPrice: null,         // application-based — no direct payment
    reservePrice: null,
    originalPrice: null,
    color: 'purple',
    emoji: '🚀',
  },
  jobs: {
    id: 'jobs',
    slug: 'job-placement-support',
    name: 'Job Placement Support',
    short: 'Free with the AI for Youth program',
    location: 'PAN India',
    duration: 'Lifetime',
    schedule: '—',
    seats: null,
    ageRange: '18+',
    fullPrice: 0,
    reservePrice: null,
    originalPrice: null,
    color: 'orange',
    emoji: '💼',
  },
};

export function getProgram(id) {
  return PROGRAMS[id] || null;
}

export const INTEREST_OPTIONS = [
  { id: 'youth',     label: 'AI for Youth Program',  emoji: '🧑‍💻' },
  { id: 'school',    label: 'AI for School Students', emoji: '🏫' },
  { id: 'incubator', label: 'AI Startup Incubator',   emoji: '🚀' },
  { id: 'jobs',      label: 'Job Placement Support',  emoji: '💼' },
  { id: 'general',   label: 'General Inquiry',        emoji: '💬' },
];
