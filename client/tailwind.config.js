/** @type{import('tailwindcss').Config */
export default {
    content : [    // It gives Tailwind an explicit map of where to look for your styling classes:
        "./index.html",  // Tells Tailwind to check your main root HTML file. If you add a background class to your <body> tag there, Tailwind will make sure it compiles cleanly.
        "./src/**/*.{js,ts,jsx,tsx}",  // Scan absolutely every single React file inside the src folder. Find any Tailwind class names I typed inside my component code (like <div className="text-blue-500">), and generate the styles for them.
    ],
    theme:{
        extend: {}, // Putting customizations inside extend tells Tailwind: "Keep all your default settings (like standard grays, blues, margins), but add my new custom properties on top of them."
    },
    plugins: [],  // An array where you can drop in official or community-made add-ons to give Tailwind extra powers
}