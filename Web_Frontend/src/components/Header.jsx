import React from 'react';
import { ShieldAlert } from 'lucide-react';

const Header = () => {
    return (
        <header className="border-b border-border/40 bg-background/70 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
            <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-tr from-primary to-accent rounded-xl flex items-center justify-center shadow-lg shadow-primary/25 ring-1 ring-border/50">
                        <ShieldAlert className="text-primary-foreground w-5 h-5 drop-shadow-md" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-foreground to-muted-foreground/80">
                            SafeLine Web
                        </h1>
                        <p className="text-[10px] text-muted-foreground font-mono font-semibold tracking-widest uppercase mt-0.5">SECURE AUDIO ANALYSIS</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-secondary/80 backdrop-blur-md rounded-full border border-border/40 shadow-sm">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                        <span className="text-[11px] font-semibold text-foreground/80 tracking-wide uppercase">System Operational</span>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
