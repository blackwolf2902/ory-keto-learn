import { IsString, IsOptional, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddMemberDto {
    @ApiProperty({ example: 'user-uuid-here' })
    @IsString()
    userId: string;

    @ApiPropertyOptional({ example: 'member', enum: ['member', 'admin'] })
    @IsString()
    @IsOptional()
    @IsIn(['member', 'admin'])
    role?: string;
}
