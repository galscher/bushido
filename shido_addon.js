/* ================= 臆病 the coward's stance: no winning by hiding until the incense burns out =================
   There were no referees in a duel to the death. But there were witnesses, and a samurai lived by his name:
   a fighter who leads and then only blocks, backs away or rests is seen as a coward. Each mark of cowardice costs honor,
   fires the opponent's spirit and weighs on the final cut when the incense burns out. The third is open shame.
   A guard held too long also cracks: every block after the second costs more stamina, and the fourth in a row breaks. */
const SHIDO_PASSIVE=['block','ret','rest','taunt'];
function shidoGive(){if(!FF||FF.war)return;FF.shido=(FF.shido||0)+1;const n=FF.shido;sfx('gong');bigKanji={t:n>=3?'恥':'臆病',life:1.2};
 S.meiyo=(S.meiyo||0)-(n>=3?4:1);try{if(E){E.ki=Math.min(100,(E.ki||0)+10);if(n>=3)E.dmgMul=(E.dmgMul||1)*1.15}}catch(e){}try{updatePills()}catch(e){}
 if(n>=3){announce(TX('恥 בושה','恥 Shame'),{size:64,dur:1500,lose:true});logMsg(TX(`העדים מפנים את הגב. ${E.name} יורק על האדמה ותוקף בזעם. (−4 כבוד, והמכה האחרונה כשהקטורת תכבה תהיה קשה מאוד)`,`The witnesses turn their backs. ${E.name} spits on the ground and attacks in fury. (−4 honor, and the last cut when the incense burns out will be very hard)`));toast(TX('恥 לוחם שמסתתר מאחורי ההגנה מאבד את שמו. תקוף.','恥 A warrior who hides behind his guard loses his name. Attack.'));return}
 announce(TX(`臆病 פחדן? ${n}/3`,`臆病 Coward? ${n}/3`),{size:56,dur:1200,lose:true});
 logMsg(TX(`העדים לוחשים: ״פחדן״. ${E.name} מרגיש את זה ומתלהט. (−1 כבוד. כל סימן כזה מקשה עליך במכה האחרונה כשהקטורת תכבה)`,`The witnesses whisper: “coward”. ${E.name} feels it and burns hotter. (−1 honor. Every such mark weighs on your last cut when the incense burns out)`));
 if(n===1)toast(TX('臆病 מוביל ורק מתגונן? העדים רואים. התקפה אחת מוחקת את הלחישות.','臆病 Leading and only defending? The witnesses see it. One attack silences the whispers.'))}
{const o=playerAct;playerAct=async function(k){const live=!busy&&!fightOver;const r=await o.apply(this,arguments);try{if(live&&FF&&!FF.war&&FF.clock!=null&&P&&E&&!S.autoFight){
 if(SHIDO_PASSIVE.includes(k)){const lead=pct(P)>pct(E)+.02;FF.pas=(FF.pas||0)+(lead?1:0);if(FF.pas>=3){FF.pas=0;shidoGive()}}else FF.pas=0}}catch(e){}return r}}
{const o=doAction;doAction=async function(a,d,k){try{if(a){if(k==='block')a._blk=(a._blk||0)+1;else a._blk=0;if(k==='block'&&a._blk>=3)a.sta=Math.max(0,a.sta-5*(a._blk-2))}}catch(e){}
 const r=await o.apply(this,arguments);
 try{if(a&&k==='block'&&a._blk>=4){a.guard=false;a._blk=0;logMsg(TX(`ההגנה של ${a.name} נשברה: אי אפשר להחזיק את החרב למעלה לנצח.`,`${a.name}’s guard breaks: no one can hold a sword up forever.`));if(a.isPlayer)toast(TX('🛡 ההגנה נשברה. אחרי שתי חסימות ברצף, כל חסימה נוספת עולה יותר סיבולת, והרביעית נשברת.','🛡 Guard broken. After two blocks in a row, each extra block costs more stamina, and the fourth one breaks.'))}}catch(e){}return r}}
