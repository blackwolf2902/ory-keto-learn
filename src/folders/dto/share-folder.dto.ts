import { IsString, IsOptional, IsIn } from 'class-validator';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';

export class ShareFolderDto {
    @ApiPropertyOptional({ example: 'user-uuid-here' })
    @IsString()
    @IsOptional()
    userId?: string;

    @ApiPropertyOptional({ example: 'group-uuid-here' })
    @IsString()
    @IsOptional()
    groupId?: string;

    @ApiProperty({ example: 'viewer', enum: ['viewer', 'editor'] })
    @IsString()
    @IsIn(['viewer', 'editor'])
    relation: 'viewer' | 'editor';
}
