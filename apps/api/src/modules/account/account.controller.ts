import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { CurrentUser } from "../auth/current-user.decorator";
import type { AccessPayload } from "../auth/auth.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { MeResponseDto } from "../auth/auth.dto";
import { AccountService } from "./account.service";
import {
  UpdateProfileDto,
  UpdateReadingPreferenceDto,
} from "./account.dto";

@ApiTags("account")
@Controller("me")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AccountController {
  constructor(private readonly account: AccountService) {}

  @Patch("profile")
  @ApiOperation({ summary: "Update current user profile" })
  @ApiOkResponse({ type: MeResponseDto })
  async updateProfile(
    @CurrentUser() user: AccessPayload,
    @Body() body: UpdateProfileDto,
  ): Promise<MeResponseDto> {
    const data = await this.account.updateProfile(user.sub, body);
    return { data };
  }

  @Get("preferences")
  @ApiOperation({ summary: "Get reading preferences" })
  async getPreferences(@CurrentUser() user: AccessPayload) {
    const data = await this.account.getReadingPreference(user.sub);
    return { data };
  }

  @Patch("preferences")
  @ApiOperation({ summary: "Update reading preferences" })
  async updatePreferences(
    @CurrentUser() user: AccessPayload,
    @Body() body: UpdateReadingPreferenceDto,
  ) {
    const data = await this.account.updateReadingPreference(user.sub, body);
    return { data };
  }
}
