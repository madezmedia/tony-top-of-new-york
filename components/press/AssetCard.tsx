import React from 'react';
import { motion } from 'framer-motion';
import { Download, Image, Video, FileText, Palette } from 'lucide-react';
import { PressAsset, PressAssetCategory } from '../../types';
import { ANIMATION_PRESETS } from '../../utils/animations';

interface AssetCardProps {
  asset: PressAsset;
}

const categoryIcons: Record<PressAssetCategory, React.ElementType> = {
  photo: Image,
  video: Video,
  logo: Palette,
  document: FileText,
};

const categoryLabels: Record<PressAssetCategory, string> = {
  photo: 'PHOTO',
  video: 'VIDEO',
  logo: 'LOGO',
  document: 'DOC',
};

export const AssetCard: React.FC<AssetCardProps> = ({ asset }) => {
  const Icon = categoryIcons[asset.category];

  return (
    <motion.div
      variants={ANIMATION_PRESETS.itemVariants}
      className="group bg-neutral-surface border border-neutral-border rounded-lg overflow-hidden hover:border-primary-main/50 transition-colors"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={asset.thumbnailUrl}
          alt={asset.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute top-3 left-3 bg-primary-main/90 text-neutral-bg text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
          <Icon size={12} />
          {categoryLabels[asset.category]}
        </span>
      </div>

      {/* Content */}
      <div className="p-4">
        <h4 className="font-bold text-neutral-text group-hover:text-primary-main transition-colors mb-1">
          {asset.title}
        </h4>
        <p className="text-neutral-textSecondary text-sm line-clamp-2 mb-3">
          {asset.description}
        </p>

        {/* Metadata */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-muted mb-4">
          <span>{asset.format}</span>
          <span>{asset.fileSize}</span>
          {asset.resolution && <span>{asset.resolution}</span>}
          {asset.duration && <span>{asset.duration}</span>}
        </div>

        {/* Download Button */}
        <motion.a
          href={asset.downloadUrl}
          download
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center justify-center gap-2 w-full py-2.5 border-2 border-primary-main text-primary-main hover:bg-primary-main/10 rounded-md font-bold text-xs tracking-wider uppercase transition-colors"
        >
          <Download size={14} />
          Download
        </motion.a>
      </div>
    </motion.div>
  );
};
