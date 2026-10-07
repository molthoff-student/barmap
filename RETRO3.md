## Over het retro bestand

Deze retrospective beschrijft mijn ervaringen en leerpunten tijdens de derde sprint van het BarMap-project en de behaalde resultaten. In deze sprint lag de focus vooral op het afronden van de laatste noodzakelijke functionaliteiten en het beter bewaken van mijn planning.

## Is het gelukt om het product te maken zoals ik bedoelde?

Ja, de belangrijkste functionaliteiten die nog ontbraken zijn gerealiseerd. De applicatie bevat nu de functionaliteiten die ik aan het begin van deze sprint had gepland:

- Het opschonen van de database vanuit de applicatie door middel van een Admin-functionaliteit.
- Het importeren van Gebruikers, Speltakken en Producten.
- Het correct sorteren van gebruikers bij het importeren van statistieken uit SQLite.

Hierdoor is BarMap verder afgerond en zijn de belangrijkste onderdelen die aan het einde van de vorige sprint nog ontbraken toegevoegd.

## Is het gelukt om het gewenste product te maken in de gestelde tijd?

Ja, deze sprint is het beter gelukt om de geplande werkzaamheden binnen de beschikbare tijd af te ronden.

Een belangrijke reden hiervoor is dat ik mij tijdens deze sprint beter aan de afgesproken scope heb gehouden. In de vorige sprint bleef ik regelmatig werken aan onderdelen die al waren afgevinkt. Tijdens deze sprint heb ik geprobeerd om dit niet opnieuw te doen.

Wanneer een functionaliteit aan de eisen voldeed, beschouwde ik deze als afgerond. Verbeteringen die niet noodzakelijk waren voor de geplande functionaliteit heb ik zoveel mogelijk laten liggen.

Hierdoor kon ik mijn aandacht richten op de onderdelen die daadwerkelijk nog moesten worden gerealiseerd.

## Welke redenen kan ik hiervoor bedenken?

De belangrijkste reden is dat ik mijn manier van werken uit de vorige sprint heb aangepast.

Tijdens de vorige sprint bleef ik te lang werken aan bestaande functionaliteiten omdat ik deze steeds verder wilde verbeteren. Hierdoor werd het oplevermoment steeds verder uitgesteld.

In deze sprint heb ik geprobeerd om dit gedrag eerder te herkennen. Het kan nog steeds verleidelijk zijn om iets verder te verbeteren wanneer ik tijdens het programmeren een nieuwe mogelijkheid zie, maar ik heb mezelf vaker gedwongen om terug te gaan naar de planning.

Ook heb ik de werkzaamheden duidelijker afgebakend. De scope van deze sprint bestond uit drie concrete onderdelen. Hierdoor was het makkelijker om te bepalen of iets wel of niet binnen de sprint hoorde.

## Is het gelukt om de leerdoelen voor dit project waar te maken?

### B1-K1-W1: Stemt opdracht af, plant werkzaamheden en bewaakt voortgang

Dit leerdoel is deze sprint beter gelukt dan tijdens de vorige sprint.

Tijdens de vorige sprint had ik wel een planning en een kanban-bord, maar hield ik mij hier onvoldoende aan. Tijdens deze sprint heb ik geprobeerd om mijn planning actiever te bewaken en mij beter aan de afgesproken scope te houden.

Ik heb geleerd dat een planning alleen nuttig is wanneer ik deze ook daadwerkelijk gebruik om keuzes te maken. Wanneer een taak af is, moet ik deze ook daadwerkelijk afsluiten in plaats van opnieuw te blijven verbeteren.

Ik ben hierdoor beter geworden in het onderscheiden van noodzakelijke werkzaamheden en verbeteringen die eventueel later kunnen worden uitgevoerd.

### B1-K1-W2: Maakt een technisch ontwerp voor software, user interface & database design

Dit leerdoel is grotendeels behaald.

Voor de importfunctionaliteiten heb ik de bestaande structuur verder uitgebreid met de benodigde serialisatielaag. Hierdoor kunnen gegevens uit externe bestanden worden omgezet naar objecten die binnen de applicatie gebruikt kunnen worden.

Ook is de gebruikersinterface uitgebreid met de benodigde Admin-functionaliteiten voor het opschonen en importeren van gegevens.

Bij het toevoegen van deze functionaliteiten heb ik geprobeerd om zoveel mogelijk gebruik te maken van de bestaande structuur van BarMap. Hierdoor hoefde de bestaande architectuur niet volledig aangepast te worden.

