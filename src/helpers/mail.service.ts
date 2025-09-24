import { Injectable } from '@nestjs/common';
import nodemailer from 'nodemailer';

@Injectable()
export class MailService {
    private transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    async sendInvitationEmail(to: string, inviteLink: string) {
        const from = process.env.MAIL_FROM || 'no-reply@taskmanager.local';
        const subject = 'Siz jamoaga taklif qilindingiz';
        const html = `
            <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Arial, sans-serif;">
                <h2>Task Manager</h2>
                <p>Siz jamoaga qo'shilish uchun taklif oldingiz. Qabul qilish uchun quyidagi havolani bosing:</p>
                <p><a href="${inviteLink}" style="background:#4f46e5;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none">Taklifni qabul qilish</a></p>
                <p>Agar tugma ishlamasa, quyidagi havolani brauzerga nusxa ko'chiring:</p>
                <p><a href="${inviteLink}">${inviteLink}</a></p>
            </div>
        `;

        await this.transporter.sendMail({ from, to, subject, html });
    }
}


