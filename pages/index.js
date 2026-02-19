import { useState, useEffect, useRef } from "react";
import Head from "next/head";
const PERSONAS = [
  { id: "ibrahima", name: "Ibrahima Diop", age: 36, title: "The Digital Progressive", color: "#2E7D32", colorLight: "#E8F5E9", initial: "I" },
  { id: "fatou", name: "Fatou Sarr", age: 48, title: "The Aspiring Community Leader", color: "#00796B", colorLight: "#E0F2F1", initial: "F" },
  { id: "ousmane", name: "Ousmane Ba", age: 64, title: "The Modest Offline Farmer", color: "#5D4037", colorLight: "#EFEBE9", initial: "O" },
  { id: "aissatou", name: "Aissatou Diallo", age: 38, title: "The Connected Communicator", color: "#6A1B9A", colorLight: "#F3E5F5", initial: "A" },
  { id: "moussa", name: "Moussa Sow", age: 52, title: "The Traditional Grower", color: "#BF360C", colorLight: "#FBE9E7", initial: "M" },
];

const P_MAP = Object.fromEntries(PERSONAS.map(p => [p.id, p]));

const TEAMS = ["Sales", "Data", "Engineering", "Product", "Leadership", "IT", "Development", "Supply Chains & Logistics", "Accounting & Finance", "Government Relations", "Call Center"];

const TIMER_SECS = { 1: 30, 2: 40, 3: 50 };

const GAME1_QS = [
  { d:1, type:"single", q:"I'm the only persona who can read and write in French. I use Google to search for farming tips. Who am I?", correct:["ibrahima"], explanation:"Ibrahima is the only French-literate persona (22.4%) and uses Google (36.6%).", hint:"Literacy is the key differentiator.", about:["ibrahima"] },
  { d:1, type:"single", q:"I'm the oldest persona at 64 years old. I use a horse cart for transport. Who am I?", correct:["ousmane"], explanation:"Ousmane is 64, the oldest persona, and uses a horse cart (65.7%).", hint:"Check the ages...", about:["ousmane"] },
  { d:1, type:"single", q:"I'm active in my women's group and I grow hibiscus as my primary crop. Who am I?", correct:["fatou"], explanation:"Fatou is the only persona in a women's group (22.2%) and grows hibiscus (45.8%).", hint:"Which persona is female and community-focused?", about:["fatou"] },
  { d:1, type:"single", q:"My advice to new farmers is 'the land doesn't lie.' I grow cowpea as one of my crops. Who am I?", correct:["moussa"], explanation:"Moussa is the only persona who grows cowpea (29.7%) and his quote is about the land not lying.", hint:"Only one persona grows cowpea...", about:["moussa"] },
  { d:1, type:"single", q:"I use social media to stay informed and connected. I follow news on Facebook. Who am I?", correct:["aissatou"], explanation:"Aissatou uses social media to communicate (51.2%) and stay informed (46.5%), follows news on Facebook (45.1%).", hint:"Who is the social media persona?", about:["aissatou"] },
  { d:2, type:"single", q:"I discovered myAgro at a village meeting, not through a VE or friend. I've attended at least one training and my goal is to diversify my crops. Who am I?", correct:["fatou"], explanation:"Fatou found myAgro at a village meeting (26.1%), has attended training (28%), and wants to diversify crops (29%).", hint:"Think discovery channel + goal combination...", about:["fatou"] },
  { d:2, type:"single", q:"I participate in WhatsApp groups, use social media for information, and teach new techniques to others. I have a car for transport services. Who am I?", correct:["ibrahima"], explanation:"Ibrahima uses WhatsApp groups (73.9%), social for info (51.2%), teaches others (19.6%), and has a car/moto (48.1%).", hint:"Full digital engagement + teaching role...", about:["ibrahima"] },
  { d:2, type:"single", q:"My primary strategy is simply to work harder. I have 15+ years of experience and I use Wave for deposits. I'm not in any farmer groups. Who am I?", correct:["moussa"], explanation:"Moussa's strategy is hard work (32%), has 15+ years (42.8%), uses Wave (73.6%), and is not a group member (48.6%).", hint:"Traditional values, simple approach...", about:["moussa"] },
  { d:2, type:"single", q:"I supplement my farming with small trade year-round. I found myAgro through my VE and my goal is to save and invest for the future. Who am I?", correct:["ousmane"], explanation:"Ousmane does small trade (29.7%) year-round (52%), found via VE (62.7%), goal is to save/invest (31%).", hint:"Savings-focused + small trade combination...", about:["ousmane"] },
  { d:2, type:"single", q:"I grow groundnut, millet, and maize. My strategy is to buy quality inputs. I keep livestock for year-round income. Who am I?", correct:["aissatou"], explanation:"Aissatou grows groundnut/millet/maize, strategy is quality inputs (30%), keeps livestock (36.78%) year-round.", hint:"Maize is the distinguishing tertiary crop...", about:["aissatou"] },
  { d:3, type:"single", q:"I rate my performance as 'Very Good,' measure success by goals achieved, and I'm proudest of learning. My secondary crop is watermelon. Who am I?", correct:["ibrahima"], explanation:"Ibrahima rates 'Very Good' (14.4%), measures by goals (20.9%), proud of learning (12%), grows watermelon (7.3%).", hint:"Self-assessment + secondary crop narrows it down...", about:["ibrahima"] },
  { d:3, type:"single", q:"I rate myself 'Average,' my biggest challenge is labor shortage, and my solution is to adjust inputs. I measure success by how well I support my family. Who am I?", correct:["fatou"], explanation:"Fatou rates 'Average' (34.8%), faces labor (16%), adjusts inputs (14%), measures by family support (24.2%).", hint:"Family-centered success metric is the key...", about:["fatou"] },
  { d:3, type:"single", q:"My main challenge is animals damaging crops. My solution is careful spending. I have no formal role, no groups, use Wave but no trainings. Who am I?", correct:["ousmane"], explanation:"Ousmane faces animals (17%), spends carefully (56%), no role (63.2%), no groups (48.6%), Wave, no training (63%).", hint:"Stack all the 'none' attributes together...", about:["ousmane"] },
  { d:3, type:"single", q:"I contact my VE once a month. I use smartphone for voice but am active on WhatsApp and follow Facebook news. My proudest achievement is good harvests. Who am I?", correct:["aissatou"], explanation:"Aissatou contacts VE 1x/month (41.8%), smartphone for voice, WhatsApp (73.9%), Facebook news (45.1%), proud of harvests.", hint:"VE contact frequency + social media combo...", about:["aissatou"] },
  { d:3, type:"single", q:"I have 15+ years on 1-5 hectares. I grow groundnut, millet, and cowpea. I prefer phone calls and participate in WhatsApp groups. Who am I?", correct:["moussa"], explanation:"Moussa has 15+ years (42.8%), 1-5 ha (54.9%), cowpea (29.7%), prefers calls (78.6%), WhatsApp groups (38.1%).", hint:"Cowpea is the unique crop identifier...", about:["moussa"] },
  { d:2, type:"single", q:"I process products and take on casual labor to supplement irregular income. I check TikTok on other people's phones. Who am I?", correct:["fatou"], explanation:"Fatou does processing (18.6%), has irregular income, checks TikTok on others' phones (29.2%).", hint:"Who borrows others' phones for TikTok?", about:["fatou"] },
  { d:2, type:"single", q:"I'm a savings group member who contacts myAgro weekly and prefers WhatsApp. I have less than 0.5 hectares. Who am I?", correct:["ibrahima"], explanation:"Ibrahima is in a savings group (8.8%), contacts weekly (10%), prefers WhatsApp (22.1%), farms <0.5 ha (17.1%).", hint:"Small land + frequent digital contact...", about:["ibrahima"] },
  { d:3, type:"single", q:"I sell most of my harvest. My secondary crop is hibiscus. I earn from small trade year-round and found myAgro through my VE. I carefully manage every expense. Who am I?", correct:["ousmane"], explanation:"Ousmane sells most (35.8%), hibiscus secondary (45.8%), trades year-round, found via VE (62.7%), spends carefully (56%).", hint:"Selling most + secondary hibiscus...", about:["ousmane"] },
  { d:3, type:"single", q:"My main issue is input costs at 43%. I need fertilizers and seeds (44%). I advise 'work hard' (41%) and 'use good inputs' (15%). I measure success by income. Who am I?", correct:["aissatou"], explanation:"Aissatou faces input costs (43%), needs fertilizers/seeds (44%), advises hard work (41%) and good inputs (15%), measures by income (44.3%).", hint:"The data sheet percentages are very specific...", about:["aissatou"] },
  { d:1, type:"single", q:"I earn extra income from livestock year-round. My strategy is hard work. I believe 'the land doesn't lie.' Who am I?", correct:["moussa"], explanation:"Moussa earns from livestock (36.78%) year-round (52%), strategy is hard work (32%).", hint:"Traditional, hard-working, livestock income...", about:["moussa"] },
];

