### Objectifs :

- Clone le repo (URL)
- Fait le tour du propriétaire et des différentes parties (Explore Docker-Compose)
- Rempli les fichiers d'environnement si besoin
- Lance le projet et requete la data

Observation
On a mis un setTimeOut sur la requete de données pour simuler un délai de chargement (Data lourdes ou requete complexe).

### Exercices pratiques :

- Installer redis
  `npm i redis` (cf doc npm )
- configurer redis pour graphQL
  - nouveau fichier redis.config.ts
  - importer create client depuis la librairie

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

import { createClient } from "redis";

- Mettre en place le cache redis sur notre requete pour contourner le délai
- Améliorer notre fonctionnement en gérant la durée de vie du cache
