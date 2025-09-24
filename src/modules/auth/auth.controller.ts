import { Body, Controller, ForbiddenException, Get, Param, ParseIntPipe, Patch, Post, Put, Req, Res, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dtos/register.auth.dto";
import { LoginDto } from "./dtos/login.auth.dto";
import { FileInterceptor } from "@nestjs/platform-express"
import { diskStorage } from "multer";
import { extname } from "path";
import { ApiBody, ApiConsumes, ApiProperty } from "@nestjs/swagger";
import { UploadAvatarDto } from "./dtos/avatar";
import type { Request, Response } from "express";
import { Protected } from "src/decorators/protected.decorator";
import { AuthGuard } from "src/guards/check-auth-guard";

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('register')
    async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
        return await this.authService.register(dto, res)
    }

    @Post('login')
    async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
        return await this.authService.login(dto, res)
    }

    @Patch('avatar/:userId')
    @ApiConsumes('multipart/form-data')
    @ApiBody({ type: UploadAvatarDto })
    @UseInterceptors(
        FileInterceptor('avatar', {
            storage: diskStorage({
                destination: './uploads/avatars',
                filename: (req, file, callback) => {
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                    const ext = extname(file.originalname);
                    const filename = `avatar-${uniqueSuffix}${ext}`;
                    callback(null, filename);
                },
            }),
            fileFilter: (req, file, callback) => {
                // Check if file is an image
                if (!file.mimetype.startsWith('image/')) {
                    return callback(new Error('Only image files are allowed'), false);
                }
                callback(null, true);
            },
            limits: {
                fileSize: 5 * 1024 * 1024, // 5MB limit
            },
        }),
    )
    async updateAvatar(
        @Param('userId', ParseIntPipe) userId: number,
        @UploadedFile() file: Express.Multer.File,
    ) {
        return this.authService.setAvatar(file, userId);
    }

    @Post('refresh')
    async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        return this.authService.refresh(req, res)
    }

    @Get('me')
    @Protected(true)
    @UseGuards(AuthGuard)
    async me(@Req() req: any) {
        const userId = Number(req.id)
        return this.authService.me(userId)
    }
}