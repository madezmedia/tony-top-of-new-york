import React from 'react';
import { Cloudinary } from '@cloudinary/url-gen';
import { auto } from '@cloudinary/url-gen/actions/resize';
import { autoGravity } from '@cloudinary/url-gen/qualifiers/gravity';
import { AdvancedImage } from '@cloudinary/react';
import { getCloudName } from '../../lib/media/cloudinary';

const cld = new Cloudinary({ cloud: { cloudName: getCloudName() || 'dkwpabjaq' } });

interface CloudinaryImageProps {
    publicId: string;
    alt: string;
    className?: string;
    width?: number;
    height?: number;
}

export const CloudinaryImage: React.FC<CloudinaryImageProps> = ({ publicId, alt, className, width, height }) => {
    // If no public ID is provided, fallback to standard img to avoid crash
    if (!publicId) return <img src="" alt={alt} className={className} />;

    const img = cld
        .image(publicId)
        .format('auto')
        .quality('auto');

    if (width && height) {
        img.resize(auto().gravity(autoGravity()).width(width).height(height));
    } else if (width) {
        img.resize(auto().gravity(autoGravity()).width(width));
    }

    return <AdvancedImage cldImg={img} alt={alt} className={className} />;
};
