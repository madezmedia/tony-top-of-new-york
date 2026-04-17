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

async function uploadRecursive(localPath, cloudinaryPath) {
    const items = fs.readdirSync(localPath);
    
    for (const item of items) {
        const fullLocalPath = path.join(localPath, item);
        const stats = fs.statSync(fullLocalPath);
        
        if (stats.isDirectory()) {
            await uploadRecursive(fullLocalPath, `${cloudinaryPath}/${item}`);
        } else if (item.match(/\.(jpe?g|png|webp|gif|JPG|JPEG)$/i)) {
            const publicId = path.parse(item).name.replace(/_/g, '-');
            
            try {
                process.stdout.write(`Uploading ${item} to ${cloudinaryPath}/${publicId}... `);
                await cloudinary.uploader.upload(fullLocalPath, {
                    folder: cloudinaryPath,
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
    console.log('Starting T.O.N.Y. Recursive Cloudinary Migration...');
    try {
        await uploadRecursive('public/images', 'tony');
        console.log('Migration Complete!');
    } catch (e) {
        console.error('Migration failed:', e);
    }
}

main();
