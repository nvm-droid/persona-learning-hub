import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import { PERSONAS, P_MAP, TEAMS, TIMER_SECS, GAMES } from "./data";

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
