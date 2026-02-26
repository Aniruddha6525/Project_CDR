import os
import json

DATASET_DIR = "Dataset"
FILE_SCAM_MAP = {}

if os.path.exists(DATASET_DIR):
    for root, dirs, files in os.walk(DATASET_DIR):
        folder_name = os.path.basename(root)
        if folder_name == "Dataset": continue
        
        for file in files:
            if file.lower().endswith('.mp3') or file.lower().endswith('.wav'):
                FILE_SCAM_MAP[file] = folder_name

with open("scam_mapping.json", "w") as f:
    json.dump(FILE_SCAM_MAP, f, indent=4)

print(f"Saved {len(FILE_SCAM_MAP)} mappings to scam_mapping.json.")
