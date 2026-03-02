export type EventType =
  | 'wedding'
  | 'birthday'
  | 'party'
  | 'corporate'
  | 'conference'
  | 'private';

export type TemplateTone = 'minimal' | 'playful' | 'elegant';

export const EVENT_TYPES: Array<{ id: EventType; label: string }> = [
  { id: 'wedding', label: 'Wedding' },
  { id: 'birthday', label: 'Birthday' },
  { id: 'party', label: 'Party' },
  { id: 'corporate', label: 'Corporate' },
  { id: 'conference', label: 'Conference' },
  { id: 'private', label: 'Private Event' },
];

export const TEMPLATE_CATALOG: Array<{
  id: string;
  name: string;
  icon: string;
  color: string;
  tone: TemplateTone;
  typographyPreset: string;
  supportedEventTypes: EventType[];
}> = [
    // ── Romantic / Wedding ──────────────────────────────────────
    {
      id: 'eternal-vows',
      name: 'Eternal Vows',
      icon: 'diamond',
      color: '#8B5A2B',
      tone: 'elegant',
      typographyPreset: 'classic',
      supportedEventTypes: ['wedding'],
    },
    {
      id: 'golden-hour',
      name: 'Golden Hour',
      icon: 'wb_sunny',
      color: '#C8872A',
      tone: 'elegant',
      typographyPreset: 'classic',
      supportedEventTypes: ['wedding', 'birthday', 'party'],
    },
    {
      id: 'midnight-bloom',
      name: 'Midnight Bloom',
      icon: 'local_florist',
      color: '#5B21B6',
      tone: 'elegant',
      typographyPreset: 'classic',
      supportedEventTypes: ['wedding', 'private'],
    },

    // ── Work & Formal ────────────────────────────────────────────
    {
      id: 'velvet-nights',
      name: 'Velvet Nights',
      icon: 'auto_awesome',
      color: '#111827',
      tone: 'elegant',
      typographyPreset: 'classic',
      supportedEventTypes: ['corporate', 'conference', 'private'],
    },
    {
      id: 'ocean-breeze',
      name: 'Ocean Breeze',
      icon: 'waves',
      color: '#0F766E',
      tone: 'minimal',
      typographyPreset: 'modern',
      supportedEventTypes: ['corporate', 'conference'],
    },
    {
      id: 'forest-pine',
      name: 'Forest Pine',
      icon: 'park',
      color: '#166534',
      tone: 'minimal',
      typographyPreset: 'modern',
      supportedEventTypes: ['corporate', 'conference', 'private'],
    },

    // ── Celebration ──────────────────────────────────────────────
    {
      id: 'playpulse',
      name: 'PlayPulse',
      icon: 'celebration',
      color: '#FF4F5A',
      tone: 'playful',
      typographyPreset: 'playful',
      supportedEventTypes: ['party', 'birthday'],
    },
    {
      id: 'coral-fiesta',
      name: 'Coral Fiesta',
      icon: 'festival',
      color: '#FB923C',
      tone: 'playful',
      typographyPreset: 'playful',
      supportedEventTypes: ['party', 'birthday'],
    },
    {
      id: 'neon-bash',
      name: 'Neon Bash',
      icon: 'nightlife',
      color: '#7C3AED',
      tone: 'playful',
      typographyPreset: 'playful',
      supportedEventTypes: ['party', 'birthday', 'private'],
    },

    // ── Universal / Minimal ──────────────────────────────────────
    {
      id: 'clean-canvas',
      name: 'Clean Canvas',
      icon: 'crop_square',
      color: '#2563EB',
      tone: 'minimal',
      typographyPreset: 'modern',
      supportedEventTypes: ['wedding', 'birthday', 'party', 'corporate', 'conference', 'private'],
    },
    {
      id: 'rose-quartz',
      name: 'Rose Quartz',
      icon: 'favorite',
      color: '#DB2777',
      tone: 'minimal',
      typographyPreset: 'modern',
      supportedEventTypes: ['wedding', 'birthday', 'party', 'private'],
    },
  ];

export function resolveTemplateTone(templateId?: string): TemplateTone {
  const found = TEMPLATE_CATALOG.find((t) => t.id === templateId);
  return found?.tone ?? 'minimal';
}

export function resolveTemplate(templateId?: string) {
  return TEMPLATE_CATALOG.find((t) => t.id === templateId) ?? TEMPLATE_CATALOG.find(t => t.id === 'clean-canvas')!;
}
