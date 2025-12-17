import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
    @ApiProperty({ example: 'alice@example.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'Alice Smith' })
    @IsString()
    @MinLength(2)
    name: string;
}
