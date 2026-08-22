export const MI = "Sportivo Malvin";

// Las 15 jornadas fijas del Clausura 2026. Cada una tiene un id único
// que se usa para guardar resultados en Firestore ("j1".."j15").
export const jornadas = [
  
  {id:"j1", n:1, fecha:"22/08/2026", partidos:[
    ["C.A. Ankara","Babacar FC"],["DELTA FC","Montevinas FC"],["Universidad ORT Uruguay","Cesar Nabia FC"],
    ["Real Rejunte","La Axioneta"],["TFC","Chacal F.C"],["Carechimba FC","Ligamentos Cruzeiro"],["Sportivo Malvin","Juana Chard"]
  ]},
  {id:"j2", n:2, fecha:"29/08/2026", partidos:[
    ["Babacar FC","Inter Mitente FC"],["C.A. Ankara","DELTA FC"],["Montevinas FC","Real Rejunte"],
    ["Cesar Nabia FC","TFC"],["La Axioneta","Carechimba FC"],["Chacal F.C","Sportivo Malvin"],["Ligamentos Cruzeiro","Juana Chard"]
  ]},
  {id:"j3", n:3, fecha:"05/09/2026", partidos:[
    ["DELTA FC","Babacar FC"],["Universidad ORT Uruguay","Inter Mitente FC"],["Real Rejunte","C.A. Ankara"],
    ["Carechimba FC","Montevinas FC"],["Sportivo Malvin","Cesar Nabia FC"],["Juana Chard","La Axioneta"],["Ligamentos Cruzeiro","Chacal F.C"]
  ]},
  {id:"j4", n:4, fecha:"12/09/2026", partidos:[
    ["Babacar FC","Universidad ORT Uruguay"],["DELTA FC","Real Rejunte"],["Inter Mitente FC","TFC"],
    ["C.A. Ankara","Carechimba FC"],["Montevinas FC","Juana Chard"],["Cesar Nabia FC","Ligamentos Cruzeiro"],["La Axioneta","Chacal F.C"]
  ]},
  {id:"j5", n:5, fecha:"19/09/2026", partidos:[
    ["Real Rejunte","Babacar FC"],["TFC","Universidad ORT Uruguay"],["Carechimba FC","DELTA FC"],
    ["Sportivo Malvin","Inter Mitente FC"],["Juana Chard","C.A. Ankara"],["Chacal F.C","Montevinas FC"],["La Axioneta","Cesar Nabia FC"]
  ]},
  {id:"j6", n:6, fecha:"26/09/2026", partidos:[
    ["Babacar FC","TFC"],["Real Rejunte","Carechimba FC"],["Universidad ORT Uruguay","Sportivo Malvin"],
    ["DELTA FC","Juana Chard"],["Inter Mitente FC","Ligamentos Cruzeiro"],["C.A. Ankara","Chacal F.C"],["Montevinas FC","Cesar Nabia FC"]
  ]},
  {id:"j7", n:7, fecha:"03/10/2026", partidos:[
    ["Carechimba FC","Babacar FC"],["Sportivo Malvin","TFC"],["Juana Chard","Real Rejunte"],
    ["Ligamentos Cruzeiro","Universidad ORT Uruguay"],["Chacal F.C","DELTA FC"],["La Axioneta","Inter Mitente FC"],["Cesar Nabia FC","C.A. Ankara"]
  ]},
  {id:"j8", n:8, fecha:"10/10/2026", partidos:[
    ["Babacar FC","Sportivo Malvin"],["Carechimba FC","Juana Chard"],["TFC","Ligamentos Cruzeiro"],
    ["Real Rejunte","Chacal F.C"],["Universidad ORT Uruguay","La Axioneta"],["DELTA FC","Cesar Nabia FC"],["Inter Mitente FC","Montevinas FC"]
  ]},
  {id:"j9", n:9, fecha:"17/10/2026", partidos:[
    ["Juana Chard","Babacar FC"],["Ligamentos Cruzeiro","Sportivo Malvin"],["Chacal F.C","Carechimba FC"],
    ["La Axioneta","TFC"],["Cesar Nabia FC","Real Rejunte"],["Montevinas FC","Universidad ORT Uruguay"],["C.A. Ankara","Inter Mitente FC"]
  ]},
  {id:"j10", n:10, fecha:"24/10/2026", partidos:[
    ["Babacar FC","Ligamentos Cruzeiro"],["Juana Chard","Chacal F.C"],["Sportivo Malvin","La Axioneta"],
    ["Carechimba FC","Cesar Nabia FC"],["TFC","Montevinas FC"],["Universidad ORT Uruguay","C.A. Ankara"],["DELTA FC","Inter Mitente FC"]
  ]},
  {id:"j11", n:11, fecha:"31/10/2026", partidos:[
    ["Chacal F.C","Babacar FC"],["La Axioneta","Ligamentos Cruzeiro"],["Cesar Nabia FC","Juana Chard"],
    ["Montevinas FC","Sportivo Malvin"],["C.A. Ankara","TFC"],["Inter Mitente FC","Real Rejunte"],["DELTA FC","Universidad ORT Uruguay"]
  ]},
  {id:"j12", n:12, fecha:"07/11/2026", partidos:[
    ["Babacar FC","La Axioneta"],["Chacal F.C","Cesar Nabia FC"],["Ligamentos Cruzeiro","Montevinas FC"],
    ["Sportivo Malvin","C.A. Ankara"],["Carechimba FC","Inter Mitente FC"],["TFC","DELTA FC"],["Real Rejunte","Universidad ORT Uruguay"]
  ]},
  {id:"j13", n:13, fecha:"14/11/2026", partidos:[
    ["Cesar Nabia FC","Babacar FC"],["Montevinas FC","La Axioneta"],["C.A. Ankara","Ligamentos Cruzeiro"],
    ["Inter Mitente FC","Juana Chard"],["DELTA FC","Sportivo Malvin"],["Universidad ORT Uruguay","Carechimba FC"],["Real Rejunte","TFC"]
  ]},
  {id:"j14", n:14, fecha:"21/11/2026", partidos:[
    ["Babacar FC","Montevinas FC"],["La Axioneta","C.A. Ankara"],["Chacal F.C","Inter Mitente FC"],
    ["Ligamentos Cruzeiro","DELTA FC"],["Juana Chard","Universidad ORT Uruguay"],["Sportivo Malvin","Real Rejunte"],["Carechimba FC","TFC"]
  ]},
  {id:"j15", n:15, fecha:"28/11/2026", partidos:[
    ["C.A. Ankara","Montevinas FC"],["Inter Mitente FC","Cesar Nabia FC"],["DELTA FC","La Axioneta"],
    ["Universidad ORT Uruguay","Chacal F.C"],["Real Rejunte","Ligamentos Cruzeiro"],["TFC","Juana Chard"],["Carechimba FC","Sportivo Malvin"]
  ]}
];

// Lista de equipos, para usar en el formulario de "agregar jornada extra"
export const EQUIPOS = [
  "C.A. Ankara","Babacar FC","DELTA FC","Montevinas FC","Universidad ORT Uruguay",
  "Cesar Nabia FC","Real Rejunte","La Axioneta","TFC","Chacal F.C",
  "Carechimba FC","Ligamentos Cruzeiro","Sportivo Malvin","Juana Chard","Inter Mitente FC"
];

export function matchId(jornadaId, i){ return jornadaId + "_" + i; }