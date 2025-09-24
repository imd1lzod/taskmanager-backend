import { Injectable, BadRequestException, UnauthorizedException, Res, ForbiddenException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from './dtos/register.auth.dto';
import { LoginDto } from './dtos/login.auth.dto';
import * as bcrypt from 'bcrypt';
import { JsonWebTokenError, JwtService, TokenExpiredError } from '@nestjs/jwt';
import { Request, Response } from 'express';

@Injectable()
export class AuthService {
    constructor(private readonly prisma: PrismaService, private jwtService: JwtService) { }

    async register(payload: RegisterDto, res: Response) {
        const existingUser = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { name: payload.name },
                    { email: payload.email }
                ]
            }
        });

        if (existingUser) {
            throw new BadRequestException('Foydalanuvchi allaqachon ro\'yxatdan o\'tgan!');
        }

        const hashedPassword = await bcrypt.hash(payload.password, 10);

        const user = await this.prisma.user.create({
            data: {
                ...payload,
                password: hashedPassword,
            },
        });

        const accessToken = this.jwtService.sign({ id: user.id, role: user.role }, {
            secret: process.env.ACCESS_TOKEN_SECRET,
            expiresIn: process.env.ACCESS_TOKEN_EXPIRE
        })

        const refreshToken = this.jwtService.sign({ id: user.id, role: user.role }, {
            secret: process.env.REFRESH_TOKEN_SECRET,
            expiresIn: process.env.REFRESH_TOKEN_EXPIRE
        })

        res.cookie("accessToken", accessToken)
        res.cookie("refreshToken", refreshToken)

        return {
            message: 'Foydalanuvchi muvaffaqiyatli ro\'yxatdan o\'tkazildi!',
            data: {
                id: user.id,
                role: user.role
            },
            tokens: { accessToken, refreshToken }
        };
    }


    async login(payload: LoginDto, res: Response) {
        const user = await this.prisma.user.findUnique({
            where: { email: payload.email },
        });

        if (!user) {
            throw new UnauthorizedException('Foydalanuvchi ro\'yxatdan o\'tmagan!');
        }

        const passwordMatch = await bcrypt.compare(payload.password, user.password);

        if (!passwordMatch) {
            throw new UnauthorizedException('Email yoki parol noto\'g\'ri');
        }

        const accessToken = this.jwtService.sign({ id: user.id, role: user.role }, {
            secret: process.env.ACCESS_TOKEN_SECRET,
            expiresIn: process.env.ACCESS_TOKEN_EXPIRE
        })

        const refreshToken = this.jwtService.sign({ id: user.id, role: user.role }, {
            secret: process.env.REFRESH_TOKEN_SECRET,
            expiresIn: process.env.REFRESH_TOKEN_EXPIRE
        })

        res.cookie("accessToken", accessToken)
        res.cookie("refreshToken", refreshToken)
        console.log("Login ishlayapti");
        

        return {
            message: 'Kirish muvaffaqiyatli!',
            data: {
                id: user.id,
                role: user.role
            },
            tokens: { accessToken, refreshToken }
        };
    }

    async setAvatar(file: Express.Multer.File, userId: number) {
        console.log(file, userId);

        if (!file) {
            throw new BadRequestException('No file uploaded');
        }

        const avatarUrl = `/uploads/avatars/${file.filename}`;

        const user = await this.prisma.user.update({
            where: { id: userId },
            data: { avatar: avatarUrl },
        });

        return {
            message: 'Avatar updated successfully!',
            data: {
                userId: user.id,
                avatar: user.avatar,
            },
        };
    }

    async refresh(req: Request, res: Response) {
        const refreshToken = req.cookies?.['refreshToken']

        if (!refreshToken) {
            throw new ForbiddenException('Refresh Token not found!')
        }

        try {
            const data = this.jwtService.verify(refreshToken, {
                secret: process.env.REFRESH_TOKEN_SECRET
            })

            const newAccessToken = this.jwtService.sign({ id: data.id, role: data.role }, {
                secret: process.env.ACCESS_TOKEN_SECRET,
                expiresIn: process.env.ACCESS_TOKEN_EXPIRE
            })

            res.cookie("accessToken", newAccessToken)

            return {
                message: 'Token yangilandi!'
            }
        } catch (error) {
            if (error instanceof TokenExpiredError) {
                throw new ForbiddenException('Refresh token expired!');
            }

            if (error instanceof JsonWebTokenError) {
                throw new ConflictException('Invalid refresh token!');
            }

            throw new InternalServerErrorException('Internal server error');

        }
    }

    async me(userId: number) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, email: true, avatar: true, role: true }
        });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        return { data: user };
    }
}
