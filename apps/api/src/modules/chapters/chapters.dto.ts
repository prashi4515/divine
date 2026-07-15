import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

/**
 * Nested work summary on chapter responses. Mirrors `@divine/types`
 * chapterWorkSummarySchema for Swagger.
 */
export class ChapterWorkSummaryDto {
  @ApiProperty({ example: "bg", description: "Stable work code used in public IDs" })
  code!: string;

  @ApiProperty({ example: "bhagavad-gita" })
  slug!: string;

  @ApiProperty({ example: "Bhagavad Gita" })
  title!: string;
}

/**
 * Response DTO for a single Chapter. Mirrors `@divine/types` chapterSchema.
 */
export class ChapterResponseDto {
  @ApiProperty({ format: "uuid", example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890" })
  id!: string;

  @ApiProperty({
    example: "bg.1",
    description: "Stable public identity — {workCode}.{chapterNumber}",
  })
  publicId!: string;

  @ApiProperty({ example: 1 })
  number!: number;

  @ApiPropertyOptional({
    nullable: true,
    example: "Arjuna Vishada Yoga",
  })
  title!: string | null;

  @ApiProperty({ example: 47 })
  verseCount!: number;

  @ApiProperty({ example: 1 })
  sortOrder!: number;

  @ApiProperty({ example: true })
  isPublished!: boolean;

  @ApiProperty({ type: ChapterWorkSummaryDto })
  work!: ChapterWorkSummaryDto;

  @ApiProperty({ example: "2026-07-10T06:52:00.000Z" })
  createdAt!: string;

  @ApiProperty({ example: "2026-07-10T06:52:00.000Z" })
  updatedAt!: string;
}

export class ChaptersListResponseDto {
  @ApiProperty({ type: [ChapterResponseDto] })
  data!: ChapterResponseDto[];
}

export class ChapterDetailResponseDto {
  @ApiProperty({ type: ChapterResponseDto })
  data!: ChapterResponseDto;
}
