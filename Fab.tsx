
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusIcon } from '@/components/Icons';

interface FabProps {
    onClick: () => void;
    label: string;
    isVisible: boolean;
}

export const Fab: React.FC<FabProps> = ({ onClick, label, isVisible }) => {
    return (
        <AnimatePresence>
            {isVisible && (
                <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ ease: 'easeInOut', duration: 0.2 }}
                    onClick={onClick}
                    className="fixed bottom-6 left-6 bg-gold-800/80 text-gold-100 backdrop-blur-sm p-3 rounded-full shadow-lg border border-gold-700 hover:bg-gold-700 transition-colors z-40"
                    aria-label={label}
                >
                    <PlusIcon className="w-6 h-6" />
                </motion.button>
            )}
        </AnimatePresence>
    );
};