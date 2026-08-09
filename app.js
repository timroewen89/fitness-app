
    (function () {
      "use strict";

      var root = document.getElementById("fitJourneyApp");
      if (!root) return;
      var runtimeNotice = root.querySelector("#runtimeNotice");
      if (runtimeNotice) runtimeNotice.hidden = true;

      var STORAGE_KEY = "momentum-fitness-v1";
      var dayNames = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];
      var dayLong = ["Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag", "Zondag"];
      var todayIso = localIso(new Date());

      var phases = [
        { min: 1, max: 2, label: "Rustige herstart", sets: 2, circuit: 2, cardio: 20, detail: "Techniek, gewenning en herstel staan voorop." },
        { min: 3, max: 4, label: "Basis opbouwen", sets: 3, circuit: 3, cardio: 28, detail: "Iets meer volume, nog zonder maximale inspanning." },
        { min: 5, max: 8, label: "Sterker en fitter", sets: 3, circuit: 3, cardio: 35, detail: "Geleidelijk zwaarder met behoud van goede techniek." },
        { min: 9, max: 11, label: "Conditie verdiepen", sets: 3, circuit: 4, cardio: 42, detail: "Meer trainingsminuten en gecontroleerde intensiteit." },
        { min: 12, max: 12, label: "Herstelweek", sets: 2, circuit: 2, cardio: 30, detail: "Ongeveer 70% van je normale trainingsvolume." }
      ];
      var trainingSchedules = {
        "mon-wed-sat": { label: "Maandag · woensdag · zaterdag", days: ["Maandag", "Woensdag", "Zaterdag"], optional: "Zondag of dinsdag" },
        "tue-thu-sat": { label: "Dinsdag · donderdag · zaterdag", days: ["Dinsdag", "Donderdag", "Zaterdag"], optional: "Zondag" },
        "mon-thu-sun": { label: "Maandag · donderdag · zondag", days: ["Maandag", "Donderdag", "Zondag"], optional: "Vrijdag of zaterdag" }
      };

      var workouts = [
        {
          id: "strength-a", order: 1, title: "Kracht A + fietsen", type: "Vast", duration: 45,
          description: "Full-body kracht met de fiets als knievriendelijke basis.",
          exercises: function (week) {
            var p = trainingPlanFor(week);
            return [
              ["Rustig fietsen", "7 min", "Zadel zo instellen dat de knie onderaan bijna gestrekt is."],
              ["Squat naar bankje", p.sets + " × 8–12", "Lichaamsgewicht of lichte belasting, comfortabele diepte en gecontroleerd tempo."],
              ["Chest press", p.sets + " × 8–12", "Stop met ongeveer drie herhalingen over."],
              ["Seated row", p.sets + " × 10–12", "Schouderbladen rustig naar achteren."],
              ["Hip thrust", p.sets + " × 10–15", "Span de bilspieren bovenaan aan."],
              ["Hamstring curl", p.sets + " × 10–15", "Rustig terug laten zakken."],
              ["Staande kuitheffing", p.sets + " × 12–15", "Houd lichte steun vast en beweeg langzaam door de volledige comfortabele uitslag."],
              ["Plank", p.sets + " × 20–35 sec", "Kies knieën of tenen."],
              ["Rustig uitfietsen", "5–8 min", "Ademhaling terug naar rustig tempo."]
            ];
          }
        },
        {
          id: "conditioning", order: 2, title: "Conditie + circuit", type: "Vast", duration: 40,
          description: "Intervals zonder springen, gevolgd door een beheerst circuit.",
          exercises: function (week) {
            var p = trainingPlanFor(week);
            var burpee = state.coaching.mode === "recover"
              ? ["Verhoogde walk-out", "6 herhalingen", "Herstelstand: geen sprong. Handen op een hoog bankje en rustig uitstappen."]
              : (week < 3
              ? ["Verhoogde walk-out", "6 herhalingen", "Handen op bankje. Kies als alternatief 6–10 kleine tweebenige sprongen als je knie rustig blijft."]
              : (week < 5
                ? ["Verhoogde step-back burpee", "6 herhalingen", "Handen op een hoog bankje; sluit desgewenst af met een klein gecontroleerd sprongetje."]
                : ["Step-back burpee met klein sprongetje", "6 herhalingen", "Laag springen, stil en zacht landen; geen diepe squat of snelle draaibeweging."]));
            return [
              ["Warming-up", "5 min", "Fiets, crosstrainer of roeier."],
              ["Conditie-intervallen", p.cardio + " min", "2 minuten rustig, 1 minuut stevig op RPE 6."],
              ["Circuit", p.circuit + " rondes", "Werk beheerst, rust 60–90 seconden per ronde."],
              ["Incline push-up", "8–12", "Handen op een bankje."],
              ["Box squat", "10", "Lichaamsgewicht, comfortabele bewegingsuitslag en geen zware squatbelasting."],
              burpee,
              ["Glute bridge", "12", "Voeten stevig op de vloer."],
              ["Plank", "20–30 sec", "Blijf rustig ademen."],
              ["Cooling-down", "5 min", "Rustig bewegen."]
            ];
          }
        },
        {
          id: "strength-b", order: 3, title: "Kracht B + roeien", type: "Vast", duration: 50,
          description: "Rug, heupen, benen en romp met gecontroleerde kniebelasting.",
          exercises: function (week) {
            var p = trainingPlanFor(week);
            return [
              ["Rustig roeien", "7 min", "Maak de kniehoek niet dieper dan prettig voelt."],
              ["Cable pull-through", p.sets + " × 10–12", "Beweeg vanuit de heupen, rug neutraal."],
              ["Lat pulldown", p.sets + " × 8–12", "Trek richting borst, niet achter de nek."],
              ["Incline chest press", p.sets + " × 8–12", "Gecontroleerd uitstoten en terug."],
              ["Leg press", p.sets + " × 10–12", "Pijnvrije diepte, knieën volgen de voeten."],
              ["Balans met lichte steun", "2 × 20–30 sec per been", "Sta naast een rek, houd zo nodig één hand vast en houd de knie licht gebogen."],
              ["Cable row", p.sets + " × 10–12", "Borst rustig rechtop."],
              ["Dead bug", p.sets + " × 8 per kant", "Onderrug licht tegen de vloer."],
              ["Crosstrainer of roeier", "5–8 min", "Rustig afronden."]
            ];
          }
        },
        {
          id: "optional-cardio", order: 4, title: "Rustige duurtraining", type: "Optioneel", duration: 50,
          description: "Extra conditie op praattempo; overslaan als herstel achterblijft.",
          exercises: function (week) {
            var p = trainingPlanFor(week);
            return [
              ["Warming-up", "5 min", "Zeer rustig beginnen."],
              ["Fiets of crosstrainer", Math.max(30, p.cardio + 10) + " min", "RPE 4–5: je kunt blijven praten."],
              ["Mobiliteit", "5 min", "Rustige heup-, kuit- en bovenbeenbewegingen."]
            ];
          }
        }
      ];

      var exerciseAlternatives = {
        "Rustig fietsen": ["Crosstrainer rustig", "Roeien met korte haal"],
        "Squat naar bankje": ["Leg press met kleine bewegingsuitslag", "Sit-to-stand vanaf hogere bank"],
        "Chest press": ["Incline push-up tegen bank", "Machine press met neutrale greep"],
        "Seated row": ["Cable row", "Chest-supported row"],
        "Hip thrust": ["Glute bridge", "Cable pull-through"],
        "Hamstring curl": ["Glute bridge walk-out", "Lichte Romanian deadlift"],
        "Staande kuitheffing": ["Zittende kuitheffing", "Kuitheffing met twee handen aan een rek"],
        "Balans met lichte steun": ["Tandemstand met steun", "Gewichtsverplaatsing links-rechts"],
        "Plank": ["Plank op knieën", "Dead bug"],
        "Conditie-intervallen": ["Fietsintervallen", "Crosstrainerintervallen", "Roeien met beperkte kniehoek"],
        "Box squat": ["Sit-to-stand vanaf hoge bank", "Leg press met kleine bewegingsuitslag"],
        "Verhoogde walk-out": ["Kleine tweebenige sprongen", "Incline mountain climber zonder tempo", "Dead bug"],
        "Verhoogde step-back burpee": ["Step-back burpee met klein sprongetje", "Verhoogde walk-out", "Kleine tweebenige sprongen"],
        "Step-back burpee met klein sprongetje": ["Verhoogde step-back burpee zonder sprong", "Kleine tweebenige sprongen", "Verhoogde walk-out"],
        "Cable pull-through": ["Hip thrust", "Lichte Romanian deadlift"],
        "Leg press": ["Squat naar hoge bank", "Sit-to-stand"],
        "Crosstrainer of roeier": ["Rustig fietsen", "Wandelen op vlakke band zonder helling"],
        "Fiets of crosstrainer": ["Roeien met beperkte kniehoek", "Rustig wandelen op vlakke band"]
      };

      var mealDays = [
        [
          ["Ontbijt", "300 g magere kwark, 50 g havermout, 120 g banaan en 15 g ongezouten noten", 480, 34, 9, 0, 120, "Meng alles in een kom; gebruik kaneel voor extra smaak."],
          ["Lunch", "4 volkoren boterhammen, 150 g hüttenkäse, 1 ei en 150 g rauwkost", 560, 38, 12, 150, 0, "Kook het ei en verdeel hüttenkäse, ei en rauwkost over het brood."],
          ["Tussendoor", "250 g skyr en 150 g appel", 230, 20, 5, 0, 150, "Snijd de appel door de skyr of eet hem ernaast."],
          ["Avondeten", "200 g tofu, 100 g edamame, 300 g aardappelen, 300 g gemengde groenten en 10 g olijfolie", 760, 48, 16, 300, 0, "Bak tofu en groenten in de olie; kook of rooster de aardappelen en voeg edamame toe."],
          ["Avond", "2 volkoren crackers met 100 g hüttenkäse", 180, 14, 3, 0, 0, "Breng op smaak met peper, bieslook of paprikapoeder."]
        ],
        [
          ["Ontbijt", "3 volkoren boterhammen, roerei van 3 eieren en 150 g tomaat", 510, 32, 9, 150, 0, "Bak het roerei zonder boter of met een kleine hoeveelheid vloeibaar bakproduct."],
          ["Lunch", "2 volkoren wraps, 150 g kidneybonen, 100 g hüttenkäse en 200 g rauwkost", 570, 40, 15, 200, 0, "Spoel de bonen af, meng met hüttenkäse en rauwkost en rol de wraps op."],
          ["Tussendoor", "250 g magere kwark en 150 g rood fruit", 220, 22, 5, 0, 150, "Gebruik vers of ongezoet diepvriesfruit."],
          ["Avondeten", "75 g volkoren pasta (droog), 125 g linzen (uitgelekt), 100 g sojagehakt, 300 g groenten, 200 ml passata en 10 g olijfolie", 760, 46, 18, 300, 0, "Kook de pasta; bak groenten en sojagehakt, voeg linzen en passata toe en laat kort pruttelen."],
          ["Avond", "150 g seizoensfruit en 25 g ongezouten noten", 200, 5, 5, 0, 150, "Weeg de noten één keer af om de portie te leren herkennen."]
        ],
        [
          ["Ontbijt", "50 g havermout, 200 ml halfvolle melk, 200 g magere kwark, 150 g appel en kaneel", 490, 31, 10, 0, 150, "Meng de avond ervoor en zet afgedekt in de koelkast."],
          ["Lunch", "4 volkoren boterhammen, 150 g hüttenkäse, 40 g hummus en 200 g komkommer en tomaat", 540, 41, 13, 200, 0, "Besmeer het brood met hummus en hüttenkäse en voeg de rauwkost toe."],
          ["Tussendoor", "250 g skyr en 120 g banaan", 240, 21, 3, 0, 120, "Eet samen als snel tussendoormoment."],
          ["Avondeten", "150 g zalm, 90 g zilvervliesrijst (droog), 300 g broccoli en 10 g olijfolie", 800, 47, 12, 300, 0, "Kook rijst en broccoli; bak de zalm gaar en gebruik de olie voor bereiding of dressing."],
          ["Avond", "250 g magere yoghurt", 160, 12, 0, 0, 0, "Voeg eventueel kaneel of een zoetstof zonder calorieën toe."]
        ],
        [
          ["Ontbijt", "300 g magere kwark, 45 g muesli zonder veel suiker, 150 g peer en 15 g pompoenpitten", 500, 34, 10, 0, 150, "Meng alles in een kom; laat diepvriesfruit eerst ontdooien als je dat als wissel gebruikt."],
          ["Lunch", "Omelet van 3 eieren met 200 g groenten en 3 volkoren boterhammen", 590, 36, 11, 200, 0, "Bak de groenten eerst, voeg losgeklopte eieren toe en serveer met brood."],
          ["Tussendoor", "250 g skyr en 150 g seizoensfruit", 220, 21, 4, 0, 150, "Kies fruit dat je die week nog over hebt."],
          ["Avondeten", "80 g zilvervliesrijst (droog), 200 g kidneybonen (uitgelekt), 150 g sojagehakt, 300 g groenten en 200 ml passata", 780, 49, 20, 300, 0, "Bak groenten en sojagehakt, voeg bonen en passata toe en serveer met de rijst."],
          ["Avond", "2 volkoren crackers met 100 g hüttenkäse", 170, 13, 3, 0, 0, "Breng op smaak met peper of verse kruiden."]
        ],
        [
          ["Ontbijt", "60 g havermout, 250 ml halfvolle melk, 200 g skyr, 120 g banaan en 15 g 100% pindakaas", 520, 35, 10, 0, 120, "Kook havermout in melk en roer skyr en pindakaas er na het koken doorheen."],
          ["Lunch", "1 grote volkoren wrap, 150 g gerookte tofu, 100 g skyr-kruidensaus en 200 g rauwkost", 570, 42, 12, 200, 0, "Bak de tofu kort, meng skyr met kruiden en vul de wrap met tofu, saus en rauwkost."],
          ["Tussendoor", "250 g magere kwark en 150 g aardbeien", 230, 24, 4, 0, 150, "Gebruik vers of ongezoet diepvriesfruit."],
          ["Avondeten", "150 g kipfilet als burger, 350 g aardappelpartjes, 300 g salade en 10 g olijfolie", 790, 51, 12, 300, 0, "Vorm of grill de kipburger, rooster de aardappelen en gebruik de olie in de salade."],
          ["Avond", "150 g seizoensfruit", 100, 1, 3, 0, 150, "Kies bijvoorbeeld een appel, sinaasappel of twee mandarijnen."]
        ],
        [
          ["Ontbijt", "Roerei van 3 eieren, 3 volkoren boterhammen en 150 g seizoensfruit", 520, 31, 10, 0, 150, "Bak het roerei rustig en serveer met brood en fruit."],
          ["Lunch", "200 g tofu, 70 g volkoren couscous (droog), 250 g salade en 100 g yoghurt-kruidendressing", 590, 42, 13, 250, 0, "Bereid de couscous, bak de tofu en meng met salade en yoghurtdressing."],
          ["Tussendoor", "250 g skyr en 120 g banaan", 250, 21, 3, 0, 120, "Eet samen of neem afzonderlijk mee."],
          ["Avondeten", "200 g vegetarische stukjes of 100 g biefstuk, 350 g aardappelen, 300 g groenten en 10 g olijfolie", 760, 48, 12, 300, 0, "Bak de gekozen eiwitbron; kook of rooster aardappelen en groenten en gebruik de olie bij de bereiding."],
          ["Avond", "150 g fruit met 15 g ongezouten noten", 180, 5, 4, 0, 150, "Houd dit een kleine, afgewogen portie."]
        ],
        [
          ["Ontbijt", "300 g magere kwark, 50 g havermout, 150 g fruit en 15 g ongezouten noten", 480, 34, 10, 0, 150, "Meng alles in een kom en voeg kaneel toe naar smaak."],
          ["Lunch", "2 volkoren tosti's van 4 boterhammen met 40 g 30+ kaas en 100 g hüttenkäse, plus 300 ml groentesoep", 610, 40, 13, 200, 0, "Maak de tosti's zonder boter en kies groentesoep met weinig zout."],
          ["Tussendoor", "150 g fruit en 250 g magere yoghurt", 210, 15, 4, 0, 150, "Snijd het fruit door de yoghurt."],
          ["Avondeten", "200 g tofu of 150 g kipfilet, 150 g kikkererwten (uitgelekt), 75 g zilvervliesrijst (droog), 300 g groenten en 100 ml lichte kokosmelk", 790, 48, 18, 300, 0, "Bak de eiwitbron met kerrie, voeg groenten, kikkererwten en kokosmelk toe en serveer met rijst."],
          ["Avond", "2 volkoren crackers met 100 g hüttenkäse", 180, 14, 3, 0, 0, "Breng op smaak met peper of verse kruiden."]
        ]
      ];
      var BASE_MEAL_CALORIES = 2250;
      var BASE_MEAL_PROTEIN = 150;
      var NUTRITION_GOALS = { fiber: 30, vegetables: 250, fruit: 200, water: 1800 };

      var shoppingCategories = [
        {
          name: "Groente & fruit",
          items: [
            ["bananen", "Bananen", "5 stuks"],
            ["appels", "Appels", "4 stuks"],
            ["peren", "Peren", "2 stuks"],
            ["rood-fruit", "Rood fruit", "500 g"],
            ["overig-fruit", "Overig seizoensfruit", "5 stuks"],
            ["gemengde-groenten", "Gemengde groenten", "1,5 kg"],
            ["broccoli", "Broccoli", "300 g"],
            ["tomaten", "Tomaten", "6 stuks"],
            ["komkommer", "Komkommer", "2 stuks"],
            ["salademix", "Rauwkost of salademix", "3 zakken"],
            ["uien", "Uien", "4 stuks"],
            ["groentesoep", "Groentesoep", "1 liter"]
          ]
        },
        {
          name: "Eiwitbronnen",
          items: [
            ["kipfilet", "Kipfilet", "150 g"],
            ["zalm", "Zalmfilet", "150 g"],
            ["zaterdag-eiwit", "Vegetarische stukjes", "200 g"],
            ["tofu", "Tofu", "750 g"],
            ["edamame", "Edamame", "100 g"],
            ["sojagehakt", "Sojagehakt", "250 g"],
            ["kidneybonen", "Kidneybonen", "3 blikken"],
            ["linzen", "Linzen", "1 blik"],
            ["kikkererwten", "Kikkererwten", "2 blikken"]
          ]
        },
        {
          name: "Zuivel & eieren",
          items: [
            ["magere-kwark", "Magere kwark", "2,5 kg"],
            ["skyr", "Skyr", "1,5 kg"],
            ["yoghurt", "Magere yoghurt", "1 liter"],
            ["melk", "Halfvolle melk", "1 liter"],
            ["eieren", "Eieren", "10 stuks"],
            ["huttenkase", "Hüttenkäse", "800 g"],
            ["kaas", "30+ kaas", "150 g"]
          ]
        },
        {
          name: "Brood, granen & aardappelen",
          items: [
            ["volkoren-brood", "Volkoren brood", "2 broden"],
            ["havermout", "Havermout", "500 g"],
            ["muesli", "Muesli zonder veel suiker", "250 g"],
            ["wraps", "Volkoren wraps", "4 stuks"],
            ["pasta", "Volkoren pasta", "500 g"],
            ["rijst", "Zilvervliesrijst", "750 g"],
            ["aardappelen", "Aardappelen", "2,5 kg"],
            ["couscous", "Volkoren couscous", "250 g"],
            ["crackers", "Volkoren crackers", "1 pak"]
          ]
        },
        {
          name: "Voorraad",
          items: [
            ["noten", "Ongezouten noten", "250 g"],
            ["pindakaas", "100% pindakaas", "1 pot"],
            ["hummus", "Hummus", "200 g"],
            ["tomatensaus", "Tomatenpassata", "2 pakken"],
            ["olijfolie", "Olijfolie", "1 fles, indien nodig"],
            ["kruiden", "Kruiden: kaneel, kerrie, paprika en chili", "naar smaak"]
          ]
        }
      ];

      var VIEW_NAMES = ["dashboard", "training", "nutrition", "knee", "weekly", "progress", "settings"];

      var defaultState = {
        profile: { age: 36, height: 184, startWeight: 87.5, calories: 2250, protein: 150, startDate: todayIso },
        completions: {},
        mealLogs: {},
        customFoodLogs: [],
        waterLogs: {},
        shoppingChecks: {},
        kneeChecks: [],
        workoutHistory: [],
        weeklyCheckins: [],
        coaching: { mode: "normal", message: "Start rustig en registreer je trainingen. Na je eerste weekcheck wordt het advies persoonlijker.", updated: todayIso },
        weights: [{ date: todayIso, value: 87.5 }],
        selectedWeek: 1,
        selectedView: "dashboard",
        selectedMealDay: Math.max(0, (new Date().getDay() + 6) % 7),
        selectedNutritionMode: "meals",
        selectedStrengthExercise: "",
        trainingSchedule: "mon-wed-sat",
        nutritionSettings: { portionScale: 1, saturdayProtein: "vega", sundayProtein: "tofu" },
        pendingCalories: null,
        activeSession: null
      };

      var state = loadState();
      var activeSession = restoreActiveSession(state.activeSession);
      var sessionTicker = null;
      var restTicker = null;
      var restSeconds = 0;

      function localIso(date) {
        var offset = date.getTimezoneOffset();
        return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 10);
      }

      function safeNumber(value, fallback) {
        if (value == null || (typeof value === "string" && value.trim() === "")) return fallback;
        var parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : fallback;
      }

      function currentTodayIso() {
        return localIso(new Date());
      }

      function restoreActiveSession(savedSession) {
        if (!savedSession || typeof savedSession !== "object") return null;
        if (!workouts.some(function (workout) { return workout.id === savedSession.workoutId; })) return null;
        return {
          workoutId: savedSession.workoutId,
          week: Math.min(12, Math.max(1, safeNumber(savedSession.week, 1))),
          cycle: Math.max(1, safeNumber(savedSession.cycle, currentProgramCycle())),
          startedAt: Math.max(0, safeNumber(savedSession.startedAt, Date.now())),
          checked: Array.isArray(savedSession.checked) ? savedSession.checked.map(function (index) { return safeNumber(index, -1); }).filter(function (index) { return index >= 0; }) : [],
          logs: savedSession.logs && typeof savedSession.logs === "object" ? savedSession.logs : {},
          rpe: Math.min(10, Math.max(1, safeNumber(savedSession.rpe, 6))),
          kneePain: Math.min(10, Math.max(0, safeNumber(savedSession.kneePain, 0)))
        };
      }

      function persistActiveSession() {
        state.activeSession = activeSession ? JSON.parse(JSON.stringify(activeSession)) : null;
        saveState();
      }

      /* Debounce voor hoogfrequente invoer (typen, slider slepen): niet per toetsaanslag
         de volledige state serialiseren. */
      var persistSessionTimer = null;
      function persistActiveSessionSoon() {
        clearTimeout(persistSessionTimer);
        persistSessionTimer = setTimeout(persistActiveSession, 400);
      }

      function isIsoDay(value) {
        return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
      }

      /* Dieptevalidatie: dwingt types af zodat een (geimporteerde) back-up nooit
         HTML kan injecteren of de app kan laten crashen op ontbrekende velden. */
      function sanitizeState(merged) {
        var profileDefaults = defaultState.profile;
        merged.profile.age = safeNumber(merged.profile.age, profileDefaults.age);
        merged.profile.height = safeNumber(merged.profile.height, profileDefaults.height);
        merged.profile.startWeight = safeNumber(merged.profile.startWeight, profileDefaults.startWeight);
        merged.profile.calories = safeNumber(merged.profile.calories, profileDefaults.calories);
        merged.profile.protein = safeNumber(merged.profile.protein, profileDefaults.protein);
        if (!isIsoDay(merged.profile.startDate)) merged.profile.startDate = todayIso;
        merged.weights = merged.weights.filter(function (entry) {
          return entry && typeof entry === "object" && isIsoDay(entry.date) && Number.isFinite(Number(entry.value));
        }).map(function (entry) { return { date: entry.date, value: Number(entry.value) }; });
        if (!merged.weights.length) merged.weights = defaultState.weights.slice();
        merged.weeklyCheckins = merged.weeklyCheckins.filter(function (entry) {
          return entry && typeof entry === "object" && isIsoDay(entry.day);
        }).map(function (entry) {
          return Object.assign({}, entry, {
            weight: safeNumber(entry.weight, profileDefaults.startWeight),
            energy: safeNumber(entry.energy, 6),
            sleep: safeNumber(entry.sleep, 6),
            knee: safeNumber(entry.knee, 1),
            swelling: entry.swelling === true,
            instability: entry.instability === true
          });
        });
        merged.workoutHistory = merged.workoutHistory.filter(function (entry) {
          return entry && typeof entry === "object" && typeof entry.date === "string" && isIsoDay(entry.day);
        });
        merged.kneeChecks = merged.kneeChecks.filter(function (entry) {
          return entry && typeof entry === "object" && typeof entry.date === "string";
        });
        merged.customFoodLogs = merged.customFoodLogs.filter(function (entry) {
          return entry && typeof entry === "object";
        });
        merged.selectedMealDay = Math.min(6, Math.max(0, Math.round(safeNumber(merged.selectedMealDay, 0))));
        merged.selectedWeek = Math.min(12, Math.max(1, Math.round(safeNumber(merged.selectedWeek, 1))));
        merged.selectedNutritionMode = merged.selectedNutritionMode === "shopping" ? "shopping" : "meals";
        if (VIEW_NAMES.indexOf(merged.selectedView) === -1) merged.selectedView = "dashboard";
        return merged;
      }

      function mergeSavedState(saved) {
        var merged = Object.assign({}, defaultState, saved);
          merged.profile = Object.assign({}, defaultState.profile, saved.profile || {});
          merged.completions = saved.completions || {};
          merged.mealLogs = saved.mealLogs || {};
          merged.customFoodLogs = Array.isArray(saved.customFoodLogs) ? saved.customFoodLogs : [];
          merged.waterLogs = saved.waterLogs && typeof saved.waterLogs === "object" ? saved.waterLogs : {};
          merged.shoppingChecks = saved.shoppingChecks || {};
          merged.kneeChecks = Array.isArray(saved.kneeChecks) ? saved.kneeChecks : [];
          merged.workoutHistory = Array.isArray(saved.workoutHistory) ? saved.workoutHistory : [];
          merged.weeklyCheckins = Array.isArray(saved.weeklyCheckins) ? saved.weeklyCheckins : [];
          merged.coaching = Object.assign({}, defaultState.coaching, saved.coaching || {});
          merged.weights = Array.isArray(saved.weights) && saved.weights.length ? saved.weights : defaultState.weights.slice();
          merged.nutritionSettings = Object.assign({}, defaultState.nutritionSettings, saved.nutritionSettings || {});
          merged.trainingSchedule = trainingSchedules[saved.trainingSchedule] ? saved.trainingSchedule : defaultState.trainingSchedule;
        merged.pendingCalories = saved.pendingCalories && typeof saved.pendingCalories === "object" ? saved.pendingCalories : null;
        merged.activeSession = saved.activeSession && typeof saved.activeSession === "object" ? saved.activeSession : null;
        return sanitizeState(merged);
      }

      function loadState() {
        try {
          var saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
          if (!saved || typeof saved !== "object") return JSON.parse(JSON.stringify(defaultState));
          return mergeSavedState(saved);
        } catch (error) {
          return JSON.parse(JSON.stringify(defaultState));
        }
      }

      var storageWarningShown = false;

      function saveState() {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
          storageWarningShown = false;
          return true;
        } catch (error) {
          /* Nooit stil laten mislukken: de gebruiker denkt anders dat alles bewaard is. */
          if (!storageWarningShown) {
            storageWarningShown = true;
            window.alert("Opslaan is niet gelukt: de browseropslag is vol of geblokkeerd. Recente wijzigingen kunnen verloren gaan. Download een back-up via Profiel zodra opslaan weer lukt.");
          }
          return false;
        }
      }

      function escapeHtml(value) {
        return String(value).replace(/[&<>'"]/g, function (char) {
          return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", "\"": "&quot;" }[char];
        });
      }

      function phaseFor(week) {
        return phases.find(function (phase) { return week >= phase.min && week <= phase.max; }) || phases[0];
      }

      function trainingPlanFor(week) {
        var plan = Object.assign({}, phaseFor(week));
        if (state.coaching.mode === "recover") {
          plan.sets = Math.max(2, plan.sets - 1);
          plan.circuit = Math.max(2, plan.circuit - 1);
          plan.cardio = Math.max(15, Math.round(plan.cardio * 0.8));
          plan.label += " · herstelstand";
        }
        return plan;
      }

      /* Week en cyclus worden op dag-niveau berekend (wissel om middernacht, niet om 12:00)
         en overal via dezelfde functie, zodat dashboard en handmatige sessies nooit
         een andere week zien op de overgangsdag. Math.round vangt DST-uurverschuiving af. */
      function programPositionForDay(day) {
        var start = new Date(state.profile.startDate + "T12:00:00");
        var target = new Date((day || currentTodayIso()) + "T12:00:00");
        var days = Math.round((target - start) / 86400000);
        var elapsedWeek = Math.max(1, Math.floor(days / 7) + 1);
        return { week: (elapsedWeek - 1) % 12 + 1, cycle: Math.floor((elapsedWeek - 1) / 12) + 1 };
      }

      function currentProgramWeek() {
        return programPositionForDay(currentTodayIso()).week;
      }

      function currentProgramCycle() {
        return programPositionForDay(currentTodayIso()).cycle;
      }

      function manualSessionsForCurrentWeek() {
        /* Zelfde weekvenster als het weekdoel: de programmaweek vanaf de startdatum,
           niet de kalenderweek (ma-zo). Anders tellen "x/3" en "handmatig extra"
           over verschillende periodes zodra de startdatum geen maandag is. */
        var programStart = new Date(state.profile.startDate + "T12:00:00");
        var today = new Date(currentTodayIso() + "T12:00:00");
        var days = Math.max(0, Math.round((today - programStart) / 86400000));
        var weekStart = new Date(programStart);
        weekStart.setDate(weekStart.getDate() + Math.floor(days / 7) * 7);
        var end = new Date(weekStart);
        end.setDate(end.getDate() + 6);
        var startIso = localIso(weekStart);
        var endIso = localIso(end);
        return state.workoutHistory.filter(function (record) {
          var day = record.day || String(record.date || "").slice(0, 10);
          return record.manual === true && day >= startIso && day <= endIso;
        });
      }

      function completionKey(week, id, cycle) {
        return "c" + Math.max(1, safeNumber(cycle, currentProgramCycle())) + "::" + String(week) + "::" + id;
      }

      function isComplete(week, id, cycle) {
        var activeCycle = Math.max(1, safeNumber(cycle, currentProgramCycle()));
        if (state.completions[completionKey(week, id, activeCycle)]) return true;
        return activeCycle === 1 && Boolean(state.completions[String(week) + "::" + id]);
      }

      function formatDate(value, options) {
        return new Date(value + "T12:00:00").toLocaleDateString("nl-NL", options || { day: "numeric", month: "short" });
      }

      function refreshIcons() {
        if (window.lucide && typeof window.lucide.createIcons === "function") {
          window.lucide.createIcons({ attrs: { width: 16, height: 16 } });
        }
      }

      /* Behoud focus en open <details>-elementen over volledige innerHTML-rebuilds heen,
         zodat toetsenbord- en VoiceOver-gebruikers hun positie niet verliezen bij elk vinkje. */
      var UI_STATE_ATTRS = ["data-meal-check", "data-shopping-check", "data-meal-day", "data-nutrition-mode", "data-session-check", "data-session-log", "data-session-alternative", "data-start-workout", "data-edit-food", "data-delete-food"];

      function uiFocusKeyFor(element) {
        if (!element || element === document.body) return null;
        if (element.id) return "#" + (window.CSS && CSS.escape ? CSS.escape(element.id) : element.id);
        for (var i = 0; i < UI_STATE_ATTRS.length; i++) {
          var value = element.getAttribute(UI_STATE_ATTRS[i]);
          if (value !== null) return "[" + UI_STATE_ATTRS[i] + "=\"" + value.replace(/"/g, '\\"') + "\"]";
        }
        return null;
      }

      function detailsStateKey(detail) {
        var summary = detail.querySelector("summary");
        var container = detail.closest("article, section");
        var heading = container ? container.querySelector("h3, h2") : null;
        return (heading ? heading.textContent + "::" : "") + (summary ? summary.textContent : "");
      }

      function preserveUiState(render) {
        var active = document.activeElement;
        var focusKey = active && root.contains(active) ? uiFocusKeyFor(active) : null;
        var openKeys = [];
        root.querySelectorAll("details[open]").forEach(function (detail) {
          var key = detailsStateKey(detail);
          if (key) openKeys.push(key);
        });
        render();
        if (openKeys.length) {
          root.querySelectorAll("details").forEach(function (detail) {
            if (openKeys.indexOf(detailsStateKey(detail)) !== -1) detail.open = true;
          });
        }
        if (focusKey) {
          var next = null;
          try { next = root.querySelector(focusKey); } catch (error) { next = null; }
          if (next && typeof next.focus === "function") next.focus({ preventScroll: true });
        }
      }

      /* Per-view rendering: elke view heeft eigen renderfuncties en wordt pas
         (opnieuw) opgebouwd wanneer hij zichtbaar wordt. renderAll herbouwt dus
         niet langer alle zeven views bij elke opslag. */
      var VIEW_RENDERERS = {
        dashboard: function () { renderDashboard(); },
        training: function () { renderWeekSelect(); renderWorkouts(); renderTrainingGuidance(); renderActiveSession(); },
        nutrition: function () { renderNutrition(); },
        knee: function () { renderKneeHistory(); updateKneePreview(); },
        weekly: function () { renderWeeklyCheck(); },
        progress: function () { renderWeight(); renderTrainingHistory(); renderProgressCharts(); },
        settings: function () { renderProfile(); }
      };
      var dirtyViews = {};

      function currentViewName() {
        var section = root.querySelector("[data-view]:not([hidden])");
        return section ? section.dataset.view : "dashboard";
      }

      function renderView(name) {
        var render = VIEW_RENDERERS[name];
        if (!render) return;
        render();
        delete dirtyViews[name];
        refreshIcons();
      }

      /* Render direct als de view zichtbaar is; markeer hem anders als verouderd. */
      function refreshView(name) {
        if (currentViewName() === name) renderView(name);
        else dirtyViews[name] = true;
      }

      function renderAll() {
        todayIso = currentTodayIso();
        state.selectedWeek = Math.min(12, Math.max(1, safeNumber(state.selectedWeek, currentProgramWeek())));
        renderHeader();
        Object.keys(VIEW_RENDERERS).forEach(function (name) { dirtyViews[name] = true; });
        renderView(currentViewName());
      }

      function renderHeader() {
        root.querySelector("#todayLabel").textContent = new Date().toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" });
      }

      function getWeekCompletions(week) {
        return workouts.filter(function (workout) { return isComplete(week, workout.id); });
      }

      function nextWorkout(week) {
        return workouts.find(function (workout) { return workout.type === "Vast" && !isComplete(week, workout.id); }) || workouts.find(function (workout) { return !isComplete(week, workout.id); }) || workouts[0];
      }

      function replacedMealIndexes(dayIndex) {
        return customFoodForDay(mealDateForDay(dayIndex)).filter(function (entry) {
          return entry.relation === "replace" && safeNumber(entry.replacedMealIndex, -1) >= 0;
        }).map(function (entry) { return safeNumber(entry.replacedMealIndex, -1); });
      }

      function nutritionTotals(dayIndex) {
        var key = mealLogKey(dayIndex);
        var eaten = state.mealLogs[key] || [];
        var replaced = replacedMealIndexes(dayIndex);
        var totals = mealDays[dayIndex].map(function (meal, index) { return personalizedMeal(dayIndex, index, meal); }).reduce(function (acc, meal, index) {
          if (eaten.indexOf(index) !== -1 && replaced.indexOf(index) === -1) {
            acc.calories += meal[2];
            acc.protein += meal[3];
            acc.fiber += safeNumber(meal[4], 0);
            acc.vegetables += safeNumber(meal[5], 0);
            acc.fruit += safeNumber(meal[6], 0);
          }
          acc.plannedCalories += meal[2];
          acc.plannedProtein += meal[3];
          acc.plannedFiber += safeNumber(meal[4], 0);
          acc.plannedVegetables += safeNumber(meal[5], 0);
          acc.plannedFruit += safeNumber(meal[6], 0);
          return acc;
        }, { calories: 0, protein: 0, fiber: 0, vegetables: 0, fruit: 0, water: safeNumber(state.waterLogs[mealDateForDay(dayIndex)], 0), plannedCalories: 0, plannedProtein: 0, plannedFiber: 0, plannedVegetables: 0, plannedFruit: 0, customCalories: 0, customProtein: 0 });
        customFoodForDay(mealDateForDay(dayIndex)).forEach(function (entry) {
          totals.customCalories += safeNumber(entry.calories, 0);
          totals.customProtein += safeNumber(entry.protein, 0);
          totals.fiber += safeNumber(entry.fiber, 0);
          totals.vegetables += safeNumber(entry.vegetables, 0);
          totals.fruit += safeNumber(entry.fruit, 0);
        });
        totals.customProtein = Math.round(totals.customProtein * 10) / 10;
        totals.calories += totals.customCalories;
        totals.protein = Math.round((totals.protein + totals.customProtein) * 10) / 10;
        totals.fiber = Math.round(totals.fiber * 10) / 10;
        return totals;
      }

      function nutritionScale() {
        var targetScale = safeNumber(state.profile.calories, BASE_MEAL_CALORIES) / BASE_MEAL_CALORIES;
        var preference = Math.min(1.1, Math.max(0.9, safeNumber((state.nutritionSettings || defaultState.nutritionSettings).portionScale, 1)));
        return Math.min(1.8, Math.max(0.65, targetScale * preference));
      }

      function nutritionProteinScale() {
        return Math.min(1.5, Math.max(0.75, safeNumber(state.profile.protein, BASE_MEAL_PROTEIN) / BASE_MEAL_PROTEIN));
      }

      function personalizedMeal(dayIndex, mealIndex, sourceMeal) {
        var meal = sourceMeal.slice();
        var settings = state.nutritionSettings || defaultState.nutritionSettings;
        var scale = nutritionScale();
        if (dayIndex === 5 && mealIndex === 3) {
          meal[1] = settings.saturdayProtein === "vega" ? "200 g vegetarische stukjes, 350 g aardappelen, 300 g groenten en 10 g olijfolie" : "100 g biefstuk, 350 g aardappelen, 300 g groenten en 10 g olijfolie";
        }
        if (dayIndex === 6 && mealIndex === 3) {
          meal[1] = (settings.sundayProtein === "tofu" ? "200 g tofu" : "150 g kipfilet") + ", 150 g kikkererwten (uitgelekt), 75 g zilvervliesrijst (droog), 300 g groenten en 100 ml lichte kokosmelk";
        }
        meal[1] = scaleMealDescription(meal[1], scale, nutritionProteinScale());
        meal[2] = Math.round(meal[2] * scale / 10) * 10;
        meal[3] = Math.round(meal[3] * nutritionProteinScale());
        return meal;
      }

      function scaleMealDescription(description, energyScale, proteinScale) {
        if (energyScale === 1 && proteinScale === 1) return description;
        var energyTerms = /havermout|muesli|boterham|wrap|pasta|rijst|aardappel|couscous|noten|pindakaas|olijfolie|pompoenpit|kokosmelk/;
        var proteinTerms = /kwark|skyr|yoghurt|melk|hüttenkäse|tofu|tempeh|kip|zalm|biefstuk|vegetarische stukjes|edamame|sojagehakt|kidneybonen|linzen|kikkererwten|hummus|kaas/;
        /* Staat één bijvoeglijk naamwoord tussen getal en eenheid toe ("4 volkoren boterhammen"),
           en telt de eenheid zelf mee in de context, zodat stuk-items net als de kcal meeschalen. */
        return String(description).replace(/(\d+(?:[.,]\d+)?)\s*((?:[a-zà-ü-]+\s+)?)(g|ml|boterhammen|wraps|crackers|eieren|stuks)\b/gi, function (match, numberText, middle, unit, offset, fullText) {
          var context = (middle + unit + " " + fullText.slice(offset + match.length, offset + match.length + 28)).toLowerCase();
          /* Energie-termen eerst: "pindakaas" bevat anders de eiwitterm "kaas" en schaalt verkeerd. */
          var scale = unit.toLowerCase() === "eieren" ? proteinScale : (energyTerms.test(context) ? energyScale : (proteinTerms.test(context) ? proteinScale : 1));
          if (scale === 1) return match;
          var value = Number(numberText.replace(",", "."));
          var scaled = /^(g|ml)$/i.test(unit) ? Math.max(5, Math.round(value * scale / 5) * 5) : Math.max(1, Math.round(value * scale));
          return String(scaled).replace(".", ",") + " " + middle + unit;
        });
      }

      function scaleQuantity(quantity, scale) {
        if (scale === 1 || /naar smaak|indien nodig/.test(quantity)) return quantity;
        var match = String(quantity).match(/(\d+(?:[.,]\d+)?)/);
        if (!match) return quantity;
        var value = Number(match[1].replace(",", "."));
        var unitText = quantity.slice(match.index + match[0].length).trim();
        var scaled;
        if (/^(?:stuks?|blikjes?|blikken?|zakken?|pak(?:ken)?|broden|pot(?:ten)?|fles(?:sen)?)\b/.test(unitText)) scaled = Math.max(1, Math.ceil(value * scale));
        else if (/^g\b/.test(unitText)) scaled = Math.max(25, Math.round(value * scale / 25) * 25);
        else scaled = Math.round(value * scale * 10) / 10;
        return String(scaled).replace(".", ",") + " " + unitText;
      }

      function activeShoppingCategories() {
        var settings = state.nutritionSettings || defaultState.nutritionSettings;
        var scale = nutritionScale();
        var scalableItems = ["volkoren-brood", "havermout", "muesli", "wraps", "pasta", "rijst", "aardappelen", "couscous", "crackers", "noten", "pindakaas", "olijfolie"];
        var proteinItems = ["kipfilet", "zalm", "zaterdag-eiwit", "tofu", "edamame", "sojagehakt", "kidneybonen", "linzen", "kikkererwten", "magere-kwark", "skyr", "yoghurt", "melk", "eieren", "huttenkase", "kaas"];
        return shoppingCategories.map(function (category) {
          return {
            name: category.name,
            items: category.items.map(function (item) {
              var copy = item.slice();
              if (copy[0] === "zaterdag-eiwit") {
                copy[1] = settings.saturdayProtein === "vega" ? "Vegetarische stukjes" : "Biefstuk";
                copy[2] = settings.saturdayProtein === "vega" ? "200 g" : "100 g";
              }
              if (copy[0] === "kipfilet") copy[2] = settings.sundayProtein === "chicken" ? "300 g" : "150 g";
              if (copy[0] === "tofu") copy[2] = settings.sundayProtein === "tofu" ? "750 g" : "550 g";
              if (scalableItems.indexOf(copy[0]) !== -1) copy[2] = scaleQuantity(copy[2], scale);
              else if (proteinItems.indexOf(copy[0]) !== -1) copy[2] = scaleQuantity(copy[2], nutritionProteinScale());
              return copy;
            })
          };
        });
      }

      function todayMealDay() {
        return Math.max(0, (new Date().getDay() + 6) % 7);
      }

      function mealDateForDay(dayIndex) {
        var date = new Date();
        date.setHours(12, 0, 0, 0);
        date.setDate(date.getDate() + safeNumber(dayIndex, todayMealDay()) - todayMealDay());
        return localIso(date);
      }

      function mealLogKey(dayIndex) {
        return mealDateForDay(dayIndex) + "::" + dayIndex;
      }

      function weightDelta() {
        var sorted = state.weights.slice().sort(function (a, b) { return a.date.localeCompare(b.date); });
        if (sorted.length < 2) return 0;
        return sorted[sorted.length - 1].value - sorted[0].value;
      }

      function renderDashboard() {
        preserveUiState(renderDashboardCore);
      }

      function renderDashboardCore() {
        var week = currentProgramWeek();
        var cycle = currentProgramCycle();
        var phase = trainingPlanFor(week);
        var completed = getWeekCompletions(week);
        var coreDone = completed.filter(function (w) { return w.type === "Vast"; }).length;
        var manualSessions = manualSessionsForCurrentWeek();
        var delta = weightDelta();
        var stats = [
          ["Programma", "Cyclus " + cycle + " · week " + week + "/12", phase.label],
          ["Trainingen", coreDone + "/3", manualSessions.length ? manualSessions.length + " handmatig extra" : (completed.length > coreDone ? "+ optionele dag" : "vaste sessies")],
          ["Gewichtstrend", (delta > 0 ? "+" : "") + delta.toFixed(1) + " kg", state.weights.length < 2 ? "eerste meetpunt" : "sinds de start"]
        ];
        root.querySelector("#dashboardStats").innerHTML = stats.map(function (item) {
          return "<article class=\"card viz-stat\"><span class=\"text-muted\">" + item[0] + "</span><div class=\"viz-stat-value\">" + item[1] + "</div><span class=\"text-small text-muted\">" + item[2] + "</span></article>";
        }).join("");
        root.querySelector("#weekContext").textContent = "Cyclus " + cycle + " · week " + week + " · " + phase.label + " · " + phase.detail;

        var next = nextWorkout(week);
        var progress = Math.min(100, Math.round(coreDone / 3 * 100));
        root.querySelector("#nextWorkoutCard").innerHTML =
          "<span class=\"viz-badge\">Volgende training</span>" +
          "<h2>" + escapeHtml(next.title) + "</h2>" +
          "<p>" + escapeHtml(next.description) + "</p>" +
          "<div class=\"metric-pair text-small\"><span>Weekdoel</span><strong>" + coreDone + " van 3 voltooid</strong></div>" +
          "<div class=\"progress-track\" role=\"img\" aria-label=\"" + progress + "% van het weekdoel voltooid\"><div class=\"progress-fill\" style=\"width:" + progress + "%\"></div></div>" +
          "<div class=\"card-actions\"><button class=\"btn btn-primary\" type=\"button\" data-start-workout=\"" + next.id + "\" data-week=\"" + week + "\">Start training</button><button class=\"btn\" type=\"button\" data-open-training>Bekijk programma</button></div>";

        var totals = nutritionTotals(todayMealDay());
        var kcalPct = Math.min(100, Math.round(totals.calories / state.profile.calories * 100));
        var proteinPct = Math.min(100, Math.round(totals.protein / state.profile.protein * 100));
        root.querySelector("#dailyTargets").innerHTML =
          "<h3>Dagdoelen</h3>" +
          "<div class=\"macro-bars\"><div class=\"metric-pair\"><span>Calorieën</span><strong>" + totals.calories + " / " + state.profile.calories + " kcal</strong></div><div class=\"progress-track\"><div class=\"progress-fill\" style=\"width:" + kcalPct + "%\"></div></div>" +
          "<div class=\"metric-pair\"><span>Eiwit</span><strong>" + totals.protein + " / " + state.profile.protein + " g</strong></div><div class=\"progress-track\"><div class=\"progress-fill\" style=\"width:" + proteinPct + "%\"></div></div></div>" +
          "<p class=\"text-small text-muted\">Vink menu-items af of voeg eigen voeding toe om je dagtotaal bij te werken.</p>";

        var plannedOverview = workouts.map(function (workout) {
          var complete = isComplete(week, workout.id);
          return "<li class=\"quick-item\"><div class=\"item-main\"><strong>" + workout.order + ". " + escapeHtml(workout.title) + "</strong><span>" + workout.duration + " min · " + workout.type + "</span></div><span class=\"viz-badge\">" + (complete ? "Voltooid" : "Gepland") + "</span></li>";
        }).join("");
        var manualOverview = manualSessions.map(function (record) {
          return "<li class=\"quick-item\"><div class=\"item-main\"><strong>Handmatig · " + escapeHtml(record.workoutTitle || "Training") + "</strong><span>" + safeNumber(record.duration, 0) + " min · " + safeNumber(record.completedExercises, 0) + " oefeningen</span></div><span class=\"viz-badge\">Gelogd</span></li>";
        }).join("");
        root.querySelector("#weekOverview").innerHTML = plannedOverview + manualOverview;
        var coachLabel = state.coaching.mode === "recover" ? "Herstel" : (state.coaching.mode === "progress" ? "Opbouwen" : "Vasthouden");
        root.querySelector("#coachAdviceCard").innerHTML = "<div class=\"coach-summary\"><div><strong>" + coachLabel + "</strong><p>" + escapeHtml(state.coaching.message) + "</p><span class=\"text-small text-muted\">Laatst bijgewerkt: " + formatDate(state.coaching.updated || currentTodayIso(), { day: "numeric", month: "short", year: "numeric" }) + "</span></div><span class=\"viz-badge\">" + coachLabel + "</span></div><div class=\"card-actions\"><button class=\"btn\" type=\"button\" data-open-weekly>Nieuwe weekcheck</button></div>";
      }

      function renderWeekSelect() {
        var select = root.querySelector("#weekSelect");
        select.innerHTML = Array.from({ length: 12 }, function (_, index) {
          var week = index + 1;
          return "<option value=\"" + week + "\"" + (week === state.selectedWeek ? " selected" : "") + ">Week " + week + "</option>";
        }).join("");
      }

      function renderTrainingGuidance() {
        var selectedKey = trainingSchedules[state.trainingSchedule] ? state.trainingSchedule : defaultState.trainingSchedule;
        var schedule = trainingSchedules[selectedKey];
        var options = Object.keys(trainingSchedules).map(function (key) {
          return "<option value=\"" + key + "\"" + (key === selectedKey ? " selected" : "") + ">" + escapeHtml(trainingSchedules[key].label) + "</option>";
        }).join("");
        root.querySelector("#trainingGuidance").innerHTML = "<article class=\"card\"><h3>Jouw weekindeling</h3><label class=\"form-field\"><span class=\"form-label\">Vaste trainingsdagen</span><select class=\"form-select\" id=\"trainingScheduleSelect\">" + options + "</select></label><ul class=\"quick-list\"><li class=\"quick-item\"><span>" + schedule.days[0] + "</span><strong>Kracht A</strong></li><li class=\"quick-item\"><span>" + schedule.days[1] + "</span><strong>Conditie + circuit</strong></li><li class=\"quick-item\"><span>" + schedule.days[2] + "</span><strong>Kracht B</strong></li><li class=\"quick-item\"><span>Optioneel: " + schedule.optional + "</span><strong>Rustige duurtraining</strong></li></ul></article><article class=\"card\"><h3>Wanneer opbouwen?</h3><ol class=\"text-small\"><li>Haal eerst alle sets aan de bovenkant van de herhalingsrange met RPE 7 of lager.</li><li>Alleen opbouwen als de knie tijdens de training maximaal 3/10 blijft en de volgende ochtend terug is op het oude niveau.</li><li>Verhoog daarna één ding: het kleinste gewichtsstapje óf 1–2 herhalingen; bij cardio maximaal 2–3 minuten per week.</li><li>Bij nieuwe zwelling, instabiliteit, blokkeren of pijn boven 4/10: stop de sprongen en verlaag de omvang.</li></ol><p class=\"callout text-small\">Conditiemeting: noteer in week 1, 5 en 9 de afstand van de eerste 10 minuten op dezelfde fiets of crosstrainer, met dezelfde weerstand en RPE.</p></article>";
      }

      function latestWorkoutRecord(workoutId) {
        for (var index = state.workoutHistory.length - 1; index >= 0; index -= 1) {
          if (state.workoutHistory[index].workoutId === workoutId) return state.workoutHistory[index];
        }
        return null;
      }

      function exerciseLogType(exercise) {
        var name = String(exercise[0]).toLowerCase();
        var prescription = String(exercise[1]).toLowerCase();
        if (prescription.indexOf("rondes") !== -1) return "rounds";
        if (prescription.indexOf("sec") !== -1) return "timed";
        if (prescription.indexOf("min") !== -1 || /(fiet|roei|crosstrainer|warming|cooling|conditie)/.test(name)) return "cardio";
        return "strength";
      }

      function exerciseFields(exercise) {
        var type = exerciseLogType(exercise);
        if (type === "cardio") return [["minutes", "Minuten", "1"], ["distance", "Afstand (km)", "0.1"]];
        if (type === "rounds") return [["rounds", "Rondes", "1"]];
        if (type === "timed") return [["sets", "Sets", "1"], ["seconds", "Seconden", "1"]];
        return [["sets", "Sets", "1"], ["reps", "Herhalingen", "1"], ["weight", "Gewicht (kg)", "0.5"]];
      }

      function alternativesFor(exerciseName) {
        var alternatives = exerciseAlternatives[exerciseName] || [];
        if (state.coaching.mode === "recover") {
          return alternatives.filter(function (alternative) { return alternative.toLowerCase().indexOf("sprong") === -1; });
        }
        return alternatives;
      }

      function exerciseProgressionAdvice(workoutId, exerciseIndex, exercise) {
        var previous = latestWorkoutRecord(workoutId);
        if (!previous || !previous.logs || !previous.logs[exerciseIndex]) return "Eerste meting: noteer wat je vandaag werkelijk uitvoert.";
        var log = previous.logs[exerciseIndex];
        var type = exerciseLogType(exercise);
        if (previous.kneePain > 4) return "Vorige keer reageerde je knie: kies minder weerstand of een kleinere bewegingsuitslag.";
        if (previous.rpe >= 8) return "Vorige keer was zwaar: houd de belasting gelijk of verlaag ongeveer 10%.";
        if (type === "strength" && safeNumber(log.reps, 0) >= 12 && previous.rpe <= 7) {
          return safeNumber(log.weight, 0) > 0 ? "Doel: verhoog maximaal 2,5 kg en blijf technisch netjes." : "Doel: kies een iets moeilijkere variant of voeg 1–2 herhalingen toe.";
        }
        if (type === "cardio" && previous.rpe <= 6) return "Doel: voeg maximaal 2–3 minuten toe als je knie rustig blijft.";
        return "Doel: herhaal de vorige belasting en verbeter controle en techniek.";
      }

      function workoutAdvice(record) {
        if (record.kneePain > 4) return "Belasting verlagen; controleer je knieherstel.";
        if (record.rpe >= 8) return "Volgende keer belasting gelijk houden.";
        if (record.rpe <= 6 && record.completedExercises >= Math.max(1, record.totalExercises - 1)) return "Volgende keer één onderdeel rustig opbouwen.";
        return "Zelfde belasting herhalen en techniek bewaken.";
      }

      function completionThreshold(totalExercises) {
        return Math.max(1, Math.ceil(safeNumber(totalExercises, 1) * 0.6));
      }

      function recordCountsForWeek(record) {
        if (record.countsForWeek !== undefined) return Boolean(record.countsForWeek);
        return safeNumber(record.completedExercises, 0) >= completionThreshold(record.totalExercises);
      }

      function renderWorkouts() {
        var week = state.selectedWeek;
        var phase = trainingPlanFor(week);
        root.querySelector("#trainingPhaseText").textContent = "Week " + week + " · " + phase.label + " — " + phase.detail;
        root.querySelector("#workoutGrid").innerHTML = workouts.map(function (workout) {
          var complete = isComplete(week, workout.id);
          var latest = latestWorkoutRecord(workout.id);
          var exercises = workout.exercises(week);
          var list = exercises.map(function (exercise) {
            var alternatives = alternativesFor(exercise[0]);
            var alternativeText = alternatives.length ? " Alternatief: " + alternatives.join(" of ") + "." : "";
            return "<li class=\"exercise-item\"><div class=\"item-main\"><strong>" + escapeHtml(exercise[0]) + "</strong><span class=\"text-small\">" + escapeHtml(exercise[2] + alternativeText) + "</span></div><span class=\"item-value\">" + escapeHtml(exercise[1]) + "</span></li>";
          }).join("");
          var latestNote = latest ? "<p class=\"callout text-small\"><strong>Laatste advies:</strong> " + escapeHtml(latest.advice || workoutAdvice(latest)) + "</p>" : "";
          return "<article class=\"card workout-card\"><header><div><h3>" + workout.order + ". " + escapeHtml(workout.title) + "</h3><p class=\"text-muted\">" + escapeHtml(workout.description) + "</p></div><span class=\"viz-badge\">" + workout.type + "</span></header><div class=\"workout-meta\"><span class=\"viz-badge\">" + workout.duration + " min</span><span class=\"viz-badge\">RPE 4–7</span></div><details><summary>Bekijk oefeningen</summary><ul class=\"exercise-list\">" + list + "</ul></details>" + latestNote + "<div class=\"card-actions\"><button class=\"btn " + (complete ? "" : "btn-primary") + "\" type=\"button\" data-start-workout=\"" + workout.id + "\" data-week=\"" + week + "\">" + (complete ? "Opnieuw uitvoeren" : "Start training") + "</button>" + (complete ? "<span class=\"viz-badge\">Voltooid</span>" : "") + "</div></article>";
        }).join("");
        renderActiveSession();
      }

      function selectedManualExercises() {
        var exercises = Array.from(root.querySelectorAll("[data-manual-exercise]:checked")).map(function (checkbox) { return checkbox.value; });
        var custom = root.querySelector("#manualCustomExercise").value.split(",").map(function (name) { return name.trim(); }).filter(Boolean);
        custom.forEach(function (name) {
          if (!exercises.some(function (existing) { return existing.toLowerCase() === name.toLowerCase(); })) exercises.push(name);
        });
        return exercises;
      }

      function closeManualWorkoutForm() {
        var form = root.querySelector("#manualWorkoutForm");
        form.reset();
        form.hidden = true;
        root.querySelector("#manualWorkoutEditId").value = "";
        root.querySelector("#manualWorkoutToast").textContent = "";
      }

      function openManualWorkoutForm(record) {
        if (activeSession) {
          showView("training");
          showToast("trainingToast", "Rond eerst je actieve training af of stop deze zonder opslaan.", true);
          return;
        }
        var form = root.querySelector("#manualWorkoutForm");
        form.reset();
        root.querySelectorAll("[data-manual-exercise]").forEach(function (checkbox) { checkbox.checked = false; });
        root.querySelector("#manualWorkoutEditId").value = record ? record.id : "";
        root.querySelector("#manualWorkoutDate").max = currentTodayIso();
        root.querySelector("#manualWorkoutDate").value = record ? (record.day || String(record.date).slice(0, 10)) : currentTodayIso();
        root.querySelector("#manualWorkoutTitle").value = record ? (record.workoutTitle || "Handmatige training") : "Handmatige training";
        root.querySelector("#manualWorkoutType").value = record && record.manualType ? record.manualType : "Gemengd";
        root.querySelector("#manualWorkoutDuration").value = record ? safeNumber(record.duration, 45) : 45;
        root.querySelector("#manualWorkoutRpe").value = record ? safeNumber(record.rpe, 6) : 6;
        root.querySelector("#manualWorkoutKnee").value = record ? safeNumber(record.kneePain, 0) : 0;
        var known = Array.from(root.querySelectorAll("[data-manual-exercise]")).map(function (checkbox) { return checkbox.value; });
        var exercises = record && Array.isArray(record.exercises) ? record.exercises : [];
        root.querySelectorAll("[data-manual-exercise]").forEach(function (checkbox) { checkbox.checked = exercises.indexOf(checkbox.value) !== -1; });
        root.querySelector("#manualCustomExercise").value = exercises.filter(function (name) { return known.indexOf(name) === -1; }).join(", ");
        root.querySelector("#manualWorkoutHeading").textContent = record ? "Handmatige sessie bewerken" : "Handmatige sessie toevoegen";
        root.querySelector("#manualWorkoutSubmit").textContent = record ? "Wijzigingen opslaan" : "Sessie opslaan";
        root.querySelector("#manualWorkoutToast").textContent = "";
        form.hidden = false;
        showView("training");
        form.scrollIntoView({ behavior: "smooth", block: "start" });
      }

      function saveManualWorkout(event) {
        event.preventDefault();
        var editId = root.querySelector("#manualWorkoutEditId").value;
        var day = root.querySelector("#manualWorkoutDate").value;
        var title = root.querySelector("#manualWorkoutTitle").value.trim();
        var type = root.querySelector("#manualWorkoutType").value;
        var duration = Math.min(300, Math.max(1, safeNumber(root.querySelector("#manualWorkoutDuration").value, 0)));
        var rpe = Math.min(10, Math.max(1, safeNumber(root.querySelector("#manualWorkoutRpe").value, 6)));
        var kneePain = Math.min(10, Math.max(0, safeNumber(root.querySelector("#manualWorkoutKnee").value, 0)));
        var exercises = selectedManualExercises();
        if (!day || day > currentTodayIso()) {
          showToast("manualWorkoutToast", "Kies vandaag of een datum in het verleden.", true);
          return;
        }
        if (!title) {
          showToast("manualWorkoutToast", "Geef de sessie een naam.", true);
          return;
        }
        if (!exercises.length) {
          showToast("manualWorkoutToast", "Vink minimaal één oefening aan of voeg een andere oefening toe.", true);
          return;
        }
        var position = programPositionForDay(day);
        var record = {
          id: editId || "manual-" + String(Date.now()),
          date: new Date(day + "T12:00:00").toISOString(),
          day: day,
          workoutId: "manual",
          workoutTitle: title,
          manual: true,
          manualType: type,
          exercises: exercises,
          week: position.week,
          cycle: position.cycle,
          duration: duration,
          completedExercises: exercises.length,
          totalExercises: exercises.length,
          countsForWeek: true,
          logs: {},
          cardioMinutes: type === "Conditie" ? duration : 0,
          rpe: rpe,
          kneePain: kneePain
        };
        record.advice = workoutAdvice(record);
        if (editId) {
          var existingIndex = state.workoutHistory.findIndex(function (item) { return item.id === editId && item.manual === true; });
          if (existingIndex < 0) {
            showToast("manualWorkoutToast", "Deze handmatige sessie kon niet worden gevonden.", true);
            return;
          }
          state.workoutHistory[existingIndex] = record;
        } else {
          state.workoutHistory.push(record);
        }
        if (kneePain > 4) {
          state.coaching = { mode: "recover", message: "Je knie reageerde tijdens de laatste training. De trainingsomvang is tijdelijk verlaagd; bouw pas weer op als de klachten zijn hersteld.", updated: day };
        }
        saveState();
        closeManualWorkoutForm();
        renderAll();
        showView("training");
        showToast("trainingToast", editId ? "Handmatige sessie bijgewerkt." : "Handmatige sessie opgeslagen en toegevoegd aan je weektotaal.");
      }

      function startWorkout(id, week) {
        var workout = workouts.find(function (item) { return item.id === id; });
        if (!workout) return;
        clearInterval(sessionTicker);
        clearInterval(restTicker);
        var previous = latestWorkoutRecord(id);
        var previousLogs = previous && previous.logs ? JSON.parse(JSON.stringify(previous.logs)) : {};
        activeSession = { workoutId: id, week: week, cycle: currentProgramCycle(), startedAt: Date.now(), checked: [], logs: previousLogs, rpe: 6, kneePain: 0 };
        restSeconds = 0;
        persistActiveSession();
        showView("training");
        renderActiveSession();
        sessionTicker = setInterval(updateSessionClocks, 1000);
        var sessionHost = root.querySelector("#activeSessionHost");
        if (sessionHost && typeof sessionHost.scrollIntoView === "function") {
          sessionHost.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }

      function renderActiveSession() {
        preserveUiState(renderActiveSessionCore);
      }

      function renderActiveSessionCore() {
        var host = root.querySelector("#activeSessionHost");
        if (!activeSession) { host.innerHTML = ""; return; }
        var workout = workouts.find(function (item) { return item.id === activeSession.workoutId; });
        if (!workout) {
          activeSession = null;
          persistActiveSession();
          host.innerHTML = "";
          return;
        }
        var exercises = workout.exercises(activeSession.week);
        host.innerHTML = "<article class=\"card active-session\"><span class=\"viz-badge\">Training actief</span><h3>" + escapeHtml(workout.title) + "</h3><div class=\"session-clock\" id=\"sessionClock\">00:00</div><p class=\"text-small text-muted\">Vink iedere oefening af en registreer je werkelijke prestatie. Waarde 0 kg betekent lichaamsgewicht.</p><div>" + exercises.map(function (exercise, index) {
          var checked = activeSession.checked.indexOf(index) !== -1;
          var log = activeSession.logs[index] || {};
          var fields = exerciseFields(exercise).map(function (field) {
            var value = log[field[0]] === undefined ? "" : log[field[0]];
            return "<label class=\"form-label\">" + field[1] + "<input class=\"form-control\" type=\"number\" min=\"0\" step=\"" + field[2] + "\" value=\"" + escapeHtml(value) + "\" data-session-log=\"" + index + "\" data-log-field=\"" + field[0] + "\"></label>";
          }).join("");
          var alternatives = alternativesFor(exercise[0]);
          var alternativeField = alternatives.length ? "<label class=\"form-label exercise-alternative\">Knievriendelijk alternatief<select class=\"form-select\" data-session-alternative=\"" + index + "\"><option value=\"\">Geplande oefening</option>" + alternatives.map(function (alternative) { return "<option value=\"" + escapeHtml(alternative) + "\"" + (log.alternative === alternative ? " selected" : "") + ">" + escapeHtml(alternative) + "</option>"; }).join("") + "</select></label>" : "";
          return "<div class=\"session-block\"><div class=\"session-exercise" + (checked ? " is-done" : "") + "\"><input class=\"form-check-input\" type=\"checkbox\" aria-label=\"" + escapeHtml(exercise[0]) + " voltooid\" data-session-check=\"" + index + "\"" + (checked ? " checked" : "") + "><span class=\"session-label\"><strong>" + escapeHtml(log.alternative || exercise[0]) + "</strong><span class=\"text-small text-muted\">" + (log.alternative ? "In plaats van " + escapeHtml(exercise[0]) + ". " : "") + escapeHtml(exercise[2]) + "</span></span><span class=\"viz-badge\">" + escapeHtml(exercise[1]) + "</span></div><div class=\"session-log-grid\">" + fields + alternativeField + "<span class=\"exercise-advice text-small\">" + escapeHtml(exerciseProgressionAdvice(workout.id, index, exercise)) + "</span></div></div>";
        }).join("") + "</div><div class=\"form-grid\"><label class=\"form-field\"><span class=\"form-label\">Ervaren zwaarte (RPE): <output id=\"sessionRpeValue\">" + activeSession.rpe + "</output>/10</span><input class=\"form-range\" id=\"sessionRpe\" type=\"range\" min=\"1\" max=\"10\" value=\"" + activeSession.rpe + "\"></label><label class=\"form-field\"><span class=\"form-label\">Knieklachten: <output id=\"sessionKneeValue\">" + activeSession.kneePain + "</output>/10</span><input class=\"form-range\" id=\"sessionKnee\" type=\"range\" min=\"0\" max=\"10\" value=\"" + activeSession.kneePain + "\"></label></div><div class=\"card-actions session-actions\"><button class=\"btn\" type=\"button\" id=\"restButton\">Rust 60 sec</button><span class=\"rest-clock\" id=\"restClock\"></span><button class=\"btn btn-primary\" type=\"button\" id=\"completeWorkout\">Training afronden</button><button class=\"btn btn-danger\" type=\"button\" id=\"cancelWorkout\">Stop zonder opslaan</button></div></article>";
        updateSessionClocks();
      }

      function updateSessionClocks() {
        if (!activeSession) return;
        var elapsed = Math.max(0, Math.floor((Date.now() - activeSession.startedAt) / 1000));
        var mins = String(Math.floor(elapsed / 60)).padStart(2, "0");
        var secs = String(elapsed % 60).padStart(2, "0");
        var clock = root.querySelector("#sessionClock");
        if (clock) clock.textContent = mins + ":" + secs;
        var rest = root.querySelector("#restClock");
        if (rest) rest.textContent = restSeconds > 0 ? "Rust " + restSeconds + "s" : "";
      }

      function announceRest(message) {
        var toast = root.querySelector("#sessionToast");
        if (toast) toast.textContent = message;
      }

      function startRest() {
        clearInterval(restTicker);
        restSeconds = 60;
        updateSessionClocks();
        announceRest("Rustpauze gestart: 60 seconden.");
        restTicker = setInterval(function () {
          restSeconds -= 1;
          if (restSeconds <= 0) {
            restSeconds = 0;
            clearInterval(restTicker);
            announceRest("Rustpauze voorbij.");
          }
          updateSessionClocks();
        }, 1000);
      }

      function finishWorkout() {
        if (!activeSession) return;
        if (!activeSession.checked.length) {
          showToast("sessionToast", "Vink minimaal één uitgevoerde oefening af voordat je de training opslaat.", true);
          return;
        }
        /* Clamp op 300 min (net als de editor): een dagen open blijven staan sessie mag geen absurde duur loggen. */
        var elapsed = Math.min(300, Math.max(1, Math.round((Date.now() - activeSession.startedAt) / 60000)));
        var workout = workouts.find(function (item) { return item.id === activeSession.workoutId; });
        var completedLogs = {};
        activeSession.checked.forEach(function (index) {
          if (activeSession.logs && activeSession.logs[index]) completedLogs[index] = JSON.parse(JSON.stringify(activeSession.logs[index]));
        });
        var completedDay = currentTodayIso();
        var totalExercises = workout ? workout.exercises(activeSession.week).length : activeSession.checked.length;
        var countsForWeek = activeSession.checked.length >= completionThreshold(totalExercises);
        var record = { id: String(Date.now()), date: new Date().toISOString(), day: completedDay, workoutId: activeSession.workoutId, workoutTitle: workout ? workout.title : activeSession.workoutId, week: activeSession.week, cycle: activeSession.cycle || currentProgramCycle(), duration: elapsed, completedExercises: activeSession.checked.length, totalExercises: totalExercises, countsForWeek: countsForWeek, logs: completedLogs, rpe: safeNumber(activeSession.rpe, 6), kneePain: safeNumber(activeSession.kneePain, 0) };
        record.advice = workoutAdvice(record);
        state.workoutHistory.push(record);
        if (countsForWeek) state.completions[completionKey(activeSession.week, activeSession.workoutId, record.cycle)] = { date: completedDay, duration: elapsed, exercises: activeSession.checked.length, rpe: record.rpe, advice: record.advice };
        if (record.kneePain > 4) {
          state.coaching = { mode: "recover", message: "Je knie reageerde tijdens de laatste training. De trainingsomvang is tijdelijk verlaagd; bouw pas weer op als de klachten zijn hersteld.", updated: completedDay };
        }
        activeSession = null;
        persistActiveSession();
        clearInterval(sessionTicker);
        clearInterval(restTicker);
        restSeconds = 0;
        renderAll();
        showToast("trainingToast", countsForWeek ? "Training opgeslagen en meegeteld voor je weekdoel." : "Gedeeltelijke training opgeslagen; rond minimaal " + completionThreshold(totalExercises) + " oefeningen af om hem mee te laten tellen.");
      }

      function cancelWorkout() {
        if (!window.confirm("Actieve training stoppen zonder resultaat op te slaan?")) return;
        activeSession = null;
        persistActiveSession();
        clearInterval(sessionTicker);
        clearInterval(restTicker);
        restSeconds = 0;
        renderActiveSession();
      }

      function customFoodForDay(day) {
        return (state.customFoodLogs || []).filter(function (entry) { return entry.date === day; });
      }

      function selectedMealDayForDate(day) {
        for (var index = 0; index < 7; index += 1) {
          if (mealDateForDay(index) === day) return index;
        }
        return -1;
      }

      function closeCustomFoodForm() {
        var form = root.querySelector("#customFoodForm");
        form.reset();
        form.hidden = true;
        root.querySelector("#customFoodReplaceField").hidden = true;
        root.querySelector("#customFoodReplaceMeal").required = false;
        root.querySelector("#customFoodEditId").value = "";
        root.querySelector("#customFoodToast").textContent = "";
      }

      function updateCustomFoodReplaceOptions(preferredIndex) {
        var relation = root.querySelector("#customFoodRelation").value;
        var field = root.querySelector("#customFoodReplaceField");
        var select = root.querySelector("#customFoodReplaceMeal");
        var dayIndex = selectedMealDayForDate(root.querySelector("#customFoodDate").value);
        field.hidden = relation !== "replace";
        select.required = relation === "replace";
        if (dayIndex < 0) {
          select.innerHTML = "<option value=\"\">Kies eerst een geldige datum</option>";
          return;
        }
        select.innerHTML = mealDays[dayIndex].map(function (meal, index) {
          return "<option value=\"" + index + "\">" + escapeHtml(meal[0] + " — " + meal[1]) + "</option>";
        }).join("");
        if (safeNumber(preferredIndex, -1) >= 0) select.value = String(preferredIndex);
      }

      function openCustomFoodForm(record) {
        state.selectedNutritionMode = "meals";
        saveState();
        renderNutrition();
        showView("nutrition");
        var form = root.querySelector("#customFoodForm");
        form.reset();
        var selectedDate = mealDateForDay(state.selectedMealDay);
        if (selectedDate > currentTodayIso()) selectedDate = currentTodayIso();
        root.querySelector("#customFoodEditId").value = record ? record.id : "";
        root.querySelector("#customFoodDate").min = mealDateForDay(0);
        root.querySelector("#customFoodDate").max = currentTodayIso();
        root.querySelector("#customFoodDate").value = record ? record.date : selectedDate;
        root.querySelector("#customFoodMoment").value = record ? record.moment : "Ontbijt";
        root.querySelector("#customFoodRelation").value = record && record.relation === "replace" ? "replace" : "extra";
        root.querySelector("#customFoodName").value = record ? record.name : "";
        root.querySelector("#customFoodAmount").value = record ? (record.amount || "") : "";
        root.querySelector("#customFoodCalories").value = record ? safeNumber(record.calories, 0) : "";
        root.querySelector("#customFoodProtein").value = record ? safeNumber(record.protein, 0) : 0;
        root.querySelector("#customFoodFiber").value = record ? safeNumber(record.fiber, 0) : 0;
        root.querySelector("#customFoodVegetables").value = record ? safeNumber(record.vegetables, 0) : 0;
        root.querySelector("#customFoodFruit").value = record ? safeNumber(record.fruit, 0) : 0;
        updateCustomFoodReplaceOptions(record ? record.replacedMealIndex : -1);
        root.querySelector("#customFoodHeading").textContent = record ? "Voeding bewerken" : "Voeding toevoegen";
        root.querySelector("#customFoodSubmit").textContent = record ? "Wijzigingen opslaan" : "Toevoegen aan dagtotaal";
        root.querySelector("#customFoodToast").textContent = "";
        form.hidden = false;
        form.scrollIntoView({ behavior: "smooth", block: "start" });
      }

      function saveCustomFood(event) {
        event.preventDefault();
        var editId = root.querySelector("#customFoodEditId").value;
        var day = root.querySelector("#customFoodDate").value;
        var name = root.querySelector("#customFoodName").value.trim();
        var amount = root.querySelector("#customFoodAmount").value.trim();
        var calories = Math.min(5000, Math.max(0, Math.round(safeNumber(root.querySelector("#customFoodCalories").value, 0))));
        var protein = Math.min(300, Math.max(0, Math.round(safeNumber(root.querySelector("#customFoodProtein").value, 0) * 10) / 10));
        var fiber = Math.min(100, Math.max(0, Math.round(safeNumber(root.querySelector("#customFoodFiber").value, 0) * 10) / 10));
        var vegetables = Math.min(2000, Math.max(0, Math.round(safeNumber(root.querySelector("#customFoodVegetables").value, 0))));
        var fruit = Math.min(1000, Math.max(0, Math.round(safeNumber(root.querySelector("#customFoodFruit").value, 0))));
        var relation = root.querySelector("#customFoodRelation").value === "replace" ? "replace" : "extra";
        var replacedMealIndex = relation === "replace" ? safeNumber(root.querySelector("#customFoodReplaceMeal").value, -1) : -1;
        if (!day || day < mealDateForDay(0) || day > currentTodayIso()) {
          showToast("customFoodToast", "Kies een datum uit de huidige voedingsweek tot en met vandaag.", true);
          return;
        }
        if (!name) {
          showToast("customFoodToast", "Vul in wat je hebt gegeten of gedronken.", true);
          return;
        }
        if (calories <= 0 && protein <= 0 && fiber <= 0 && vegetables <= 0 && fruit <= 0) {
          showToast("customFoodToast", "Vul minimaal één voedingswaarde in.", true);
          return;
        }
        var selectedDay = selectedMealDayForDate(day);
        if (relation === "replace" && (selectedDay < 0 || replacedMealIndex < 0 || replacedMealIndex >= mealDays[selectedDay].length)) {
          showToast("customFoodToast", "Kies welk menu-item deze invoer vervangt.", true);
          return;
        }
        var entry = {
          id: editId || "food-" + String(Date.now()),
          date: day,
          moment: root.querySelector("#customFoodMoment").value,
          name: name,
          amount: amount,
          calories: calories,
          protein: protein,
          fiber: fiber,
          vegetables: vegetables,
          fruit: fruit,
          relation: relation,
          replacedMealIndex: replacedMealIndex
        };
        if (editId) {
          var existingIndex = state.customFoodLogs.findIndex(function (item) { return item.id === editId; });
          if (existingIndex < 0) {
            showToast("customFoodToast", "Deze voedingsinvoer kon niet worden gevonden.", true);
            return;
          }
          state.customFoodLogs[existingIndex] = entry;
        } else {
          state.customFoodLogs.push(entry);
        }
        if (relation === "replace") {
          var logKey = mealLogKey(selectedDay);
          state.mealLogs[logKey] = (state.mealLogs[logKey] || []).filter(function (index) { return index !== replacedMealIndex; });
        }
        if (selectedDay >= 0) state.selectedMealDay = selectedDay;
        saveState();
        closeCustomFoodForm();
        renderNutrition();
        refreshView("dashboard");
        showToast("customFoodSectionToast", editId ? "Voeding bijgewerkt in je dagtotaal." : "Voeding toegevoegd aan je dagtotaal.");
      }

      function editCustomFood(id) {
        var entry = state.customFoodLogs.find(function (item) { return item.id === id; });
        if (entry) openCustomFoodForm(entry);
      }

      function deleteCustomFood(id) {
        var entry = state.customFoodLogs.find(function (item) { return item.id === id; });
        if (!entry || !window.confirm("Deze voedingsinvoer verwijderen?")) return;
        state.customFoodLogs = state.customFoodLogs.filter(function (item) { return item.id !== id; });
        saveState();
        renderNutrition();
        refreshView("dashboard");
        showToast("customFoodSectionToast", "Voedingsinvoer verwijderd.");
      }

      function renderCustomFoodHistory(day) {
        var entries = customFoodForDay(day).slice().reverse();
        root.querySelector("#customFoodHistory").innerHTML = entries.length ? entries.map(function (entry) {
          var amount = entry.amount ? " · " + escapeHtml(entry.amount) : "";
          var protein = safeNumber(entry.protein, 0).toFixed(1).replace(".0", "");
          var quality = [safeNumber(entry.fiber, 0) ? safeNumber(entry.fiber, 0) + " g vezels" : "", safeNumber(entry.vegetables, 0) ? safeNumber(entry.vegetables, 0) + " g groente" : "", safeNumber(entry.fruit, 0) ? safeNumber(entry.fruit, 0) + " g fruit" : ""].filter(Boolean).join(" · ");
          var relation = entry.relation === "replace" ? "Vervangt menu-item" : "Extra";
          return "<li class=\"history-item\"><div class=\"item-main\"><strong>" + escapeHtml(entry.name) + "</strong><span>" + escapeHtml(entry.moment || "Overig") + amount + " · " + relation + "</span><span>" + safeNumber(entry.calories, 0) + " kcal · " + protein + " g eiwit" + (quality ? " · " + quality : "") + "</span></div><div class=\"card-actions\"><button class=\"btn\" type=\"button\" data-edit-food=\"" + escapeHtml(entry.id) + "\">Wijzig</button><button class=\"btn btn-danger\" type=\"button\" data-delete-food=\"" + escapeHtml(entry.id) + "\">Verwijder</button></div></li>";
        }).join("") : "<li class=\"empty-state\">Nog geen eigen voeding toegevoegd voor deze dag.</li>";
      }

      function mealAlternativeOptions(mealType) {
        var options = {
          "Ontbijt": ["300 g skyr, 50 g havermout, fruit en 15 g noten", "3 volkoren boterhammen, 3 eieren en tomaat"],
          "Lunch": ["Volkoren wraps met bonen, hüttenkäse en 200 g rauwkost", "4 volkoren boterhammen met hummus, ei en rauwkost"],
          "Tussendoor": ["250 g skyr of kwark met 150 g fruit", "200 g hüttenkäse met komkommer en 2 volkoren crackers"],
          "Avondeten": ["Tofu of tempeh met volkoren granen en 300 g groenten", "Peulvruchtenschotel met aardappelen of zilvervliesrijst en 300 g groenten"],
          "Avond": ["2 volkoren crackers met 100 g hüttenkäse", "150 g fruit met 15 g ongezouten noten"]
        };
        return options[mealType] || [];
      }

      function changeWater(direction) {
        var day = mealDateForDay(state.selectedMealDay);
        if (day > currentTodayIso()) {
          showToast("nutritionQualityToast", "Je kunt vocht pas op de betreffende dag registreren.", true);
          return;
        }
        var amount = Math.min(2000, Math.max(50, Math.round(safeNumber(root.querySelector("#waterAmount").value, 250) / 50) * 50));
        state.waterLogs[day] = Math.min(6000, Math.max(0, safeNumber(state.waterLogs[day], 0) + direction * amount));
        saveState();
        renderNutrition();
        showToast("nutritionQualityToast", direction > 0 ? amount + " ml vocht toegevoegd." : amount + " ml vocht teruggedraaid.");
      }

      function renderNutritionQuality(totals, day) {
        function goalItem(label, value, target, unit, planned) {
          var pct = Math.min(100, Math.round(value / target * 100));
          return "<div class=\"quality-item\"><div class=\"metric-pair\"><span>" + label + "</span><strong>" + value + " / " + target + " " + unit + "</strong></div><div class=\"progress-track\"><div class=\"progress-fill\" style=\"width:" + pct + "%\"></div></div><span class=\"text-small text-muted\">" + planned + "</span></div>";
        }
        var future = day > currentTodayIso();
        root.querySelector("#nutritionQualityGoals").innerHTML = "<div class=\"section-head\"><div><h3>Voedingskwaliteit</h3><p>Dagdoelen naast calorieën en eiwit.</p></div><span class=\"viz-badge\">Menu: " + totals.plannedFiber + " g vezels</span></div><div class=\"quality-grid\">" + goalItem("Vezels", totals.fiber, NUTRITION_GOALS.fiber, "g", "Volledig menu: " + totals.plannedFiber + " g") + goalItem("Groente", totals.vegetables, NUTRITION_GOALS.vegetables, "g", "Volledig menu: " + totals.plannedVegetables + " g") + goalItem("Fruit", totals.fruit, NUTRITION_GOALS.fruit, "g", "Volledig menu: " + totals.plannedFruit + " g") + goalItem("Vocht", totals.water, NUTRITION_GOALS.water, "ml", "Registreer water, thee, koffie en andere dranken") + "</div><div class=\"viz-controls water-controls\"><label class=\"form-label\">Hoeveelheid vocht<input class=\"form-control\" id=\"waterAmount\" type=\"number\" min=\"50\" max=\"2000\" step=\"50\" value=\"250\" inputmode=\"numeric\"></label><button class=\"btn btn-primary\" type=\"button\" id=\"addWater\"" + (future ? " disabled" : "") + ">Voeg toe</button><button class=\"btn\" type=\"button\" id=\"removeWater\"" + (future ? " disabled" : "") + ">Draai terug</button></div>";
      }

      function renderNutrition() {
        var waterField = root.querySelector("#waterAmount");
        var waterValue = waterField ? waterField.value : null;
        preserveUiState(renderNutritionCore);
        if (waterValue !== null) {
          waterField = root.querySelector("#waterAmount");
          if (waterField) waterField.value = waterValue;
        }
      }

      function renderNutritionCore() {
        var mode = state.selectedNutritionMode === "shopping" ? "shopping" : "meals";
        var settings = state.nutritionSettings || defaultState.nutritionSettings;
        root.querySelector("#portionScale").value = String(settings.portionScale);
        root.querySelector("#saturdayProtein").value = settings.saturdayProtein;
        root.querySelector("#sundayProtein").value = settings.sundayProtein;
        root.querySelectorAll("[data-nutrition-mode]").forEach(function (button) {
          button.setAttribute("aria-pressed", String(button.dataset.nutritionMode === mode));
        });
        root.querySelector("#mealMode").hidden = mode !== "meals";
        root.querySelector("#shoppingMode").hidden = mode !== "shopping";
        /* Alleen de zichtbare modus opbouwen; de andere wordt bij het wisselen
           opnieuw gerenderd via de mode-handler. */
        if (mode === "shopping") {
          renderShoppingList();
          return;
        }
        var selected = state.selectedMealDay;
        root.querySelector("#mealDayTabs").innerHTML = dayNames.map(function (day, index) {
          return "<button class=\"btn\" type=\"button\" aria-pressed=\"" + (index === selected ? "true" : "false") + "\" data-meal-day=\"" + index + "\">" + day + "</button>";
        }).join("");
        var key = mealLogKey(selected);
        var eaten = state.mealLogs[key] || [];
        var replaced = replacedMealIndexes(selected);
        var meals = mealDays[selected].map(function (meal, index) { return personalizedMeal(selected, index, meal); });
        root.querySelector("#mealPlanCard").innerHTML = "<div class=\"section-head\"><div><h3>" + dayLong[selected] + "</h3><p>" + formatDate(mealDateForDay(selected), { day: "numeric", month: "long" }) + "</p></div><span class=\"viz-badge\">Doel " + state.profile.calories + " kcal</span></div><ul class=\"meal-list\">" + meals.map(function (meal, index) {
          var isReplaced = replaced.indexOf(index) !== -1;
          var checked = eaten.indexOf(index) !== -1 && !isReplaced;
          var alternatives = mealAlternativeOptions(meal[0]);
          return "<li class=\"meal-item\"><label class=\"meal-check" + (checked ? " is-eaten" : "") + (isReplaced ? " is-replaced" : "") + "\"><input class=\"form-check-input\" type=\"checkbox\" data-meal-check=\"" + index + "\"" + (checked ? " checked" : "") + (isReplaced ? " disabled" : "") + "><span class=\"item-main meal-name\"><strong>" + meal[0] + "</strong><span class=\"text-small\">" + escapeHtml(meal[1]) + "</span></span><span class=\"item-value text-small\">" + (isReplaced ? "<span class=\"viz-badge\">Vervangen</span><br>" : "") + meal[2] + " kcal<br>" + meal[3] + " g eiwit</span></label><details class=\"meal-details\"><summary>Bereiding en wisselopties</summary><p class=\"text-small\">" + escapeHtml(meal[7] || "Bereid met zo min mogelijk toegevoegd zout.") + "</p><ul class=\"text-small\">" + alternatives.map(function (option) { return "<li>" + escapeHtml(option) + "</li>"; }).join("") + "</ul><p class=\"text-small\">Wijkt je portie duidelijk af? Registreer de wissel dan als vervanging bij Eigen voeding.</p></details></li>";
        }).join("") + "</ul>";
        var totals = nutritionTotals(selected);
        var kcalPct = Math.min(100, Math.round(totals.calories / state.profile.calories * 100));
        var proteinPct = Math.min(100, Math.round(totals.protein / state.profile.protein * 100));
        var proteinText = totals.protein.toFixed(1).replace(".0", "");
        var customProteinText = totals.customProtein.toFixed(1).replace(".0", "");
        root.querySelector("#nutritionSummary").innerHTML = "<h3>Dagtotaal</h3><div class=\"metric-pair\"><span>Menu gepland</span><strong>" + totals.plannedCalories + " kcal</strong></div><div class=\"metric-pair\"><span>Gepland eiwit</span><strong>" + totals.plannedProtein + " g</strong></div><div class=\"metric-pair\"><span>Eigen invoer</span><strong>" + totals.customCalories + " kcal · " + customProteinText + " g</strong></div><div class=\"macro-bars\"><div class=\"metric-pair\"><span>Geregistreerd</span><strong>" + totals.calories + " / " + state.profile.calories + " kcal</strong></div><div class=\"progress-track\"><div class=\"progress-fill\" style=\"width:" + kcalPct + "%\"></div></div><div class=\"metric-pair\"><span>Eiwit</span><strong>" + proteinText + " / " + state.profile.protein + " g</strong></div><div class=\"progress-track\"><div class=\"progress-fill\" style=\"width:" + proteinPct + "%\"></div></div></div><p class=\"text-small text-muted\">Afgevinkte menu-items plus eigen voeding; een vervangen menu-item wordt niet dubbel geteld.</p><p class=\"callout text-small\">Bij een lager caloriedoel blijven de eiwitporties behouden; vooral graan-, aardappel- en vetporties worden aangepast.</p>";
        renderNutritionQuality(totals, mealDateForDay(selected));
        renderCustomFoodHistory(mealDateForDay(selected));
      }

      function renderShoppingList() {
        var categories = activeShoppingCategories();
        var total = categories.reduce(function (sum, category) { return sum + category.items.length; }, 0);
        var checked = categories.reduce(function (sum, category) {
          return sum + category.items.filter(function (item) { return Boolean(state.shoppingChecks[item[0]]); }).length;
        }, 0);
        var progress = total ? Math.round(checked / total * 100) : 0;
        root.querySelector("#shoppingListCard").innerHTML = "<div class=\"section-head\"><div><h3>Weekboodschappen</h3><p>Automatisch aangepast aan je caloriedoel, portiemarge en eiwitkeuzes.</p></div><span class=\"viz-badge\">" + checked + "/" + total + "</span></div>" + categories.map(function (category) {
          return "<section class=\"shopping-category\"><h3>" + escapeHtml(category.name) + "</h3><ul class=\"shopping-list\">" + category.items.map(function (item) {
            var isChecked = Boolean(state.shoppingChecks[item[0]]);
            return "<li class=\"shopping-item\"><label class=\"shopping-check" + (isChecked ? " is-checked" : "") + "\"><input class=\"form-check-input\" type=\"checkbox\" data-shopping-check=\"" + escapeHtml(item[0]) + "\"" + (isChecked ? " checked" : "") + "><span class=\"shopping-name\">" + escapeHtml(item[1]) + "</span><strong class=\"item-value text-small\">" + escapeHtml(item[2]) + "</strong></label></li>";
          }).join("") + "</ul></section>";
        }).join("");
        root.querySelector("#shoppingSummary").innerHTML = "<h3>Voortgang</h3><div class=\"metric-pair\"><span>In de kar</span><strong>" + checked + " van " + total + "</strong></div><div class=\"progress-track\" role=\"img\" aria-label=\"" + progress + "% van de boodschappen afgevinkt\"><div class=\"progress-fill\" style=\"width:" + progress + "%\"></div></div><p class=\"text-small text-muted\">De basisweek gebruikt vooral tofu, peulvruchten en sojagehakt, met één kip- en één vismaaltijd. Bij biefstuk blijft de portie 100 g.</p><div class=\"card-actions\"><button class=\"btn btn-primary\" type=\"button\" id=\"copyShoppingList\">Kopieer lijst</button><button class=\"btn\" type=\"button\" id=\"clearShoppingChecks\">Vinkjes wissen</button></div>";
      }

      function shoppingListText() {
        var lines = ["Boodschappenlijst — 1 persoon / 7 dagen", ""];
        activeShoppingCategories().forEach(function (category) {
          lines.push(category.name);
          category.items.forEach(function (item) {
            var mark = state.shoppingChecks[item[0]] ? "☑" : "☐";
            lines.push(mark + " " + item[1] + " — " + item[2]);
          });
          lines.push("");
        });
        return lines.join("\n").trim();
      }

      function fallbackCopyText(text) {
        var textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "absolute";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        textarea.setSelectionRange(0, textarea.value.length);
        var succeeded = false;
        try {
          succeeded = Boolean(document.execCommand && document.execCommand("copy"));
        } catch (error) {
          succeeded = false;
        }
        textarea.remove();
        return succeeded;
      }

      function copyShoppingList() {
        var text = shoppingListText();
        var copied = function () { showToast("shoppingToast", "Boodschappenlijst gekopieerd. Plak hem nu in Notities of WhatsApp."); };
        var failed = function () { showToast("shoppingToast", "Kopiëren lukte niet. Open de app rechtstreeks in Safari, Chrome, Edge of Firefox.", true); };
        if (navigator.clipboard && typeof navigator.clipboard.writeText === "function" && window.isSecureContext) {
          navigator.clipboard.writeText(text).then(copied).catch(function () {
            if (fallbackCopyText(text)) copied();
            else failed();
          });
          return;
        }
        if (fallbackCopyText(text)) copied();
        else failed();
      }

      function kneeStatus() {
        var values = ["painBefore", "painDuring", "painAfter"].map(function (id) { return safeNumber(root.querySelector("#" + id).value, 0); });
        var redFlag = ["swelling", "instability", "locking"].some(function (id) { return root.querySelector("#" + id).checked; });
        var maxPain = Math.max.apply(Math, values);
        if (redFlag || maxPain > 4) return { level: "red", title: "Rood — belasting terugnemen", text: "Stop of vereenvoudig de training. Bij zwelling, blokkeren of doorzakken: laat je knie beoordelen." };
        if (maxPain >= 3) return { level: "orange", title: "Oranje — niet opbouwen", text: "Houd gewicht, herhalingen en bewegingsdiepte gelijk of lager en controleer het herstel binnen 24 uur." };
        return { level: "green", title: "Groen — rustig doorgaan", text: "Geen duidelijke waarschuwing. Bouw maximaal één onderdeel tegelijk geleidelijk op." };
      }

      function updateKneePreview() {
        var status = kneeStatus();
        var panel = root.querySelector("#kneePreview");
        panel.dataset.status = status.level;
        panel.innerHTML = "<strong>" + status.title + "</strong><span class=\"text-small\">" + status.text + "</span>";
      }

      function saveKneeCheck(event) {
        event.preventDefault();
        var status = kneeStatus();
        state.kneeChecks.push({
          id: String(Date.now()),
          date: new Date().toISOString(),
          day: currentTodayIso(),
          before: safeNumber(root.querySelector("#painBefore").value, 0),
          during: safeNumber(root.querySelector("#painDuring").value, 0),
          after: safeNumber(root.querySelector("#painAfter").value, 0),
          swelling: root.querySelector("#swelling").checked,
          instability: root.querySelector("#instability").checked,
          locking: root.querySelector("#locking").checked,
          status: status.level
        });
        saveState();
        renderKneeHistory();
        renderProgressCharts();
        showToast("kneeToast", "Kniecheck opgeslagen: " + status.title + ".");
      }

      function renderKneeHistory() {
        var host = root.querySelector("#kneeHistory");
        if (!host) return;
        var checks = state.kneeChecks.slice().reverse().slice(0, 10);
        host.innerHTML = checks.length ? checks.map(function (check) {
          var day = check.day || String(check.date).slice(0, 10);
          var maxPain = Math.max(safeNumber(check.before, 0), safeNumber(check.during, 0), safeNumber(check.after, 0));
          var identifier = check.id || check.date;
          return "<li class=\"history-item\"><div class=\"item-main\"><strong>" + formatDate(day, { day: "numeric", month: "short", year: "numeric" }) + " · maximaal " + maxPain + "/10</strong><span>Voor " + safeNumber(check.before, 0) + " · tijdens " + safeNumber(check.during, 0) + " · erna " + safeNumber(check.after, 0) + "</span></div><button class=\"btn btn-danger\" type=\"button\" data-delete-knee=\"" + escapeHtml(identifier) + "\">Verwijder</button></li>";
        }).join("") : "<li class=\"empty-state\">Nog geen losse kniechecks opgeslagen.</li>";
      }

      function deleteKneeCheck(identifier) {
        if (!window.confirm("Deze kniecheck verwijderen?")) return;
        state.kneeChecks = state.kneeChecks.filter(function (check) { return String(check.id || check.date) !== identifier; });
        saveState();
        renderKneeHistory();
        renderProgressCharts();
        showToast("kneeToast", "Kniecheck verwijderd.");
      }

      function sortedWeights() {
        return state.weights.slice().sort(function (a, b) { return a.date.localeCompare(b.date); });
      }

      function renderWeight() {
        var weights = sortedWeights();
        var first = weights[0];
        var last = weights[weights.length - 1];
        var change = last.value - first.value;
        root.querySelector("#weightTrendText").textContent = weights.length < 2 ? "Voeg wekelijks onder vergelijkbare omstandigheden een meting toe." : (change > 0 ? "+" : "") + change.toFixed(1) + " kg sinds " + formatDate(first.date) + ".";
        root.querySelector("#weightChartHost").innerHTML = weightChart(weights);
        root.querySelector("#weightHistory").innerHTML = weights.slice().reverse().slice(0, 8).map(function (entry) {
          return "<li class=\"history-item\"><div class=\"item-main\"><strong>" + Number(entry.value).toFixed(1) + " kg</strong><span>" + formatDate(entry.date, { day: "numeric", month: "short", year: "numeric" }) + "</span></div><div class=\"card-actions\"><button class=\"btn\" type=\"button\" data-edit-weight=\"" + escapeHtml(entry.date) + "\">Wijzig</button><button class=\"btn btn-danger\" type=\"button\" data-delete-weight=\"" + escapeHtml(entry.date) + "\">Verwijder</button></div></li>";
        }).join("");
        root.querySelector("#weightDate").value = currentTodayIso();
        root.querySelector("#weightDate").max = currentTodayIso();
        root.querySelector("#weightInput").value = last.value;
      }

      function weightChart(weights) {
        if (!weights.length) return "<p class=\"empty-state\">Nog geen metingen.</p>";
        var width = 720;
        var height = 240;
        var pad = { left: 54, right: 28, top: 24, bottom: 44 };
        var values = weights.map(function (w) { return Number(w.value); });
        var min = Math.floor(Math.min.apply(Math, values) - 1);
        var max = Math.ceil(Math.max.apply(Math, values) + 1);
        if (max === min) max = min + 2;
        var usableW = width - pad.left - pad.right;
        var usableH = height - pad.top - pad.bottom;
        var points = weights.map(function (entry, index) {
          var x = pad.left + (weights.length === 1 ? usableW / 2 : index / (weights.length - 1) * usableW);
          var y = pad.top + (max - entry.value) / (max - min) * usableH;
          return { x: x, y: y, entry: entry };
        });
        var path = points.map(function (point, index) { return (index ? "L" : "M") + point.x.toFixed(1) + " " + point.y.toFixed(1); }).join(" ");
        var grids = [0, .5, 1].map(function (ratio) {
          var y = pad.top + ratio * usableH;
          var label = (max - ratio * (max - min)).toFixed(1);
          return "<line class=\"grid-line\" x1=\"" + pad.left + "\" y1=\"" + y + "\" x2=\"" + (width - pad.right) + "\" y2=\"" + y + "\"></line><text x=\"" + (pad.left - 10) + "\" y=\"" + (y + 4) + "\" text-anchor=\"end\" class=\"text-small\">" + label + "</text>";
        }).join("");
        var dots = points.map(function (point) {
          return "<circle class=\"weight-dot\" cx=\"" + point.x + "\" cy=\"" + point.y + "\" r=\"5\"><title>" + formatDate(point.entry.date) + ": " + Number(point.entry.value).toFixed(1) + " kg</title></circle>";
        }).join("");
        var startLabel = formatDate(weights[0].date);
        var endLabel = formatDate(weights[weights.length - 1].date);
        return "<svg class=\"weight-chart\" viewBox=\"0 0 " + width + " " + height + "\" role=\"img\" aria-label=\"Gewichtsontwikkeling van " + values[0].toFixed(1) + " naar " + values[values.length - 1].toFixed(1) + " kilogram\"><title>Gewichtsontwikkeling</title><desc>De lijn toont alle opgeslagen gewichtsmetingen.</desc>" + grids + (points.length > 1 ? "<path class=\"weight-line\" d=\"" + path + "\"></path>" : "") + dots + "<text x=\"" + pad.left + "\" y=\"" + (height - 14) + "\" text-anchor=\"start\">" + startLabel + "</text><text x=\"" + (width - pad.right) + "\" y=\"" + (height - 14) + "\" text-anchor=\"end\">" + endLabel + "</text></svg>";
      }

      function addWeight(event) {
        event.preventDefault();
        var date = root.querySelector("#weightDate").value;
        var value = safeNumber(root.querySelector("#weightInput").value, 0);
        if (!date || value < 50 || value > 180) return;
        if (date > currentTodayIso()) {
          showToast("weightToast", "Een meting kan niet in de toekomst liggen.", true);
          return;
        }
        var existing = state.weights.find(function (entry) { return entry.date === date; });
        if (existing) existing.value = value;
        else state.weights.push({ date: date, value: value });
        saveState();
        renderWeight();
        refreshView("dashboard");
        showToast("weightToast", "Meting opgeslagen.");
      }

      function editWeight(date) {
        var entry = state.weights.find(function (item) { return item.date === date; });
        if (!entry) return;
        root.querySelector("#weightDate").value = entry.date;
        root.querySelector("#weightInput").value = entry.value;
        root.querySelector("#weightForm").scrollIntoView({ behavior: "smooth", block: "center" });
        showToast("weightToast", "Pas de waarde aan en kies Meting toevoegen.");
      }

      function deleteWeight(date) {
        if (state.weights.length <= 1) {
          showToast("weightToast", "Bewaar minimaal één gewichtsmeting.", true);
          return;
        }
        if (!window.confirm("Deze gewichtsmeting verwijderen?")) return;
        state.weights = state.weights.filter(function (entry) { return entry.date !== date; });
        saveState();
        renderWeight();
        refreshView("dashboard");
        showToast("weightToast", "Meting verwijderd.");
      }

      function renderTrainingHistory() {
        var rows = state.workoutHistory.slice().reverse().slice(0, 12);
        root.querySelector("#trainingHistoryRows").innerHTML = rows.length ? rows.map(function (record) {
          var status = record.manual ? "Handmatig" : (recordCountsForWeek(record) ? "Voltooid" : "Gedeeltelijk");
          var statusKey = record.manual ? "manual" : (recordCountsForWeek(record) ? "complete" : "partial");
          var exerciseSummary = record.manual && Array.isArray(record.exercises) ? "<span class=\"manual-exercise-summary text-small\">" + escapeHtml((record.manualType || "Gemengd") + " · " + record.exercises.join(" · ")) + "</span>" : "";
          return "<tr><td class=\"text-nowrap\" data-label=\"Datum\">" + formatDate(record.day || String(record.date).slice(0, 10)) + "</td><td data-label=\"Training\"><div class=\"training-name\">" + escapeHtml(record.workoutTitle || record.workoutId) + "</div>" + exerciseSummary + " <span class=\"viz-badge training-status\" data-status=\"" + statusKey + "\">" + status + "</span></td><td class=\"text-nowrap\" data-label=\"Duur\">" + safeNumber(record.duration, 0) + " min</td><td data-label=\"RPE\">" + safeNumber(record.rpe, 0) + "/10</td><td data-label=\"Advies\">" + escapeHtml(record.advice || workoutAdvice(record)) + "</td><td data-label=\"Acties\"><div class=\"card-actions\"><button class=\"btn\" type=\"button\" data-edit-workout=\"" + escapeHtml(record.id) + "\">Bewerk</button><button class=\"btn btn-danger\" type=\"button\" data-delete-workout=\"" + escapeHtml(record.id) + "\">Verwijder</button></div></td></tr>";
        }).join("") : "<tr><td colspan=\"6\" class=\"text-muted\">Rond je eerste training af om hier prestaties te zien.</td></tr>";
      }

      function updateCompletionFromRecord(record) {
        if (record.manual) return;
        if (!recordCountsForWeek(record)) return;
        var cycle = record.cycle || 1;
        state.completions[completionKey(record.week, record.workoutId, cycle)] = { date: record.day, duration: record.duration, exercises: record.completedExercises, rpe: record.rpe, advice: record.advice };
      }

      function rebuildCompletionAfterDelete(record) {
        if (record.manual) return;
        var cycle = record.cycle || 1;
        var key = completionKey(record.week, record.workoutId, cycle);
        var replacement = state.workoutHistory.slice().reverse().find(function (item) {
          return item.workoutId === record.workoutId && safeNumber(item.week, 1) === safeNumber(record.week, 1) && (item.cycle || 1) === cycle && recordCountsForWeek(item);
        });
        if (replacement) updateCompletionFromRecord(replacement);
        else delete state.completions[key];
        if (cycle === 1) {
          var legacyKey = String(record.week) + "::" + record.workoutId;
          var legacy = state.completions[legacyKey];
          var recordDay = record.day || String(record.date || "").slice(0, 10);
          /* Wis de legacy-voltooiing (oud sleutelformaat zonder cyclus) alleen als die
             aantoonbaar bij dit record hoort; een voltooiing uit een oude appversie
             zonder bijbehorend logboekrecord blijft anders onterecht verdwijnen. */
          if (legacy && legacy.date === recordDay) delete state.completions[legacyKey];
        }
      }

      function openWorkoutEditor(id) {
        var record = state.workoutHistory.find(function (item) { return item.id === id; });
        if (!record) return;
        if (record.manual) {
          openManualWorkoutForm(record);
          return;
        }
        root.querySelector("#workoutEditId").value = record.id;
        root.querySelector("#workoutEditDuration").value = record.duration;
        root.querySelector("#workoutEditRpe").value = record.rpe;
        root.querySelector("#workoutEditKnee").value = record.kneePain;
        root.querySelector("#workoutEditor").hidden = false;
        root.querySelector("#workoutEditor").scrollIntoView({ behavior: "smooth", block: "center" });
      }

      function saveWorkoutEdit(event) {
        event.preventDefault();
        var id = root.querySelector("#workoutEditId").value;
        var record = state.workoutHistory.find(function (item) { return item.id === id; });
        if (!record) return;
        record.duration = Math.min(300, Math.max(1, safeNumber(root.querySelector("#workoutEditDuration").value, record.duration)));
        record.rpe = Math.min(10, Math.max(1, safeNumber(root.querySelector("#workoutEditRpe").value, record.rpe)));
        record.kneePain = Math.min(10, Math.max(0, safeNumber(root.querySelector("#workoutEditKnee").value, record.kneePain)));
        record.advice = workoutAdvice(record);
        updateCompletionFromRecord(record);
        saveState();
        root.querySelector("#workoutEditor").hidden = true;
        renderTrainingHistory();
        renderProgressCharts();
        refreshView("dashboard");
        refreshView("training");
      }

      function deleteWorkoutRecord(id) {
        var index = state.workoutHistory.findIndex(function (item) { return item.id === id; });
        if (index < 0 || !window.confirm("Deze training definitief verwijderen?")) return;
        var record = state.workoutHistory[index];
        state.workoutHistory.splice(index, 1);
        rebuildCompletionAfterDelete(record);
        saveState();
        root.querySelector("#workoutEditor").hidden = true;
        renderTrainingHistory();
        renderProgressCharts();
        refreshView("dashboard");
        refreshView("training");
      }

      function trendChart(points, label, unit, maxValue) {
        var recent = points.slice(-12);
        if (!recent.length) return "<p class=\"empty-state\">Nog onvoldoende gelogde gegevens.</p>";
        var width = 620;
        var height = 210;
        var pad = { left: 48, right: 24, top: 22, bottom: 42 };
        var values = recent.map(function (point) { return safeNumber(point.value, 0); });
        var min = 0;
        var max = maxValue || Math.max.apply(Math, values);
        if (max <= min) max = min + 1;
        var usableW = width - pad.left - pad.right;
        var usableH = height - pad.top - pad.bottom;
        var chartPoints = recent.map(function (point, index) {
          return {
            x: pad.left + (recent.length === 1 ? usableW / 2 : index / (recent.length - 1) * usableW),
            y: pad.top + (max - point.value) / (max - min) * usableH,
            source: point
          };
        });
        var path = chartPoints.map(function (point, index) { return (index ? "L" : "M") + point.x.toFixed(1) + " " + point.y.toFixed(1); }).join(" ");
        var grids = [0, .5, 1].map(function (ratio) {
          var y = pad.top + ratio * usableH;
          var value = (max - ratio * (max - min)).toFixed(max <= 10 ? 1 : 0);
          return "<line class=\"grid-line\" x1=\"" + pad.left + "\" y1=\"" + y + "\" x2=\"" + (width - pad.right) + "\" y2=\"" + y + "\"></line><text x=\"" + (pad.left - 8) + "\" y=\"" + (y + 4) + "\" text-anchor=\"end\">" + value + "</text>";
        }).join("");
        var dots = chartPoints.map(function (point) {
          return "<circle class=\"trend-dot\" cx=\"" + point.x + "\" cy=\"" + point.y + "\" r=\"4\"><title>" + escapeHtml(formatDate(point.source.date) + ": " + point.source.value + " " + unit) + "</title></circle>";
        }).join("");
        return "<svg class=\"trend-chart\" viewBox=\"0 0 " + width + " " + height + "\" role=\"img\" aria-label=\"" + escapeHtml(label) + "\"><title>" + escapeHtml(label) + "</title><desc>Trend van de laatste " + recent.length + " metingen in " + escapeHtml(unit) + ".</desc>" + grids + (chartPoints.length > 1 ? "<path class=\"trend-line\" d=\"" + path + "\"></path>" : "") + dots + "<text x=\"" + pad.left + "\" y=\"" + (height - 12) + "\" text-anchor=\"start\">" + escapeHtml(formatDate(recent[0].date)) + "</text><text x=\"" + (width - pad.right) + "\" y=\"" + (height - 12) + "\" text-anchor=\"end\">" + escapeHtml(formatDate(recent[recent.length - 1].date)) + "</text></svg>";
      }

      function strengthSeries() {
        var series = {};
        state.workoutHistory.forEach(function (record) {
          var workout = workouts.find(function (item) { return item.id === record.workoutId; });
          if (!workout || !record.logs) return;
          var exercises = workout.exercises(record.week || 1);
          Object.keys(record.logs).forEach(function (indexKey) {
            var log = record.logs[indexKey] || {};
            var weight = safeNumber(log.weight, 0);
            var index = safeNumber(indexKey, -1);
            if (weight <= 0 || !exercises[index]) return;
            var key = record.workoutId + "::" + index;
            if (!series[key]) series[key] = { label: exercises[index][0], points: [] };
            series[key].points.push({ date: record.day || String(record.date).slice(0, 10), value: weight });
          });
        });
        return series;
      }

      function renderProgressCharts() {
        var select = root.querySelector("#strengthExerciseSelect");
        if (!select) return;
        var strength = strengthSeries();
        var keys = Object.keys(strength);
        if (keys.length) {
          if (!state.selectedStrengthExercise || !strength[state.selectedStrengthExercise]) state.selectedStrengthExercise = keys[0];
          select.disabled = false;
          select.innerHTML = keys.map(function (key) { return "<option value=\"" + escapeHtml(key) + "\"" + (key === state.selectedStrengthExercise ? " selected" : "") + ">" + escapeHtml(strength[key].label) + "</option>"; }).join("");
          root.querySelector("#strengthChartHost").innerHTML = trendChart(strength[state.selectedStrengthExercise].points, "Krachtprogressie voor " + strength[state.selectedStrengthExercise].label, "kg");
        } else {
          select.disabled = true;
          select.innerHTML = "<option>Nog geen gewicht gelogd</option>";
          root.querySelector("#strengthChartHost").innerHTML = "<p class=\"empty-state\">Log bij een krachtoefening sets, herhalingen en gewicht om hier de trend te zien.</p>";
        }
        var cardio = state.workoutHistory.map(function (record) {
          var minutes = safeNumber(record.cardioMinutes, 0) || Object.keys(record.logs || {}).reduce(function (sum, key) { return sum + safeNumber(record.logs[key].minutes, 0); }, 0);
          return { date: record.day || String(record.date).slice(0, 10), value: minutes };
        }).filter(function (point) { return point.value > 0; }).sort(function (a, b) { return a.date.localeCompare(b.date); });
        var knee = state.workoutHistory.map(function (record) { return { date: record.day || String(record.date).slice(0, 10), value: safeNumber(record.kneePain, 0) }; }).concat(state.kneeChecks.map(function (check) {
          return { date: check.day || String(check.date).slice(0, 10), value: Math.max(safeNumber(check.before, 0), safeNumber(check.during, 0), safeNumber(check.after, 0)) };
        })).sort(function (a, b) { return a.date.localeCompare(b.date); });
        root.querySelector("#cardioChartHost").innerHTML = trendChart(cardio, "Gelogde conditieminuten per training", "min");
        root.querySelector("#kneeTrendChartHost").innerHTML = trendChart(knee, "Knieklachten uit trainingen en losse kniechecks", "van 10", 10);
      }

      function weeklyFormValues() {
        return {
          day: root.querySelector("#weeklyDate").value || currentTodayIso(),
          weight: safeNumber(root.querySelector("#weeklyWeight").value, sortedWeights().slice(-1)[0].value),
          energy: safeNumber(root.querySelector("#weeklyEnergy").value, 6),
          sleep: safeNumber(root.querySelector("#weeklySleep").value, 6),
          knee: safeNumber(root.querySelector("#weeklyKnee").value, 1),
          swelling: root.querySelector("#weeklySwelling").checked,
          instability: root.querySelector("#weeklyInstability").checked
        };
      }

      function evaluateWeeklyCheck(values, existingCheck) {
        var checkDate = new Date(values.day + "T12:00:00");
        var periodStart = new Date(checkDate);
        periodStart.setDate(periodStart.getDate() - 6);
        var workoutsBeforeCheck = state.workoutHistory.filter(function (record) {
          var day = record.day || String(record.date).slice(0, 10);
          return day <= values.day;
        }).sort(function (a, b) {
          return (a.day || String(a.date)).localeCompare(b.day || String(b.date));
        });
        var coreIds = {};
        workoutsBeforeCheck.forEach(function (record) {
          var day = record.day || String(record.date).slice(0, 10);
          var workout = workouts.find(function (item) { return item.id === record.workoutId; });
          if (workout && workout.type === "Vast" && recordCountsForWeek(record) && new Date(day + "T12:00:00") >= periodStart) coreIds[record.workoutId] = true;
        });
        var coreDone = Object.keys(coreIds).length;
        var recentRpe = workoutsBeforeCheck.slice(-3).map(function (record) { return safeNumber(record.rpe, 0); }).filter(Boolean);
        var avgRpe = recentRpe.length ? recentRpe.reduce(function (sum, value) { return sum + value; }, 0) / recentRpe.length : 0;
        var mode = "normal";
        var title = "Vasthouden";
        var message = "Houd het huidige schema aan en blijf de trainingen registreren.";
        var status = "orange";
        if (values.swelling || values.instability || values.knee > 4) {
          mode = "recover";
          title = "Herstelweek activeren";
          message = "De trainingsomvang wordt ongeveer 20% lager. Vermijd impact en laat aanhoudende zwelling, blokkeren of instabiliteit beoordelen.";
          status = "red";
        } else if (values.energy <= 4 || values.sleep <= 4 || avgRpe >= 8) {
          mode = "recover";
          title = "Tijdelijk rustiger trainen";
          message = "Je herstel blijft achter. De app verlaagt sets, circuits en conditieminuten totdat je volgende weekcheck beter is.";
          status = "orange";
        } else if (coreDone >= 3 && values.energy >= 6 && values.sleep >= 6 && values.knee <= 2) {
          mode = "progress";
          title = "Klaar om rustig op te bouwen";
          message = "Je herstel en regelmaat zijn goed. Verhoog per training slechts één onderdeel: maximaal 2,5 kg, 1–2 herhalingen of 2–3 minuten cardio.";
          status = "green";
        }

        var calories = safeNumber(state.profile.calories, 2250);
        var suggestedCalories = existingCheck ? safeNumber(existingCheck.suggestedCalories, 0) : 0;
        var calorieMessage = existingCheck ? (existingCheck.calorieMessage || "Caloriedoel blijft " + calories + " kcal; deze weekcheck is al beoordeeld.") : "Caloriedoel blijft " + calories + " kcal.";
        var priorChecks = state.weeklyCheckins.filter(function (item) { return item.day < values.day; }).sort(function (a, b) { return a.day.localeCompare(b.day); });
        if (!existingCheck && priorChecks.length >= 2) {
          var baseline = priorChecks[priorChecks.length - 2];
          var days = Math.max(1, Math.round((checkDate - new Date(baseline.day + "T12:00:00")) / 86400000));
          var weeklyChange = (values.weight - baseline.weight) * 7 / days;
          if (days >= 12 && weeklyChange > -0.2 && values.energy >= 5) {
            suggestedCalories = Math.max(1800, calories - 100);
            calorieMessage = "De trend over " + days + " dagen is minder dan 0,2 kg verlies per week. Voorstel: " + suggestedCalories + " kcal; kies na opslaan of je dit wilt toepassen.";
          } else if (days >= 12 && (weeklyChange < -0.7 || values.energy <= 3)) {
            suggestedCalories = Math.min(3000, calories + 100);
            calorieMessage = "De trend over " + days + " dagen of je vermoeidheid vraagt om meer herstel. Voorstel: " + suggestedCalories + " kcal; kies na opslaan of je dit wilt toepassen.";
          }
        } else if (!existingCheck && priorChecks.length < 2) {
          calorieMessage = "Caloriedoel blijft " + calories + " kcal; voor een aanpassing zijn minimaal drie weekchecks nodig.";
        }
        return { mode: mode, title: title, message: message, status: status, calories: calories, suggestedCalories: suggestedCalories || null, calorieMessage: calorieMessage, coreDone: coreDone, avgRpe: avgRpe };
      }

      function updateWeeklyPreview() {
        var panel = root.querySelector("#weeklyCoachPreview");
        if (!panel) return;
        var values = weeklyFormValues();
        var existing = state.weeklyCheckins.find(function (item) { return item.day === values.day; });
        var advice = evaluateWeeklyCheck(values, existing);
        panel.dataset.status = advice.status;
        panel.innerHTML = "<strong>" + escapeHtml(advice.title) + "</strong><span class=\"text-small\">" + escapeHtml(advice.message + " " + advice.calorieMessage) + "</span>";
      }

      function renderCalorieDecision() {
        var panel = root.querySelector("#calorieDecision");
        var pending = state.pendingCalories;
        panel.hidden = !pending;
        if (!pending) { panel.innerHTML = ""; return; }
        panel.innerHTML = "<strong>Calorievoorstel: " + safeNumber(pending.from, state.profile.calories) + " → " + safeNumber(pending.to, state.profile.calories) + " kcal</strong><span class=\"text-small\">Gebaseerd op de gewichtstrend over meerdere weekchecks. Je huidige doel verandert pas na jouw keuze.</span><div class=\"card-actions\"><button class=\"btn btn-primary\" type=\"button\" id=\"acceptCalories\">Voorstel accepteren</button><button class=\"btn\" type=\"button\" id=\"rejectCalories\">Huidig doel behouden</button></div>";
      }

      function decideCalories(accept) {
        var pending = state.pendingCalories;
        if (!pending) return;
        var check = state.weeklyCheckins.find(function (item) { return item.day === pending.day; });
        if (accept) state.profile.calories = safeNumber(pending.to, state.profile.calories);
        if (check) {
          check.calorieDecision = accept ? "accepted" : "rejected";
          check.appliedCalories = state.profile.calories;
        }
        state.pendingCalories = null;
        if (state.coaching && state.coaching.updated === pending.day) {
          state.coaching.message += accept ? " Calorievoorstel toegepast: " + state.profile.calories + " kcal." : " Calorievoorstel niet toegepast; huidig doel blijft " + state.profile.calories + " kcal.";
        }
        saveState();
        renderAll();
        showToast("weeklyToast", accept ? "Nieuw caloriedoel toegepast." : "Huidig caloriedoel behouden.");
      }

      function renderWeeklyCheck() {
        var latestWeight = sortedWeights().slice(-1)[0];
        root.querySelector("#weeklyDate").value = currentTodayIso();
        root.querySelector("#weeklyDate").max = currentTodayIso();
        root.querySelector("#weeklyWeight").value = Number(latestWeight.value).toFixed(1);
        root.querySelector("#weeklyEnergy").value = 6;
        root.querySelector("#weeklySleep").value = 6;
        root.querySelector("#weeklyKnee").value = 1;
        root.querySelector("#weeklyEnergyValue").value = 6;
        root.querySelector("#weeklySleepValue").value = 6;
        root.querySelector("#weeklyKneeValue").value = 1;
        root.querySelector("#weeklySwelling").checked = false;
        root.querySelector("#weeklyInstability").checked = false;
        root.querySelector("#weeklyHistory").innerHTML = state.weeklyCheckins.length ? state.weeklyCheckins.slice().reverse().slice(0, 8).map(function (check) {
          var label = check.mode === "recover" ? "Herstel" : (check.mode === "progress" ? "Opbouwen" : "Vasthouden");
          return "<li class=\"history-item\"><div class=\"item-main\"><strong>" + formatDate(check.day, { day: "numeric", month: "short", year: "numeric" }) + "</strong><span>" + Number(check.weight).toFixed(1) + " kg · energie " + check.energy + "/10 · " + label + "</span></div><div class=\"card-actions\"><button class=\"btn\" type=\"button\" data-edit-weekly=\"" + escapeHtml(check.day) + "\">Wijzig</button><button class=\"btn btn-danger\" type=\"button\" data-delete-weekly=\"" + escapeHtml(check.day) + "\">Verwijder</button></div></li>";
        }).join("") : "<li class=\"empty-state\">Nog geen weekchecks opgeslagen.</li>";
        updateWeeklyPreview();
        renderCalorieDecision();
      }

      function editWeeklyCheck(day) {
        var check = state.weeklyCheckins.find(function (item) { return item.day === day; });
        if (!check) return;
        root.querySelector("#weeklyDate").value = check.day;
        root.querySelector("#weeklyWeight").value = check.weight;
        root.querySelector("#weeklyEnergy").value = check.energy;
        root.querySelector("#weeklySleep").value = check.sleep;
        root.querySelector("#weeklyKnee").value = check.knee;
        root.querySelector("#weeklySwelling").checked = Boolean(check.swelling);
        root.querySelector("#weeklyInstability").checked = Boolean(check.instability);
        root.querySelector("#weeklyEnergyValue").value = check.energy;
        root.querySelector("#weeklySleepValue").value = check.sleep;
        root.querySelector("#weeklyKneeValue").value = check.knee;
        updateWeeklyPreview();
        root.querySelector("#weeklyForm").scrollIntoView({ behavior: "smooth", block: "start" });
        showToast("weeklyToast", "Pas de waarden aan en bewaar de weekcheck opnieuw.");
      }

      function deleteWeeklyCheck(day) {
        if (!window.confirm("Deze weekcheck verwijderen?")) return;
        state.weeklyCheckins = state.weeklyCheckins.filter(function (item) { return item.day !== day; });
        if (state.pendingCalories && state.pendingCalories.day === day) state.pendingCalories = null;
        var latest = state.weeklyCheckins.slice().sort(function (a, b) { return a.day.localeCompare(b.day); }).slice(-1)[0];
        if (latest) {
          state.coaching = { mode: latest.mode, message: latest.message + " " + latest.calorieMessage, updated: latest.day };
        } else {
          state.coaching = JSON.parse(JSON.stringify(defaultState.coaching));
        }
        saveState();
        renderAll();
        showToast("weeklyToast", "Weekcheck verwijderd.");
      }

      function saveWeeklyCheck(event) {
        event.preventDefault();
        var values = weeklyFormValues();
        if (values.day > currentTodayIso()) {
          showToast("weeklyToast", "Een weekcheck kan niet in de toekomst liggen.", true);
          return;
        }
        var existingIndex = state.weeklyCheckins.findIndex(function (item) { return item.day === values.day; });
        var existing = existingIndex >= 0 ? state.weeklyCheckins[existingIndex] : null;
        var advice = evaluateWeeklyCheck(values, existing);
        var record = Object.assign({}, values, advice, { savedAt: new Date().toISOString() });
        if (existingIndex >= 0) state.weeklyCheckins[existingIndex] = record;
        else state.weeklyCheckins.push(record);
        var latestDay = state.weeklyCheckins.reduce(function (latest, item) { return item.day > latest ? item.day : latest; }, "");
        var isLatestCheck = values.day === latestDay;
        if (isLatestCheck && !existing && advice.suggestedCalories && advice.suggestedCalories !== state.profile.calories) {
          state.pendingCalories = { day: values.day, from: state.profile.calories, to: advice.suggestedCalories };
        } else if (isLatestCheck) {
          /* Een nieuwere check zonder voorstel maakt een ouder, nog openstaand voorstel ongeldig. */
          state.pendingCalories = null;
        }
        if (isLatestCheck) state.coaching = { mode: advice.mode, message: advice.message + " " + advice.calorieMessage, updated: values.day };
        var weightEntry = state.weights.find(function (entry) { return entry.date === values.day; });
        if (weightEntry) weightEntry.value = values.weight;
        else state.weights.push({ date: values.day, value: values.weight });
        saveState();
        renderAll();
        showToast("weeklyToast", "Weekcheck opgeslagen en advies toegepast.");
      }

      function renderProfile() {
        root.querySelector("#profileAge").value = state.profile.age;
        root.querySelector("#profileHeight").value = state.profile.height;
        root.querySelector("#profileWeight").value = state.profile.startWeight;
        root.querySelector("#profileStartDate").value = state.profile.startDate;
        root.querySelector("#profileCalories").value = state.profile.calories;
        root.querySelector("#profileProtein").value = state.profile.protein;
      }

      function saveProfile(event) {
        event.preventDefault();
        state.profile = {
          age: safeNumber(root.querySelector("#profileAge").value, 36),
          height: safeNumber(root.querySelector("#profileHeight").value, 184),
          startWeight: safeNumber(root.querySelector("#profileWeight").value, 87.5),
          startDate: root.querySelector("#profileStartDate").value || currentTodayIso(),
          calories: safeNumber(root.querySelector("#profileCalories").value, 2250),
          protein: safeNumber(root.querySelector("#profileProtein").value, 150)
        };
        state.pendingCalories = null;
        saveState();
        renderAll();
        showToast("profileToast", "Profiel opgeslagen.");
      }

      /* Versleutelde back-ups: AES-GCM met een sleutel afgeleid via PBKDF2-SHA256.
         De export bevat gevoelige gezondheidsdata; een wachtwoord is optioneel maar aanbevolen. */
      var BACKUP_KDF_ITERATIONS = 310000;

      function bytesToBase64(bytes) {
        var chunks = [];
        for (var i = 0; i < bytes.length; i += 0x8000) {
          chunks.push(String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000)));
        }
        return btoa(chunks.join(""));
      }

      function base64ToBytes(text) {
        var binary = atob(String(text));
        var bytes = new Uint8Array(binary.length);
        for (var i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        return bytes;
      }

      function backupCryptoKey(password, salt, iterations) {
        var encoder = new TextEncoder();
        return crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveKey"]).then(function (material) {
          return crypto.subtle.deriveKey(
            { name: "PBKDF2", salt: salt, iterations: iterations, hash: "SHA-256" },
            material,
            { name: "AES-GCM", length: 256 },
            false,
            ["encrypt", "decrypt"]
          );
        });
      }

      function encryptBackup(json, password) {
        var salt = crypto.getRandomValues(new Uint8Array(16));
        var iv = crypto.getRandomValues(new Uint8Array(12));
        return backupCryptoKey(password, salt, BACKUP_KDF_ITERATIONS).then(function (key) {
          return crypto.subtle.encrypt({ name: "AES-GCM", iv: iv }, key, new TextEncoder().encode(json));
        }).then(function (cipher) {
          return {
            momentumEncrypted: 1,
            kdf: "PBKDF2-SHA256",
            iterations: BACKUP_KDF_ITERATIONS,
            salt: bytesToBase64(salt),
            iv: bytesToBase64(iv),
            data: bytesToBase64(new Uint8Array(cipher))
          };
        });
      }

      function decryptBackup(payload, password) {
        var salt = base64ToBytes(payload.salt);
        var iv = base64ToBytes(payload.iv);
        var data = base64ToBytes(payload.data);
        return backupCryptoKey(password, salt, safeNumber(payload.iterations, BACKUP_KDF_ITERATIONS)).then(function (key) {
          return crypto.subtle.decrypt({ name: "AES-GCM", iv: iv }, key, data);
        }).then(function (plain) {
          return new TextDecoder().decode(plain);
        });
      }

      function exportData() {
        var fileName = "momentum-backup-" + currentTodayIso() + ".json";
        var json = JSON.stringify(state, null, 2);
        if (window.crypto && crypto.subtle) {
          var password = window.prompt("Optioneel wachtwoord om de back-up te versleutelen (aanbevolen: het bestand bevat je gezondheidsgegevens; laat leeg voor een leesbaar bestand):", "");
          if (password === null) return;
          if (password) {
            encryptBackup(json, password).then(function (payload) {
              deliverBackup(JSON.stringify(payload, null, 2), fileName);
            }).catch(function () {
              showToast("dataToast", "Versleutelen mislukt; er is geen back-up gemaakt.", true);
            });
            return;
          }
        }
        deliverBackup(json, fileName);
      }

      function deliverBackup(json, fileName) {
        /* In een iOS-standalone-app is een downloadlink onbetrouwbaar; het deelmenu
           (Bewaar in Bestanden) is daar de robuuste route. Elders blijft downloaden werken. */
        if (typeof window.File === "function" && navigator.canShare && navigator.share) {
          try {
            var shareFile = new File([json], fileName, { type: "application/json" });
            if (navigator.canShare({ files: [shareFile] })) {
              navigator.share({ files: [shareFile], title: "Momentum back-up" })
                .then(function () { showToast("dataToast", "Back-up gedeeld."); })
                .catch(function (error) {
                  if (error && error.name !== "AbortError") downloadBackupFile(json, fileName);
                });
              return;
            }
          } catch (error) { /* val terug op downloaden */ }
        }
        downloadBackupFile(json, fileName);
      }

      function downloadBackupFile(json, fileName) {
        var blob = new Blob([json], { type: "application/json" });
        var url = URL.createObjectURL(blob);
        var link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        showToast("dataToast", "Back-up gedownload.");
      }

      function applyImportedBackup(jsonText) {
        /* Bewaar de huidige staat zodat een mislukte import nooit data vernietigt;
           de nieuwe staat wordt pas gepersisteerd nadat het renderen is geslaagd. */
        var previousState = state;
        var previousSession = activeSession;
        try {
          var parsed = JSON.parse(String(jsonText));
          if (!parsed || typeof parsed !== "object" || !parsed.profile || typeof parsed.profile !== "object" || !Array.isArray(parsed.weights) || !parsed.completions) throw new Error("Ongeldig bestand");
          state = mergeSavedState(parsed);
          activeSession = restoreActiveSession(state.activeSession);
          clearInterval(sessionTicker);
          clearInterval(restTicker);
          renderAll();
          saveState();
          if (activeSession) sessionTicker = setInterval(updateSessionClocks, 1000);
          showToast("dataToast", "Back-up geïmporteerd.");
        } catch (error) {
          state = previousState;
          activeSession = previousSession;
          try { renderAll(); } catch (renderError) { /* vorige staat was al zichtbaar */ }
          showToast("dataToast", "Importeren mislukt: kies een geldige Momentum-back-up.", true);
        }
      }

      function importData(file) {
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function () {
          var raw = String(reader.result);
          var head = null;
          try {
            head = JSON.parse(raw);
          } catch (error) {
            showToast("dataToast", "Importeren mislukt: kies een geldige Momentum-back-up.", true);
            return;
          }
          if (head && head.momentumEncrypted) {
            if (!(window.crypto && crypto.subtle)) {
              showToast("dataToast", "Deze back-up is versleuteld en kan hier niet worden ontsleuteld.", true);
              return;
            }
            var password = window.prompt("Deze back-up is versleuteld. Voer het wachtwoord in:");
            if (password === null) return;
            decryptBackup(head, password)
              .then(applyImportedBackup)
              .catch(function () {
                showToast("dataToast", "Ontsleutelen mislukt: controleer het wachtwoord.", true);
              });
            return;
          }
          applyImportedBackup(raw);
        };
        reader.readAsText(file);
      }

      function resetData() {
        if (!window.confirm("Alle trainingen, metingen en instellingen definitief uit deze browser wissen?")) return;
        localStorage.removeItem(STORAGE_KEY);
        state = JSON.parse(JSON.stringify(defaultState));
        activeSession = null;
        clearInterval(sessionTicker);
        clearInterval(restTicker);
        restSeconds = 0;
        renderAll();
        showToast("dataToast", "Alle gegevens zijn gewist.");
      }

      function showToast(id, message, destructive) {
        var element = root.querySelector("#" + id);
        if (!element) return;
        element.textContent = message;
        element.classList.toggle("text-destructive", Boolean(destructive));
        window.setTimeout(function () { if (element.textContent === message) element.textContent = ""; }, 3500);
      }

      function showView(name, options) {
        if (VIEW_NAMES.indexOf(name) === -1) name = "dashboard";
        var previous = currentViewName();
        var hadFocusInHiddenView = false;
        root.querySelectorAll("[data-view]").forEach(function (section) {
          var hide = section.dataset.view !== name;
          if (hide && section.contains(document.activeElement)) hadFocusInHiddenView = true;
          section.hidden = hide;
        });
        root.querySelectorAll("[data-nav]").forEach(function (button) { button.setAttribute("aria-pressed", String(button.dataset.nav === name)); });
        if (dirtyViews[name]) renderView(name);
        /* Focus mag niet op een verborgen element achterblijven: verplaats hem naar de kop van de nieuwe view. */
        if (hadFocusInHiddenView) {
          var section = root.querySelector('[data-view="' + name + '"]');
          var heading = section ? section.querySelector("h2, h3") : null;
          if (heading) {
            heading.setAttribute("tabindex", "-1");
            heading.focus({ preventScroll: false });
          }
        }
        /* Laatste view onthouden voor de volgende start, en de terug-knop/gesture
           laten navigeren tussen views i.p.v. de app te verlaten. */
        if (state.selectedView !== name) {
          state.selectedView = name;
          saveState();
        }
        if (!(options && options.skipHistory) && previous !== name && window.history && typeof history.pushState === "function") {
          history.pushState({ view: name }, "", "#" + name);
        }
      }

      window.addEventListener("popstate", function (event) {
        var name = (event.state && event.state.view) || (location.hash || "").slice(1) || state.selectedView || "dashboard";
        showView(name, { skipHistory: true });
      });

      root.addEventListener("click", function (event) {
        if (event.target.closest("#openManualWorkout")) { openManualWorkoutForm(); return; }
        if (event.target.closest("#cancelManualWorkout")) { closeManualWorkoutForm(); return; }
        if (event.target.closest("#openCustomFood")) { openCustomFoodForm(); return; }
        if (event.target.closest("#cancelCustomFood")) { closeCustomFoodForm(); return; }
        var editFoodButton = event.target.closest("[data-edit-food]");
        if (editFoodButton) { editCustomFood(editFoodButton.dataset.editFood); return; }
        var deleteFoodButton = event.target.closest("[data-delete-food]");
        if (deleteFoodButton) { deleteCustomFood(deleteFoodButton.dataset.deleteFood); return; }
        if (event.target.closest("#addWater")) { changeWater(1); return; }
        if (event.target.closest("#removeWater")) { changeWater(-1); return; }
        var nav = event.target.closest("[data-nav]");
        if (nav) { showView(nav.dataset.nav); return; }
        var start = event.target.closest("[data-start-workout]");
        if (start) { startWorkout(start.dataset.startWorkout, safeNumber(start.dataset.week, state.selectedWeek)); return; }
        if (event.target.closest("[data-open-training]")) { showView("training"); return; }
        if (event.target.closest("[data-open-weekly]")) { showView("weekly"); return; }
        var nutritionMode = event.target.closest("[data-nutrition-mode]");
        if (nutritionMode) {
          state.selectedNutritionMode = nutritionMode.dataset.nutritionMode === "shopping" ? "shopping" : "meals";
          saveState();
          renderNutrition();
          return;
        }
        var day = event.target.closest("[data-meal-day]");
        if (day) { state.selectedMealDay = safeNumber(day.dataset.mealDay, 0); saveState(); renderNutrition(); return; }
        if (event.target.closest("#copyShoppingList")) {
          copyShoppingList();
          return;
        }
        if (event.target.closest("#clearShoppingChecks")) {
          state.shoppingChecks = {};
          saveState();
          renderNutrition();
          return;
        }
        var editWeightButton = event.target.closest("[data-edit-weight]");
        if (editWeightButton) { editWeight(editWeightButton.dataset.editWeight); return; }
        var deleteWeightButton = event.target.closest("[data-delete-weight]");
        if (deleteWeightButton) { deleteWeight(deleteWeightButton.dataset.deleteWeight); return; }
        var editWeeklyButton = event.target.closest("[data-edit-weekly]");
        if (editWeeklyButton) { editWeeklyCheck(editWeeklyButton.dataset.editWeekly); return; }
        var deleteWeeklyButton = event.target.closest("[data-delete-weekly]");
        if (deleteWeeklyButton) { deleteWeeklyCheck(deleteWeeklyButton.dataset.deleteWeekly); return; }
        var editWorkoutButton = event.target.closest("[data-edit-workout]");
        if (editWorkoutButton) { openWorkoutEditor(editWorkoutButton.dataset.editWorkout); return; }
        var deleteWorkoutButton = event.target.closest("[data-delete-workout]");
        if (deleteWorkoutButton) { deleteWorkoutRecord(deleteWorkoutButton.dataset.deleteWorkout); return; }
        var deleteKneeButton = event.target.closest("[data-delete-knee]");
        if (deleteKneeButton) { deleteKneeCheck(deleteKneeButton.dataset.deleteKnee); return; }
        if (event.target.closest("#cancelWorkoutEdit")) { root.querySelector("#workoutEditor").hidden = true; return; }
        if (event.target.closest("#acceptCalories")) { decideCalories(true); return; }
        if (event.target.closest("#rejectCalories")) { decideCalories(false); return; }
        if (event.target.closest("#restButton")) { startRest(); return; }
        if (event.target.closest("#completeWorkout")) { finishWorkout(); return; }
        if (event.target.closest("#cancelWorkout")) { cancelWorkout(); return; }
      });

      root.addEventListener("change", function (event) {
        if (event.target.id === "customFoodRelation" || event.target.id === "customFoodDate") {
          updateCustomFoodReplaceOptions(root.querySelector("#customFoodReplaceMeal").value);
          return;
        }
        if (event.target.id === "trainingScheduleSelect") {
          state.trainingSchedule = trainingSchedules[event.target.value] ? event.target.value : defaultState.trainingSchedule;
          saveState();
          renderTrainingGuidance();
          return;
        }
        if (event.target.matches("[data-nutrition-setting]")) {
          state.nutritionSettings = {
            portionScale: safeNumber(root.querySelector("#portionScale").value, 1),
            saturdayProtein: root.querySelector("#saturdayProtein").value === "vega" ? "vega" : "beef",
            sundayProtein: root.querySelector("#sundayProtein").value === "tofu" ? "tofu" : "chicken"
          };
          saveState();
          renderNutrition();
          refreshView("dashboard");
          return;
        }
        if (event.target.id === "strengthExerciseSelect") {
          state.selectedStrengthExercise = event.target.value;
          saveState();
          renderProgressCharts();
          return;
        }
        if (event.target.id === "weeklySwelling" || event.target.id === "weeklyInstability" || event.target.id === "weeklyDate") {
          updateWeeklyPreview();
          return;
        }
        if (event.target.id === "weekSelect") {
          state.selectedWeek = safeNumber(event.target.value, 1);
          saveState();
          renderWorkouts();
          return;
        }
        if (event.target.matches("[data-session-check]") && activeSession) {
          var index = safeNumber(event.target.dataset.sessionCheck, 0);
          var position = activeSession.checked.indexOf(index);
          if (event.target.checked && position === -1) activeSession.checked.push(index);
          if (!event.target.checked && position !== -1) activeSession.checked.splice(position, 1);
          event.target.closest(".session-exercise").classList.toggle("is-done", event.target.checked);
          persistActiveSession();
          return;
        }
        if (event.target.matches("[data-session-alternative]") && activeSession) {
          var alternativeIndex = safeNumber(event.target.dataset.sessionAlternative, 0);
          if (!activeSession.logs[alternativeIndex]) activeSession.logs[alternativeIndex] = {};
          if (event.target.value) activeSession.logs[alternativeIndex].alternative = event.target.value;
          else delete activeSession.logs[alternativeIndex].alternative;
          persistActiveSession();
          renderActiveSession();
          return;
        }
        if (event.target.matches("[data-meal-check]")) {
          /* Consistent met vocht: maaltijden voor toekomstige dagen zijn nog niet af te vinken. */
          if (mealDateForDay(state.selectedMealDay) > currentTodayIso()) {
            event.target.checked = false;
            showToast("nutritionQualityToast", "Je kunt maaltijden pas op de betreffende dag afvinken.", true);
            return;
          }
          var key = mealLogKey(state.selectedMealDay);
          var mealIndex = safeNumber(event.target.dataset.mealCheck, 0);
          var logs = state.mealLogs[key] || [];
          var found = logs.indexOf(mealIndex);
          if (event.target.checked && found === -1) logs.push(mealIndex);
          if (!event.target.checked && found !== -1) logs.splice(found, 1);
          state.mealLogs[key] = logs;
          saveState();
          renderNutrition();
          refreshView("dashboard");
          return;
        }
        if (event.target.matches("[data-shopping-check]")) {
          state.shoppingChecks[event.target.dataset.shoppingCheck] = event.target.checked;
          saveState();
          renderNutrition();
          return;
        }
        if (event.target.id === "importData") {
          importData(event.target.files[0]);
          /* Reset zodat hetzelfde (gecorrigeerde) bestand opnieuw een change-event geeft. */
          event.target.value = "";
        }
      });

      root.addEventListener("input", function (event) {
        if (activeSession && event.target.matches("[data-session-log]")) {
          var logIndex = safeNumber(event.target.dataset.sessionLog, 0);
          var field = event.target.dataset.logField;
          if (!activeSession.logs[logIndex]) activeSession.logs[logIndex] = {};
          activeSession.logs[logIndex][field] = event.target.value;
          persistActiveSessionSoon();
          return;
        }
        if (activeSession && event.target.id === "sessionRpe") {
          activeSession.rpe = safeNumber(event.target.value, 6);
          root.querySelector("#sessionRpeValue").value = activeSession.rpe;
          persistActiveSessionSoon();
          return;
        }
        if (activeSession && event.target.id === "sessionKnee") {
          activeSession.kneePain = safeNumber(event.target.value, 0);
          root.querySelector("#sessionKneeValue").value = activeSession.kneePain;
          persistActiveSessionSoon();
          return;
        }
        if (["weeklyWeight", "weeklyEnergy", "weeklySleep", "weeklyKnee"].indexOf(event.target.id) !== -1) {
          if (event.target.id !== "weeklyWeight") {
            var output = root.querySelector("#" + event.target.id + "Value");
            if (output) output.value = event.target.value;
          }
          updateWeeklyPreview();
        }
      });

      root.querySelectorAll("#painBefore, #painDuring, #painAfter").forEach(function (input) {
        input.addEventListener("input", function () { input.parentElement.querySelector("output").value = input.value; updateKneePreview(); });
      });
      root.querySelectorAll("#swelling, #instability, #locking").forEach(function (input) { input.addEventListener("change", updateKneePreview); });
      root.querySelector("#kneeForm").addEventListener("submit", saveKneeCheck);
      root.querySelector("#manualWorkoutForm").addEventListener("submit", saveManualWorkout);
      root.querySelector("#customFoodForm").addEventListener("submit", saveCustomFood);
      root.querySelector("#weightForm").addEventListener("submit", addWeight);
      root.querySelector("#weeklyForm").addEventListener("submit", saveWeeklyCheck);
      root.querySelector("#workoutEditor").addEventListener("submit", saveWorkoutEdit);
      root.querySelector("#profileForm").addEventListener("submit", saveProfile);
      root.querySelector("#exportData").addEventListener("click", exportData);
      root.querySelector("#resetData").addEventListener("click", resetData);

      state.selectedWeek = currentProgramWeek();
      renderAll();
      var initialView = (location.hash || "").slice(1);
      if (VIEW_NAMES.indexOf(initialView) === -1) initialView = state.selectedView || "dashboard";
      if (window.history && typeof history.replaceState === "function") {
        history.replaceState({ view: initialView }, "", initialView === "dashboard" ? location.pathname + location.search : "#" + initialView);
      }
      showView(initialView, { skipHistory: true });
      if (activeSession) sessionTicker = setInterval(updateSessionClocks, 1000);
      function refreshForDateRollover() {
        var currentDay = currentTodayIso();
        if (currentDay === todayIso) return;
        /* Niet midden in een invulactie (bv. de weekcheck rond middernacht) alles wegrenderen;
           de volgende tick of tabwissel probeert het opnieuw. */
        var active = document.activeElement;
        if (active && root.contains(active) && active.matches("input, select, textarea")) return;
        todayIso = currentDay;
        state.selectedWeek = currentProgramWeek();
        state.selectedMealDay = todayMealDay();
        saveState();
        renderAll();
      }
      window.setInterval(refreshForDateRollover, 60000);
      document.addEventListener("visibilitychange", function () {
        if (!document.hidden) refreshForDateRollover();
      });
      var navRow = root.querySelector(".nav-row");
      function updateNavOverflowHint() {
        if (!navRow) return;
        var overflow = navRow.scrollWidth - navRow.clientWidth;
        navRow.classList.toggle("has-overflow-end", overflow > 4 && navRow.scrollLeft < overflow - 4);
        navRow.classList.toggle("has-overflow-start", overflow > 4 && navRow.scrollLeft > 4);
      }
      if (navRow) {
        navRow.addEventListener("scroll", updateNavOverflowHint, { passive: true });
        window.addEventListener("resize", updateNavOverflowHint);
        updateNavOverflowHint();
      }
      if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1") && document.documentElement.hasAttribute("data-visualize-standalone")) {
        window.addEventListener("load", function () {
          navigator.serviceWorker.register("./service-worker.js").catch(function () {});
        });
      }
    })();

(() => {
  const initialize = () => {
    globalThis.lucide?.createIcons({ attrs: { width: 16, height: 16 } });
  };
  if (globalThis.lucide != null) {
    initialize();
    return;
  }
  document
    .getElementById("codex-visualization-lucide")
    ?.addEventListener("load", initialize, { once: true });
})();
