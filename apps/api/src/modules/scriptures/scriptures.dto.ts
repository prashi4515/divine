import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";

export const STRUCTURE_PRESETS = [
  { key: "gita", label: "Bhagavad Gita", levels: ["Chapter", "Verse"] },
  { key: "bible", label: "Bible", levels: ["Testament", "Book", "Chapter", "Verse"] },
  { key: "mahabharata", label: "Mahabharata", levels: ["Book", "Section", "Chapter", "Verse"] },
  { key: "ramayana", label: "Ramayana", levels: ["Kanda", "Chapter", "Verse"] },
  { key: "quran", label: "Quran", levels: ["Surah", "Verse"] },
  { key: "tripitaka", label: "Tripitaka", levels: ["Basket", "Book", "Chapter", "Verse"] },
  { key: "custom", label: "Custom", levels: [] },
] as const;

export class CreateScriptureDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  slug!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(64)
  shortName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(128)
  religion?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(64)
  originalLanguage?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  author?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(128)
  estimatedDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  coverImageUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bannerImageUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(32)
  themeColor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(32)
  accentColor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  seoTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  seoDescription?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  seoKeywords?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  canonicalUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ogImageUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  copyright?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  license?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  website?: string;

  @ApiPropertyOptional({ enum: ["public", "private", "unlisted"] })
  @IsOptional()
  @IsIn(["public", "private", "unlisted"])
  visibility?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  defaultLanguage?: string;

  @ApiPropertyOptional({ enum: ["ltr", "rtl"] })
  @IsOptional()
  @IsIn(["ltr", "rtl"])
  readingDirection?: string;

  @ApiPropertyOptional({ type: [String], example: ["Chapter", "Verse"] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  structureLevels?: string[];

  @ApiPropertyOptional({ enum: ["draft", "review", "published", "archived"] })
  @IsOptional()
  @IsIn(["draft", "review", "published", "archived"])
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({ description: "Public work code (e.g. bg). Auto-derived from slug if omitted." })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  workCode?: string;
}

export class UpdateScriptureDto extends PartialType(CreateScriptureDto) {}

export class ScriptureResponseDto {
  @ApiProperty()
  id!: string;

  @ApiPropertyOptional({ nullable: true })
  workId!: string | null;

  @ApiPropertyOptional({ nullable: true })
  workCode!: string | null;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  slug!: string;

  @ApiPropertyOptional({ nullable: true })
  shortName!: string | null;

  @ApiPropertyOptional({ nullable: true })
  description!: string | null;

  @ApiPropertyOptional({ nullable: true })
  religion!: string | null;

  @ApiPropertyOptional({ nullable: true })
  originalLanguage!: string | null;

  @ApiPropertyOptional({ nullable: true })
  author!: string | null;

  @ApiPropertyOptional({ nullable: true })
  estimatedDate!: string | null;

  @ApiPropertyOptional({ nullable: true })
  coverImageUrl!: string | null;

  @ApiPropertyOptional({ nullable: true })
  bannerImageUrl!: string | null;

  @ApiPropertyOptional({ nullable: true })
  themeColor!: string | null;

  @ApiPropertyOptional({ nullable: true })
  accentColor!: string | null;

  @ApiPropertyOptional({ nullable: true })
  seoTitle!: string | null;

  @ApiPropertyOptional({ nullable: true })
  seoDescription!: string | null;

  @ApiPropertyOptional({ nullable: true })
  seoKeywords!: string | null;

  @ApiPropertyOptional({ nullable: true })
  canonicalUrl!: string | null;

  @ApiPropertyOptional({ nullable: true })
  ogImageUrl!: string | null;

  @ApiPropertyOptional({ nullable: true })
  copyright!: string | null;

  @ApiPropertyOptional({ nullable: true })
  license!: string | null;

  @ApiPropertyOptional({ nullable: true })
  website!: string | null;

  @ApiProperty()
  visibility!: string;

  @ApiPropertyOptional({ nullable: true })
  defaultLanguage!: string | null;

  @ApiProperty()
  readingDirection!: string;

  @ApiProperty({ type: [String] })
  structureLevels!: string[];

  @ApiProperty()
  status!: string;

  @ApiProperty()
  isPublished!: boolean;

  @ApiProperty()
  bookCount!: number;

  @ApiProperty()
  chapterCount!: number;

  @ApiProperty()
  verseCount!: number;

  @ApiProperty()
  translationCount!: number;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}

export class ScriptureListMetaDto {
  @ApiProperty()
  page!: number;

  @ApiProperty()
  pageSize!: number;

  @ApiProperty()
  total!: number;

  @ApiProperty()
  totalPages!: number;
}

export class ScriptureListResponseDto {
  @ApiProperty({ type: [ScriptureResponseDto] })
  data!: ScriptureResponseDto[];

  @ApiProperty({ type: ScriptureListMetaDto })
  meta!: ScriptureListMetaDto;
}

export class ScriptureDetailResponseDto {
  @ApiProperty({ type: ScriptureResponseDto })
  data!: ScriptureResponseDto;
}

export class CreateNodeDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  label!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  title!: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  parentId?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  sortOrder?: number;
}

export class UpdateNodeDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  label?: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  parentId?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  sortOrder?: number;
}

export class ReorderNodesDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  orderedIds!: string[];
}

export class ScriptureNodeDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  scriptureId!: string;

  @ApiPropertyOptional({ nullable: true })
  parentId!: string | null;

  @ApiProperty()
  label!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  sortOrder!: number;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;

  @ApiProperty({ type: [ScriptureNodeDto] })
  children!: ScriptureNodeDto[];
}

export class CreateMediaDto {
  @ApiProperty({ enum: ["cover", "banner", "icon", "illustration", "audio", "pdf", "video", "other"] })
  @IsIn(["cover", "banner", "icon", "illustration", "audio", "pdf", "video", "other"])
  kind!: string;

  @ApiProperty()
  @IsString()
  fileName!: string;

  @ApiProperty()
  @IsString()
  mimeType!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  sizeBytes?: number;

  @ApiProperty({ description: "URL or data URI placeholder until object storage exists" })
  @IsString()
  @MinLength(1)
  url!: string;
}

export class MediaAssetDto {
  @ApiProperty()
  id!: string;

  @ApiPropertyOptional({ nullable: true })
  scriptureId!: string | null;

  @ApiProperty()
  kind!: string;

  @ApiProperty()
  fileName!: string;

  @ApiProperty()
  mimeType!: string;

  @ApiProperty()
  sizeBytes!: number;

  @ApiProperty()
  url!: string;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}
