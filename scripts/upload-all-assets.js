import cloudinaryModule from 'cloudinary';
const { v2: cloudinary } = cloudinaryModule;
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load env vars
dotenv.config({ path: '.env.local.production' });

cloudinary.config({
    cloud_name: process.env.VITE_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.VITE_CLOUDINARY_API_KEY,
    api_secret: process.env.VITE_CLOUDINARY_API_SECRET
});

async function uploadFolder(localPath, cloudinaryFolder) {
    console.log(`Scanning ${localPath} for images...`);
    const files = fs.readdirSync(localPath);
    
    for (const file of files) {
        if (file.match(/\.(jpe?g|png|webp|gif|JPG|JPEG)$/i)) {
            const filePath = path.join(localPath, file);
            const publicId = path.parse(file).name.replace(/_/g, '-'); // Filename with hyphens
            
            try {
                process.stdout.write(`Uploading ${file} to ${cloudinaryFolder}/${publicId}... `);
                const result = await cloudinary.uploader.upload(filePath, {
                    folder: cloudinaryFolder,
                    public_id: publicId,
                    overwrite: true,
                    resource_type: "image"
                });
                console.log('Done!');
            } catch (e) {
                console.error(`FAILED: ${e.message}`);
            }
        }
    }
}

async function main() {
    console.log('Starting T.O.N.Y. Cloudinary Migration...');
    
    try {
        const categories = fs.readdirSync('public/images').filter(f => 
            fs.statSync(path.join('public/images', f)).isDirectory()
        );
        
        for (const cat of categories) {
            await uploadFolder(`public/images/${cat}`, `tony/${cat}`);
        }
        console.log('Migration Complete!');
    } catch (e) {
        console.error('Migration failed:', e);
    }
}

main();
