import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Music, FileAudio } from 'lucide-react';
import clsx from 'clsx';

const UploadZone = ({ onFileSelect }) => {
    const onDrop = useCallback((acceptedFiles) => {
        if (acceptedFiles?.length > 0) {
            onFileSelect(acceptedFiles[0]);
        }
    }, [onFileSelect]);

    const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
        onDrop,
        accept: {
            'audio/*': ['.mp3', '.wav', '.ogg', '.m4a']
        },
        maxFiles: 1,
        multiple: false
    });

    return (
        <div
            {...getRootProps()}
            className={clsx(
                "relative group cursor-pointer flex flex-col items-center justify-center w-full h-64 rounded-2xl border-2 border-dashed transition-all duration-300 ease-out overflow-hidden",
                "bg-secondary/30 hover:bg-secondary/60 backdrop-blur-xl shadow-sm",
                isDragActive ? "border-primary bg-primary/5 scale-[1.02] shadow-primary/10 shadow-xl" : "border-border/60 hover:border-primary/40",
                isDragReject && "border-destructive bg-destructive/10"
            )}
        >
            <input {...getInputProps()} />

            <div className="flex flex-col items-center space-y-4 text-center p-6 z-10">
                <div className={clsx(
                    "p-4 rounded-full transition-all duration-300 shadow-md",
                    isDragActive ? "bg-primary/20 text-primary scale-110 shadow-primary/20" : "bg-background/80 text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 border border-border/50"
                )}>
                    {isDragActive ? (
                        <UploadCloud className="w-10 h-10 animate-bounce" />
                    ) : (
                        <Music className="w-10 h-10 transition-transform group-hover:scale-110" />
                    )}
                </div>

                <div className="space-y-1">
                    <p className="text-lg font-bold tracking-tight text-foreground transition-colors group-hover:text-primary/90">
                        {isDragActive ? "Drop the audio here" : "Drag & drop audio file"}
                    </p>
                    <p className="text-sm font-medium text-muted-foreground/80">
                        Supports MP3, WAV, OGG, M4A
                    </p>
                </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/5 pointer-events-none" />
        </div>
    );
};

export default UploadZone;
