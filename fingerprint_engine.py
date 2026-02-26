import librosa
import numpy as np
import scipy.ndimage
import hashlib
from typing import List, Tuple, Dict

class FingerprintEngine:
    def __init__(self, sampling_rate: int = 22050, n_fft: int = 2048, hop_length: int = 512):
        self.sampling_rate = sampling_rate
        self.n_fft = n_fft
        self.hop_length = hop_length
        # Parameters for peak finding
        self.amp_min = -60  # Minimum amplitude (dB) to consider a peak. 0 is max.
        self.fan_value = 15  # Max number of pairs per peak
        self.neighborhood_size = 20 # Size of the neighborhood for local maxima

    def load_audio(self, file_path: str) -> np.ndarray:
        """Loads audio and resamples to the target sampling rate."""
        try:
            # Load audio with librosa (it handles resampling)
            y, sr = librosa.load(file_path, sr=self.sampling_rate)
            return y
        except Exception as e:
            print(f"Error loading audio file {file_path}: {e}")
            return np.array([])

    def _get_spectrogram(self, y: np.ndarray) -> np.ndarray:
        """Generates a spectrogram from the audio signal."""
        # Short-time Fourier transform
        D = librosa.stft(y, n_fft=self.n_fft, hop_length=self.hop_length)
        # Convert to magnitude spectrogram
        S = np.abs(D)
        # Convert to log scale (dB) which is better for audio processing
        # We use a small offset to avoid log(0)
        return librosa.amplitude_to_db(S, ref=np.max)

    def _find_peaks(self, S: np.ndarray) -> List[Tuple[int, int]]:
        """Finds local maxima (peaks) in the spectrogram."""
        # Define the structure for local maximum filter
        # It defines the area around a point to check if it is the maximum
        structure = scipy.ndimage.generate_binary_structure(2, 1)
        neighborhood = scipy.ndimage.iterate_structure(structure, self.neighborhood_size)

        # Find local maxima
        local_max = scipy.ndimage.maximum_filter(S, footprint=neighborhood) == S
        
        # Boolean mask of peaks where amplitude is above threshold
        background = (S == 0)
        eroded_background = scipy.ndimage.binary_erosion(background, structure=neighborhood, border_value=1)
        detected_peaks = local_max ^ eroded_background

        # Get coordinates of peaks
        # Return as (frequency_idx, time_idx)
        peaks = []
        freq_indices, time_indices = np.where(detected_peaks & (S > self.amp_min))
        for f, t in zip(freq_indices, time_indices):
            peaks.append((f, t))
            
        return peaks

    def _generate_hashes(self, peaks: List[Tuple[int, int]]) -> List[Tuple[str, int]]:
        """
        Generates hashes from peaks using combinatorial hashing.
        Returns a list of (hash_string, time_offset).
        """
        # Sort peaks by time
        peaks.sort(key=lambda x: x[1])
        
        hashes = []
        for i in range(len(peaks)):
            for j in range(1, self.fan_value):
                if (i + j) < len(peaks):
                    freq1 = peaks[i][0]
                    freq2 = peaks[i + j][0]
                    t1 = peaks[i][1]
                    t2 = peaks[i + j][1]
                    t_delta = t2 - t1

                    # Create a hash from the frequency pair and time delta
                    # Determine a target zone for time delta to limit connections
                    if 0 <= t_delta <= 200: 
                        h = hashlib.sha1(f"{freq1}|{freq2}|{t_delta}".encode('utf-8'))
                        # Store hash and the time offset of the anchor point
                        hashes.append((h.hexdigest()[:20], t1))
        
        return hashes

    def fingerprint_file(self, file_path: str) -> List[Tuple[str, int]]:
        """
        Public method to fingerprint an audio file.
        Returns list of (hash, offset).
        """
        y = self.load_audio(file_path)
        if len(y) == 0:
            return []
            
        S = self._get_spectrogram(y)
        peaks = self._find_peaks(S)
        hashes = self._generate_hashes(peaks)
        
        return hashes

if __name__ == "__main__":
    # Simple test
    import sys
    if len(sys.argv) > 1:
        engine = FingerprintEngine()
        hashes = engine.fingerprint_file(sys.argv[1])
        print(f"Generated {len(hashes)} hashes for {sys.argv[1]}")
