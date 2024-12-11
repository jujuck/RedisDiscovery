import { setTimeout as sleep } from "node:timers/promises";
import { Arg, Mutation, Query, Resolver } from "type-graphql";
import Ad from "../type/ad";
import { ads } from "../db/randomAds";
import redisClient from "../redis.config";

let index = 1000;

@Resolver()
class AdResolver {
  @Query(() => [Ad])
  async getAllAdsByKeyword(
    @Arg("keyword", { nullable: true }) keyword: string
  ) {
    const cache = await redisClient.get(keyword);

    if (cache) return JSON.parse(cache);
    // On simule ici l'attente d'une requete longue et complexe
    await sleep(2500);
    const result: Ad[] = keyword
      ? ads.filter((ad: Ad) => ad.title.includes(keyword))
      : ads;
    redisClient.set(keyword, JSON.stringify(result), { EX: 30 });
    return result;
  }

  @Mutation(() => Ad)
  async createNewAd(
    @Arg("title") title: string,
    @Arg("description") description: string
  ) {
    const result = { id: ++index, title, description };
    ads.push(result);
    return result;
  }
}
export default AdResolver;