const GAME2_QS = [
  { d:1, type:"single", q:"Which persona has NO mobile money registration and has NEVER used mobile money?", correct:["fatou"], explanation:"Fatou is the only persona not registered (22.4%) and never used mobile money (21.6%).", hint:"Who is most disconnected from digital finance?", about:["fatou"] },
  { d:1, type:"single", q:"Which persona found myAgro through a friend — not a VE or village meeting?", correct:["ibrahima"], explanation:"Ibrahima found myAgro through a friend (10.7%).", hint:"Digitally connected, found it socially...", about:["ibrahima"] },
  { d:1, type:"single", q:"Which persona's main farming challenge is animals damaging their crops?", correct:["ousmane"], explanation:"Ousmane faces animals (17%). Others face pests, labor, or input costs.", hint:"Rural, larger land...", about:["ousmane"] },
  { d:1, type:"multi", q:"Which personas use Wave for mobile money? Select all that apply.", correct:["ibrahima","ousmane","aissatou","moussa"], explanation:"All use Wave (73.6%) except Fatou who has no mobile money.", hint:"Almost everyone except one...", about:["fatou","ibrahima","ousmane","aissatou","moussa"] },
  { d:1, type:"single", q:"Which persona's primary goal is to 'diversify crops and activities'?", correct:["fatou"], explanation:"Fatou wants to diversify (29%).", hint:"She grows hibiscus and okra and wants more variety...", about:["fatou"] },
  { d:2, type:"multi", q:"Which personas have NEVER attended a myAgro training? Select all.", correct:["ousmane","aissatou","moussa"], explanation:"All three show 63% 'None' for trainings. Ibrahima attended multiple and Fatou at least 1.", hint:"More than two share this...", about:["ousmane","aissatou","moussa"] },
  { d:2, type:"multi", q:"Which personas earn year-round income (not just seasonal)? Select all.", correct:["ousmane","aissatou","moussa"], explanation:"Ousmane (trade), Aissatou (livestock), Moussa (livestock) earn year-round (52%).", hint:"Think income beyond crops...", about:["ousmane","aissatou","moussa"] },
  { d:2, type:"single", q:"Which persona contacts their VE weekly — more frequently than all others?", correct:["ibrahima"], explanation:"Ibrahima contacts weekly (10%). Others contact 2-3x/month or 1x/month.", hint:"The most engaged persona...", about:["ibrahima"] },
  { d:2, type:"multi", q:"Which personas prefer phone calls as their main communication? Select all.", correct:["fatou","ousmane","aissatou","moussa"], explanation:"All except Ibrahima prefer calls (78.6%). Ibrahima prefers WhatsApp (22.1%).", hint:"Only one prefers a different channel...", about:["fatou","ousmane","aissatou","moussa","ibrahima"] },
  { d:2, type:"single", q:"Which persona rates their performance as 'Very Good'?", correct:["ibrahima"], explanation:"Ibrahima rates 'Very Good' (14.4%). Others rate 'Average' or 'Good'.", hint:"The most confident persona...", about:["ibrahima"] },
  { d:3, type:"multi", q:"Which personas use a smartphone (not basic phone)? Select all.", correct:["ibrahima","aissatou","moussa"], explanation:"Ibrahima, Aissatou, Moussa use smartphones (58%). Fatou and Ousmane use basic phones (42%).", hint:"Device type splits personas into two groups...", about:["ibrahima","aissatou","moussa","fatou","ousmane"] },
  { d:3, type:"single", q:"Which persona's secondary crop is watermelon?", correct:["ibrahima"], explanation:"Ibrahima grows watermelon as secondary (7.3%).", hint:"Small plot, vegetable farmer...", about:["ibrahima"] },
  { d:3, type:"multi", q:"Which personas have 'no formal community role' (63.2%)? Select all.", correct:["ousmane","aissatou","moussa"], explanation:"Ibrahima is a teacher (19.6%) and Fatou has skills (23.2%).", hint:"Check the Community & Personal section...", about:["ousmane","aissatou","moussa"] },
  { d:3, type:"single", q:"Which persona measures success specifically by 'yield' (37.5%)?", correct:["ousmane"], explanation:"Ousmane measures by yield. Others measure by goals, family, or income.", hint:"Harvest output focused...", about:["ousmane"] },
  { d:3, type:"multi", q:"Which personas grow groundnut as primary crop? Select all.", correct:["ousmane","aissatou","moussa"], explanation:"All three grow groundnut (63.7%). Ibrahima grows vegetables, Fatou grows hibiscus.", hint:"Groundnut is the dominant crop in Senegal...", about:["ousmane","aissatou","moussa"] },
  { d:2, type:"single", q:"Which persona's main challenge is specifically labor shortage (16%)?", correct:["fatou"], explanation:"Fatou faces labor shortage (16%).", hint:"Think about who might lack helping hands...", about:["fatou"] },
  { d:3, type:"multi", q:"Which personas are NOT members of any community groups (48.6%)? Select all.", correct:["ousmane","aissatou","moussa"], explanation:"Ibrahima is in a savings group and Fatou is in a women's group.", hint:"The three who also haven't attended training...", about:["ousmane","aissatou","moussa"] },
  { d:2, type:"single", q:"Which persona uses Orange Money in addition to Wave?", correct:["ibrahima"], explanation:"Ibrahima uses both Wave (73.6%) and Orange Money (25.9%).", hint:"The most digitally advanced persona...", about:["ibrahima"] },
  { d:1, type:"single", q:"Which persona is proudest of 'supporting family and household success'?", correct:["fatou"], explanation:"Fatou measures success by family support (24.2%).", hint:"Family-focused persona...", about:["fatou"] },
  { d:3, type:"single", q:"Which persona advises new farmers to 'start small, learn as you go, and gradually expand'?", correct:["fatou"], explanation:"This is Fatou's direct quote and advice.", hint:"Cautious, growth-minded advice...", about:["fatou"] },
];