Een belangrijk inzicht hierbij is dat een technisch ontwerp niet alleen gaat over hoe iets technisch gebouwd kan worden, maar ook over hoe een nieuwe functionaliteit binnen de bestaande applicatie past.

### B1-K1-W3: Realiseert software, object oriented programming

Dit leerdoel is behaald.

De resterende functionaliteiten van BarMap zijn gerealiseerd en geïntegreerd in de bestaande applicatie. Hierbij heb ik gebruikgemaakt van de bestaande objectgeoriënteerde structuur en database-interface.

De importfunctionaliteiten voor Gebruikers, Speltakken en Producten zijn toegevoegd. Daarnaast is de bestaande functionaliteit voor het importeren van statistieken aangepast zodat gebruikers correct alfabetisch worden verwerkt.

Ook heb ik de Admin-functionaliteit toegevoegd waarmee de lokale database vanuit de applicatie kan worden opgeschoond.

Ik heb hierbij geleerd dat het niet altijd nodig is om bestaande code opnieuw te ontwerpen. Wanneer de bestaande structuur goed genoeg is, kan het verstandiger zijn om hierop voort te bouwen en alleen de noodzakelijke onderdelen toe te voegen.

## Wat vond ik makkelijk aan dit project?

Ik vond het makkelijk om bestaande kennis uit de eerdere sprints opnieuw te gebruiken. De basis van BarMap was al aanwezig, waardoor ik niet vanaf nul hoefde te beginnen.

Ook hielp het dat de meeste belangrijke onderdelen van de applicatie al waren uitgewerkt. Hierdoor kon ik mij tijdens deze sprint vooral richten op de ontbrekende functionaliteiten.

Het werken met de bestaande objectgeoriënteerde structuur en database-interface voelde hierdoor een stuk vertrouwder dan tijdens de eerste ontwikkeling van het project.

Ook het werken met Git en development branches bleef prettig. Hierdoor kon ik wijzigingen gescheiden ontwikkelen en hield ik de geschiedenis van het project overzichtelijk.

## Wat vond ik moeilijk aan dit project?

Het moeilijkste onderdeel bleef het bewaken van mijn eigen planning en het niet blijven verbeteren van onderdelen die al voldoende waren.

Hoewel dit tijdens deze sprint beter ging, blijft dit voor mij een aandachtspunt. Wanneer ik tijdens het programmeren een verbetering zie, vind ik het nog steeds lastig om deze niet direct uit te voeren.

Ik heb hierdoor gemerkt dat perfectionisme niet alleen zorgt voor extra werk, maar ook invloed heeft op mijn planning. Een kleine verbetering kan op zichzelf weinig tijd kosten, maar wanneer ik dit meerdere keren doe, kan dit uiteindelijk veel tijd van de geplande werkzaamheden afhalen.

Daarnaast vond ik het importeren van gegevens lastiger dan het toevoegen van normale functionaliteiten. Hierbij moet niet alleen de interface werken, maar moeten gegevens uit een extern formaat ook correct worden geïnterpreteerd en binnen de bestaande database-structuur worden geplaatst.

## Welke inzichten wil ik voor een volgend project behouden?

Er zijn verschillende inzichten en technieken die ik bij een volgend project opnieuw wil gebruiken:

- **Duidelijke scope:** Door vooraf duidelijk te bepalen welke werkzaamheden binnen een sprint vallen, kan ik makkelijker bepalen waar ik wel en niet aan moet werken.
- **Taken daadwerkelijk afsluiten:** Wanneer een taak aan de eisen voldoet, moet ik deze als afgerond beschouwen. Eventuele verbeteringen kunnen op een later moment worden ingepland.
- **Git en development branches:** Door branches te gebruiken blijft de geschiedenis van het project overzichtelijk en kan ik wijzigingen beter van elkaar scheiden.
- **Bestaande structuur hergebruiken:** Niet iedere nieuwe functionaliteit vereist een grote aanpassing aan de bestaande codebase. Wanneer de huidige structuur geschikt is, wil ik hierop blijven voortbouwen.
- **Planning actief bewaken:** Een planning moet niet alleen aan het begin van een project worden gemaakt, maar gedurende het hele project worden gecontroleerd.
- **Bestaande kennis toepassen:** Kennis die ik eerder heb opgedaan kan ik opnieuw gebruiken om nieuwe functionaliteiten sneller te ontwikkelen.

## Welke inzichten ga ik bij een volgend project aanpassen?

