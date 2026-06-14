import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Add custom colors here
      },
      fontFamily: {
        // Add custom fonts here
      },
      spacing: {
        // Add custom spacing here
      },
      animation: {
        // Text & Font Animations
        "bounce-in": "bounceIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        "float": "float 3s ease-in-out infinite",
        
        // Section Animations
        "fade-up": "fadeUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        "slide-in-left": "slideInLeft 0.8s ease-out forwards",
        "slide-in-right": "slideInRight 0.8s ease-out forwards",
        
        // Card Animations
        "pop-in": "popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        "card-scale": "cardScale 0.3s ease-out forwards",
        
        // Interactive Animations
        "icon-rotate": "iconRotate 0.6s ease-out forwards",
        "badge-flip": "badgeFlip 0.6s ease-in-out forwards",
        "wiggle": "wiggle 0.5s ease-in-out",
        "shine": "shine 0.8s ease-out forwards",
      },
      keyframes: {
        // Text animation - per-letter bounce in
        bounceIn: {
          "0%": {
            opacity: "0",
            transform: "translateY(-10px)",
          },
          "50%": {
            transform: "translateY(-5px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        
        // Gentle floating animation for badges
        float: {
          "0%, 100%": {
            transform: "translateY(0px)",
          },
          "50%": {
            transform: "translateY(-12px)",
          },
        },
        
        // Section fade and slide up
        fadeUp: {
          "0%": {
            opacity: "0",
            transform: "translateY(30px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        
        slideInLeft: {
          "0%": {
            opacity: "0",
            transform: "translateX(-50px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateX(0)",
          },
        },
        
        slideInRight: {
          "0%": {
            opacity: "0",
            transform: "translateX(50px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateX(0)",
          },
        },
        
        // Card pop-in effect
        popIn: {
          "0%": {
            opacity: "0",
            transform: "scale(0.8)",
          },
          "100%": {
            opacity: "1",
            transform: "scale(1)",
          },
        },
        
        // Card scale on hover (used via group-hover)
        cardScale: {
          "0%": {
            transform: "scale(1)",
          },
          "100%": {
            transform: "scale(1.05)",
          },
        },
        
        // Icon rotation
        iconRotate: {
          "0%": {
            transform: "rotate(0deg)",
          },
          "100%": {
            transform: "rotate(360deg)",
          },
        },
        
        // Badge flip effect
        badgeFlip: {
          "0%": {
            transform: "rotateY(0deg)",
          },
          "100%": {
            transform: "rotateY(360deg)",
          },
        },
        
        // Wiggle effect
        wiggle: {
          "0%, 100%": {
            transform: "rotate(0deg)",
          },
          "25%": {
            transform: "rotate(-3deg)",
          },
          "75%": {
            transform: "rotate(3deg)",
          },
        },
        
        // Shine effect for buttons
        shine: {
          "0%": {
            backgroundPosition: "-1000px 0",
          },
          "100%": {
            backgroundPosition: "1000px 0",
          },
        },
      },
      transitionDelay: {
        "50": "50ms",
        "100": "100ms",
        "150": "150ms",
        "200": "200ms",
      },
    },
  },
  plugins: [],
};

export default config;
