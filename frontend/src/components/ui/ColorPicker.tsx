import { useState } from 'react';
import { cn } from '../../lib/utils';
import { colors } from '../../lib/theme';

export const ColorPicker = () => {
    const [activeColor, setActiveColor] = useState(() => {
        return localStorage.getItem('accentColor') || 'Blue';
    });

    const handleColorChange = (color: typeof colors[0]) => {
        setActiveColor(color.name);
        localStorage.setItem('accentColor', color.name);
        document.documentElement.style.setProperty('--primary', color.value);
        document.documentElement.style.setProperty('--ring', color.ring);
    };

    return (
        <div className="flex flex-wrap items-center justify-center gap-2">
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
