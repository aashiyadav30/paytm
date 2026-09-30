import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        paytm: {
          blue: '#002970',
          lightBlue: '#00baf2',
          navy: '#0f172a',
          accent: '#e0f2fe',
        }
      }
    },
  },
  plugins: [],
}
export default config
