import { Field, ObjectType } from "type-graphql";

@ObjectType()
export default class Ad {
  @Field()
  id: number;

  @Field()
  title: string;

  @Field()
  description: string;
}
