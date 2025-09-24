import {
    BadRequestException,
    CanActivate,
    ConflictException,
    ExecutionContext,
    ForbiddenException,
    Injectable,
    InternalServerErrorException
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JsonWebTokenError, JwtService, TokenExpiredError } from "@nestjs/jwt";
import { Observable } from "rxjs";
import { Request } from "express";
import { UserRoles } from "src/enums/roles.enum";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private reflector: Reflector, private jwt: JwtService) { }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const isProtected = this.reflector.getAllAndOverride<boolean>('istrue', [
            context.getHandler(),
            context.getClass(),
        ]);

        const ctx = context.switchToHttp();
        const request = ctx.getRequest<Request & { role?: string; id?: string }>();


        console.log("token tekshirilyapti");
        if (!isProtected) {
            request.role = UserRoles.USER;
            return true;
        }

        const accessToken = request.cookies?.['accessToken'];

        if (!accessToken) {
            throw new BadRequestException('Access token cookie orqali yuborilmagan');
        }


        try {
            // Tokenni tekshirish
            const data = this.jwt.verify(accessToken, { secret: process.env.ACCESS_TOKEN_SECRET });

            // Requestga foydalanuvchi ID va rolni joylash
            request.id = data.id;
            const normalizedRole = String(data.role).toUpperCase();
            // Normalize Prisma Role (User/Admin/Moderator) -> UserRoles (USER/ADMIN/MODERATOR)
            if (normalizedRole === 'ADMIN') {
                request.role = UserRoles.ADMIN;
            } else if (normalizedRole === 'MODERATOR') {
                request.role = UserRoles.MODERATOR;
            } else {
                request.role = UserRoles.USER;
            }
            return true;
        } catch (error) {
            // Muddati tugagan token
            if (error instanceof TokenExpiredError) {
                throw new ForbiddenException('Token muddati tugagan');
            }

            // Noto‘g‘ri token
            if (error instanceof JsonWebTokenError) {
                console.log(error);

                throw new ConflictException('Noto‘g‘ri token');
            }

            // Boshqa xatoliklar
            throw new InternalServerErrorException('Server xatoligi');
        }
    }
}
