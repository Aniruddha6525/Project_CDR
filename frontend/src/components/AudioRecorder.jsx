import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, RotateCcw, Check, Activity } from 'lucide-react';

const AudioRecorder = ({ onFileSelect }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioBlob, setAudioBlob] = useState(null);

    const audioContextRef = useRef(null);
    const mediaStreamRef = useRef(null);
    const scriptProcessorRef = useRef(null);
    const audioInputRef = useRef(null);
    const audioDataRef = useRef([]);
    const timerRef = useRef(null);

    const isRecordingRef = useRef(false);

    useEffect(() => {
        return () => {
            cleanup();
        };
    }, []);

    const cleanup = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
        }
        if (scriptProcessorRef.current) scriptProcessorRef.current.disconnect();
        if (audioInputRef.current) audioInputRef.current.disconnect();

        isRecordingRef.current = false;
    };

    const startRecording = async () => {
        try {
            audioDataRef.current = [];
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;

            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            audioContextRef.current = audioContext;

            const input = audioContext.createMediaStreamSource(stream);
            audioInputRef.current = input;

            const bufferSize = 4096;
            const processor = audioContext.createScriptProcessor(bufferSize, 1, 1);
            scriptProcessorRef.current = processor;

            processor.onaudioprocess = (e) => {
                if (!isRecordingRef.current) return;

                const inputData = e.inputBuffer.getChannelData(0);
                audioDataRef.current.push(new Float32Array(inputData));
            };

            input.connect(processor);
            processor.connect(audioContext.destination);

            isRecordingRef.current = true;
            setIsRecording(true);
            setRecordingTime(0);

            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("Could not access microphone: " + err.message);
        }
    };

    const stopRecording = () => {
        isRecordingRef.current = false;
        setIsRecording(false);
        if (timerRef.current) clearInterval(timerRef.current);

        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
        }

        if (scriptProcessorRef.current) scriptProcessorRef.current.disconnect();
        if (audioInputRef.current) audioInputRef.current.disconnect();

        if (audioContextRef.current && audioDataRef.current.length > 0) {
            const buffer = mergeBuffers(audioDataRef.current);
            const wavBlob = encodeWAV(buffer, audioContextRef.current.sampleRate);
            setAudioBlob(wavBlob);
        }
    };

    const handleReset = () => {
        setAudioBlob(null);
        setRecordingTime(0);
        setIsRecording(false);
        isRecordingRef.current = false;
        cleanup();
    };

    const handleConfirm = () => {
        if (audioBlob) {
            const file = new File([audioBlob], `recording_${new Date().getTime()}.wav`, { type: 'audio/wav' });
            onFileSelect(file);
        }
    };

    const mergeBuffers = (bufferFragments) => {
        let totalLength = 0;
        for (let i = 0; i < bufferFragments.length; i++) {
            totalLength += bufferFragments[i].length;
        }
        const result = new Float32Array(totalLength);
        let offset = 0;
        for (let i = 0; i < bufferFragments.length; i++) {
            result.set(bufferFragments[i], offset);
            offset += bufferFragments[i].length;
        }
        return result;
    };

    const encodeWAV = (samples, sampleRate) => {
        const buffer = new ArrayBuffer(44 + samples.length * 2);
        const view = new DataView(buffer);

        writeString(view, 0, 'RIFF');
        view.setUint32(4, 36 + samples.length * 2, true);
        writeString(view, 8, 'WAVE');
        writeString(view, 12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, 1, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * 2, true);
        view.setUint16(32, 2, true);
        view.setUint16(34, 16, true);
        writeString(view, 36, 'data');
        view.setUint32(40, samples.length * 2, true);

        floatTo16BitPCM(view, 44, samples);

        return new Blob([view], { type: 'audio/wav' });
    };

    const floatTo16BitPCM = (output, offset, input) => {
        for (let i = 0; i < input.length; i++, offset += 2) {
            const s = Math.max(-1, Math.min(1, input[i]));
            output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
        }
    };

    const writeString = (view, offset, string) => {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
            <div style={{ marginBottom: '1.5rem', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {isRecording ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#ef4444' }}>
                        <div className="recording-dot" style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 10px #ef4444' }}></div>
                        <span style={{ fontSize: '2rem', fontFamily: 'monospace', fontWeight: 'bold' }}>{formatTime(recordingTime)}</span>
                        <Activity className="animate-pulse" />
                    </div>
                ) : audioBlob ? (
                    <div style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.2rem' }}>Recording Complete</span>
                        <span style={{ fontSize: '1rem', opacity: 0.7 }}>({formatTime(recordingTime)})</span>
                    </div>
                ) : (
                    <div style={{ color: '#94a3b8' }}>
                        <span style={{ fontSize: '1.2rem' }}>Ready to Record</span>
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
                {!isRecording && !audioBlob && (
                    <button
                        onClick={startRecording}
                        className="btn-primary"
                        style={{ borderRadius: '50%', width: '64px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                    >
                        <Mic size={32} />
                    </button>
                )}

                {isRecording && (
                    <button
                        onClick={stopRecording}
                        style={{
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '64px',
                            height: '64px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                        }}
                    >
                        <Square size={28} fill="currentColor" />
                    </button>
                )}

                {audioBlob && (
                    <>
                        <button
                            onClick={handleReset}
                            className="btn-secondary"
                            style={{ borderRadius: '50%', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                            title="Record Again"
                        >
                            <RotateCcw size={24} />
                        </button>

                        <button
                            onClick={handleConfirm}
                            className="btn-primary"
                            style={{ borderRadius: '50%', width: '64px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, background: '#10b981' }}
                            title="Analyze Recording"
                        >
                            <Check size={32} />
                        </button>
                    </>
                )}
            </div>
            {isRecording && <p style={{ marginTop: '1rem', color: '#94a3b8', fontSize: '0.9rem' }}>Recording... speak clearly</p>}
        </div>
    );
};

export default AudioRecorder;
