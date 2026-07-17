import { ConflictException, Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { AuthService } from "../auth/auth.service";
import type { AuthUserDto } from "../auth/auth.dto";
import type {
  UpdateProfileDto,
  UpdateReadingPreferenceDto,
} from "./account.dto";

export type ReadingPreferenceDto = {
  theme: string;
  language: string;
  translationSourceKey: string | null;
  commentarySourceKey: string | null;
  fontSize: string;
  fontFamily: string;
  readerWidth: string;
  lineHeight: string;
  layout: string;
  updatedAt: string;
};

@Injectable()
export class AccountService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auth: AuthService,
  ) {}

  async updateProfile(
    userId: string,
    input: UpdateProfileDto,
  ): Promise<AuthUserDto> {
    if (input.username) {
      const taken = await this.prisma.user.findFirst({
        where: {
          username: input.username,
          NOT: { id: userId },
        },
      });
      if (taken) {
        throw new ConflictException("Username is already taken");
      }
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        displayName: input.displayName,
        username: input.username === undefined ? undefined : input.username,
        avatarUrl: input.avatarUrl === undefined ? undefined : input.avatarUrl,
        preferredLanguage:
          input.preferredLanguage === undefined
            ? undefined
            : input.preferredLanguage,
        preferredTranslation:
          input.preferredTranslation === undefined
            ? undefined
            : input.preferredTranslation,
        preferredCommentary:
          input.preferredCommentary === undefined
            ? undefined
            : input.preferredCommentary,
        timeZone: input.timeZone === undefined ? undefined : input.timeZone,
        country: input.country === undefined ? undefined : input.country,
      },
    });

    if (input.preferredLanguage) {
      await this.prisma.readingPreference.upsert({
        where: { userId },
        create: {
          userId,
          language: input.preferredLanguage,
        },
        update: { language: input.preferredLanguage },
      });
    }

    return this.auth.toUserDto(user);
  }

  async getReadingPreference(userId: string): Promise<ReadingPreferenceDto> {
    const pref = await this.prisma.readingPreference.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });
    return this.toPrefDto(pref);
  }

  async updateReadingPreference(
    userId: string,
    input: UpdateReadingPreferenceDto,
  ): Promise<ReadingPreferenceDto> {
    const existing = await this.prisma.readingPreference.findUnique({
      where: { userId },
    });
    if (!existing) {
      const created = await this.prisma.readingPreference.create({
        data: {
          userId,
          theme: input.theme ?? "system",
          language: input.language ?? "en",
          translationSourceKey: input.translationSourceKey ?? null,
          commentarySourceKey: input.commentarySourceKey ?? null,
          fontSize: input.fontSize ?? "comfortable",
          fontFamily: input.fontFamily ?? "serif",
          readerWidth: input.readerWidth ?? "default",
          lineHeight: input.lineHeight ?? "relaxed",
          layout: input.layout ?? "classic",
        },
      });
      if (input.language) {
        await this.prisma.user.update({
          where: { id: userId },
          data: {
            preferredLanguage: input.language,
            preferredTranslation: input.translationSourceKey ?? undefined,
            preferredCommentary: input.commentarySourceKey ?? undefined,
          },
        });
      }
      return this.toPrefDto(created);
    }

    const updated = await this.prisma.readingPreference.update({
      where: { userId },
      data: {
        theme: input.theme,
        language: input.language,
        translationSourceKey:
          input.translationSourceKey === undefined
            ? undefined
            : input.translationSourceKey,
        commentarySourceKey:
          input.commentarySourceKey === undefined
            ? undefined
            : input.commentarySourceKey,
        fontSize: input.fontSize,
        fontFamily: input.fontFamily,
        readerWidth: input.readerWidth,
        lineHeight: input.lineHeight,
        layout: input.layout,
      },
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        preferredLanguage: input.language ?? undefined,
        preferredTranslation:
          input.translationSourceKey === undefined
            ? undefined
            : input.translationSourceKey,
        preferredCommentary:
          input.commentarySourceKey === undefined
            ? undefined
            : input.commentarySourceKey,
      },
    });

    return this.toPrefDto(updated);
  }

  private toPrefDto(pref: {
    theme: string;
    language: string;
    translationSourceKey: string | null;
    commentarySourceKey: string | null;
    fontSize: string;
    fontFamily: string;
    readerWidth: string;
    lineHeight: string;
    layout: string;
    updatedAt: Date;
  }): ReadingPreferenceDto {
    return {
      theme: pref.theme,
      language: pref.language,
      translationSourceKey: pref.translationSourceKey,
      commentarySourceKey: pref.commentarySourceKey,
      fontSize: pref.fontSize,
      fontFamily: pref.fontFamily,
      readerWidth: pref.readerWidth,
      lineHeight: pref.lineHeight,
      layout: pref.layout,
      updatedAt: pref.updatedAt.toISOString(),
    };
  }
}
