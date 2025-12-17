import { IsString, IsOptional, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFolderDto {
    @ApiProperty({ example: 'Projects' })
    @IsString()
    @MinLength(1)
    name: string;

    @ApiPropertyOptional({ example: 'All project files' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional({
        example: 'parent-folder-uuid',
        description: 'Parent folder ID for nested folders (enables permission inheritance)'
    })
    @IsString()
    @IsOptional()
    parentId?: string;
}
