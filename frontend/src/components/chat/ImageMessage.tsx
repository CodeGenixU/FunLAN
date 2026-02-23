import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ImageMessageProps {
    fileId: string;
    filename: string;
    timestamp?: string;
}

export const ImageMessage = ({ fileId, filename, timestamp }: ImageMessageProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const imageUrl = `/api/download/${fileId}`;

    return (
        <>
            <div
                className="relative cursor-pointer overflow-hidden rounded-[inherit] max-w-full sm:max-w-xs group"
                onClick={() => setIsOpen(true)}
            >
                <motion.img
                    layoutId={`image-${fileId}`}
                    src={imageUrl}
                    alt={filename}
                    className="max-w-full sm:max-w-xs max-h-64 object-cover block rounded-md"
                />

                {timestamp && (
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end justify-end p-2 pointer-events-none rounded-b-[inherit]">
                        <span className="text-[10px] text-white/90 drop-shadow-md font-medium">
                            {timestamp}
                        </span>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
                    >
                        <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="absolute top-4 right-4 z-[110] p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsOpen(false);
                            }}
                        >
                            <X size={24} />
                        </motion.button>

                        <motion.img
                            layoutId={`image-${fileId}`}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            src={imageUrl}
                            alt={filename}
                            className="max-w-full max-h-[90vh] object-contain rounded-md shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
