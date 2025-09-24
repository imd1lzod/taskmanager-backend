import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { InvitationService } from './invitation.service';
import { SendInvitationDto } from './dtos/send-invitation.dto';
import { AcceptInvitationDto } from './dtos/accept-invitation.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Protected } from 'src/decorators/protected.decorator';
import { AuthGuard } from 'src/guards/check-auth-guard';

@ApiTags('Invitations')
@Controller('invitations')
export class InvitationController {
  constructor(private readonly invitationService: InvitationService) {}

  @Get()
  @Protected(true)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  list(@Req() req: any) {
    const inviterId = Number(req.id);
    return this.invitationService.listInvitations(inviterId);
  }

  @Post()
  @Protected(true)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  sendInvitation(@Body() dto: SendInvitationDto, @Req() req: any) {
    const inviterId = Number(req.id);
    return this.invitationService.sendInvitation(inviterId, dto);
  }

  @Get(':token')
  validateToken(@Param('token') token: string) {
    return this.invitationService.validateInvitation(token);
  }

  @Post('accept')
  acceptInvitation(@Body() dto: AcceptInvitationDto) {
    return this.invitationService.acceptInvitation(dto);
  }
}


