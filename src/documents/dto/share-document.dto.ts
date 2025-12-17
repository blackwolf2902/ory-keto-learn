import { IsString, IsOptional, IsIn } from 'class-validator';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';

/**
 * DTO for sharing a document
 * 
 * LEARNING: Sharing Options
 * 
 * 1. Share with user (direct relation):
 *    { userId: 'alice-id', relation: 'viewer' }
 *    → Document:xxx#viewer@User:alice-id
 * 
 * 2. Share with group (subject set):
 *    { groupId: 'engineering-id', relation: 'editor' }
 *    → Document:xxx#editor@Group:engineering-id#member
 */
export class ShareDocumentDto {
    @ApiPropertyOptional({
        example: 'user-uuid-here',
        description: 'User ID to share with (mutually exclusive with groupId)'
    })
    @IsString()
    @IsOptional()
    userId?: string;

    @ApiPropertyOptional({
        example: 'group-uuid-here',
        description: 'Group ID to share with (all members get access)'
    })
    @IsString()
    @IsOptional()
    groupId?: string;

    @ApiProperty({
        example: 'viewer',
        enum: ['viewer', 'editor'],
        description: 'Permission level to grant'
    })
    @IsString()
    @IsIn(['viewer', 'editor'])
    relation: 'viewer' | 'editor';
}
