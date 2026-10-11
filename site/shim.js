/* Bushido standalone: plays the role of the Claude platform services on a normal website, backed by Firebase. */
(function(){
 const CFG=window.BUSHIDO_FIREBASE;let app=null,ready=null,UIDV=null;
 function boot(){if(ready)return ready;ready=(async()=>{try{if(!CFG||!window.firebase)return null;app=firebase.apps.length?firebase.app():firebase.initializeApp(CFG);
  const auth=firebase.auth();if(!auth.currentUser){await auth.signInAnonymously()}UIDV=auth.currentUser&&auth.currentUser.uid;
  const fs=firebase.firestore();try{await fs.enablePersistence({synchronizeTabs:true})}catch(e){}return fs}catch(e){console.warn('firebase boot',e);return null}})();return ready}
 const ADMIN=(window.BUSHIDO_ADMIN||[]);
 window.claude={use:async function(name){
  if(name==='db'){const fs=await boot();return fs||null}
  if(name==='user'){await boot();if(!UIDV)return null;return{id:async()=>UIDV,can:async(p)=>p==='data.write',isOwner:async()=>ADMIN.includes(UIDV),canEdit:async()=>false}}
  return null}};
 boot();
})();
