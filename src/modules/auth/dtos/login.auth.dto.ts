import { ApiProperty } from "@nestjs/swagger"
import { IsEmail, IsString, MinLength } from "class-validator"

export class LoginDto {
    @ApiProperty({ type: "string", example: 'messi_2022', description: 'user username' })
    @IsString()
    email: string

    @ApiProperty({ type: "string", example: '1234', description: 'user password' })
    @IsString()
    @MinLength(4)
    password: string
}