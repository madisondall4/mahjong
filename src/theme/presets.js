// Theme presets for the app.
//
// Each preset maps the same set of semantic tokens to colors. The app currently
// ships with `matchaGarden` active. Components still reference the active
// palette's hex values directly; migrating every component to read these tokens
// via CSS variables at runtime is tracked in BACKLOG.md ("Aesthetic
// customization & theme packs") and will enable live in-app theme switching.
//
// Token roles:
//   bg        – light app background (home/menus)
//   primary   – main accent (titles, primary buttons, "your turn")
//   secondary – warm secondary accent (skip/close, flowers, negatives)
//   tertiary  – info accent (card button, wall, AI-thinking)
//   success   – positive accent (winning glow, positive scores, received tiles)
//   surface   – dark surface for the table and slide-up panels
//   tileFace  – tile front
//   tileShadow– tile drop-shadow tint

export const THEME_PRESETS = {
  midnightBloom: {
    label: 'Midnight Bloom',
    tokens: {
      bg: '#FFF6EE',
      primary: '#FF4FA3',
      secondary: '#FF7A45',
      tertiary: '#4FCBFF',
      success: '#3DDBA7',
      surface: '#2A2140',
      tileFace: '#ffffff',
      tileShadow: '#f0d8e8',
    },
  },
  matchaGarden: {
    label: 'Matcha Garden',
    tokens: {
      bg: '#F4F1E4',
      primary: '#5E8C3E',
      secondary: '#E2A03F',
      tertiary: '#7FB3A4',
      success: '#A4D65E',
      surface: '#2B3A2A',
      tileFace: '#ffffff',
      tileShadow: '#dce8cc',
    },
  },
};

// The preset the app renders with today.
export const ACTIVE_PRESET = 'matchaGarden';

// Maps a preset's tokens onto the CSS custom properties defined in globals.css.
// Call applyTheme(ACTIVE_PRESET) once the runtime theme switcher lands.
export function applyTheme(presetKey = ACTIVE_PRESET) {
  const preset = THEME_PRESETS[presetKey];
  if (!preset) return;
  const root = document.documentElement;
  const { tokens } = preset;
  root.style.setProperty('--bg', tokens.bg);
  root.style.setProperty('--accent-pink', tokens.primary);
  root.style.setProperty('--accent-orange', tokens.secondary);
  root.style.setProperty('--accent-blue', tokens.tertiary);
  root.style.setProperty('--accent-mint', tokens.success);
  root.style.setProperty('--plum', tokens.surface);
  root.style.setProperty('--tile-face', tokens.tileFace);
  root.style.setProperty('--tile-shadow', tokens.tileShadow);
}
