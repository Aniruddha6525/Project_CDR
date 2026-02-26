import React from 'react';
import { clsx } from 'clsx';
import { Zap, BrainCircuit } from 'lucide-react';

const ModeSelector = ({ currentMode, onModeChange }) => {
    return (
        <div className="bg-secondary/40 backdrop-blur-md p-1.5 rounded-2xl border border-border/50 flex relative shadow-inner">
            <button
                onClick={() => onModeChange('fingerprint')}
                className={clsx(
                    "flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-bold tracking-wide transition-all duration-300 relative z-10",
                    currentMode === 'fingerprint' ? "text-primary-foreground bg-primary shadow-lg shadow-primary/25" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
            >
                <Zap className={clsx("w-4 h-4", currentMode === 'fingerprint' ? "text-primary-foreground fill-primary-foreground" : "")} />
                Quick Scan
            </button>
            <button
                onClick={() => onModeChange('hybrid')}
                className={clsx(
                    "flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-bold tracking-wide transition-all duration-300 relative z-10",
                    currentMode === 'hybrid' ? "text-primary-foreground bg-primary shadow-lg shadow-primary/25" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
            >
                <BrainCircuit className={clsx("w-4 h-4", currentMode === 'hybrid' ? "text-primary-foreground" : "")} />
                Deep Analysis
            </button>
        </div>
    );
};

export default ModeSelector;
