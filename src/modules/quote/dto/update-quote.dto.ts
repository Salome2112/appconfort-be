// src/quotes/dto/update-quote.dto.ts
import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateQuoteDto } from './create-quote.dto';

// No se permite reasignar el clientId de una cotización ya creada
export class UpdateQuoteDto extends PartialType(
  OmitType(CreateQuoteDto, ['clientId'] as const),
) {}
