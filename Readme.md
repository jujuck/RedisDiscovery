# Premier pas :

- Clone le repo (URL)
- Fait le tour du propriétaire et des différentes parties (Explore Docker-Compose)
- Rempli les fichiers d'environnement si besoin
- Lance le projet et requete la data

Observation
On a mis un setTimeOut sur la requete de données pour simuler un délai de chargement (Data lourdes ou requete complexe).

# Exercices pratiques :

### Installer redis

`npm i redis` (cf doc npm https://www.npmjs.com/package/redis)

### configurer redis pour graphQL

- nouveau fichier redis.config.ts
- importer create client depuis la librairie
- Créer l'instance de connexion à la base de données Redis url via docker (https://www.npmjs.com/package/redis#basic-example)
- Mettre en place des listeners d'action sur l'erreur et la connexion pour s'assurer au plus tôt du bon fonctionnement (https://redis.io/docs/latest/develop/get-started/data-store/#connect)

```ts
const redisClient = createClient({ url: "redis://redis" }); // * 1

redisClient.on("error", (err) => {
  // * 2
  console.log("Redis Client Error", err);
});
redisClient.on("connect", () => {
  console.log("redis connected");
});

export default redisClient;
```

:bulb: **_1_** : la proriété `url` indique l'adresse du serveur Redis de connection. Le préfixe `redis://` indique que nous utilisons le protocole redis. L'autre `redis` qui suit, indique le nom du container Docker (cf Docker compose).
D'autres propriétés sont possibles pour affiner nos paramètrages selon notre utilisation (name 'si plusieurs instances', socket, username et password en cas de mise en place d'une connexion sur l'instance, ...).

:bulb: **_2_** : La méthode `on` permet d'écouter des évènements spécifiques émis par `redis`. Cette méthode courante sur `node.js` permet de gérer des évenements asynchrone via des callbacks. D'autres évènements peuvent être écoutés selon nos besoins ("ready", "end", "close", "reconnecting"...)

### Connecter notre app à la BDD Redis dans l'`index.ts`

```ts
import redisClient from "./redisClient";

const start = async() => {
  await redisClient.connect();
  ....
}
```

### Mettre en place la mise à jour du cache redis dans notre resolver

- importer redisClient
- Dans notre méthode, `getAllAdsByKeyword`, modifier notre code en y ajoutant la mise à jour du cache en fonction du mot clé ou non

```ts
// avant le return
redisClient.set(keyword, JSON.stringify(result)); // * 3
return result;
```

:bulb: **_3_** : La méthode `set` est utilisée pour enregistrer dans notre base de données `Redis`. Cette base fonctionne sur le principe de clé - valeur. On fournit donc en premier argument une clé (de type String) et une valeur, (de type String aussi). Chaque clé doit restée unique.

### Vérifier le cache par le mot clé avant de chercher à faire une requete (avant le `await sleep()`)

```ts
const cache = await redisClient.get(keyword); // * 4
if (cache !== null) { // * 5
  return JSON.parse(cache)
}
await sleep()
...
```

:bulb: **_4_** : La méthode `get` de redis retourne une promesse. Nous devons donc l'utiliser après un `await`. Cette méthode retourne la valeur, si il y en a une correspondant à notre clé (keyword).

:bulb: **_5_** : Si une réponse (cache) est retournée par notre BDD redis, alors nous retournons directement ce résultat, sans avoir besoin de consulter notre BDD (PostGres, SQlite, MySQL) et entrer dans notre logique métier.

- Maintenant, tu peux tester ton application via le code SandBox d'apollo. Lorsque tu testes une requête pour la première fois, le temps de réponse est long. Mais, une fois le résultat de la requête méméorise par redis, la deuxième tentative est instantannée. C'est ce qu'il va se passer sur ton serveur si plusieurs utilisateurs demandent une même requete. Le premier va la lancer et les suivants accéderont au résultat en mémoire.

- Etape suivante : teste la requete avec comme `keywords` "Wilders". Une seule réponse ressort. Sert toi de la mutation `createNewAd` avec ces informations pour ajouter une entrée.

```json
{
  "title": "Wilders 2",
  "description": "The best developpers we know in the world"
}
```

- Ensuite, relance la requête de recherche avec le `keywords` "Wilders". Notre nouvelle entrée ne ressort pas.
- Essayons avec juste `keywords` "Wild". Cela prend du temps, mais je récupère bien mon nouvel enregistrement.

- Essayons de comprendre.
  Une fois que Redis a fait une association avec une data (`keywords` => `result`). Celui ci n'est pas remis en cause pas la modification de données, car Redis n'a aucun moyen de le savoir.
  Pour cela, on va donner une espérance de vie à notre mots clés dans le cache (celle ci varie en fonction de notre application, de la fréquence des changments et de l'importance pour notre utilisateur d'avoir des données 100% à jour)

### Améliorer le code en gérant la mise à jour du cache (durée de vie de 30 secondes). Attention, il sera important de réinitialiser le cache pour que les changements soient pris en compte. Pour cela, pense à relancer Docker et refaire la manipulation d'ajout d'entrée.

```ts
redisClient.set(keyword, JSON.stringify(result), { EX: 30 }); // *6
```

:bulb: **_6_** : la méthode `set` de redis peut avoir 4 arguments

- key: string
- payload: string
- config: Object (
  EX pour expires en seocnde,
  PX en millisecondes,
  NX enregistre si Non définie,
  XX enregistre seulement si existante
  ...
  )
- callback: function (Celle ci sera appellée après la mise en mémoire)

## Et voilà, tu a compris le principe de cache et la mise en place de Redis comme base de données (in Memory)

Félicitations.
