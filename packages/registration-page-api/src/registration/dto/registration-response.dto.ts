import { ApiProperty } from '@nestjs/swagger';

export enum RegistrationResponseError {
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  NO_SUCH_ORGANIZATION = 'NO_SUCH_ORGANIZATION',
  TOO_LATE = 'TOO_LATE',
}

export class RegistrationResponseDto {
  @ApiProperty()
  error?: RegistrationResponseError;
}
