import cloudinaryModule from 'cloudinary';
const { v2: cloudinary } = cloudinaryModule;

// T.O.N.Y. env variables
cloudinary.config({
    cloud_name: process.env.VITE_CLOUDINARY_CLOUD_NAME || 'tonydemo',
    api_key: process.env.VITE_CLOUDINARY_API_KEY || '12345',
    api_secret: process.env.VITE_CLOUDINARY_API_SECRET || 'abcde'
});

async function uploadImages() {
    console.log('Uploading images to Cloudinary...');

    const results = [];

    const images = [
        '/Users/michaelshaw/.gemini/antigravity/tmp/image_0.png',
        '/Users/michaelshaw/.gemini/antigravity/tmp/image_1.png',
        '/Users/michaelshaw/.gemini/antigravity/tmp/image_2.png'
    ];

    for (let i = 0; i < images.length; i++) {
        try {
            const result = await cloudinary.uploader.upload(images[i], {
                folder: 'tony/cast',
                public_id: `jennifer-askew-diamond-${i + 1}`,
                overwrite: true,
                resource_type: "image"
            });
            console.log(`Success uploading image ${i + 1}: ${result.secure_url}`);
            results.push(result.secure_url);
        } catch (e) {
            console.error(`Error uploading image ${i + 1}`, e);
        }
    }
}

uploadImages();
