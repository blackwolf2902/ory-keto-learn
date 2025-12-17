import { IsString, IsOptional, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDocumentDto {
    @ApiProperty({ example: 'Project Roadmap' })
    @IsString()
    @MinLength(1)
    title: string;

    @ApiPropertyOptional({ example: 'This document outlines our Q4 goals...' })
    @IsString()
    @IsOptional()
    content?: string;

    @ApiPropertyOptional({ example: 'folder-uuid-here', description: 'Parent folder ID for inheritance' })
    @IsString()
    @IsOptional()
    folderId?: string;
}
