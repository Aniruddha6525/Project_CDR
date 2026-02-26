import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileAudio, FileText, Check, AlertCircle } from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

const HybridInput = ({ onAnalyze }) => {
    const [file, setFile] = useState(null);
    const [transcript, setTranscript] = useState('');
    const [useManualTranscript, setUseManualTranscript] = useState(false);

    const onDrop = useCallback((acceptedFiles) => {
        if (acceptedFiles?.length > 0) {
            setFile(acceptedFiles[0]);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
        onDrop,
        accept: { 'audio/*': ['.mp3', '.wav', '.ogg', '.m4a'] },
        maxFiles: 1,
        multiple: false
    });

    const handleSubmit = () => {
        if (!file) return;
        onAnalyze(file, useManualTranscript ? transcript : null);
    };

    return (
        <div className="space-y-6">
            {/* Audio Upload Section */}
            <div className="space-y-2">
                <label className="text-sm text-muted-foreground font-medium uppercase tracking-wider ml-1">
                    1. Audio Source (Required)
                </label>
                <div
                    {...getRootProps()}
                    className={clsx(
                        "relative group cursor-pointer flex flex-col items-center justify-center w-full h-40 rounded-2xl border-2 border-dashed transition-all duration-300 ease-out overflow-hidden",
                        "bg-secondary/20 hover:bg-secondary/40 backdrop-blur-xl shadow-sm",
                        isDragActive ? "border-primary bg-primary/5 shadow-primary/10 shadow-lg" : "border-border/60 hover:border-primary/40",
                        isDragReject && "border-destructive bg-destructive/10",
                        file && "border-primary/50 bg-primary/10 shadow-primary/5"
                    )}
                >
                    <input {...getInputProps()} />

                    {file ? (
                        <div className="flex items-center gap-4 text-primary z-10">
                            <div className="p-3 bg-background/80 rounded-xl shadow-sm border border-border/50">
                                <FileAudio className="w-8 h-8 drop-shadow-sm" />
                            </div>
                            <div className="text-left">
                                <p className="font-bold tracking-tight text-foreground">{file.name}</p>
                                <p className="text-xs font-medium text-primary/80">Ready for analysis</p>
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                className="ml-auto p-2 bg-background/50 hover:bg-destructive/10 rounded-full text-muted-foreground hover:text-destructive transition-colors border border-transparent hover:border-destructive/20"
                            >
                                <clsx.X className="w-5 h-5" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-3 text-muted-foreground group-hover:text-foreground z-10">
                            <UploadCloud className={clsx("w-8 h-8 transition-transform duration-300 group-hover:scale-110", isDragActive && "scale-110 text-primary")} />
                            <p className="text-sm font-semibold tracking-wide">Drag audio here or click to browse</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Transcript Section */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <label className="text-sm text-muted-foreground font-medium uppercase tracking-wider ml-1 leading-none">
                        2. Transcript Configuration
                    </label>
                    <div className="flex items-center gap-3">
                        <span className={clsx("text-xs transition-colors leading-none mt-[2px]", !useManualTranscript ? "text-primary font-bold" : "text-muted-foreground")}>Auto-Generate</span>
                        <button
                            onClick={() => setUseManualTranscript(!useManualTranscript)}
                            className={clsx(
                                "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background",
                                useManualTranscript ? 'bg-primary' : 'bg-muted'
                            )}
                        >
                            <span
                                className={clsx(
                                    "inline-block h-3 w-3 transform rounded-full bg-primary-foreground transition-transform shadow-sm",
                                    useManualTranscript ? 'translate-x-5' : 'translate-x-1'
                                )}
                            />
                        </button>
                        <span className={clsx("text-xs transition-colors leading-none mt-[2px]", useManualTranscript ? "text-primary font-bold" : "text-muted-foreground")}>Manual Input</span>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {useManualTranscript ? (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="relative"
                        >
                            <textarea
                                value={transcript}
                                onChange={(e) => setTranscript(e.target.value)}
                                placeholder="Paste or type the call transcript here for deeper analysis..."
                                className="w-full h-48 bg-secondary/20 backdrop-blur-xl border border-border/50 rounded-2xl p-5 pb-10 text-sm font-medium text-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all resize-none shadow-inner"
                            />
                            <div className="absolute bottom-3 right-4 text-[10px] font-bold tracking-widest uppercase text-muted-foreground/60 bg-background/80 px-2 py-1 rounded-md border border-border/50 pointer-events-none">
                                {transcript.length} CHARS
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-secondary/20 backdrop-blur-xl border border-border/40 rounded-2xl p-6 text-center text-muted-foreground text-sm shadow-sm"
                        >
                            <div className="flex flex-col items-center gap-3">
                                <div className="p-2.5 bg-background/80 rounded-xl text-primary shadow-sm border border-border/50">
                                    <FileAudio className="w-5 h-5" />
                                </div>
                                <p className="font-medium tracking-wide">System will automatically transcribe audio using Speech-to-Text engine.</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Action Button */}
            <div className="pt-2"> {/* Added padding top to separate from above content */}
                <button
                    onClick={handleSubmit}
                    disabled={!file}
                    className={clsx(
                        "w-full py-4 rounded-2xl font-bold text-lg tracking-wide transition-all duration-300 flex items-center justify-center gap-2 shadow-sm border border-transparent",
                        file
                            ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/25 shadow-lg transform hover:-translate-y-1 hover:border-primary-foreground/10"
                            : "bg-secondary/50 text-muted-foreground/50 cursor-not-allowed border-border/40 backdrop-blur-md"
                    )}
                >
                    {file ? (
                        <>Run Deep Analysis <Check className="w-5 h-5" /></>
                    ) : (
                        <>Upload Audio <AlertCircle className="w-5 h-5" /></>
                    )}
                </button>
            </div>
        </div>
    );
};

export default HybridInput;
