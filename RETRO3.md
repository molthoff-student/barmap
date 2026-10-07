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

Wanneer een functionaliteit aan de eisen voldeed, heb ik deze afgevinkt en heb ik er verder niet meer aan gewerkt. Verbeteringen die niet noodzakelijk waren voor de geplande functionaliteit heb ik zoveel mogelijk laten liggen.

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

Hoewel dit tijdens deze
