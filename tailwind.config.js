/** @type {import('tailwindcss').Config} */
module.exports = {
  // Projenin her yerindeki js, jsx, ts, tsx dosyalarını tarar
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",      // Expo Router kullanıyorsan (app klasörü)
    "./src/**/*.{js,jsx,ts,tsx}",      // Kodların src altındaysa
    "./components/**/*.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}",   // Sayfalar bu klasördeyse
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
};