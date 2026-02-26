import React, { useCallback } from 'react';
import { UploadCloud } from 'lucide-react';

const FileUpload = ({ onFileSelect }) => {
    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) onFileSelect(file);
    };

    const handleChange = (e) => {
        const file = e.target.files[0];
        if (file) onFileSelect(file);
    };

    return (
        <div
            className="glass-panel"
            style={{ borderStyle: 'dashed', cursor: 'pointer' }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => document.getElementById('fileInput').click()}
        >
            <input
                type="file"
                id="fileInput"
                style={{ display: 'none' }}
                accept="audio/*"
                onChange={handleChange}
            />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <div style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '50%' }}>
                    <UploadCloud size={48} color="#60a5fa" />
                </div>
                <div>
                    <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Click or Drag Audio File Here</h3>
                    <p style={{ margin: '0.5rem 0 0', color: '#94a3b8' }}>Supports MP3, WAV</p>
                </div>
            </div>
        </div>
    );
};

export default FileUpload;
