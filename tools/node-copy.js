import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const SOURCE_DIR = path.resolve(process.cwd(), 'dist');

// Check if source folder exists
if (!fs.existsSync(SOURCE_DIR)) {
    console.error(`[Copy] Source directory not found: ${SOURCE_DIR}`);
    process.exit(1);
}

// Parse destinations array from .env
let destinations = [];
try {
    destinations = JSON.parse(process.env.DEST_DIRS || '[]');
} catch (error) {
    console.error('[Copy] Failed to parse DEST_DIRS as JSON array:', error.message);
    process.exit(1);
}

if (!Array.isArray(destinations) || destinations.length === 0) {
    console.warn('[Copy] No destinations specified in DEST_DIRS.');
    process.exit(0);
}

// Copy dist contents to each target directory
destinations.forEach((dest) => {
    const targetPath = path.resolve(dest);

    try {
        // Ensure the target directory exists
        fs.mkdirSync(targetPath, { recursive: true });

        // Copy files recursively (available natively in Node.js 16.7+)
        fs.cpSync(SOURCE_DIR, targetPath, { recursive: true, force: true });
        console.log(`[Copy] Successfully synced dist -> ${targetPath}`);
    } catch (err) {
        console.error(`[Copy] Error copying to ${targetPath}:`, err.message);
    }
});
