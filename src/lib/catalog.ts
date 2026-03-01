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
  supportedEventTypes: EventType[];
}> = [
  {
    id: 'eternal-vows',
    name: 'Eternal Vows',
    icon: 'diamond',
    color: '#3B241A',
    tone: 'elegant',
    supportedEventTypes: ['wedding'],
  },
  {
    id: 'velvet-nights',
    name: 'Velvet Nights',
    icon: 'auto_awesome',
    color: '#111827',
    tone: 'elegant',
    supportedEventTypes: ['corporate', 'conference', 'private'],
  },
  {
    id: 'playpulse',
    name: 'PlayPulse',
    icon: 'celebration',
    color: '#FF4F5A',
    tone: 'playful',
    supportedEventTypes: ['party', 'birthday'],
  },
  {
    id: 'clean-canvas',
    name: 'Clean Canvas',
    icon: 'crop_square',
    color: '#007BFF',
    tone: 'minimal',
    supportedEventTypes: ['wedding', 'birthday', 'party', 'corporate', 'conference', 'private'],
  },
];

export function resolveTemplateTone(templateId?: string): TemplateTone {
  const found = TEMPLATE_CATALOG.find((t) => t.id === templateId);
  return found?.tone ?? 'minimal';
}
