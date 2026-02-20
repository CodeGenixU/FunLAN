// Predefined accent colors
export const colors = [
    { name: 'Blue', value: '221.2 83.2% 53.3%', ring: '221.2 83.2% 53.3%' },
    { name: 'Purple', value: '262.1 83.3% 57.8%', ring: '262.1 83.3% 57.8%' },
    { name: 'Green', value: '142.1 76.2% 36.3%', ring: '142.1 76.2% 36.3%' },
    { name: 'Orange', value: '24.6 95% 53.1%', ring: '24.6 95% 53.1%' },
    { name: 'Pink', value: '346.8 77.2% 49.8%', ring: '346.8 77.2% 49.8%' },
];

export const initTheme = () => {
    // 1. Restore Dark/Light Mode
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.documentElement.classList.remove('dark');
    } else {
        // Default to dark
        document.documentElement.classList.add('dark');
    }

    // 2. Restore Accent Color
    const savedColorName = localStorage.getItem('accentColor') || 'Blue';
    const colorDetails = colors.find((c) => c.name === savedColorName);

    if (colorDetails) {
        document.documentElement.style.setProperty('--primary', colorDetails.value);
        document.documentElement.style.setProperty('--ring', colorDetails.ring);
    }
};
