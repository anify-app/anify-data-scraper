import JikanTS from "jikants";
import cleanMalArrayFields from "../utils/cleanMalArrayFields";
import determineStatus from "../utils/determineStatus";
import determineType from "../utils/determineType";
import slugify from "slugify";
import _ from "lodash";

const apiScraper = async (
  ayakashi: import("@ayakashi/types").IAyakashiInstance,
  input: { id: number; index: number; total: number }
) => {
  // give status update
  console.log(`🟡 [IN PROGRESS] - (${input.index + 1}/${input.total})`);

  const malAnime = await JikanTS.Anime.byId(input.id);

  if (!malAnime) {
    console.log(
      `🔵 [SKIPPED] - No anime found with ID ${input?.id}, skipping item...`
    );
    return null;
  }

  const anime = {
    title: malAnime?.title,
    relations: _.reduce(
      malAnime?.related,
      (result, value, key) => {
        const relationType = _.camelCase(key);
        if (relationType === "adaptation") return {};
        return (result = {
          ...{ [relationType]: value.map(({ name }) => slugify(name)) },
          ...result,
        });
      },
      {}
    ),

    description: malAnime?.synopsis,
    trailer: malAnime?.trailer_url,
    type: determineType(malAnime?.type || ""),
    episodes: malAnime?.episodes,
    status: determineStatus(malAnime?.status || ""),
    mainImage: malAnime?.image_url,
    rating: malAnime?.rating,
    genres: cleanMalArrayFields(malAnime?.genres),
    season: malAnime?.premiered?.split(" ")[0],
    airedStart: malAnime?.aired
      ? new Date(malAnime?.aired?.from).toISOString()
      : null,
    airedEnd: malAnime?.aired
      ? new Date(malAnime?.aired?.to).toISOString()
      : null,
    duration: malAnime?.duration,
    producers: cleanMalArrayFields(malAnime?.producers),
    licensors: cleanMalArrayFields(malAnime?.licensors),
    studios: cleanMalArrayFields(malAnime?.studios),
    sourceMaterialType: malAnime?.source,
    englishTitle: malAnime?.title_english,
    japaneseTitle: malAnime?.title_japanese,
    synonyms: malAnime?.title_synonyms,
    sources: malAnime ? [{ name: "MyAnimeList", url: malAnime?.url }] : [],
    score: malAnime?.score,
  };

  if (anime.genres.includes("Hentai")) {
    console.log(`🔵 [SKIPPED] - Hentai detected, skipping item...`);
    return null;
  }

  return anime;
};

export default apiScraper;
