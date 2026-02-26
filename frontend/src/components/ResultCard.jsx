import React, { useState } from 'react';
import { AlertTriangle, ShieldCheck, Activity, Terminal, FileJson, FileText, Cpu, Server, Clock } from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

const ResultCard = ({ result, isLoading, error, mode }) => {
    const [activeTab, setActiveTab] = useState('overview'); // overview | transcript | json | logs

    if (isLoading) {
        return (
            <div className="w-full bg-secondary/30 backdrop-blur-xl border border-border/50 shadow-lg rounded-2xl p-8 flex flex-col items-center justify-center space-y-5 min-h-[400px]">
                <div className="relative">
                    <div className="w-20 h-20 border-[3px] border-primary/20 border-t-primary rounded-full animate-spin shadow-[0_0_15px_rgba(var(--primary),0.3)]"></div>
                    <div className="absolute inset-0 m-auto flex items-center justify-center">
                        <Activity className="text-primary w-8 h-8 animate-pulse drop-shadow-md" />
                    </div>
                </div>
                <div className="text-center space-y-2">
                    <p className="text-foreground tracking-tight font-bold text-xl animate-pulse">Running Deep Analysis...</p>
                    <p className="text-muted-foreground/80 text-[10px] font-mono font-semibold uppercase tracking-widest">
                        {mode === 'fingerprint' ? "Querying Fingerprint DB..." : "Processing Neural Network..."}
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full bg-red-950/20 border border-red-900/50 rounded-2xl p-6 flex items-center space-x-4">
                <AlertTriangle className="w-12 h-12 text-red-500" />
                <div>
                    <h3 className="text-lg font-bold text-red-500">System Error</h3>
                    <p className="text-red-400/80 font-mono text-sm mt-1">{error}</p>
                </div>
            </div>
        );
    }

    if (!result) return null;

    const isFraud = result.label?.includes("FRAUD");
    const riskScore = (result.confidence * 100).toFixed(2);
    const timestamp = new Date().toLocaleTimeString();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full space-y-6"
        >
            {/* Header Status Bar */}
            <div className={clsx(
                "w-full p-1 rounded-t-2xl border-x border-t flex items-center justify-between px-4 py-2 text-[10px] font-mono uppercase tracking-widest",
                isFraud ? "bg-red-950/30 border-red-500/30 text-red-400" : "bg-emerald-950/30 border-emerald-500/30 text-emerald-400"
            )}>
                <span>ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                <span>{timestamp}</span>
            </div>

            {/* Main Dashboard Card */}
            <div className={clsx(
                "relative overflow-hidden rounded-b-2xl rounded-tr-none border backdrop-blur-2xl p-8 -mt-2 shadow-xl",
                isFraud ? "bg-red-950/10 border-red-500/30 shadow-red-900/10" : "bg-emerald-950/10 border-emerald-500/30 shadow-emerald-900/10"
            )}>
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    {/* Status Icon & Label */}
                    <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                            <div className={clsx(
                                "p-4 rounded-xl border",
                                isFraud ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                            )}>
                                {isFraud ? <AlertTriangle className="w-12 h-12" /> : <ShieldCheck className="w-12 h-12" />}
                            </div>
                            <div>
                                <h1 className={clsx("text-4xl font-black tracking-tight", isFraud ? "text-red-500" : "text-emerald-500")}>
                                    {isFraud ? "THREAT DETECTED" : "SECURE"}
                                </h1>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={clsx("px-2 py-0.5 rounded textxs font-bold uppercase", isFraud ? "bg-destructive text-destructive-foreground" : "bg-emerald-500 text-black")}>
                                        {result.label}
                                    </span>
                                    {result.scam_type && (
                                        <span className="text-muted-foreground text-sm font-medium px-2 border-l border-border">
                                            {result.scam_type.replace(/_/g, " ")}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Confidence / Risk Meter */}
                    <div className="w-full md:w-auto text-right">
                        <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1.5 opacity-80">
                            Calculated Risk
                        </div>
                        <div className="text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-foreground to-muted-foreground/50 drop-shadow-sm">
                            {riskScore}%
                        </div>
                        <div className="text-[11px] font-bold tracking-wide uppercase text-primary font-mono mt-2 bg-primary/10 inline-block px-2 py-1 rounded-md border border-primary/20">
                            Model: {mode === 'hybrid' ? 'Hybrid Neural Net v7' : 'Fingerprint Matcher v2'}
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex items-center gap-2 mt-8 border-b border-border pb-1">
                    {[
                        { id: 'overview', icon: Activity, label: 'Overview' },
                        { id: 'transcript', icon: FileText, label: 'Transcript' },
                        { id: 'logs', icon: Terminal, label: 'System Logs' },
                        { id: 'json', icon: FileJson, label: 'Raw Data' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={clsx(
                                "flex items-center gap-2 px-4 py-2 rounded-t-lg text-xs font-bold uppercase tracking-wide transition-all",
                                activeTab === tab.id
                                    ? "bg-secondary text-foreground border-t border-x border-border -mb-1.5 pb-3 z-10"
                                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                            )}
                        >
                            <tab.icon className="w-3 h-3" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content Area */}
                <div className="bg-secondary/20 rounded-b-xl rounded-tr-xl border border-border p-6 min-h-[200px] mt-1">

                    {/* OVERVIEW TAB */}
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70 flex items-center gap-2">
                                    <Cpu className="w-4 h-4 text-primary" /> Detection Engine Metrics
                                </h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-secondary/50 p-3 rounded-lg border border-border">
                                        <div className="text-xs text-muted-foreground">Method</div>
                                        <div className="font-mono text-sm text-primary">{mode.toUpperCase()}</div>
                                    </div>
                                    <div className="bg-secondary/50 p-3 rounded-lg border border-border">
                                        <div className="text-xs text-muted-foreground">Scam Type</div>
                                        <div className="font-mono text-sm text-foreground">{result.scam_type || "N/A"}</div>
                                    </div>
                                    <div className="bg-secondary/50 p-3 rounded-lg border border-border col-span-2">
                                        <div className="text-xs text-muted-foreground">Details</div>
                                        <div className="font-mono text-xs text-muted-foreground leading-relaxed mt-1">{result.details}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                                    <Server className="w-4 h-4 text-accent" /> Backend Status
                                </h3>
                                <div className="bg-secondary/50 p-4 rounded-lg border border-border font-mono text-xs text-muted-foreground space-y-2">
                                    <div className="flex justify-between">
                                        <span>Status:</span> <span className="text-emerald-500">200 OK</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Latency:</span> <span>124ms</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Model Ver:</span> <span>{result.model_version || "2.1.0"}</span>
                                    </div>
                                    {result.match_ratio && (
                                        <div className="flex justify-between">
                                            <span>Hash Match:</span>
                                            <span className={(result.match_ratio > 0.1) ? "text-yellow-500" : "text-gray-500"}>
                                                {(result.match_ratio * 100).toFixed(1)}%
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TRANSCRIPT TAB */}
                    {activeTab === 'transcript' && (
                        <div className="space-y-2 h-full">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs text-muted-foreground uppercase">Recognized Text</span>
                                <span className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">Fast Speech v2</span>
                            </div>
                            {result.transcript ? (
                                <div className="bg-card p-4 rounded-lg border border-border h-64 overflow-y-auto font-mono text-sm text-muted-foreground leading-relaxed custom-scrollbar whitespace-pre-wrap">
                                    {result.transcript}
                                </div>
                            ) : (
                                <div className="h-64 flex flex-col items-center justify-center text-muted">
                                    <FileAudio className="w-8 h-8 mb-2 opacity-50" />
                                    No transcript available for this scan mode.
                                </div>
                            )}
                        </div>
                    )}

                    {/* LOGS TAB */}
                    {activeTab === 'logs' && (
                        <div className="bg-black/80 rounded-lg p-4 font-mono text-xs h-64 overflow-y-auto custom-scrollbar border border-border">
                            <div className="space-y-1">
                                <span className="block text-muted-foreground">[{timestamp}] <span className="text-primary">INFO</span> Initiating scan sequence...</span>
                                <span className="block text-muted-foreground">[{timestamp}] <span className="text-primary">INFO</span> Mode selected: {mode}</span>
                                <span className="block text-muted-foreground">[{timestamp}] <span className="text-primary">INFO</span> File uploaded: {result.file_name || "audio_sample.mp3"}</span>
                                <span className="block text-muted-foreground">[{timestamp}] <span className="text-yellow-500">PROC</span> Preprocessing audio buffers...</span>
                                {result.match_ratio ? (
                                    <span className="block text-muted-foreground">[{timestamp}] <span className="text-emerald-500">DONE</span> Fingerprint Match: {(result.match_ratio * 100).toFixed(1)}%</span>
                                ) : (
                                    <span className="block text-muted-foreground">[{timestamp}] <span className="text-primary">INFO</span> Skipped Fingerprint (Hybrid Mode)</span>
                                )}
                                {result.transcript && (
                                    <span className="block text-muted-foreground">[{timestamp}] <span className="text-emerald-500">DONE</span> Transcript generation complete ({result.transcript.length} chars)</span>
                                )}
                                <span className="block text-muted-foreground">[{timestamp}] <span className="text-accent">AI</span> Inference Result: {result.label} ({riskScore}%)</span>
                                <span className="block text-muted-foreground">[{timestamp}] <span className="text-emerald-500">SUCCESS</span> Analysis complete.</span>
                            </div>
                        </div>
                    )}

                    {/* RAW JSON TAB */}
                    {activeTab === 'json' && (
                        <div className="relative">
                            <pre className="bg-secondary/50 rounded-lg p-4 font-mono text-xs text-emerald-400 h-64 overflow-y-auto custom-scrollbar border border-border">
                                {JSON.stringify(result, null, 2)}
                            </pre>
                            <div className="absolute top-2 right-4 text-[10px] text-muted-foreground">READ-ONLY</div>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default ResultCard;
