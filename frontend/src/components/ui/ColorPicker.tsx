import React from 'react';
import { cn } from '../../lib/utils';

const colors = [
    { name: 'Blue', value: '221.2 83.2% 53.3%', ring: '221.2 83.2% 53.3%' },
    { name: 'Purple', value: '262.1 83.3% 57.8%', ring: '262.1 83.3% 57.8%' },
    { name: 'Green', value: '142.1 76.2% 36.3%', ring: '142.1 76.2% 36.3%' },
    { name: 'Orange', value: '24.6 95% 53.1%', ring: '24.6 95% 53.1%' },
    { name: 'Pink', value: '346.8 77.2% 49.8%', ring: '346.8 77.2% 49.8%' },
];

export const ColorPicker = () => {
    const [activeColor, setActiveColor] = React.useState('Blue');

    const handleColorChange = (color: typeof colors[0]) => {
        setActiveColor(color.name);
        document.documentElement.style.setProperty('--primary', color.value);
        document.documentElement.style.setProperty('--ring', color.ring);
    };

    return (
        <div className="flex items-center gap-1">
            {colors.map((color) => (
                <button
                    key={color.name}
                    onClick={() => handleColorChange(color)}
                    className={cn(
                        "w-4 h-4 rounded-full transition-all hover:scale-110 focus:outline-none ring-offset-background",
                        activeColor === color.name ? "ring-2 ring-ring ring-offset-2" : ""
                    )}
                    style={{ backgroundColor: `hsl(${color.value})` }}
                    title={color.name}
                />
            ))}
        </div>
    );
};
