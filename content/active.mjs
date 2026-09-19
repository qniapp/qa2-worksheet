// Re-export worksheet copy for the active locale (QA2_LOCALE=en|ja).
import { getLocale } from './locale.mjs';
import * as ja from './worksheet-content.mjs';
import * as en from './worksheet-content-en.mjs';

const content = getLocale() === 'en' ? en : ja;

export const {
  N,
  SOUTH,
  EQ,
  HELSINKI,
  FRONT_Y,
  LABELS,
  DECORATION_COPY,
  APP_LINKS,
  PAIRS,
  TRIPLES_H,
  TRIPLES_ST,
  INTRO_BLOCKS,
  PAGE_COPY,
  LANDING_COPY,
} = content;
