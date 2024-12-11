### Objectifs :

- Clone le repo (URL)
- Fait le tour du propriétaire et des différentes parties (Explore Docker-Compose)
- Rempli les fichiers d'environnement si besoin
- Lance le projet et requete la data

Observation
On a mis un setTimeOut sur la requete de données pour simuler un délai de chargement (Data lourdes ou requete complexe).

### Exercices pratiques :

- Installer redis
  `npm i redis` (cf doc npm https://www.npmjs.com/package/redis)
- configurer redis pour graphQL
  - nouveau fichier redis.config.ts
  - importer create client depuis la librairie
  - Créer l'instance de connexion à la base de données Redis url via docker (https://www.npmjs.com/package/redis#basic-example)
  - Mettre en place des listeners d'action sur l'erreur et la connexion pour s'assurer au plus tôt du bon fonctionnement (https://redis.io/docs/latest/develop/get-started/data-store/#connect)

```ts
const redisClient = createClient({ url: "redis://redis" });

redisClient.on("error", (err) => {
  console.log("Redis Client Error", err);
});
redisClient.on("connect", () => {
  console.log("redis connected");
});

export default redisClient;
```

- Connecter notre app à la BDD Redis dans l'`index.ts`

```ts
import redisClient from "./redisClient";

const start = async() => {
  await redisClient.connect();
  ....
}
```

- Mettre en place la mise à jour du cache redis dans notre resolver
  - importer redisClient
  - Dans notre méthode, `getAllAdsByKeyword`, modifier notre code en y ajoutant la mise à jour du cache en fonction du mot clé ou non

```ts
// avant le return
redisClient.set(keyword, JSON.stringify(result));
return result;
```

- Vérifier le cache par le mot clé avant de chercher à faire une requete (avant le `await sleep()`)

```ts
const cache = await redisClient.get(keyword);
if (cache !== null) {
  return JSON.parse(cache)
}
await sleep()
...
```

- Améliorer le code en gérant la mise à jour du cache (durée de vie de 30 secondes)

```ts
redisClient.set(keyword, JSON.stringify(result), { EX: 30 });
```
