import { PartialType } from '@nestjs/mapped-types';
import { CreateClientDto } from './create-client.dto';

/**
 * DTO para actualizar un cliente
 *
 * Extiende de CreateClientDto pero todos los campos son opcionales.
 * Permite actualizar únicamente los campos enviados en el body.
 */
export class UpdateClientDto extends PartialType(CreateClientDto) {}
