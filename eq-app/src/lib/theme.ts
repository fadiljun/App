export const theme = {
  bg: '#0F0F14',
  bgElev: '#181821',
  surface: '#22222E',
  border: '#2E2E3D',
  text: '#F4F4F8',
  textMuted: '#9A9AAE',
  accent: '#C9A875', // muted gold — the "earned warmth" feel
  accentSoft: '#3A2F1E',
  danger: '#E16E6E',
  success: '#7BC8A4',
  pillar: {
    selfAwareness: '#7AA7E8',
    selfRegulation: '#9C8AE0',
    empathy: '#E89AB8',
    socialSkills: '#7BC8A4',
    motivation: '#C9A875',
  } as Record<string, string>,
  radius: 16,
  spacing: (n: number) => n * 4,
} as const;

export type Theme = typeof theme;
