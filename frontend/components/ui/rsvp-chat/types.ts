/** Shared types for the RSVP chat view components. */

export interface ChatMessage {
  id: string;
  sender: 'system' | 'guest';
  text: string;
}

export interface Chip {
  label: string;
  onClick: () => void;
}

/** Framer Motion variant key, switched by prefers-reduced-motion. */
export type AnimState = 'hidden' | 'visible' | 'reduced';
