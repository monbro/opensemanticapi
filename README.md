opensemanticapi
===============

**Works with NodeJS and Redis - v0.1**

**Description**

Will allow you to create your own semantic wording database with redis. Otherwise there will be a open api to get related words by meaning.

![ScreenShot](https://raw.github.com/monbro/opensemanticapi/master/infographic.png)

**1. Example (http://localhost:8080/relations/hund):**

* Input: "hund" (german word)

* Output: ["locke", "fluss", "sklaven", "desmond", "treue", "widmore", "staffel", "hunde", "wald", "tuberkulose", "tuberkulin", "tollwut", "serie", "senegal", "pferd", "nacht", "mühlig", "mensch", "meister", "kuhhirten"]

**2. Example (http://localhost:8080/relations/schiff):**

* Input: "schiff" (german word)

* Output: ["gulliver", "hafen", "seute", "deern", "bark", "schiffes", "mini", "kaub", "hms", "beagle", "bandi", "wappen", "tage", "see", "ostsee", "england", "bald", "args", "tonnen", "staffel", "schiffe", "puka", "pegel", "nimmt"]

**3. Example (http://localhost:8080/relations/mensch):**

* Input: "mensch" (german word)

* Output: ["homo", "sapiens", "erziehung", "wissenschaft", "chromosomen", "evolution", "buch", "biologie", "pädagogik", "menschlichen", "giacometti", "anthropologie", "philosophie", "gut", "tieren", "science", "lebens", "kind", "jean", "human", "gattung", "doi", "wesen", "pmid", "natur", "handeln", "frage", "entwickelt", "entstehung", "einzige", "chromosom", "antipädagogik", "anderer", "alte", "alles", "wort", "werke", "umwelt", "testament", "psychologie", "problem", "population", "natürlichen", "modernen", "modern", "menschheit", "mensch", "locke"]

**To Do:**

* improve performance of script
* allow certain configurations
* try to use http://yeoman.io/ with its structure for more compatibility and understanding

**USAGE**

* start your redis server on a disk with enough space
* open the app via "node app.js"
* happy output watching
