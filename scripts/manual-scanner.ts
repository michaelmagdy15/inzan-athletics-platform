import fs from 'fs';
import path from 'path';

/**
 * Recurse through the directory to find all .ts and .tsx files.
 */
function getAllFiles(dirPath: string, arrayOfFiles: string[] = []) {
    const files = fs.readdirSync(dirPath).filter(f => !f.includes('node_modules') && !f.startsWith('.'));

    files.forEach(function (file) {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
        } else {
            if (file.endsWith('.ts') || file.endsWith('.tsx')) {
                arrayOfFiles.push(fullPath);
            }
        }
    });

    return arrayOfFiles;
}

const SRC_DIR = path.resolve(process.cwd(), 'src');
const OUTPUT_FILE = path.resolve(process.cwd(), 'public/help/features.json');

async function scan() {
    console.log('--- Inzan Manual Scanner: Starting ---');
    const files = getAllFiles(SRC_DIR);

    if (!fs.existsSync(OUTPUT_FILE)) {
        console.error('Error: features.json not found in public/help/');
        return;
    }

    const existingFeatures = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'));
    existingFeatures.lastUpdate = new Date().toISOString();

    let discoveredCount = 0;

    for (const file of files) {
        const content = fs.readFileSync(file, 'utf8');
        const pattern = /\/\*\*[\s\S]*?@feature\s*({[\s\S]*?})[\s\S]*?\*\//g;

        let match;
        while ((match = pattern.exec(content)) !== null) {
            try {
                // Remove leading asterisks from JSDoc lines
                const rawJson = match[1]
                    .split('\n')
                    .map(line => line.trim().replace(/^\*\s?/, ''))
                    .join('\n')
                    .trim();

                const feature = JSON.parse(rawJson);

                if (feature.role && feature.title) {
                    const role = feature.role.toLowerCase();
                    if (!existingFeatures.roles[role]) {
                        existingFeatures.roles[role] = { name: role, description: "", features: [] };
                    }

                    const existingIndex = existingFeatures.roles[role].features.findIndex((f: any) => f.title === feature.title);
                    if (existingIndex > -1) {
                        existingFeatures.roles[role].features[existingIndex] = {
                            title: feature.title,
                            description: feature.description || "",
                            steps: feature.steps || []
                        };
                    } else {
                        existingFeatures.roles[role].features.push({
                            title: feature.title,
                            description: feature.description || "",
                            steps: feature.steps || []
                        });
                    }
                    discoveredCount++;
                }
            } catch (err) {
                console.error(`Error parsing feature in ${file}:`, err);
                console.debug(`Matched segment: ${match[1]}`);
            }
        }
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(existingFeatures, null, 2));
    console.log(`--- Scan Complete! Discovered/Updated ${discoveredCount} Features ---`);
    console.log(`Output: ${OUTPUT_FILE}`);
}

scan().catch(console.error);