const GAME3_QS = [
  { d:1, type:"single", q:"You're designing a payment feature that only works via app. Which persona is MOST excluded?", correct:["fatou"], explanation:"Fatou has a basic phone, voice only, no mobile money, no other tech — the most stacked barriers.", hint:"Basic phone + no mobile money = most excluded.", about:["fatou"] },
  { d:1, type:"single", q:"You want to send farming tips via WhatsApp text messages. Which persona benefits MOST?", correct:["ibrahima"], explanation:"Ibrahima is the only persona who can read, uses WhatsApp groups actively, and seeks info digitally.", hint:"Who can actually read the messages?", about:["ibrahima"] },
  { d:1, type:"multi", q:"You're building a voice-based IVR system. Which personas would this work well for? Select all.", correct:["fatou","ousmane","aissatou","moussa"], explanation:"All except Ibrahima prefer phone calls (78.6%).", hint:"Who prefers phone calls?", about:["fatou","ousmane","aissatou","moussa"] },
  { d:1, type:"single", q:"A new feature requires reading a text menu. Which persona represents the non-literate majority who would struggle?", correct:["ousmane"], explanation:"79.3% can't read/write. Ousmane represents this majority as the offline-first persona.", hint:"Think about literacy rates...", about:["ousmane","fatou","aissatou","moussa"] },
  { d:1, type:"single", q:"You need to reach farmers through Village Entrepreneurs. Which persona was NOT discovered through a VE?", correct:["ibrahima"], explanation:"Ibrahima found myAgro through a friend (10.7%).", hint:"Two personas have non-VE discovery channels...", about:["ibrahima"] },
  { d:2, type:"multi", q:"You're running a Facebook marketing campaign. Which personas might see it? Select all.", correct:["ibrahima","aissatou","moussa"], explanation:"Ibrahima uses Facebook for fun (27.2%), Aissatou follows news (45.1%), Moussa follows news (45.1%).", hint:"Check who has active Facebook usage...", about:["ibrahima","aissatou","moussa"] },
  { d:2, type:"single", q:"You're designing a savings goal tracker. Which persona's primary goal makes them the ideal first user?", correct:["ousmane"], explanation:"Ousmane's goal is to 'save/invest for the future' (31%).", hint:"Which persona's goal is literally about saving?", about:["ousmane"] },
  { d:2, type:"single", q:"A stakeholder wants a complex budgeting spreadsheet feature. Which persona's quote best argues against this?", correct:["moussa"], explanation:"Moussa says 'The land doesn't lie' — he values simplicity. Plus 79% can't read.", hint:"Who values keeping things simple?", about:["moussa"] },
  { d:2, type:"multi", q:"You need non-literate farmers for testing. Which personas represent this segment? Select all.", correct:["fatou","ousmane","aissatou","moussa"], explanation:"All except Ibrahima cannot read/write (79.3%).", hint:"79% can't read — that's 4 out of 5 personas.", about:["fatou","ousmane","aissatou","moussa"] },
  { d:2, type:"single", q:"You want to pilot WhatsApp voice messages for farmer updates. Which persona's discovery channel suggests they'd respond well?", correct:["fatou"], explanation:"Fatou found myAgro at a village meeting (word-of-mouth), prefers calls, has attended training — open to engagement.", hint:"Who is reachable but needs voice format?", about:["fatou"] },
  { d:3, type:"single", q:"You're allocating budget between app development and VE training. Which persona represents the untapped potential of VE training?", correct:["ousmane"], explanation:"Ousmane found myAgro through VE, contacts 2-3x/month, but never attended training.", hint:"Strongest VE relationship + zero training?", about:["ousmane"] },
  { d:3, type:"single", q:"A PM wants a community comparison feature. Which persona's data MOST supports keeping it out?", correct:["ousmane"], explanation:"Ousmane has no groups (48.6%), no role (63.2%), focuses on individual savings.", hint:"Who is most individually focused?", about:["ousmane"] },
  { d:3, type:"multi", q:"You're onboarding farmers to pay via mobile money. Which already use Wave? Select all.", correct:["ousmane","aissatou","moussa"], explanation:"All three use Wave for deposits/withdrawals but may not use it for myAgro payments.", hint:"Who uses Wave already?", about:["ousmane","aissatou","moussa"] },
  { d:3, type:"single", q:"You need different onboarding for literate vs non-literate users. Which persona represents the ~20% literate group?", correct:["ibrahima"], explanation:"Ibrahima represents the ~20% literate segment.", hint:"Think about the 79/21 literacy split...", about:["ibrahima"] },
  { d:3, type:"single", q:"SMS text vs voice call reminders for payment deadlines — which persona best shows why voice wins?", correct:["moussa"], explanation:"Moussa: smartphone owner who still uses voice primarily. Voice covers all 5 personas.", hint:"What communication method do ALL personas use?", about:["moussa","fatou","ousmane","aissatou"] },
  { d:2, type:"multi", q:"You're planning research home visits. Which personas should you visit in person? Select all.", correct:["fatou","ousmane"], explanation:"Both have basic phones and limited digital access — phone interviews miss context.", hint:"Most limited phone capabilities?", about:["fatou","ousmane"] },
  { d:3, type:"single", q:"You want to test a visual progress tracker (icons, not text). Which persona should you test FIRST?", correct:["fatou"], explanation:"Fatou is most constrained: basic phone, no mobile money, voice only, no literacy. If it works for her, it works for everyone.", hint:"Test with the most constrained user first...", about:["fatou"] },
  { d:2, type:"single", q:"You're choosing which mobile money provider to integrate first. The data says Wave is at 73.6%. Which persona represents the typical Wave user?", correct:["aissatou"], explanation:"Aissatou represents the typical Wave user — deposits and withdrawals (78.6%).", hint:"73.6% vs 25.9% — the numbers are clear.", about:["aissatou","ousmane","moussa"] },
  { d:1, type:"multi", q:"You're creating training content. Which personas have attended at least one myAgro training? Select all.", correct:["ibrahima","fatou"], explanation:"Ibrahima attended multiple (>1) and Fatou at least 1 (28%). Others never attended (63%).", hint:"Only two have training experience...", about:["ibrahima","fatou"] },
  { d:3, type:"single", q:"An investor asks 'who is your typical farmer?' Which persona BEST represents the statistical majority?", correct:["moussa"], explanation:"Moussa hits the majority on almost every dimension: 15+ years, 1-5 ha, groundnut, smartphone, voice, Wave, VE, no training, Wolof, can't read.", hint:"Who sits at the center of the bell curve?", about:["moussa"] },
];

