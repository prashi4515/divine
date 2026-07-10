import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

/**
 * Response DTO for a single Work. Mirrors `@divine/types` workSchema for Swagger.
 * Controllers return plain objects shaped like this; ValidationPipe is not applied
 * to responses — the service is responsible for the mapping.
 */
export class WorkResponseDto {
  @ApiProperty({ format: "uuid", example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890" })
  id!: string;

  @ApiProperty({ example: "bg", description: "Stable work code used in public IDs" })
  code!: string;

  @ApiProperty({ example: "bhagavad-gita" })
  slug!: string;

  @ApiProperty({ example: "Bhagavad Gita" })
  title!: string;

  @ApiPropertyOptional({
    nullable: true,
    example: "The Song of the Lord — 700 verses across 18 chapters.",
  })
  description!: string | null;

  @ApiProperty({ example: 10 })
  sortOrder!: number;

  @ApiProperty({ example: true })
  isPublished!: boolean;

  @ApiProperty({ example: "2026-07-10T06:52:00.000Z" })
  createdAt!: string;

  @ApiProperty({ example: "2026-07-10T06:52:00.000Z" })
  updatedAt!: string;
}

export class WorksListResponseDto {
  @ApiProperty({ type: [WorkResponseDto] })
  data!: WorkResponseDto[];
}
