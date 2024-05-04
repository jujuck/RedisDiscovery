import { ILike } from "typeorm";
import Ad from "../entity/ad";
import { Arg, Query, Resolver } from "type-graphql";

@Resolver()
class AdResolver {
  @Query(() => [Ad])
  async getAllAdsByKeyword(@Arg("keyword") keyword: string) {
    return await Ad.find({
      where: { description: ILike(`%${keyword}%`) },
    });
  }
}
export default AdResolver;
