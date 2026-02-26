import os
import sqlite3
import time
import argparse
import sys

# Add parent directory to path to import fingerprint_engine
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
try:
    from fingerprint_engine import FingerprintEngine
except ImportError:
    print("Error: Could not import fingerprint_engine. Make sure you are running this from the project root or scripts directory.")
    sys.exit(1)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATASET_DIR = os.path.join(BASE_DIR, 'Dataset')
DB_PATH = os.path.join(BASE_DIR, 'fingerprints.db')

# Folders to exclude (Legitimate calls)
EXCLUDE_FOLDERS = ['Legit_Call']

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS fingerprints (
            hash TEXT NOT NULL,
            file_name TEXT NOT NULL,
            offset INTEGER NOT NULL
        )
    ''')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_hash ON fingerprints (hash)')
    conn.commit()
    return conn

def build_database():
    conn = init_db()
    cursor = conn.cursor()
    engine = FingerprintEngine()
    
    total_files = 0
    processed_files = 0
    start_time = time.time()

    print(f"Scanning dataset at {DATASET_DIR}...")
    
    # 1. Count files first for progress
    files_to_process = []
    if os.path.exists(DATASET_DIR):
        for root, dirs, files in os.walk(DATASET_DIR):
            folder_name = os.path.basename(root)
            if folder_name in EXCLUDE_FOLDERS:
                continue
                
            for file in files:
                if file.lower().endswith(('.wav', '.mp3', '.flac', '.ogg')):
                    files_to_process.append(os.path.join(root, file))
    else:
        print(f"Dataset directory not found at {DATASET_DIR}")
        return

    total_files = len(files_to_process)
    print(f"Found {total_files} fraud audio files to process.")

    # 2. Process files
    for file_path in files_to_process:
        try:
            filename = os.path.basename(file_path)
            # Check if already processed (simple check, can be improved)
            # For now, we assume we want to rebuild or append. 
            # To avoid duplicates if re-running, we could delete existing entries for this file.
            cursor.execute("DELETE FROM fingerprints WHERE file_name = ?", (filename,))
            
            hashes = engine.fingerprint_file(file_path)
            
            if hashes:
                # Batch insert
                data_to_insert = [(h, filename, offset) for h, offset in hashes]
                cursor.executemany("INSERT INTO fingerprints (hash, file_name, offset) VALUES (?, ?, ?)", data_to_insert)
                conn.commit()
            
            processed_files += 1
            if processed_files % 10 == 0:
                print(f"Processed {processed_files}/{total_files} files...")
                
        except Exception as e:
            print(f"Error processing {file_path}: {e}")

    conn.close()
    elapsed = time.time() - start_time
    print(f"Database build complete. Processed {processed_files} files in {elapsed:.2f} seconds.")

def check_database():
    if not os.path.exists(DB_PATH):
        print("Database not found!")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM fingerprints")
    count = cursor.fetchone()[0]
    print(f"Total fingerprints: {count}")
    
    cursor.execute("SELECT COUNT(DISTINCT file_name) FROM fingerprints")
    file_count = cursor.fetchone()[0]
    print(f"Distinct files indexed: {file_count}")
    
    cursor.execute("SELECT file_name FROM fingerprints LIMIT 5")
    rows = cursor.fetchall()
    print("Sample files:", [r[0] for r in rows])
    
    conn.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Tools for managing the fingerprint database.")
    parser.add_argument('--build', action='store_true', help='Build or update the database from the dataset.')
    parser.add_argument('--check', action='store_true', help='Check database statistics.')
    
    args = parser.parse_args()
    
    if args.build:
        if os.path.exists(DB_PATH):
            print(f"Database already exists at {DB_PATH}. It will be updated.")
        build_database()
    elif args.check:
        check_database()
    else:
        parser.print_help()
