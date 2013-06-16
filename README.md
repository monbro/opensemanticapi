opensemanticapi
===============

Will allow you to create your own semantic wording database with redis. Otherwise there will be a open api to get related words by meaning.

**Example (http://localhost:8080/relations/hund):**

* Current Input:

** "hund" (german word)

* Current Output:

** ["und", "die", "der", "von", "sich", "wolf", "das", "caniden", "zwischen", "zitat", "wurden", "wallerstein", "verhalten", "sebastian", "rochus", "ref", "rechts", "pfeile", "nicht", "lilien", "heilige", "haushund", "auch", "alle", "übergingen", "über", "zwar", "zunächst", "zum", "zug", "zuerst", "zimen", "ziegen", "wüste", "wölfen", "wolfes", "wie", "weisen", "waren", "wann", "wacht", "vom", "vgl", "verteidigen", "unterschiede", "unterscheidet", "unterscheiden", "ungeklärt", "tötungsverhalten", "treffen", "tragtiere", "tragkraft", "tierischen", "tiere", "thumb", "standardwerk", "später", "soziale", "sondern", "sind", "sie", "seuche", "sei", "sehr", "schon", "schafe", "sagma", "rind", "related", "reittier", "raubtiere", "potentials", "pestsäule", "per", "packziege", "packtier", "packsattel", "packeinrichtungen", "pack", "originalausgabe", "organisation", "nutzbar", "nur", "nbsp", "münchen", "möglichkeiten", "montpellier", "mit", "michael", "menschen", "man", "machen", "lässt", "logistische", "links", "linke", "letztlich", "lastentragenden", "lassen", "kaum", "jpg", "jedoch", "jagdverhalten", "jagdbeute", "jagd", "ist", "isbn", "inschrift", "hundeartigen", "hierzu", "hier", "helfen", "heimat", "heiliger", "heilen", "haustiere", "hausrind", "haus", "großen", "gattungen"]

**To Do:**

* Remove all conjunctions and stuff
* improve performance of script

**USAGE**

* start your redis server on a disc with enough space
* open the app via "node app.js"
* happy output watching
