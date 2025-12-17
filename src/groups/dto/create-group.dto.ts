import { IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateGroupDto {
    @ApiProperty({ example: 'Engineering Team' })
    @IsString()
    @MinLength(2)
    name: string;

    @ApiPropertyOptional({ example: 'Backend and frontend developers' })
    @IsString()
    @IsOptional()
    description?: string;
}
