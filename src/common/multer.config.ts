// src/common/multer.config.ts
import { diskStorage } from 'multer';
import { extname } from 'path';
import { BadRequestException } from '@nestjs/common';

export const productImageStorage = diskStorage({
  destination: './uploads/products',

  filename: (req, file, callback) => {
    // Nombre único: timestamp + número random + extensión original
    // Evita colisiones si dos archivos se llaman igual
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = extname(file.originalname); // .jpg, .png, etc.
    callback(null, `product-${uniqueSuffix}${ext}`);
  },
});

// Filtra qué tipos de archivo se aceptan, antes de guardarlos
export const imageFileFilter = (
  req: any,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
) => {
  if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
    return callback(
      new BadRequestException(
        'Solo se permiten imágenes (jpg, jpeg, png, webp)',
      ),
      false,
    );
  }
  callback(null, true);
};
