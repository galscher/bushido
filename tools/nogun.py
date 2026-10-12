# No firearms in Bushido: every gun and cannon in the story and the texts becomes something of old Japan.
# Idempotent. Usage: python3 -I tools/nogun.py [files...]  (default: the sources). Exit 1 if a phrase is found nowhere.
import sys,os
os.chdir('/home/claude/bushido')
R=[
 # the Tanegashima chapter becomes the coming of the foreign steel (nanban-tetsu, prized by Japanese swordsmiths)
 ("{id:'tane',k:'鉄砲',","{id:'tane',k:'南蛮鉄',"),
 ("בידיים שלהם היו מקלות ברזל שיורקים אש ורעם.","בידיים שלהם הייתה פלדה מוזרה, כחולה כמו מים עמוקים, שמצלצלת כמו פעמון ולא נשברת."),
 ("In their hands were iron sticks that spat fire and thunder.","In their hands was a strange steel, blue as deep water, that rang like a bell and would not break."),
 ("אדון האי, טאנגאשימה טוקיטאקה, קנה שניים מהם במחיר עצום, ונתן לנפח שלו, יאיטה קינביי, לגלות איך הם עובדים. (גם זה קרה באמת. תוך כמה עשרות שנים יפן כבר ייצרה רובים בכמויות עצומות.)",
  "אדון האי, טאנגאשימה טוקיטאקה, קנה את הפלדה במחיר עצום, ונתן לנפח שלו, יאיטה קינביי, לגלות איך מחשלים אותה. (גם זה אמיתי: הנפחים של יפן העריכו מאוד את \"הברזל של הברברים מהדרום\", 南蛮鉄.)"),
 ("The island’s lord, Tanegashima Tokitaka, bought two of them for a fortune and set his smith, Yaita Kinbei, to discover how they worked. (This too is true. Within a few decades Japan was making guns in enormous numbers.)",
  "The island’s lord, Tanegashima Tokitaka, bought the steel for a fortune and set his smith, Yaita Kinbei, to discover how it was forged. (This too is true: Japan’s swordsmiths prized the “iron of the southern barbarians”, 南蛮鉄.)"),
 ("אבל לא רק האדון שמע על הרובים. ספינות הוואקו, שודדי הים, כבר מקיפות את האי. הוטארו מסתכלת על הברזל ואומרת: ״חרב הורגת אדם אחד. הדבר הזה יהרוג דור שלם.״",
  "אבל לא רק האדון שמע על הפלדה הזרה. ספינות הוואקו, שודדי הים, כבר מקיפות את האי. הוטארו מסתכלת על הלהב ואומרת: ״להב שלא נשבר לעולם. מי שיחזיק בו לא יעצור במלחמה אחת.״"),
 ("But the lord is not the only one who has heard of the guns. The ships of the wakō pirates are already circling the island. Hotaru looks at the iron and says: “A sword kills one man. This thing will kill a generation.”",
  "But the lord is not the only one who has heard of the foreign steel. The ships of the wakō pirates are already circling the island. Hotaru looks at the blade and says: “A blade that never breaks. Whoever holds it will not stop at one war.”"),
 ("״אתה מסתכל על הרובים כאילו אתה כבר יודע מה הם יעשו.״","״אתה מסתכל על הפלדה הזאת כאילו אתה כבר יודע מה היא תהיה.״"),
 ("“You look at those guns as if you already know what they’ll do.”","“You look at that steel as if you already know what it will become.”"),
 ("הוא הצליח לבנות את הקנה, אבל לא את הבורג שסוגר אותו מאחור.","הוא מצליח להתיך את הפלדה, אבל היא נסדקת בכל פעם שהוא מקפל אותה."),
 ("He has managed to make the barrel, but not the screw that seals its breech.","He can melt the steel, but it cracks every time he folds it."),
 ("אחרי שנה הנפחים שלך יודעים לבנות רובים.","אחרי שנה הנפחים שלך יודעים לחשל את הפלדה הזרה."),
 ("A year later your smiths can build guns.","A year later your smiths can forge the foreign steel."),
 ("ולומדת את הסוד בעצמה, בורג אחרי בורג.","ולומדת את הסוד בעצמה, קיפול אחרי קיפול."),
 ("and learns the secret herself, screw by screw.","and learns the secret herself, fold by fold."),
 ("['השלך את הרובים לים','Throw the guns into the sea']","['השלך את הפלדה הזרה לים','Throw the foreign steel into the sea']"),
 ("״לוחם צריך לראות את העיניים של מי שהוא הורג,״ אתה אומר, וזורק את הברזל לגלים.","״להב של לוחם נולד מהברזל ומהחול של יפן,״ אתה אומר, וזורק את הפלדה לגלים."),
 ("“A warrior should see the eyes of the man he kills,” you say, and throw the iron into the waves.","“A warrior’s blade is born of the iron and sand of Japan,” you say, and throw the steel into the waves."),
 # Shingen's death
 ("ממחלה או מכדור של רובאי מעל חומות נודה.","ממחלה או מחץ של קשת מעל חומות נודה."),
 ("of sickness or a marksman’s bullet from the walls of Noda.","of sickness or an archer’s arrow from the walls of Noda."),
 # Nagashino: the palisade, the archers and the long pikes
 ("h:['שלושה גלים של אש','Three waves of fire']","h:['שלושה גלים של חצים','Three waves of arrows']"),
 ("מאחורי הגדר עומדים אלפי רובאים. (זה הקרב שבו הרובה שינה את יפן לתמיד.)","מאחורי הגדר עומדים אלפי קשתים ונושאי חניתות ארוכות, בשלוש שורות. (זה הקרב שבו גדר עץ אחת שברה את הפרשים הגדולים של יפן.)"),
 ("Behind the palisade stand thousands of musketeers. (This is the battle in which the gun changed Japan forever.)","Behind the palisade stand thousands of archers and long-pikemen, in three ranks. (This is the battle in which one wooden fence broke the greatest cavalry in Japan.)"),
 ("הרובים האלה נולדו בנפחייה שלך. את הסוד קנית בטאנגאשימה, במחיר של ילדה אחת.","ראשי החניתות האלה נולדו בנפחייה שלך, מהפלדה שאת הסוד שלה קנית בטאנגאשימה, במחיר של ילדה אחת."),
 ("These guns were born in your forge. You bought the secret on Tanegashima, for the price of one girl.","These spearheads were born in your forge, of the steel whose secret you bought on Tanegashima, for the price of one girl."),
 ("היא בנתה בעצמה חצי מהרובים בשורה הראשונה.","היא חישלה בעצמה חצי מראשי החניתות בשורה הראשונה."),
 ("She built half the guns in the front rank herself.","She forged half the spearheads in the front rank herself."),
 ("אתה זוכר את הרובים שזרקת לים. זה לא עזר. הם כאן בכל זאת, אלפים מהם.","אתה זוכר את הפלדה שזרקת לים. זה לא עזר. היא נוצצת כאן בכל זאת, על אלפי ראשי חניתות."),
 ("You remember the guns you threw into the sea. It didn’t help. They are here anyway, thousands of them.","You remember the steel you threw into the sea. It didn’t help. It glints here anyway, on thousands of spearheads."),
 ("״שלוש שורות של אש. אני יודעת מה בא אחריהן.״","״שלוש שורות של חצים. אני יודעת מה בא אחריהן.״"),
 ("“Three ranks of fire. I know what comes after.”","“Three ranks of arrows. I know what comes after.”"),
 ("הרובאים שלך יורים מטח לפני הדו־קרב. באבא נכנס פצוע.","הקשתים שלך יורים מטח לפני הדו־קרב. באבא נכנס פצוע."),
 ("Your musketeers fire a volley before the duel. Baba comes in wounded.","Your archers loose a volley before the duel. Baba comes in wounded."),
 ("ואקאסה יורה ירייה אחת, מדויקת.","ואקאסה יורה חץ אחד, מדויק."),
 ("Wakasa fires a single, perfect shot.","Wakasa looses a single, perfect arrow."),
 ("ואקאסה פתחה נפחייה משלה. היה מקובל לומר שהרובים שלה הם הטובים ביפן.","ואקאסה פתחה נפחייה משלה. היה מקובל לומר שהלהבים שלה הם הטובים ביפן."),
 ("Wakasa opened a forge of her own. It was said her guns were the finest in Japan.","Wakasa opened a forge of her own. It was said her blades were the finest in Japan."),
 ("הרובים מהנפחייה שלך היו בכל שדה קרב, עד שהשוגונים אסרו כמעט לגמרי לייצר אותם. ואקאסה לא חזרה אף פעם.","הלהבים מהנפחייה שלך היו בכל שדה קרב, ועד היום אוספים אותם. ואקאסה לא חזרה אף פעם."),
 ("The guns of your forge were on every battlefield, until the shoguns all but banned their making. Wakasa never came back.","The blades of your forge were on every battlefield, and collectors still seek them. Wakasa never came back."),
 # the ashigaru, the tea kettle, the foreign armies
 ("TX('חייל רגלי עם חנית או רובה. מכאן מתחילים.','A foot soldier with spear or gun. This is where you start.')","TX('חייל רגלי עם חנית או קשת. מכאן מתחילים.','A foot soldier with spear or bow. This is where you start.')"),
 ("מילא אותו באבק שריפה ופוצץ את עצמו איתו.","ניפץ אותו לרסיסים ומת בטירה הבוערת שלו."),
 ("filled it with powder and blew himself up with it.","smashed it to pieces and died in his burning castle."),
 ("weak:TX('מעט תותחים: חומות עבות ורובים עוצרים אותם','Few cannon: thick walls and guns hold them')","weak:TX('מעט כלי מצור: חומות עבות וקשתים עוצרים אותם','Few siege engines: thick walls and archers hold them')"),
 ("macau:{n:TX('תותחים ורובי ארקבוז','Cannon and arquebus'),jp:'黒船',d:TX('תותחי ספינה ורובאים מאחורי חומות אבן','Ship cannon and arquebusiers behind stone walls')","macau:{n:TX('הספינות השחורות','The black ships'),jp:'黒船',d:TX('מלחים זרים בשריון פלדה מאחורי חומות אבן','Foreign sailors in steel armour behind stone walls')"),
 ("str:TX('אש מאחורי חומות','Firepower behind walls')","str:TX('פלדה זרה מאחורי חומות','Foreign steel behind walls')"),
 # the castle tech tree
 ("n:'חרכי ירי (סאמה)',d:'פתחים משולשים ומרובעים בקירות לקשתים, ואחרי 1543 גם לרובים'","n:'חרכי ירי (סאמה)',d:'פתחים משולשים ומרובעים בקירות, שמהם הקשתים יורים בלי להיחשף'"),
 ("d:'Triangular and square openings in the walls for archers, and after 1543 for guns too'","d:'Triangular and square openings in the walls, from which archers shoot unseen'"),
 ("{id:'ozutsu',yr:1576,kj:'砲',n:'תותחי אוזוצו',d:'תותחים כבדים שהגיעו עם הסוחרים הפורטוגזים',fx:{siege:.25,wall:.03},fd:'+25% נזק במצור',res:{iron:40,sulfur:15}}",
  "{id:'ozutsu',yr:1576,kj:'井',n:'מגדלי מצור (井楼)',d:'מגדלי עץ גבוהים שמהם הקשתים יורים אל תוך הטירה',fx:{siege:.25,wall:.03},fd:'+25% נזק במצור',res:{timber:40,iron:10}}"),
 ("{id:'ozutsu',yr:1576,kj:'砲',n:'Ozutsu cannons',d:'Heavy cannons that came with the Portuguese merchants',fx:{siege:.25,wall:.03},fd:'+25% siege damage',res:{iron:40,sulfur:15}}",
  "{id:'ozutsu',yr:1576,kj:'井',n:'Siege towers (seirō)',d:'Tall wooden towers from which archers shoot into the castle',fx:{siege:.25,wall:.03},fd:'+25% siege damage',res:{timber:40,iron:10}}"),
 # Fukuda Bay
 ("ספינת סחר פורטוגזית ענקית, חמושה בתותחים וברובי טנגאשימה.","ספינת סחר פורטוגזית ענקית, גבוהה כמו טירה, שהסירות היפניות מקיפות כמו זאבים."),
 ("a huge Portuguese trading ship armed with cannon and tanegashima guns.","a huge Portuguese trading ship, tall as a castle, that the Japanese boats circle like wolves."),
 ("/* the Portuguese at Fukuda Bay: European captain, cannon and guns */","/* the Portuguese at Fukuda Bay: a European captain and his crew */"),
 # the sea monsters: heavy stones from the deck instead of cannon
 ("['cannon','大筒',seaT('תותחים','Cannons'),seaT('חזק כשהוא חשוף','strong when it surfaces')]","['cannon','投石',seaT('אבנים כבדות','Heavy stones'),seaT('חזק כשהוא חשוף','strong when it surfaces')]"),
 ("seaT('התותחים רועמים.','The cannons roar.')","seaT('האבנים מתרסקות על הקשקשים.','The stones crash onto its scales.')"),
 ("seaT('הכדורים טובעים במים הריקים. הוא בעומק.','The shots sink into empty water. It is down deep.')","seaT('האבנים טובעות במים הריקים. הוא בעומק.','The stones sink into empty water. It is down deep.')"),
 ("seaT('מטח ישיר לגוף החשוף!','A full volley into its exposed body!')","seaT('מטח אבנים ישיר לגוף החשוף!','A volley of stones into its exposed body!')"),
 ("seaT('חלש מול חצי אש, עמיד לתותחים','Weak to fire arrows, resists cannons')","seaT('חלש מול חצי אש, עמיד לאבנים','Weak to fire arrows, resists stones')"),
 ("seaT('עמיד מאוד לתותחים, חלש מול צלצלים','Strongly resists cannons, weak to harpoons')","seaT('עמיד מאוד לאבנים, חלש מול צלצלים','Strongly resists stones, weak to harpoons')"),
 ("טיפ: צפה בכוונה שמעל ראשו. תותחים כשהוא עולה,","טיפ: צפה בכוונה שמעל ראשו. אבנים כבדות כשהוא עולה,"),
 ("Tip: watch the intent above its head. Cannons when it surfaces,","Tip: watch the intent above its head. Heavy stones when it surfaces,"),
]
files=sys.argv[1:] or ['saga_b.js','buke_addon.js','empng_addon.js','furyu_addon.js','he.html','en.html']
texts={f:open(f,encoding='utf8').read() for f in files}
missing=[]
for a,b in R:
  hit=False
  for f in files:
    if a in texts[f]:texts[f]=texts[f].replace(a,b);hit=True
    elif b in texts[f]:hit=True
  if not hit:missing.append(a[:70])
for f in files:open(f,'w',encoding='utf8').write(texts[f])
print('replacements',len(R),'missing',len(missing))
for m in missing:print('  MISSING',m)
sys.exit(1 if missing else 0)
