import { setTimeout as sleep } from "node:timers/promises";
import { Arg, Mutation, Query, Resolver } from "type-graphql";
import Ad from "../type/ad";
import { ads } from "../db/randomAds";

let index = 1000;

@Resolver()
class AdResolver {
  @Query(() => [Ad])
  async getAllAdsByKeyword(
    @Arg("keyword", { nullable: true }) keyword: string
  ) {
    // On simule ici l'attente d'une requete longue et complexe
    await sleep(2500);
    if (keyword) {
      return ads.filter((ad: Ad) => ad.title.includes(keyword));
    }
    return ads;
  }

  @Mutation(() => Ad)
  async createNewAd(
    @Arg("title") title: string,
    @Arg("description") description: string
  ) {
    return ads.push({ id: ++index, title, description });
  }
}
export default AdResolver;
