## Studentgegevens

**Studentnaam:** Mick Olthoff
**Studentnummer:** 97132891

## Projectgegevens

### BarMap – Horeca-applicatie voor sportverenigingen

De BarMap applicatie is gemaakt om een ouderwetse streepkaart en het handmatig uitrekenen van balansen. Het maakt gebruik van een lokale database om gebruikers, producten, speltakken, kredietnota's en transacties op het apparaat op te slaan.

Tijdens de derde sprint ga ik de laatste functionaliteiten toevoegen aan de applicatie:

- Het mogelijk maken om de database vanuit de applicatie op te schonen via een beheerdersfunctionaliteit.
- Het importeren van gebruikers, speltakken en producten via de applicatie.
- Het corrigeren van de sortering van gebruikers bij het importeren van statistieken uit SQLite.

## Werkwijze en planning

Wat ik heb geleerd uit de vorige sprint is dat het hebben van een alleen goed werkt als ik mezelf er ook aan houd. Tijdens de vorige sprint tekende ik de dingen die af waren ook af in het kaban-bord, maar ging ik er vervolgens wel aan verder werken. Hierdoor kwam het project niet af binnen de gestelde tijd.

Bij deze sprint ga ik het actiever bewaken en ga ik niet verder werken aan onderdelen die al afgevinkt zijn op het kanban-bord.

### Scope van deze sprint

De werkzaamheden voor deze sprint zijn bewust beperkt tot de onderdelen die nodig zijn om BarMap verder af te ronden:

- Een **Admin-functionaliteit** toevoegen waarmee de database vanuit de applicatie kan worden opgeschoond.
- Het **importeren van gebruikers, speltakken en producten** realiseren.
- De **sortering van gebruikers bij het importeren van statistieken uit SQLite** corrigeren.

Functionaliteiten die niet binnen deze scope vallen, worden niet tijdens deze sprint toegevoegd tenzij ze noodzakelijk blijken voor één van bovenstaande onderdelen.

### Randvoorwaarden

BarMap moet tijdens deze sprint blijven voldoen aan de volgende eisen:

- **Beveiliging:** toegang tot beheerdersfunctionaliteiten moet beveiligd zijn met een gehashed wachtwoord.
- **Copyright:** afbeeldingen, iconen, lettertypen en andere externe materialen mogen alleen worden gebruikt wanneer hiervoor toestemming is of wanneer de betreffende licentie dit toestaat.
- **Licenties:** gebruikte libraries en frameworks moeten een passende licentie hebben. Bij open-source software moet rekening worden gehouden met de voorwaarden van de betreffende licentie.
- **Toegankelijkheid:** de applicatie moet zo veel mogelijk bruikbaar zijn voor verschillende gebruikers, bijvoorbeeld door voldoende contrast, duidelijke navigatie en herkenbare iconen.
- **Databeheer:** de lokale database moet betrouwbaar blijven werken en gegevens moeten op een gecontroleerde manier kunnen worden geïmporteerd en geëxporteerd.
- **Scope:** nieuwe functionaliteiten mogen niet ten koste gaan van het afronden van de bestaande functionaliteiten. De focus ligt eerst op het compleet maken van de applicatie voordat extra verbeteringen worden toegevoegd.
- **Versiebeheer:** wijzigingen worden bijgehouden met Git en development branches, zodat de ontwikkeling en geschiedenis van het project overzichtelijk blijven.

### Begin- en einddatum

**Begindatum:** 30/09/26
**Einddatum:** 7/08/26

## Leerdoelen

De leerdoelen van deze sprint sluiten direct aan op de ervaringen uit de vorige sprint.

### B1-K1-W1 – Stemt opdracht af, plant werkzaamheden en bewaakt voortgang

In deze sprint wil ik mij vooral verbeteren in het bewaken van mijn planning. Tijdens de vorige sprint had ik wel een planning, maar hield ik onvoldoende vast aan de afgesproken werkzaamheden.

Ik wil daarom leren om een taak daadwerkelijk af te sluiten wanneer deze aan de eisen voldoet. Wanneer ik tijdens het werken een mogelijke verbetering tegenkom, wil ik deze niet automatisch uitvoeren. Alleen wanneer de verbetering noodzakelijk is voor de geplande functionaliteit, neem ik deze mee in de huidige sprint.

Daarnaast wil ik mijn deadlines actiever bewaken door gebruik te maken van herinneringen en vaste momenten om mijn voortgang te controleren. Hierdoor wil ik voorkomen dat het oplevermoment opnieuw wordt uitgesteld.

