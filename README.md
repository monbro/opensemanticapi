opensemanticapi
===============

**Works with NodeJS and Redis - v0.1**

**Description**

Will allow you to create your own semantic wording database with redis. Otherwise there will be a open api to get related words by meaning.

**1. Example (http://localhost:8080/relations/hund):**

* Input: "hund" (german word)

* Output: ["und", "die", "der", "von", "sich", "wolf", "das", "caniden", "zwischen", "zitat", "wurden", "wallerstein", "verhalten", "sebastian", "rochus", "ref", "rechts", "pfeile", "nicht", "lilien", "heilige", "haushund", "auch", "alle", "übergingen", "über", "zwar", "zunächst", "zum", "zug", "zuerst", "zimen", "ziegen", "wüste", "wölfen", "wolfes", "wie", "weisen", "waren", "wann", "wacht", "vom", "vgl", "verteidigen", "unterschiede", "unterscheidet", "unterscheiden", "ungeklärt", "tötungsverhalten", "treffen", "tragtiere", "tragkraft", "tierischen", "tiere", "thumb", "standardwerk", "später", "soziale", "sondern", "sind", "sie", "seuche", "sei", "sehr", "schon", "schafe", "sagma", "rind", "related", "reittier", "raubtiere", "potentials", "pestsäule", "per", "packziege", "packtier", "packsattel", "packeinrichtungen", "pack", "originalausgabe", "organisation", "nutzbar", "nur", "nbsp", "münchen", "möglichkeiten", "montpellier", "mit", "michael", "menschen", "man", "machen", "lässt", "logistische", "links", "linke", "letztlich", "lastentragenden", "lassen", "kaum", "jpg", "jedoch", "jagdverhalten", "jagdbeute", "jagd", "ist", "isbn", "inschrift", "hundeartigen", "hierzu", "hier", "helfen", "heimat", "heiliger", "heilen", "haustiere", "hausrind", "haus", "großen", "gattungen"]

**2. Example (http://localhost:8080/relations/schiff):**

* Input: "schiff" (german word)

* Output: ["der", "die", "und", "mit", "das", "von", "den", "auf", "nach", "dem", "ein", "als", "des", "gulliver", "ist", "nbsp", "für", "einem", "wurde", "eine", "wird", "bremerhaven", "sich", "ref", "dass", "war", "bei", "werden", "sie", "europa", "aus", "bis", "ihn", "hafen", "über", "wieder", "einer", "durch", "bremen", "auch", "zum", "wurden", "vor", "seute", "einen", "deern", "bark", "schiffes", "oder", "kam", "insel", "wilhelm", "wasser", "sind", "mini", "ihm", "hat", "datei", "anderen", "unter", "nicht", "man", "kaub", "jpg", "eines", "bandi", "zur", "wie", "wappen", "seiner", "seinem", "seine", "schließlich", "ostsee", "namen", "menschen", "können", "kaiser", "juni", "januar", "heute", "gegen", "findet", "erste", "drei", "diese", "damit", "band", "bald", "args", "aber", "000", "zwei", "www", "wegen", "tonnen", "tage", "staffel", "stadt", "sowie", "seinen", "see", "schiffe", "pegel", "oktober", "noch", "mark", "mainz", "lloyd", "liliputaner", "leben", "land", "koerts", "jedoch", "ihrem", "http", "hamburg", "große", "gerät", "gebaut"]

**To Do:**

* Remove all conjunctions and stuff
* improve performance of script

**USAGE**

* start your redis server on a disk with enough space
* open the app via "node app.js"
* happy output watching
* try to use http://yeoman.io/ with its structure for more compatibility and understanding
