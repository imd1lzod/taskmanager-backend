import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailService } from 'src/helpers/mail.service';
import { SendInvitationDto } from './dtos/send-invitation.dto';
import { AcceptInvitationDto } from './dtos/accept-invitation.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class InvitationService {
  constructor(private readonly prisma: PrismaService, private readonly mail: MailService) {}

  private generateToken(): string {
    return randomBytes(24).toString('hex');
  }

  async sendInvitation(inviterId: number, dto: SendInvitationDto) {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const existingPending = await this.prisma.invitation.findFirst({
      where: { email: dto.email, status: 'PENDING' as any },
    });
    if (existingPending) {
      throw new ConflictException('Invitation already sent to this email.');
    }

    const token = this.generateToken();
    const invitation = await this.prisma.invitation.create({
      data: {
        email: dto.email,
        token,
        status: 'PENDING' as any,
        invitedById: inviterId,
        expiresAt,
      },
    });

    // Send email with accept link
    const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const inviteLink = `${baseUrl}/invite/${token}`;
    try {
      await this.mail.sendInvitationEmail(dto.email, inviteLink);
    } catch (e) {
      // Non-fatal: invitation exists; log/send back info
      // eslint-disable-next-line no-console
      console.error('Failed to send invitation email:', e?.message || e);
    }

    return { message: 'Invitation created', data: invitation };
  }

  async listInvitations(inviterId: number) {
    const items = await this.prisma.invitation.findMany({
      where: { invitedById: inviterId },
      orderBy: { createdAt: 'desc' },
      select: { id: true, email: true, token: true, status: true, createdAt: true, expiresAt: true },
    });
    return { message: 'Invitations', data: items };
  }

  async validateInvitation(token: string) {
    const invitation = await this.prisma.invitation.findUnique({ where: { token } });
    if (!invitation) throw new NotFoundException('Invitation not found');
    if (invitation.status !== 'PENDING') throw new BadRequestException('Invitation not active');
    if (invitation.expiresAt < new Date()) {
      await this.prisma.invitation.update({ where: { token }, data: { status: 'EXPIRED' as any } });
      throw new BadRequestException('Invitation expired');
    }
    return { message: 'Invitation valid', data: { email: invitation.email } };
  }

  async acceptInvitation(dto: AcceptInvitationDto) {
    const invitation = await this.prisma.invitation.findUnique({ where: { token: dto.token } });
    if (!invitation) throw new NotFoundException('Invitation not found');
    if (invitation.status !== 'PENDING') throw new BadRequestException('Invitation not active');
    if (invitation.expiresAt < new Date()) {
      await this.prisma.invitation.update({ where: { token: dto.token }, data: { status: 'EXPIRED' as any } });
      throw new BadRequestException('Invitation expired');
    }

    // If user exists, just mark accepted; else create a new user
    const existingUser = await this.prisma.user.findUnique({ where: { email: invitation.email } });
    let userId: number;
    if (existingUser) {
      userId = existingUser.id;
    } else {
      // Create a user from provided data
      const bcrypt = await import('bcrypt');
      const hashed = await bcrypt.hash(dto.password, 10);
      const created = await this.prisma.user.create({
        data: {
          name: dto.name,
          email: invitation.email,
          password: hashed,
          avatar: dto.avatar ?? null,
        },
      });
      userId = created.id;
    }

    await this.prisma.invitation.update({ where: { token: dto.token }, data: { status: 'ACCEPTED' as any } });

    return { message: 'Invitation accepted', data: { userId } };
  }
}


