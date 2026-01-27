/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        // Spotify Color Palette
        spotify: {
          green: '#1DB954',
          'green-hover': '#1ed760',
          'green-dark': '#169c46',
          black: '#121212',
          'gray-dark': '#181818',
          'gray-darker': '#0d0d0d',
          'gray-medium': '#282828',
          'gray-light': '#333333',
          'gray-lighter': '#b3b3b3',
          white: '#ffffff',
          'text-muted': '#a7a7a7',
          'text-subdued': '#6a6a6a',
        },
        primary: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#1DB954',
          600: '#169c46',
          700: '#127a38',
          800: '#0e5f2b',
          900: '#0a4a21',
        },
      },
      backgroundImage: {
        'gradient-spotify': 'linear-gradient(180deg, #1e3264 0%, #121212 100%)',
        'gradient-card': 'linear-gradient(135deg, #1e3264 0%, #181818 100%)',
      },
      boxShadow: {
        'spotify': '0 8px 24px rgba(0,0,0,.5)',
        'spotify-hover': '0 16px 40px rgba(0,0,0,.7)',
      },
    },
  },
  plugins: [],
}

