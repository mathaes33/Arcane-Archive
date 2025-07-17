
import React from 'react';
import { LogoIcon } from '@/components/Icons';

export const Header: React.FC = () => (
    <header className="text-center py-16 px-4 relative z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 md:w-64 md:h-64 bg-gold-500/20 rounded-full blur-3xl -z-10"></div>
        <LogoIcon className="mx-auto h-16 w-16 text-gold-500/80 mb-4" />
        <h1 className="font-serif text-4xl md:text-6xl font-bold text-gold-200 tracking-widest uppercase">
            Arcane Archives
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-base md:text-lg text-stone-300 font-sans italic">
            Unlock the Forbidden. Illuminate the Hidden.
        </p>
    </header>
);
