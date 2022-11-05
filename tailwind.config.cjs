/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
	  extend: {
		  colors:{
			  'black': {
				  100: "#d1ccd2",
				  200: "#7d7d7d",
				  300: "#4e4e4e",
				  400: "#323232",
				  500: "#2f2f2f",
				  600: "#222222",
				  700: "#1b1b1b",
				  800: "#121212",
				  900: "#000000"
			  }
		  },
		  spacing:{
			  "gap": "20px"
		  }
	  },
  },
  plugins: [],
};