const GAMES = [
  { id: "whoami", name: "Who Am I?", icon: "🧑‍🌾", desc: "Identify the persona from clues about their life and habits", color: "#2E7D32", questions: GAME1_QS },
  { id: "matchfact", name: "Match the Fact", icon: "📊", desc: "Connect data points and percentages to the right persona", color: "#00796B", questions: GAME2_QS },
  { id: "scenario", name: "Design Scenario", icon: "🎨", desc: "Apply persona knowledge to real UX design decisions", color: "#6A1B9A", questions: GAME3_QS },
];

function shuffle(a){const s=[...a];for(let i=s.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[s[i],s[j]]=[s[j],s[i]];}return s;}

async function fetchLB(){try{const r=await fetch("/api/leaderboard");return await r.json();}catch{return[];}}
async function postLB(entry){try{const r=await fetch("/api/leaderboard",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({entry})});const d=await r.json();return d.leaderboard||[];}catch{return[];}}
async function fetchUS(uid){try{const r=await fetch(`/api/user-stats?userId=${encodeURIComponent(uid)}`);return await r.json();}catch{return null;}}
async function postUS(uid,stats){try{await fetch("/api/user-stats",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({userId:uid,stats})});}catch{}}

const PersonaBtn=({p,onClick,isSel,isCorr,isWrong,revealed,disabled,multi})=>{
  let border="#E0E0E0",bg="white",op=1;
  if(isSel&&!revealed){bg=p.colorLight;border=p.color;}
  if(revealed){if(isCorr){bg="#C8E6C9";border="#2E7D32";}else if(isWrong){bg="#FFCDD2";border="#C62828";}else{op=0.3;}}
  return(
    <button onClick={()=>!disabled&&onClick(p.id)} disabled={disabled}
      style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",border:`2px solid ${border}`,borderRadius:12,background:bg,cursor:disabled?"default":"pointer",opacity:op,transition:"all 0.2s",width:"100%",textAlign:"left",fontFamily:"inherit"}}>
      <div style={{width:20,height:20,borderRadius:multi?4:"50%",border:`2px solid ${isSel||(revealed&&isCorr)?p.color:"#BDBDBD"}`,background:(isSel&&!revealed)?p.color:(revealed&&isCorr)?"#2E7D32":(revealed&&isWrong)?"#C62828":"white",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
        {((isSel&&!revealed)||(revealed&&isCorr))&&<span style={{color:"white",fontSize:12,fontWeight:700}}>✓</span>}
      </div>
      <div style={{width:34,height:34,borderRadius:"50%",background:p.color,display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontWeight:700,fontSize:14,flexShrink:0}}>{p.initial}</div>
      <div style={{flex:1}}><div style={{fontWeight:700,fontSize:13,color:"#212121"}}>{p.name}</div><div style={{fontSize:10.5,color:"#757575"}}>{p.title}</div></div>
      {revealed&&isCorr&&<span style={{color:"#2E7D32",fontWeight:700}}>✓</span>}
      {revealed&&isWrong&&<span style={{color:"#C62828",fontWeight:700}}>✗</span>}
    </button>
  );
};

export default function Home(){
  const[page,setPage]=useState("login");
  const[user,setUser]=useState(null);
  const[userName,setUserName]=useState("");
  const[userTeam,setUserTeam]=useState("");
  const[lb,setLb]=useState([]);
  const[us,setUs]=useState(null);
  const[cg,setCg]=useState(null);// current game
  const[diff,setDiff]=useState(null);
  const[qs,setQs]=useState([]);
  const[qi,setQi]=useState(0);
  const[sel,setSel]=useState(new Set());
  const[rev,setRev]=useState(false);
  const[score,setScore]=useState(0);
  const[hint,setHint]=useState(false);
  const[streak,setStreak]=useState(0);
  const[best,setBest]=useState(0);
  const[anim,setAnim]=useState(false);
  const[timer,setTimer]=useState(0);
  const[tActive,setTActive]=useState(false);
  const[results,setResults]=useState([]);
  const[review,setReview]=useState(false);
  const subRef=useRef(false);

  useEffect(()=>{fetchLB().then(setLb);},[]);

  useEffect(()=>{
    if(tActive&&timer>0){const t=setTimeout(()=>setTimer(x=>x-1),1000);return()=>clearTimeout(t);}
    if(tActive&&timer===0&&!rev&&!subRef.current){
      subRef.current=true;setTActive(false);setRev(true);
      setResults(r=>[...r,{q:qs[qi],selected:[...sel],correct:false,timedOut:true}]);
      setStreak(0);
    }
  },[timer,tActive,rev]);

  const login=async()=>{
    if(!userName.trim()||!userTeam)return;
    const uid=userName.trim().toLowerCase().replace(/\s+/g,"-")+"-"+userTeam.toLowerCase().replace(/[^a-z]/g,"");
    const u={id:uid,name:userName.trim(),team:userTeam,firstName:userName.trim().split(" ")[0]};
    setUser(u);setUs(await fetchUS(uid)||{games:{},personaMisses:{}});setLb(await fetchLB());setPage("home");
  };

  const startGame=(gid,d)=>{
    const game=GAMES.find(g=>g.id===gid);let pool=game.questions;
    if(d==="mixed"){pool=shuffle(pool).slice(0,15);}
    else{const dv=d==="easy"?1:d==="medium"?2:3;const f=pool.filter(q=>q.d===dv);const o=shuffle(pool.filter(q=>q.d!==dv));pool=shuffle([...f,...o.slice(0,Math.max(0,15-f.length))]).slice(0,15);}
    setCg(game);setDiff(d);setQs(shuffle(pool));setQi(0);setSel(new Set());setRev(false);setScore(0);
    setHint(false);setStreak(0);setBest(0);setResults([]);setReview(false);subRef.current=false;
    setTimer(TIMER_SECS[pool[0]?.d||2]);setTActive(true);setAnim(true);setTimeout(()=>setAnim(false),400);setPage("playing");
  };

  const handleSel=(id)=>{if(rev)return;const q=qs[qi];if(q.type==="single")setSel(new Set([id]));else setSel(p=>{const n=new Set(p);n.has(id)?n.delete(id):n.add(id);return n;});};

  const handleSubmit=()=>{
    if(sel.size===0)return;subRef.current=true;setTActive(false);setRev(true);
    const q=qs[qi];const cs=new Set(q.correct);
    const ok=sel.size===cs.size&&[...sel].every(s=>cs.has(s));
    setResults(r=>[...r,{q,selected:[...sel],correct:ok,timedOut:false}]);
    if(ok){setScore(s=>s+1);setStreak(s=>{const n=s+1;if(n>best)setBest(n);return n;});}else setStreak(0);
  };

  const handleNext=()=>{
    const ni=qi+1;if(ni>=qs.length){finishGame();return;}
    setQi(ni);setSel(new Set());setRev(false);setHint(false);subRef.current=false;
    setTimer(TIMER_SECS[qs[ni].d]);setTActive(true);setAnim(true);setTimeout(()=>setAnim(false),400);
  };

  const finishGame=async()=>{
    setTActive(false);
    const misses={...(us?.personaMisses||{})};
    results.forEach(r=>{if(!r.correct)r.q.about.forEach(pid=>{misses[pid]=(misses[pid]||0)+1;});});
    const gh={...(us?.games||{})};if(!gh[cg.id])gh[cg.id]=[];
    gh[cg.id].push({score,total:qs.length,difficulty:diff,date:Date.now()});
    const ns={games:gh,personaMisses:misses};setUs(ns);await postUS(user.id,ns);
    const oldLb=await fetchLB();const ex=oldLb.find(e=>e.id===user.id);let entry;
    if(ex){if(!ex.gameScores)ex.gameScores={};if(!ex.gameScores[cg.id]||score>ex.gameScores[cg.id].best)ex.gameScores[cg.id]={best:score,total:qs.length,date:Date.now()};ex.totalScore=Object.values(ex.gameScores).reduce((s,g)=>s+g.best,0);ex.name=user.firstName;ex.team=user.team;entry=ex;}
    else entry={id:user.id,name:user.firstName,team:user.team,gameScores:{[cg.id]:{best:score,total:qs.length,date:Date.now()}},totalScore:score};
    setLb(await postLB(entry));setPage("results");
  };

  const css=`@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`;

  // ── LOGIN ──
  if(page==="login")return(
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(160deg,#1B5E20,#2E7D32 35%,#1B5E20)",fontFamily:"'Segoe UI',Tahoma,sans-serif",padding:20}}>
      <Head><title>Persona Learning Hub | myAgro</title></Head><style>{css}</style>
      <div style={{background:"white",borderRadius:24,padding:"40px 32px",maxWidth:440,width:"100%",textAlign:"center",boxShadow:"0 20px 60px rgba(0,0,0,0.2)"}}>
        <div style={{fontSize:48,marginBottom:8}}>🌱</div>
        <h1 style={{fontSize:24,color:"#1B5E20",marginBottom:4,fontWeight:800}}>Persona Learning Hub</h1>
        <p style={{color:"#757575",fontSize:14,marginBottom:24}}>Test your knowledge of myAgro's farmer personas</p>
        <input value={userName} onChange={e=>setUserName(e.target.value)} placeholder="Your name" onKeyDown={e=>e.key==="Enter"&&login()}
          style={{width:"100%",padding:"12px 16px",borderRadius:10,border:"2px solid #E0E0E0",fontSize:15,marginBottom:12,outline:"none",boxSizing:"border-box"}} />
        <p style={{fontSize:12,color:"#757575",marginBottom:8,textAlign:"left"}}>Your team:</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:20}}>
          {TEAMS.map(t=>(
            <button key={t} onClick={()=>setUserTeam(t)}
              style={{padding:"9px 6px",borderRadius:10,border:`2px solid ${userTeam===t?"#2E7D32":"#E0E0E0"}`,background:userTeam===t?"#E8F5E9":"white",color:userTeam===t?"#2E7D32":"#424242",fontSize:12,fontWeight:userTeam===t?700:500,cursor:"pointer"}}>{t}</button>
          ))}
        </div>
        <button onClick={login} disabled={!userName.trim()||!userTeam}
          style={{width:"100%",padding:14,borderRadius:12,border:"none",background:userName.trim()&&userTeam?"#2E7D32":"#E0E0E0",color:userName.trim()&&userTeam?"white":"#9E9E9E",fontSize:16,fontWeight:700,cursor:userName.trim()&&userTeam?"pointer":"default"}}>Enter →</button>
      </div>
    </div>
  );

  // ── HOME / LEADERBOARD / PROFILE ──
  if(page==="home"||page==="leaderboard"||page==="profile"){
    const nav=[{id:"home",l:"Games",i:"🎮"},{id:"leaderboard",l:"Leaderboard",i:"🏆"},{id:"profile",l:"My Stats",i:"📈"}];
    return(
      <div style={{minHeight:"100vh",background:"#F5F5F0",fontFamily:"'Segoe UI',Tahoma,sans-serif"}}>
        <Head><title>Persona Learning Hub | myAgro</title></Head><style>{css}</style>
        <div style={{width:"100%",background:"#1B5E20",padding:"16px 20px 12px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:22}}>🌱</span><span style={{color:"white",fontWeight:700,fontSize:16}}>Persona Learning Hub</span></div>
          <div style={{color:"#A5D6A7",fontSize:13}}>Hi, {user.firstName} 👋</div>
        </div>
        <div style={{display:"flex",justifyContent:"center",padding:"16px 16px 0"}}>
          <div style={{display:"flex",width:"100%",maxWidth:600,background:"white",borderRadius:12,overflow:"hidden"}}>
            {nav.map(n=><button key={n.id} onClick={()=>setPage(n.id)} style={{flex:1,padding:"12px 8px",border:"none",background:page===n.id?"#E8F5E9":"white",color:page===n.id?"#2E7D32":"#757575",fontSize:13,fontWeight:page===n.id?700:500,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}><span>{n.i}</span>{n.l}</button>)}
          </div>
        </div>
        <div style={{maxWidth:600,margin:"0 auto",padding:"16px 16px 80px"}}>

          {page==="home"&&<div style={{display:"flex",flexDirection:"column",gap:16}}>
            {GAMES.map(g=>{
              const bst=us?.games?.[g.id]?.length>0?Math.max(...us.games[g.id].map(x=>x.score)):null;
              return(<div key={g.id} style={{background:"white",borderRadius:16,padding:20,boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
                  <div style={{fontSize:32}}>{g.icon}</div>
                  <div><div style={{fontWeight:700,fontSize:17,color:"#212121"}}>{g.name}</div><div style={{fontSize:12,color:"#757575"}}>{g.desc}</div></div>
                </div>
                {bst!==null&&<div style={{fontSize:12,color:"#2E7D32",fontWeight:600,marginBottom:10,background:"#E8F5E9",padding:"4px 10px",borderRadius:8,display:"inline-block"}}>🏅 Best: {bst}/15</div>}
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  {[["easy","🟢 Easy"],["medium","🟡 Medium"],["hard","🔴 Hard"],["mixed","🔀 Mixed"]].map(([d,l])=>(
                    <button key={d} onClick={()=>startGame(g.id,d)} style={{flex:"1 1 auto",minWidth:70,padding:"10px 4px",borderRadius:10,border:"2px solid #E0E0E0",background:"white",fontSize:11,fontWeight:600,cursor:"pointer",color:"#424242"}}>{l}</button>
                  ))}
                </div>
              </div>);
            })}
          </div>}

          {page==="leaderboard"&&<div style={{background:"white",borderRadius:16,overflow:"hidden",boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>
            <div style={{background:"#1B5E20",padding:"14px 16px",color:"white",fontWeight:700,fontSize:15}}>🏆 Top Scores</div>
            {lb.length===0&&<div style={{padding:20,textAlign:"center",color:"#757575"}}>No scores yet — be the first!</div>}
            {lb.slice(0,20).map((e,i)=>(
              <div key={e.id} style={{display:"flex",alignItems:"center",padding:"12px 16px",borderBottom:"1px solid #F0F0F0",background:e.id===user.id?"#E8F5E9":"white"}}>
                <div style={{width:28,fontWeight:800,fontSize:16,color:i<3?"#F57F17":"#757575"}}>{i===0?"🥇":i===1?"🥈":i===2?"🥉":`${i+1}`}</div>
                <div style={{flex:1}}><span style={{fontWeight:700,fontSize:14,color:"#212121"}}>{e.name}</span><span style={{fontSize:11,color:"#9E9E9E",marginLeft:8}}>{e.team}</span></div>
                <div style={{display:"flex",gap:6,alignItems:"center"}}>
                  {GAMES.map(g=>{const gs=e.gameScores?.[g.id];return gs?<div key={g.id} style={{fontSize:10,background:"#F5F5F0",borderRadius:6,padding:"2px 6px",color:"#616161"}}>{g.icon}{gs.best}</div>:null;})}
                  <div style={{fontWeight:800,fontSize:16,color:"#2E7D32",minWidth:32,textAlign:"right"}}>{e.totalScore}</div>
                </div>
              </div>
            ))}
          </div>}

          {page==="profile"&&<div style={{display:"flex",flexDirection:"column",gap:16}}>
            <div style={{background:"white",borderRadius:16,padding:20,boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>
              <div style={{fontWeight:700,fontSize:16,color:"#212121",marginBottom:12}}>📊 My Game History</div>
              {GAMES.map(g=>{const h=us?.games?.[g.id]||[];const bst=h.length>0?Math.max(...h.map(x=>x.score)):0;const avg=h.length>0?Math.round(h.reduce((s,x)=>s+x.score,0)/h.length):0;
                return(<div key={g.id} style={{display:"flex",alignItems:"center",padding:"10px 0",borderBottom:"1px solid #F0F0F0"}}>
                  <span style={{fontSize:24,marginRight:12}}>{g.icon}</span>
                  <div style={{flex:1}}><div style={{fontWeight:600,fontSize:13}}>{g.name}</div><div style={{fontSize:11,color:"#757575"}}>{h.length} games</div></div>
                  <div style={{textAlign:"right"}}><div style={{fontWeight:700,fontSize:15,color:"#2E7D32"}}>Best: {bst}/15</div><div style={{fontSize:11,color:"#757575"}}>Avg: {avg}</div></div>
                </div>);
              })}
            </div>
            <div style={{background:"white",borderRadius:16,padding:20,boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>
              <div style={{fontWeight:700,fontSize:16,color:"#212121",marginBottom:4}}>🎯 Personas to Study</div>
              <div style={{fontSize:12,color:"#757575",marginBottom:12}}>Personas you miss most often</div>
              {(()=>{const m=us?.personaMisses||{};const sorted=PERSONAS.map(p=>({...p,misses:m[p.id]||0})).sort((a,b)=>b.misses-a.misses);
                if(sorted[0].misses===0)return<div style={{color:"#757575",fontSize:13}}>Play some games to see your weak spots!</div>;
                return sorted.map(p=>(
                  <div key={p.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid #F5F5F5"}}>
                    <div style={{width:30,height:30,borderRadius:"50%",background:p.color,color:"white",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:13,flexShrink:0}}>{p.initial}</div>
                    <div style={{flex:1}}><div style={{fontWeight:600,fontSize:13}}>{p.name}</div><div style={{fontSize:11,color:"#757575"}}>{p.title}</div></div>
                    <div style={{display:"flex",alignItems:"center",gap:4}}>
                      <div style={{width:Math.min(p.misses*12,80),height:8,borderRadius:4,background:p.misses>3?"#EF5350":p.misses>1?"#FFA726":"#66BB6A"}}/>
                      <span style={{fontSize:12,fontWeight:700,color:p.misses>3?"#C62828":"#757575"}}>{p.misses}</span>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>}
        </div>
      </div>
    );
  }

  // ── RESULTS ──
  if(page==="results"){
    const pct=Math.round((score/qs.length)*100);
    let em,msg;if(pct>=90){em="🏆";msg="Persona Expert!";}else if(pct>=70){em="🌟";msg="Great job!";}else if(pct>=50){em="🌱";msg="Good start — keep learning!";}else{em="📚";msg="Time to review the personas!";}

    if(review)return(
      <div style={{minHeight:"100vh",background:"#F5F5F0",fontFamily:"'Segoe UI',Tahoma,sans-serif"}}>
        <Head><title>Review | Persona Learning Hub</title></Head><style>{css}</style>
        <div style={{maxWidth:640,margin:"0 auto",padding:"20px 16px"}}>
          <button onClick={()=>setReview(false)} style={{background:"none",border:"none",color:"#2E7D32",fontWeight:700,fontSize:14,cursor:"pointer",marginBottom:12}}>← Back to Results</button>
          <h2 style={{fontSize:20,color:"#212121",marginBottom:16,fontWeight:800}}>📝 Question Review</h2>
          {results.map((r,i)=>(
            <div key={i} style={{background:"white",borderRadius:14,padding:16,marginBottom:12,borderLeft:`4px solid ${r.correct?"#2E7D32":"#C62828"}`}}>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
                <span style={{fontSize:14}}>{r.correct?"✅":r.timedOut?"⏰":"❌"}</span>
                <span style={{fontSize:12,fontWeight:700,color:"#757575"}}>Q{i+1}</span>
                <span style={{fontSize:10,background:r.q.d===1?"#E8F5E9":r.q.d===2?"#FFF8E1":"#FBE9E7",color:r.q.d===1?"#2E7D32":r.q.d===2?"#F57F17":"#C62828",padding:"1px 8px",borderRadius:8,fontWeight:600}}>{r.q.d===1?"Easy":r.q.d===2?"Medium":"Hard"}</span>
              </div>
              <div style={{fontSize:13,color:"#212121",marginBottom:8,lineHeight:1.5}}>{r.q.q}</div>
              <div style={{fontSize:12,color:"#2E7D32",fontWeight:600,marginBottom:4}}>Correct: {r.q.correct.map(c=>P_MAP[c].name).join(", ")}</div>
              {!r.correct&&<div style={{fontSize:12,color:"#C62828",marginBottom:4}}>Your answer: {r.timedOut?"Time ran out":r.selected.map(s=>P_MAP[s]?.name||s).join(", ")}</div>}
              <div style={{fontSize:11,color:"#757575",lineHeight:1.5}}>{r.q.explanation}</div>
            </div>
          ))}
        </div>
      </div>
    );

    return(
      <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(160deg,#1B5E20,#2E7D32 35%,#1B5E20)",fontFamily:"'Segoe UI',Tahoma,sans-serif",padding:20}}>
        <Head><title>Results | Persona Learning Hub</title></Head><style>{css}</style>
        <div style={{background:"white",borderRadius:24,padding:"36px 28px",maxWidth:480,width:"100%",textAlign:"center",boxShadow:"0 20px 60px rgba(0,0,0,0.15)"}}>
          <div style={{fontSize:56,marginBottom:8}}>{em}</div>
          <div style={{fontSize:13,fontWeight:600,color:cg.color}}>{cg.icon} {cg.name}</div>
          <h2 style={{fontSize:24,color:"#1B5E20",marginBottom:4,fontWeight:800}}>{msg}</h2>
          <div style={{fontSize:48,fontWeight:800,color:"#F57F17",marginBottom:2}}>{score}/{qs.length}</div>
          <div style={{fontSize:14,color:"#757575",marginBottom:20}}>{pct}% correct</div>
          {best>1&&<div style={{background:"#FFF8E1",borderRadius:10,padding:"8px 14px",marginBottom:16,fontSize:13,color:"#F57F17",fontWeight:600,display:"inline-block"}}>🔥 Best streak: {best}</div>}
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            <button onClick={()=>setReview(true)} style={{width:"100%",padding:12,borderRadius:10,border:"2px solid #2E7D32",background:"white",color:"#2E7D32",fontSize:14,fontWeight:700,cursor:"pointer"}}>📝 Review Questions</button>
            <button onClick={()=>startGame(cg.id,diff)} style={{width:"100%",padding:12,borderRadius:10,border:"none",background:"#F57F17",color:"white",fontSize:14,fontWeight:700,cursor:"pointer"}}>🔄 Play Again</button>
            <button onClick={()=>setPage("home")} style={{width:"100%",padding:12,borderRadius:10,border:"none",background:"#2E7D32",color:"white",fontSize:14,fontWeight:700,cursor:"pointer"}}>← Back to Games</button>
          </div>
        </div>
      </div>
    );
  }

  // ── PLAYING ──
  if(page==="playing"){
    const q=qs[qi];if(!q)return null;
    const isM=q.type==="multi";const cs=new Set(q.correct);
    const ok=rev&&sel.size===cs.size&&[...sel].every(s=>cs.has(s));
    const tPct=(timer/TIMER_SECS[q.d])*100;
    const tCol=timer<=5?"#C62828":timer<=10?"#F57F17":"#2E7D32";

    return(
      <div style={{minHeight:"100vh",background:"#F5F5F0",fontFamily:"'Segoe UI',Tahoma,sans-serif",display:"flex",flexDirection:"column",alignItems:"center"}}>
        <Head><title>Playing | Persona Learning Hub</title></Head><style>{css}</style>
        {/* Top bar */}
        <div style={{width:"100%",background:cg.color,padding:"10px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <button onClick={()=>{setTActive(false);setPage("home");}} style={{background:"rgba(255,255,255,0.2)",border:"none",color:"white",padding:"4px 12px",borderRadius:8,fontSize:12,cursor:"pointer",fontWeight:600}}>✕ Quit</button>
          <div style={{color:"white",fontSize:13,fontWeight:600}}>{cg.icon} {cg.name}</div>
          <div style={{display:"flex",gap:8}}>
            {streak>=2&&<span style={{background:"#F57F17",color:"white",padding:"3px 10px",borderRadius:12,fontSize:12,fontWeight:700}}>🔥{streak}</span>}
            <span style={{background:"rgba(255,255,255,0.2)",color:"white",padding:"3px 10px",borderRadius:12,fontSize:12,fontWeight:600}}>{score}/{qi}</span>
          </div>
        </div>
        {/* Timer */}
        <div style={{width:"100%",height:4,background:"#E0E0E0"}}><div style={{width:`${tPct}%`,height:"100%",background:tCol,transition:"width 1s linear"}}/></div>
        {/* Progress */}
        <div style={{display:"flex",gap:3,padding:"12px 16px",maxWidth:640,width:"100%"}}>
          {qs.map((_,i)=><div key={i} style={{flex:1,height:4,borderRadius:2,background:i<qi?(results[i]?.correct?"#66BB6A":"#EF5350"):i===qi?cg.color:"#E0E0E0"}}/>)}
        </div>
        {/* Question card */}
        <div style={{width:"100%",maxWidth:640,padding:"0 16px 20px",animation:anim?"slideUp 0.3s ease":undefined}}>
          <div style={{background:"white",borderRadius:18,padding:"20px 18px 16px",boxShadow:"0 4px 16px rgba(0,0,0,0.08)"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
              <div style={{display:"flex",gap:6,alignItems:"center"}}>
                <span style={{fontSize:11,fontWeight:700,color:"#F57F17",letterSpacing:0.5}}>Q{qi+1}/{qs.length}</span>
                <span style={{fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:8,background:isM?"#E8F5E9":"#F5F5F0",color:isM?"#2E7D32":"#757575"}}>{isM?"Select all":"Pick one"}</span>
                <span style={{fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:8,background:q.d===1?"#E8F5E9":q.d===2?"#FFF8E1":"#FBE9E7",color:q.d===1?"#2E7D32":q.d===2?"#F57F17":"#C62828"}}>{q.d===1?"Easy":q.d===2?"Medium":"Hard"}</span>
              </div>
              {!rev&&<div style={{fontSize:18,fontWeight:800,color:tCol}}>{timer}s</div>}
            </div>
            <p style={{fontSize:15,color:"#212121",lineHeight:1.6,marginBottom:14,fontWeight:500}}>{q.q}</p>
            <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:10}}>
              {PERSONAS.map(p=><PersonaBtn key={p.id} p={p} onClick={handleSel} isSel={sel.has(p.id)} isCorr={rev&&cs.has(p.id)} isWrong={rev&&sel.has(p.id)&&!cs.has(p.id)} revealed={rev} disabled={rev} multi={isM}/>)}
            </div>
            {!rev&&!hint&&<button onClick={()=>setHint(true)} style={{background:"none",border:"none",color:"#F57F17",fontSize:12,cursor:"pointer",fontWeight:600}}>💡 Hint</button>}
            {hint&&!rev&&<div style={{background:"#FFF8E1",borderRadius:8,padding:"8px 12px",fontSize:12,color:"#795548",marginBottom:6}}>💡 {q.hint}</div>}
            {rev&&<div style={{background:ok?"#E8F5E9":"#FBE9E7",borderRadius:10,padding:"12px 14px",marginBottom:6}}>
              <div style={{fontWeight:700,fontSize:14,color:ok?"#2E7D32":"#C62828",marginBottom:4}}>{ok?"✓ Correct!":isM?`✗ ${q.correct.length} persona${q.correct.length>1?"s":""} matched`:`✗ It's ${P_MAP[q.correct[0]].name}`}</div>
              <div style={{fontSize:11.5,color:"#424242",lineHeight:1.5}}>{q.explanation}</div>
            </div>}
            {!rev?<button onClick={handleSubmit} disabled={sel.size===0} style={{width:"100%",padding:12,borderRadius:10,border:"none",background:sel.size>0?cg.color:"#E0E0E0",color:sel.size>0?"white":"#9E9E9E",fontSize:15,fontWeight:700,cursor:sel.size>0?"pointer":"default",marginTop:6}}>Lock In</button>
            :<button onClick={handleNext} style={{width:"100%",padding:12,borderRadius:10,border:"none",background:"#F57F17",color:"white",fontSize:15,fontWeight:700,cursor:"pointer",marginTop:6}}>{qi+1>=qs.length?"See Results →":"Next →"}</button>}
          </div>
        </div>
      </div>
    );
  }
  return null;
}
