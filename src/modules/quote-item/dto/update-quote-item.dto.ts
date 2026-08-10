// src/quote-items/dto/update-quote-item.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateQuoteItemDto } from './create-quote-item.dto';

// Todos los campos son opcionales, incluido productId
// (permite cambiar el producto de un ítem ya creado)
export class UpdateQuoteItemDto extends PartialType(CreateQuoteItemDto) {}
