/* Pure, DOM-vrije logica van Momentum Fitness Tracker.
   Wordt zowel in de browser (window.MomentumLogic) als in Node (unit-tests)
   gebruikt; houd dit bestand vrij van document/localStorage/state. */
(function (global, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else global.MomentumLogic = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  function isIsoDay(value) {
    return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
  }

  /* Week en cyclus op dag-niveau (wissel om middernacht); beide data worden op
     12:00 verankerd en Math.round vangt DST-uurverschuivingen af. */
  function programPosition(startDateIso, dayIso) {
    var start = new Date(startDateIso + "T12:00:00");
    var target = new Date(dayIso + "T12:00:00");
    var days = Math.round((target - start) / 86400000);
    var elapsedWeek = Math.max(1, Math.floor(days / 7) + 1);
    return { week: (elapsedWeek - 1) % 12 + 1, cycle: Math.floor((elapsedWeek - 1) / 12) + 1 };
  }

  var energyTerms = /havermout|muesli|boterham|wrap|pasta|rijst|aardappel|couscous|noten|pindakaas|olijfolie|pompoenpit|kokosmelk/;
  var proteinTerms = /kwark|skyr|yoghurt|melk|hüttenkäse|tofu|tempeh|kip|zalm|biefstuk|vegetarische stukjes|edamame|sojagehakt|kidneybonen|linzen|kikkererwten|hummus|kaas/;

  function scaleMealDescription(description, energyScale, proteinScale) {
    if (energyScale === 1 && proteinScale === 1) return description;
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

  function formatPreviousLog(exercise, log) {
    var type = exerciseLogType(exercise);
    var v = function (key) { var value = log[key]; return value === undefined || String(value).trim() === "" ? null : String(value); };
    if (type === "cardio") {
      var cardioParts = [];
      if (v("minutes")) cardioParts.push(v("minutes") + " min");
      if (v("distance")) cardioParts.push(v("distance") + " km");
      return cardioParts.join(", ");
    }
    if (type === "rounds") return v("rounds") ? v("rounds") + " rondes" : "";
    if (type === "timed") {
      if (v("sets") && v("seconds")) return v("sets") + "×" + v("seconds") + " s";
      if (v("seconds")) return v("seconds") + " s";
      return v("sets") ? v("sets") + " sets" : "";
    }
    var parts = [];
    if (v("sets") && v("reps")) parts.push(v("sets") + "×" + v("reps"));
    else if (v("sets")) parts.push(v("sets") + " sets");
    else if (v("reps")) parts.push(v("reps") + " herh.");
    if (v("weight")) parts.push("@ " + v("weight") + " kg");
    return parts.join(" ");
  }

  return {
    isIsoDay: isIsoDay,
    programPosition: programPosition,
    scaleMealDescription: scaleMealDescription,
    exerciseLogType: exerciseLogType,
    exerciseFields: exerciseFields,
    formatPreviousLog: formatPreviousLog
  };
});