Hoewel mijn planning tijdens deze sprint beter ging, wil ik mijn manier van plannen bij een volgend project nog verder verbeteren.

Ik wil eerder bepalen welke functionaliteiten absoluut noodzakelijk zijn voor de oplevering en welke verbeteringen pas later mogen worden uitgevoerd. Hierdoor wil ik voorkomen dat extra verbeteringen ongemerkt onderdeel worden van mijn oorspronkelijke planning.

Daarnaast wil ik mijn deadlines nog actiever bewaken met herinneringen en vaste controlemomenten. In de vorige sprint heb ik gemerkt dat een deadline alleen niet genoeg is wanneer ik deze pas vlak voor het oplevermoment serieus ga bewaken.

Ik wil daarom gedurende een project meerdere momenten plannen waarop ik controleer of ik nog op schema lig. Wanneer ik achterloop, moet ik eerder bijsturen in plaats van proberen om alles alsnog aan het einde in te halen.

## Heb ik nog nieuwe inzichten gekregen over de randvoorwaarden van mijn project?

Ja. Tijdens deze sprint heb ik gemerkt dat randvoorwaarden zoals beveiliging en databeheer belangrijker worden wanneer er functionaliteiten worden toegevoegd waarmee gegevens direct kunnen worden aangepast of geïmporteerd.

De Admin-functionaliteit moet bijvoorbeeld niet zomaar voor iedere gebruiker beschikbaar zijn. Beheerdersfunctionaliteiten moeten beschermd worden en gegevens moeten gecontroleerd worden verwerkt.

Ook heb ik bij het importeren van gegevens gemerkt dat het belangrijk is om rekening te houden met de betrouwbaarheid en structuur van externe gegevens. Het is niet voldoende dat een bestand technisch geopend kan worden; de gegevens moeten ook correct binnen de applicatie en database terechtkomen.

Hierdoor ben ik mij meer bewust geworden van het feit dat functionaliteit niet losstaat van de randvoorwaarden van een applicatie.

## Ben ik tevreden over mijn werkwijze en het eindproduct?

Ik ben meer tevreden over mijn werkwijze dan tijdens de vorige sprint.

Tijdens de vorige sprint heb ik het oplevermoment gemist doordat ik bleef werken aan onderdelen die al af waren. Tijdens deze sprint is het beter gelukt om mijn werkzaamheden af te bakenen en mij te richten op de onderdelen die daadwerkelijk gepland waren.

Ik ben daarom tevreden dat ik mijn manier van werken heb kunnen verbeteren.

Over het eindproduct ben ik ook tevreden. De functionaliteiten die aan het begin van deze sprint gepland waren zijn toegevoegd en BarMap is hierdoor verder afgerond.

Ik ben echter niet volledig tevreden over mijn werkwijze, omdat ik nog steeds merk dat ik de neiging heb om te blijven optimaliseren wanneer ik mogelijkheden zie. Dit is iets waar ik ook in toekomstige projecten rekening mee moet blijven houden.

## Conclusie

Mijn belangrijkste leermoment uit deze derde sprint is dat een planning alleen werkt wanneer ik mij er daadwerkelijk aan houd.

Tijdens de vorige sprint bleef ik werken aan functionaliteiten die al klaar waren, waardoor het project niet op tijd werd afgerond. In deze sprint heb ik geprobeerd om dit anders aan te pakken door mijn scope duidelijk af te bakenen en taken daadwerkelijk af te sluiten wanneer ze aan de eisen voldeden.

Dit heeft ervoor gezorgd dat ik de resterende functionaliteiten van BarMap heb kunnen realiseren:

- Het opschonen van de database vanuit de applicatie.
- Het importeren van Gebruikers, Speltakken en Producten.
- Het correct sorteren van gebruikers bij het importeren van statistieken uit SQLite.

Daarnaast heb ik geleerd dat ik niet iedere verbetering direct hoef uit te voeren. Een applicatie hoeft niet perfect te zijn voordat deze kan worden opgeleverd. Het belangrijkste is dat de afgesproken functionaliteiten werken en binnen de gestelde tijd worden gerealiseerd.

Het belangrijkste uitgangspunt dat ik uit dit project meeneem is daarom:

> **Eerst afronden wat gepland is, daarna pas verbeteren wat al werkt.**

Dit wil ik bij toekomstige projecten blijven toepassen, zodat mijn perfectionisme minder invloed heeft op mijn planning en oplevermomenten.
