import { ApiProperty } from '@nestjs/swagger';

export class AttendanceResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1, description: 'Client id' })
  client_id: number;

  @ApiProperty({ example: '2026-10-10T12:00:00.000Z' })
  check_in: string;

  @ApiProperty({ example: null, nullable: true })
  check_out: string | null;

  @ApiProperty({ example: '2026-10-10T12:00:00.000Z' })
  created_at: string;
}
