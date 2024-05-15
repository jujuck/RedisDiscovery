import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { buildSchema } from "type-graphql";
import dataSource from "./config";
import AdResolver from "./resolvers/ad";
import Ad from "./entity/ad";
import { createClient } from "redis";

export const redisClient = createClient({ url: "redis://redis" });

redisClient.on("error", (err) => {
  console.log("Redis Client Error", err);
});
redisClient.on("connect", () => {
  console.log("redis connected");
});

const start = async () => {
  await redisClient.connect();
  await dataSource.initialize();

  const adsCount = await Ad.count();

  console.log("adsCount", adsCount);

  if (adsCount === 0) {
    for (let i = 0; i < 100_000; i++) {
      await Ad.save({
        title: "Lorem Ipsum",
        description: `
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras condimentum, ipsum ut sollicitudin feugiat, felis velit feugiat magna, non feugiat lacus libero quis purus. Cras pellentesque purus porta augue accumsan lobortis. Suspendisse a sodales felis, a laoreet justo. Curabitur imperdiet nibh non mollis condimentum. Duis convallis tellus vel bibendum finibus. Sed pharetra erat sed purus bibendum, id condimentum turpis mollis. Praesent commodo placerat turpis vitae fermentum. Duis eleifend commodo lorem, ut facilisis tortor. Nullam est tortor, blandit ultricies tincidunt ut, ullamcorper in urna. Maecenas et magna interdum, volutpat mi in, malesuada turpis. Sed placerat eros arcu, eu porttitor neque scelerisque sed. Aliquam scelerisque risus massa, et ultricies ligula rhoncus ac. Aliquam aliquam turpis ac lobortis volutpat. Proin dapibus massa dui, quis imperdiet dui pulvinar a. Vestibulum molestie diam urna, ac auctor est lobortis in.
                Vivamus nunc enim, volutpat eget commodo a, fringilla volutpat risus. Fusce at neque nec justo bibendum dapibus et quis metus. Nunc lobortis enim lacus, ut ultricies sapien dictum ultricies. Quisque tristique sollicitudin lobortis. In dolor lacus, laoreet vitae nunc sit amet, egestas imperdiet sem. Sed urna ipsum, rhoncus ornare purus sit amet, luctus varius ex. Cras viverra sapien nec semper vulputate. Phasellus auctor turpis non euismod pellentesque. Morbi quis aliquet diam, eget volutpat tortor. In id purus et neque hendrerit maximus. Quisque sit amet purus quis eros vestibulum hendrerit in et lorem. In tincidunt nisl ut sapien auctor feugiat. Donec dapibus augue massa, quis vulputate mauris scelerisque id. Nunc ut nunc sed nibh faucibus laoreet. Sed sed tellus vitae leo ornare vestibulum sed at urna.
                Ut cursus a purus sed porttitor. Maecenas a quam venenatis, bibendum ligula ut, feugiat enim. Cras vel tellus faucibus, scelerisque nulla nec, ullamcorper mauris. Nullam malesuada consectetur turpis, a lobortis erat facilisis ac. In ac gravida eros. Donec cursus orci nec volutpat placerat. Aliquam erat volutpat. Duis auctor ante placerat tortor condimentum pretium. Praesent turpis sapien, vehicula a gravida in, luctus ac felis. Phasellus pharetra nibh id semper aliquet. Quisque odio augue, viverra vitae scelerisque tempor, pulvinar id ligula. Nulla fringilla leo vel tincidunt pharetra. Sed bibendum tempus diam, vitae mattis sapien porttitor quis.
                Curabitur sit amet eros at dui suscipit dictum vel condimentum tortor. Donec at ante diam. In sagittis odio id nunc luctus dapibus. Mauris fermentum sapien quis ligula suscipit, eu condimentum diam laoreet. Morbi dignissim ante sed dui auctor, vitae fringilla nibh maximus. Donec dignissim tempus tristique. Maecenas molestie bibendum urna, ut sodales lorem tempus nec. Sed viverra lacus posuere egestas mattis. Aenean condimentum purus id dui porttitor sodales. Aenean vehicula felis elit, et rhoncus nisl feugiat eu. In at enim ac massa condimentum euismod. Cras hendrerit risus vel ante lobortis, et cursus justo scelerisque. Suspendisse potenti. Vivamus eget urna nec lectus aliquet pellentesque.
                Aliquam a blandit tellus. Praesent pharetra faucibus mauris, in mattis ligula venenatis at. Quisque eget lectus varius, volutpat sapien ac, pellentesque nisi. Aenean efficitur erat ut augue convallis viverra. Proin volutpat vel mauris eu luctus. Donec et ultricies justo, at hendrerit ligula. Phasellus aliquam tincidunt velit et pretium. Aliquam pellentesque vehicula elit eget vehicula. Mauris fringilla massa nisi, ac dapibus ipsum rhoncus sed. Integer non odio et purus molestie commodo. Quisque volutpat eget tellus nec faucibus. Integer bibendum, ante pretium imperdiet bibendum, erat tortor ultricies risus, eget placerat odio purus eu justo. Phasellus lobortis leo et congue consectetur. Donec vel lacinia mi, vel efficitur turpis. Suspendisse ac purus tristique, egestas ligula non, finibus diam.
            `,
      });
      console.log("inserting data", i);
    }
    await Ad.save({ title: "phone", description: "iphone" });
  }

  const schema = await buildSchema({
    resolvers: [AdResolver],
  });

  const server = new ApolloServer({ schema });

  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
  });

  console.log(`🚀  Server ready at: ${url}`);
};

start();