### B1-K1-W2 – Maakt een technisch ontwerp voor software, user interface & database design

Het technische ontwerp van BarMap is grotendeels aanwezig. Tijdens deze sprint wordt dit ontwerp verder aangevuld voor de nog ontbrekende functionaliteiten.

Voor het importeren van gebruikers, speltakken en producten moet een serialisatielaag worden toegevoegd. Deze laag zorgt ervoor dat de gegevens uit een extern bestand kunnen worden omgezet naar objecten die binnen de applicatie en database gebruikt kunnen worden.

Ook moet de gebruikersinterface worden uitgebreid met de benodigde beheerdersfunctionaliteit voor het opschonen van de database en het importeren van gegevens.

Bij wijzigingen aan de database en bestaande componenten wil ik controleren of de implementatie nog aansluit op de bestaande structuur, zodat nieuwe functionaliteiten niet onnodig voor extra complexiteit zorgen.

### B1-K1-W3 – Realiseert software, object oriented programming

De belangrijkste functionaliteiten van BarMap zijn tijdens de vorige sprint al gerealiseerd. In deze sprint richt ik mij daarom op de resterende onderdelen.

De bestaande objectgeoriënteerde structuur blijft hierbij het uitgangspunt. De functionaliteiten voor gebruikers, speltakken en producten worden uitgebreid met de benodigde importmogelijkheden. Ook wordt de bestaande database-interface gebruikt voor het gecontroleerd verwerken van gegevens.

Daarnaast wordt de bestaande functionaliteit voor het importeren van statistieken aangepast zodat gebruikers op de gewenste alfabetische volgorde worden verwerkt.

Het doel is niet om de volledige codebase opnieuw te verbeteren, maar om de noodzakelijke functionaliteiten op een gecontroleerde manier toe te voegen aan de bestaande applicatie.

## Werkprocessen

Met deze tweede sprint oefen ik opnieuw met de volgende werkprocessen:

- **Ontwerpen:** bestaande ontwerpen verder uitwerken en aanpassen waar nodig.
- **Realiseren:** ontbrekende functionaliteiten ontwikkelen en bestaande functionaliteiten verbeteren.
- **Testen:** controleren of nieuwe en bestaande functionaliteiten correct blijven werken.
- **Debuggen:** fouten en onverwachte problemen systematisch onderzoeken en oplossen.
- **Documenteren:** belangrijke keuzes, wijzigingen en werkzaamheden vastleggen.
- **Plannen:** werkzaamheden opdelen in haalbare taken en de voortgang bewaken.
- **Versiebeheer:** Git en development branches gebruiken om wijzigingen overzichtelijk bij te houden.

## Kerntaken / Werkprocessen

Met deze opdracht hoop ik de volgende kerntaken en werkprocessen verder te vullen:

- **Ontwerpen:** de gebruikersinterface, technische structuur en functionaliteiten verder uitwerken.
- **Realiseren:** de ontbrekende onderdelen van BarMap bouwen en integreren.
- **Testen:** de applicatie controleren op fouten en onverwacht gedrag.
- **Onderhouden:** bestaande code en functionaliteiten verbeteren waar dit nodig is.
- **Documenteren:** de voortgang en gemaakte keuzes bijhouden.
- **Plannen:** de beschikbare tijd beter verdelen en de voortgang actief bewaken.

Aan het einde van deze sprint wil ik een versie van BarMap hebben waarin de resterende noodzakelijke functionaliteiten uit de vorige sprint zijn gerealiseerd.

Concreet betekent dit dat een beheerder:

- de database vanuit de applicatie kan opschonen;
- gebruikers, speltakken en producten kan importeren;
- statistieken uit SQLite kan importeren waarbij gebruikers correct alfabetisch worden gesorteerd.

Naast het technische resultaat is ook mijn manier van werken een belangrijk onderdeel van deze sprint. Ik wil aantonen dat ik mijn werkzaamheden beter kan afbakenen, mijn planning actiever kan bewaken en een functionaliteit kan loslaten wanneer deze voldoende is afgerond.

Het belangrijkste uitgangspunt voor deze sprint is daarom:

> **Eerst afronden wat gepland is, daarna pas verbeteren wat al werkt.**

Op deze manier wil ik voorkomen dat perfectionisme en uitstelgedrag opnieuw ten koste gaan van het oplevermoment. Het doel is niet om iedere functionaliteit perfect te maken, maar om de afgesproken functionaliteiten daadwerkelijk op tijd te realiseren, testen en opleveren.
