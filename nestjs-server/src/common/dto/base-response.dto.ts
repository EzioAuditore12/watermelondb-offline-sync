import { ApiProperty } from '@nestjs/swagger';

export class BaseResponseDto<T extends object = object> {
  @ApiProperty({ type: 'boolean', default: true })
  success: boolean;

  @ApiProperty()
  message: string;

  [key: string]: T[keyof T] | boolean | string;
}
