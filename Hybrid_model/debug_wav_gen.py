import struct
import io
import librosa
import numpy as np
import soundfile as sf
import os

def create_test_wav(filename="test_gen.wav", duration=2.0, sample_rate=48000):
    
    
    t = np.linspace(0, duration, int(sample_rate * duration))
    samples = np.sin(2 * np.pi * 440 * t).astype(np.float32) 
    
    
    
    
    
    num_channels = 1
    bits_per_sample = 16
    byte_rate = sample_rate * num_channels * (bits_per_sample // 8)
    block_align = num_channels * (bits_per_sample // 8)
    data_size = len(samples) * 2
    total_size = 36 + data_size
    
    header = struct.pack('<4sI4s4sIHHIIHH4sI',
        b'RIFF',
        total_size,
        b'WAVE',
        b'fmt ',
        16, 
        1,  
        num_channels,
        sample_rate,
        byte_rate,
        block_align,
        bits_per_sample,
        b'data',
        data_size
    )
    
    
    
    
    pcm_samples = []
    for s in samples:
        s = max(-1, min(1, s))
        val = int(s * 0x8000) if s < 0 else int(s * 0x7FFF)
        pcm_samples.append(val)
    
    
    
    data_bytes = struct.pack(f'<{len(pcm_samples)}h', *pcm_samples)
    
    full_wav_bytes = header + data_bytes
    
    with open(filename, 'wb') as f:
        f.write(full_wav_bytes)
        
    print(f"Created {filename}. Size: {len(full_wav_bytes)} bytes.")
    return filename

def test_load(filename):
    print(f"Testing load of {filename}...")
    try:
        
        try:
            d, sr = sf.read(filename)
            print(f"✅ soundfile read successful. SR={sr}, Shape={d.shape}")
        except Exception as e:
            print(f"❌ soundfile read failed: {e}")

        
        try:
            y, sr = librosa.load(filename, sr=22050)
            print(f"✅ librosa.load successful. SR={sr}, Shape={y.shape}")
        except Exception as e:
            print(f"❌ librosa.load failed: {e}")
            import traceback
            traceback.print_exc()

    except Exception as e:
        print(f"General Error: {e}")

if __name__ == "__main__":
    test_file = create_test_wav()
    test_load(test_file)
    if os.path.exists(test_file):
        os.remove(test_file)
