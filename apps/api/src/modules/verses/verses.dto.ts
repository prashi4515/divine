import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from "class-validator";

export class VerseTranslationDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  languageCode!: string;

  @ApiProperty()
  languageName!: string;

  @ApiProperty()
  sourceKey!: string;

  @ApiProperty()
  sourceDisplayName!: string;

  @ApiProperty()
  text!: string;

  @ApiProperty()
  isPublished!: boolean;
}

export class VerseResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  publicId!: string;

  @ApiProperty()
  number!: number;

  @ApiProperty()
  sanskritText!: string;

  @ApiPropertyOptional({ nullable: true })
  transliteration!: string | null;

  @ApiPropertyOptional({ nullable: true })
  meaning!: string | null;

  @ApiPropertyOptional({ nullable: true })
  commentary!: string | null;

  @ApiPropertyOptional({ nullable: true })
  seoTitle!: string | null;

  @ApiPropertyOptional({ nullable: true })
  seoDescription!: string | null;

  @ApiProperty()
  sortOrder!: number;

  @ApiProperty()
  isPublished!: boolean;

  @ApiProperty()
  chapterPublicId!: string;

  @ApiProperty()
  chapterNumber!: number;

  @ApiProperty()
  workCode!: string;

  @ApiProperty({ type: [VerseTranslationDto] })
  translations!: VerseTranslationDto[];

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}

export class UpdateVerseDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sanskritText?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  transliteration?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  meaning?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  commentary?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  seoTitle?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  seoDescription?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({ description: "English translation text (default source)" })
  @IsOptional()
  @IsString()
  translationText?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(16)
  translationLanguageCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}

export class UpdateTranslationDto {
  @ApiProperty()
  @IsString()
  text!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}

export class ContentRevisionDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  entityType!: string;

  @ApiProperty()
  entityId!: string;

  @ApiPropertyOptional({ nullable: true })
  note!: string | null;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  snapshot!: Record<string, unknown>;
}
