import { ILike } from "typeorm";
import Ad from "../entity/ad";
import { Arg, Mutation, Query, Resolver } from "type-graphql";
import { redisClient } from "../index";

@Resolver()
class AdResolver {
  @Query(() => [Ad])
  async getAllAdsByKeyword(@Arg("keyword") keyword: string) {
    const cacheResult = await redisClient.get(keyword);
    if (cacheResult !== null) {
      console.log("from cache");
      return JSON.parse(cacheResult);
    } else {
      const dbResult = await Ad.find({
        where: { description: ILike(`%${keyword}%`) },
      });
      redisClient.set(keyword, JSON.stringify(dbResult));
      return dbResult;
    }
  }

  @Mutation(() => Ad)
  async createNewAd(
    @Arg("title") title: string,
    @Arg("description") description: string
  ) {
    return await Ad.save({ title, description });
  }
}
export default AdResolver;
