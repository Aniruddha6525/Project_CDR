import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import UploadZone from './components/UploadZone';
import HybridInput from './components/HybridInput';
import ResultCard from './components/ResultCard';
import ModeSelector from './components/ModeSelector';

function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState('fingerprint'); // 'fingerprint' | 'hybrid'

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setResult(null);
    setError(null);
    setFile(null);
  };

  const handleFileSelect = async (selectedFile, manualTranscript = null) => {
    setFile(selectedFile);
    setResult(null);
    setError(null);
    setIsLoading(true);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('mode', mode); // Send current mode
    if (manualTranscript) {
      formData.append('manual_transcript', manualTranscript);
    }

    try {
      // API call to backend
      const response = await axios.post('http://localhost:8002/predict', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log("Response:", response.data);
      setResult(response.data);
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.response?.data?.detail || "Failed to analyze audio. Server might be offline.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 overflow-x-hidden font-sans">
      {/* Premium Mesh Background Effect */}
      <div className="fixed inset-0 bg-background z-[-2]"></div>
      <div className="fixed inset-0 z-[-1] overflow-hidden opacity-40 mix-blend-screen pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full animate-ambient-shift mix-blend-screen"></div>
        <div className="absolute top-[20%] right-[-5%] w-[35%] h-[35%] bg-accent/20 blur-[100px] rounded-full animate-ambient-shift mix-blend-screen" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[45%] h-[45%] bg-blue-500/10 blur-[150px] rounded-full animate-ambient-shift mix-blend-screen" style={{ animationDelay: '4s' }}></div>
      </div>
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.035] mix-blend-overlay pointer-events-none z-0"></div>

      <Header />

      <main className="relative max-w-6xl mx-auto px-6 py-12 z-10">
        <div className="flex flex-col gap-10">

          {/* Intro Section */}
          <div className="text-center space-y-5 max-w-3xl mx-auto drop-shadow-sm">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-foreground via-foreground/90 to-muted-foreground/50">
              Global Security<br /><span className="text-primary tracking-tight brightness-125">Intelligence Grid</span>
            </h2>
            <p className="text-muted-foreground text-lg font-light max-w-2xl mx-auto leading-relaxed">
              Advanced audio forensics for fraud detection. Deploying <span className="text-foreground/90 font-medium">Acoustic Fingerprinting</span> and <span className="text-foreground/90 font-medium">Hybrid Neural Networks</span>.
            </p>
          </div>

          {/* Mode Selection */}
          <div className="w-full max-w-md mx-auto">
            <ModeSelector currentMode={mode} onModeChange={handleModeChange} />
          </div>

          {/* Main Content Area */}
          <div className="w-full max-w-4xl mx-auto min-h-[400px]">
            <AnimatePresence mode="wait">
              {!result ? (
                <motion.div
                  key={mode} // Re-render when mode changes
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {mode === 'fingerprint' ? (
                    <UploadZone onFileSelect={(f) => handleFileSelect(f)} />
                  ) : (
                    <HybridInput onAnalyze={handleFileSelect} />
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6"
                >
                  <ResultCard
                    result={result}
                    isLoading={isLoading}
                    error={error}
                    onReset={handleReset}
                    mode={mode}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Footer / Status Bar - Responsive Details */}
      <footer className="fixed bottom-0 w-full border-t border-border/40 bg-background/80 backdrop-blur-xl py-3 px-6 text-[10px] text-muted-foreground flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-4 z-40 font-mono uppercase tracking-widest shadow-[0_-4px_24px_rgba(0,0,0,0.1)]">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
          <span className="opacity-80">SYS.VER: 2.4.0-RC</span>
          <span className="text-border hidden sm:inline">|</span>
          <span className="opacity-80">NODE: LOCALHOST:8002</span>
          <span className="text-border hidden sm:inline">|</span>
          <span className="text-emerald-400 font-bold flex items-center gap-1.5 shadow-emerald-500/20 drop-shadow-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            ONLINE
          </span>
        </div>
        <div className="flex items-center gap-2 opacity-60 font-medium whitespace-nowrap">
          SECURE CONNECTION ENCRYPTED
        </div>
      </footer>
    </div>
  );
}

export default App;
