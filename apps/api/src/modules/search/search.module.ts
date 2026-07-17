import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { SEARCH_ENGINE } from "./engine/search-engine";
import { PostgresSearchEngine } from "./engine/postgres-search.engine";
import { PublicSearchController } from "./public-search.controller";
import { SearchController } from "./search.controller";
import { SearchService } from "./search.service";
import { VerseSearchService } from "./verse-search.service";

@Module({
  imports: [AuthModule],
  controllers: [PublicSearchController, SearchController],
  providers: [
    SearchService,
    VerseSearchService,
    PostgresSearchEngine,
    {
      provide: SEARCH_ENGINE,
      useExisting: PostgresSearchEngine,
    },
  ],
  exports: [SearchService, VerseSearchService, SEARCH_ENGINE],
})
export class SearchModule {}
