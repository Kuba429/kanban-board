/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
	  extend: {
		  spacing:{
			  "gap": "20px"
		  }
	  },
  },
  plugins: [],
};
