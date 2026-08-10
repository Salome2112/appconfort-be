import { memoryStorage } from 'multer';
import { extname } from 'path';
import { BadRequestException } from '@nestjs/common';

export const productImageStorage = memoryStorage();

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
