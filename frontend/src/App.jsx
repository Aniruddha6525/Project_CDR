import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import ResultCard from './components/ResultCard';
import { Activity, AlertCircle } from 'lucide-react';

function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

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
        throw new Error('Analysis failed. Please try again.');
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
        {loading ? (
          <div className="glass-panel" style={{ display: 'inline-block', minWidth: '300px' }}>
            <Activity className="animate-pulse-soft" size={64} color="#60a5fa" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.5rem' }}>Analyzing Call...</h3>
            <p style={{ color: '#94a3b8' }}>Processing audio and transcript</p>
          </div>
        ) : result ? (
          <ResultCard result={result} onReset={handleReset} />
        ) : (
          <div style={{ maxWidth: '500px', margin: '0 auto' }}>
            <FileUpload onFileSelect={handleFileSelect} />
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
