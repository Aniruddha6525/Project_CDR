import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import AudioRecorder from './components/AudioRecorder';
import ResultCard from './components/ResultCard';
import { Activity, AlertCircle, Mic, Upload } from 'lucide-react';

function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState('upload');

  const handleFileSelect = async (selectedFile) => {
    setFile(selectedFile);
    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Analysis failed. Please try again.');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="App">
      <header style={{ marginBottom: '3rem' }}>
        <h1 className="text-gradient" style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '0.5rem' }}>
          CDR Fraud Guard
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1.2rem' }}>
          Advanced AI-Powered Call Analysis System
        </p>
      </header>

      <main>
        {result ? (
          <ResultCard result={result} onReset={handleReset} />
        ) : (
          <div style={{ maxWidth: '600px', margin: '0 auto', position: 'relative' }}>

            {loading && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(15, 23, 42, 0.8)',
                backdropFilter: 'blur(4px)',
                zIndex: 10,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '1rem',
                minHeight: '300px'
              }}>
                <Activity className="animate-pulse-soft" size={64} color="#60a5fa" style={{ marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '1.5rem', margin: 0 }}>Analyzing Call...</h3>
                <p style={{ color: '#94a3b8', margin: '0.5rem 0 0' }}>Processing audio and transcript</p>
              </div>
            )}

            <div className="glass-panel" style={{ display: 'flex', padding: '0.5rem', gap: '0.5rem', marginBottom: '2rem', justifyContent: 'center', width: 'fit-content', margin: '0 auto 2rem auto' }}>
              <button
                onClick={() => setMode('upload')}
                disabled={loading}
                style={{
                  background: mode === 'upload' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                  color: mode === 'upload' ? '#60a5fa' : '#94a3b8',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontWeight: mode === 'upload' ? '600' : '400',
                  transition: 'all 0.2s',
                  opacity: loading ? 0.5 : 1
                }}
              >
                <Upload size={18} /> Upload
              </button>
              <button
                onClick={() => setMode('record')}
                disabled={loading}
                style={{
                  background: mode === 'record' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                  color: mode === 'record' ? '#60a5fa' : '#94a3b8',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontWeight: mode === 'record' ? '600' : '400',
                  transition: 'all 0.2s',
                  opacity: loading ? 0.5 : 1
                }}
              >
                <Mic size={18} /> Record
              </button>
            </div>

            {mode === 'upload' ? (
              <FileUpload onFileSelect={handleFileSelect} />
            ) : (
              <AudioRecorder onFileSelect={handleFileSelect} />
            )}

            {error && (
              <div style={{
                marginTop: '1rem',
                padding: '1rem',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '0.5rem',
                color: '#fca5a5',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                justifyContent: 'center'
              }}>
                <AlertCircle size={20} />
                {error}
              </div>
            )}
          </div>
        )}
      </main>

      <footer style={{ marginTop: '4rem', color: '#475569', fontSize: '0.9rem' }}>
        &copy; 2025 CDR Fraud Detection System
      </footer>
    </div>
  );
}

export default App;
