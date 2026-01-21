/** @type {import('tailwindcss').Config} */
// Tailwind CSS v4 Note: This config file is optional!
// You can configure Tailwind directly in your CSS using @theme or @plugin directives.
// This file is only needed if you prefer JavaScript-based configuration.
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,vue,svelte}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
