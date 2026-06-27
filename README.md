# ESTEPARIO AUSTRAL - Archive Terminal

A production-ready static website for the progressive/death metal band ESTEPARIO AUSTRAL. This is a digital archive interface—minimal, immersive, and deployed directly to GitHub Pages.

## Features

- **Zero dependencies** – Pure HTML5, CSS3, and ES2022 JavaScript
- **No build process** – Open `index.html` directly in any browser
- **GitHub Pages ready** – Deploy by simply pushing to the repository
- **Responsive design** – Mobile-first, works on all devices
- **Instant search** – Filter songs in real-time
- **Persistent state** – Remembers the last opened song
- **Accessibility** – Full keyboard navigation and ARIA support
- **Performance optimized** – Minimal assets, semantic HTML
- **Reduced motion support** – Respects user preferences

## Project Structure

```
/
├── index.html           # Main HTML structure
├── css/
│   └── style.css       # Complete styling (responsive, animations)
├── js/
│   └── app.js          # ES2022 vanilla JavaScript
├── data/
│   └── songs.json      # Archive database
└── img/                # Image assets (optional)
```

## Adding New Songs

Edit `data/songs.json` and add a new object to the `songs` array:

```json
{
  "id": "unique-id",
  "title": "Song Title",
  "tuning": "E Standard",
  "tempo": "120 BPM",
  "lyrics": "Lyrics text here...",
  "notes": "Additional notes about the composition..."
}
```

All fields are optional. The archive will automatically include new songs on next page load.

## Customization

### Colors
Edit `css/style.css`:
- Background: `#0a0a0a` (matte black)
- Text: `#e0e0e0` (light gray)
- Accents: Subtle dark red (`rgba(139, 0, 0, ...)`)

### Typography
Fonts are system defaults for optimal performance. Adjust in `css/style.css` if needed.

### Loading Screen
Edit duration in `js/app.js` line 43: `await this.delay(1200);`

## Deployment

The website is ready for deployment as-is. Simply:
1. Push all files to your GitHub repository
2. Enable GitHub Pages in repository settings
3. Visit your site

## Accessibility

- Full keyboard navigation (Tab, Enter, Escape)
- ARIA labels for screen readers
- Respects `prefers-reduced-motion` media query
- Semantic HTML structure
- High contrast design

## Performance

- **No external dependencies** – Zero HTTP requests for libraries
- **Client-side filtering** – Instant search results
- **Optimized CSS** – ~8KB minified
- **Lightweight JavaScript** – ~6KB minified

## Browser Support

- Chrome/Edge 91+
- Firefox 89+
- Safari 15+
- All modern mobile browsers

## License

© ESTEPARIO AUSTRAL. All rights reserved.