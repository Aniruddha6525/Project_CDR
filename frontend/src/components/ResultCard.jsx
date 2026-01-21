import React from 'react';
import { ShieldCheck, ShieldAlert, FileText } from 'lucide-react';

const ResultCard = ({ result, onReset }) => {
    const isFraud = result.label === 'FRAUD';
    const color = isFraud ? '#ef4444' : '#22c55e';
    const Icon = isFraud ? ShieldAlert : ShieldCheck;

    return (
        <div className="glass-panel" style={{ textAlign: 'left', maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <Icon size={48} color={color} />
                <div>
                    <h2 style={{ margin: 0, color: color, fontSize: '2rem' }}>
                        {isFraud ? 'SCAM DETECTED' : 'LEGITIMATE CALL'}
                    </h2>
                    <p style={{ margin: 0, color: '#94a3b8' }}>
                        Confidence: <span style={{ color: 'white', fontWeight: 'bold' }}>{result.confidence}</span>
                    </p>
                </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
                    <FileText size={20} /> Transcript
                </h3>
                <div style={{
                    background: 'rgba(0,0,0,0.3)',
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    fontSize: '0.9rem',
                    lineHeight: '1.6',
                    color: '#cbd5e1'
                }}>
                    {result.transcript || "No transcript available."}
                </div>
            </div>

            <button className="btn-primary" onClick={onReset} style={{ width: '100%' }}>
                Analyze Another Call
            </button>
        </div>
    );
};

export default ResultCard;
