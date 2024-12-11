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

Maintenant, tu peux tester ton application via le code SandBox d'apollo. Lorsque tu testes une requête pour la première fois, le temps de réponse est long. Mais, une fois le résultat de la requête méméorise par redis, la deuxième tentative est instantannée. C'est ce qu'il va se passer sur ton serveur si plusieurs utilisateurs demandent une même requete. Le premier va la lancer et les suivants accéderont au résultat en mémoire.

Etape suivante : teste la requete avec comme `keywords` "Wilders". une seule réponse ressort. C'est embétant. Sert toi de la mutation `createNewAd` avec ces informations pour ajouter une entrée.

```json
{
  "title": "Wilders 2",
  "description": "The best developpers we know in the world"
}
```

Ensuite, relance la requête de recherche avec le `keywords` "Wilders". Notre nouvelle entrée ne ressort pas.
Essayons avec juste `keywords` "Wild". Cela prend du temps, mais je récupère bien mon nouvel enregistrement.

Essayons de comprendre.
Une fois que Redis a fait une association avec une data (`keywords` => `result`). Celui ci n'est pas remis en cause pas la modification de données, car Redis n'a aucun moyen de le savoir.
Pour cela, on va donner une espérance de vie à notre mots clés dans le cache (celle ci varie en fonction de notre application, de la fréquence des changments et de l'importance pour notre utilisateur d'avoir des données 100% à jour)

- Améliorer le code en gérant la mise à jour du cache (durée de vie de 30 secondes). Attention, il sera important de réinitialiser le cache pour que les changements soient pris en compte. Pour cela, pense à relancer Docker et refaire la manipulation d'ajout d'entrée.

```ts
redisClient.set(keyword, JSON.stringify(result), { EX: 30 });
```

Et voilà, tu a compris le principe de cache et la mise en place de Redis comme base de données (in Memory)
Félicitations.
