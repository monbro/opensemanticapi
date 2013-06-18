opensemanticapi
===============

**Works with NodeJS and Redis - v0.1**

**Description**

Will allow you to create your own semantic wording database with redis. Otherwise there will be a open api to get related words by meaning.

![ScreenShot](https://raw.github.com/monbro/opensemanticapi/master/infographic.png)

**1. Example (http://localhost:8080/relations/ship):**

* Input: "ship"

* Output: ["midshipmen", "aboard", "ships", "rating", "master", "served", "seaman", "sea", "officers", "santa", "sailing", "cadets", "able", "sail", "navigation", "lieutenant", "hms", "expected", "yahoo", "storm", "rated", "promotion", "maría", "lewis", "false", "era", "boys", "wind", "voyage", "volunteer", "servants", "required", "passing", "palos"]

**2. Example (http://localhost:8080/relations/human):**

* Input: human

* Output: ["evolution", "humans", "reality", "primate", "ago", "tools", "pmid", "mind"]

**3. Example (http://localhost:8080/relations/dog):**

* Input: dog

* Output: ["infant", "wildlife", "offspring", "mother", "future", "southwest", "koalas", "conflict", "animals", "aitken", "wolf", "urban", "rehabilitation", "pet", "perspective", "nursing", "mexico", "evolutionary", "weaning", "ticket", "texas", "speech", "special", "retrospective", "primate", "holtcamp", "fund", "enough", "domestic", "cost", "arizona", "210–217", "variety", "trivers", "trauma", "terms", "sprawl", "southwestern", "sense", "river", "received", "questions", "point", "perhaps", "parent", "otter", "makes", "little", "less", "himself", "gray", "gorilla", "frequently"]

**Usage**

* start your redis server (http://redis.io/topics/quickstart)
* clone this repo "git clone https://github.com/monbro/opensemanticapi.git"
* change config if needed in "/config.js"
* open folder of the clones repo in console and start the node server with "node app.js"
* the longer it collects data the better the results should be

**To Do:**

* improve performance of script
* allow certain configurations (half done)
* try to use http://yeoman.io/ with its structure for more compatibility and understanding

This software is published under the MIT-License. See 'license' for more information.
