import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line, BarChart, Bar,
  ComposedChart, RadialBarChart, RadialBar, PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
} from "recharts";
import {
  LayoutDashboard, Banknote, Activity, HeartPulse, BrainCircuit, Send,
  TrendingUp, TrendingDown, AlertTriangle, ShieldCheck, Sparkles, Building2,
  ArrowUpRight, ArrowDownRight, Stethoscope, BedDouble, Users, Gauge,
  Cpu, Loader2, Bot, ChevronRight, Lightbulb, Radar as RadarIcon, Zap,
} from "lucide-react";

/* ============================================================
   XERALIT — Healthcare Executive Intelligence Platform
   Single-file demo. Dark-navy terminal aesthetic.
   AI Smart Ask uses the in-artifact Anthropic completions endpoint.
   ============================================================ */

const STYLE = `
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap');

:root{
  --bg:#05080f; --bg2:#080d1a; --panel:rgba(255,255,255,0.025);
  --panel-2:rgba(255,255,255,0.04); --line:rgba(120,160,220,0.12);
  --line-2:rgba(120,160,220,0.20); --txt:#e6edf7; --muted:#7f8ea8;
  --muted-2:#5a6b80; --cyan:#22d3ee; --cyan-d:#0891b2; --blue:#3b82f6;
  --green:#34d399; --amber:#fbbf24; --red:#fb7185; --violet:#a78bfa;
}
*{box-sizing:border-box;}
.xer{
  font-family:'IBM Plex Sans',system-ui,sans-serif; color:var(--txt);
  background:
    radial-gradient(900px 520px at 12% -8%, rgba(34,211,238,0.10), transparent 60%),
    radial-gradient(820px 520px at 100% 0%, rgba(59,130,246,0.10), transparent 55%),
    radial-gradient(700px 600px at 70% 120%, rgba(167,139,250,0.07), transparent 60%),
    linear-gradient(180deg,#05080f,#070b16 60%,#05080f);
  min-height:100vh; position:relative; overflow-x:hidden;
}
.xer:before{
  content:""; position:fixed; inset:0; pointer-events:none; opacity:.5;
  background-image:linear-gradient(rgba(120,160,220,0.035) 1px,transparent 1px),
    linear-gradient(90deg,rgba(120,160,220,0.035) 1px,transparent 1px);
  background-size:46px 46px; mask-image:radial-gradient(circle at 50% 30%,#000 30%,transparent 85%);
}
.mono{font-family:'IBM Plex Mono',monospace;}
.up{text-transform:uppercase; letter-spacing:.14em;}

/* layout */
.shell{display:flex; min-height:100vh; position:relative; z-index:1;}
.side{
  width:248px; flex:none; border-right:1px solid var(--line);
  background:linear-gradient(180deg,rgba(8,13,26,0.85),rgba(5,8,15,0.6));
  backdrop-filter:blur(14px); padding:22px 16px; position:sticky; top:0; height:100vh;
  display:flex; flex-direction:column; gap:6px;
}
.brand{display:flex; align-items:center; gap:11px; padding:4px 8px 22px;}
.logo{
  width:38px;height:38px;border-radius:11px;display:grid;place-items:center;
  background:linear-gradient(135deg,#22d3ee,#3b82f6); color:#04121a;
  box-shadow:0 0 0 1px rgba(34,211,238,.4),0 10px 30px -8px rgba(34,211,238,.6);
}
.brand h1{font-size:18px; font-weight:700; letter-spacing:.5px; margin:0;}
.brand span{font-size:9.5px; color:var(--cyan);}
.navlabel{font-size:9px; color:var(--muted-2); padding:14px 10px 6px;}
.navitem{
  display:flex; align-items:center; gap:11px; padding:10px 12px; border-radius:10px;
  color:var(--muted); font-size:13.5px; font-weight:500; cursor:pointer;
  border:1px solid transparent; transition:all .18s ease; position:relative;
}
.navitem:hover{color:var(--txt); background:var(--panel);}
.navitem.on{
  color:#eafcff; background:linear-gradient(90deg,rgba(34,211,238,.16),rgba(34,211,238,.02));
  border-color:rgba(34,211,238,.28);
}
.navitem.on:before{content:"";position:absolute;left:-16px;top:9px;bottom:9px;width:3px;border-radius:3px;background:var(--cyan);box-shadow:0 0 12px var(--cyan);}
.main{flex:1; min-width:0; display:flex; flex-direction:column;}
.topbar{
  display:flex; align-items:center; justify-content:space-between; gap:16px;
  padding:16px 26px; border-bottom:1px solid var(--line);
  background:rgba(5,8,15,0.55); backdrop-filter:blur(10px); position:sticky; top:0; z-index:20;
}
.page{padding:24px 26px 60px; max-width:1480px; width:100%; margin:0 auto;}

/* glass */
.card{
  background:var(--panel); border:1px solid var(--line); border-radius:16px;
  position:relative; overflow:hidden; backdrop-filter:blur(8px);
}
.card:before{content:"";position:absolute;inset:0 0 auto 0;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.18),transparent);}
.card .ttl{font-size:10.5px; color:var(--muted);}
.pill{
  display:inline-flex;align-items:center;gap:6px;font-size:10px;font-weight:600;
  padding:4px 9px;border-radius:999px;border:1px solid var(--line-2);
}
.dot{width:7px;height:7px;border-radius:50%;background:var(--green);box-shadow:0 0 9px var(--green);animation:pulse 1.8s infinite;}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}

/* kpi */
.kgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;}
.kpi{padding:18px;cursor:default;}
.kpi .ico{width:34px;height:34px;border-radius:9px;display:grid;place-items:center;border:1px solid var(--line-2);}
.kpi .val{font-size:27px;font-weight:700;line-height:1;margin:13px 0 5px;}
.delta{display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:600;}
.delta.pos{color:var(--green);} .delta.neg{color:var(--red);}

/* misc */
.sectitle{display:flex;align-items:center;justify-content:space-between;margin:26px 0 14px;}
.sectitle h2{font-size:14px;font-weight:600;margin:0;display:flex;align-items:center;gap:9px;}
.grd{display:grid;gap:16px;}
.bullet{display:flex;gap:11px;padding:13px 15px;border-radius:12px;background:var(--panel);border:1px solid var(--line);}
.bullet .b-ic{flex:none;width:30px;height:30px;border-radius:8px;display:grid;place-items:center;}
.btn{
  border:1px solid var(--line-2);background:var(--panel-2);color:var(--txt);
  border-radius:10px;padding:9px 14px;font-size:12.5px;font-weight:600;cursor:pointer;
  font-family:inherit;transition:all .16s;display:inline-flex;align-items:center;gap:7px;
}
.btn:hover{border-color:rgba(34,211,238,.5);color:#eafcff;background:rgba(34,211,238,.08);}
.btn.cy{background:linear-gradient(135deg,#22d3ee,#0ea5b7);color:#04121a;border:none;}
.btn.cy:hover{filter:brightness(1.08);}

/* chat */
.chat{display:flex;flex-direction:column;height:calc(100vh - 150px);min-height:520px;}
.chatlog{flex:1;overflow-y:auto;padding:8px 4px;display:flex;flex-direction:column;gap:16px;}
.msg{display:flex;gap:11px;max-width:88%;animation:rise .35s ease both;}
.msg.me{align-self:flex-end;flex-direction:row-reverse;}
.av{width:30px;height:30px;border-radius:9px;flex:none;display:grid;place-items:center;border:1px solid var(--line-2);}
.bub{padding:12px 15px;border-radius:13px;font-size:13.5px;line-height:1.62;}
.bub.ai{background:var(--panel-2);border:1px solid var(--line);border-top-left-radius:4px;}
.bub.me{background:linear-gradient(135deg,rgba(34,211,238,.18),rgba(59,130,246,.14));border:1px solid rgba(34,211,238,.3);border-top-right-radius:4px;}
.bub h4{margin:9px 0 5px;font-size:12.5px;color:var(--cyan);} .bub strong{color:#eafcff;}
.bub ul{margin:6px 0;padding-left:17px;} .bub li{margin:3px 0;}
.chip{font-size:11px;padding:7px 11px;border-radius:999px;border:1px solid var(--line-2);background:var(--panel);color:var(--muted);cursor:pointer;transition:all .15s;font-family:inherit;}
.chip:hover{color:#eafcff;border-color:rgba(34,211,238,.5);background:rgba(34,211,238,.08);}
.inp{flex:1;background:var(--panel-2);border:1px solid var(--line-2);border-radius:12px;padding:13px 15px;color:var(--txt);font-size:13.5px;font-family:inherit;resize:none;outline:none;}
.inp:focus{border-color:rgba(34,211,238,.5);}
.typing span{display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--cyan);margin:0 2px;animation:blink 1.2s infinite;}
.typing span:nth-child(2){animation-delay:.2s} .typing span:nth-child(3){animation-delay:.4s}
@keyframes blink{0%,80%,100%{opacity:.2;transform:translateY(0)}40%{opacity:1;transform:translateY(-3px)}}
@keyframes rise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
.fade{animation:rise .5s ease both;}
.chatlog::-webkit-scrollbar,.side::-webkit-scrollbar{width:8px;}
.chatlog::-webkit-scrollbar-thumb,.side::-webkit-scrollbar-thumb{background:rgba(120,160,220,.18);border-radius:8px;}
.score-ring{position:relative;display:grid;place-items:center;}
.recharts-default-tooltip{background:#0a1120 !important;border:1px solid var(--line-2) !important;border-radius:10px !important;}
.recharts-tooltip-label,.recharts-tooltip-item{color:#e6edf7 !important;font-family:'IBM Plex Mono',monospace !important;font-size:11px !important;}
@media(max-width:1100px){.kgrid{grid-template-columns:repeat(2,1fr)}}
`;

/* ---------- helpers ---------- */
const MONTHS = ["Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr","May"];
const BRANCHES = ["Chennai","Bengaluru","Hyderabad","Mumbai","Delhi"];
const DEPTS = ["Cardiology","Oncology","Orthopedics","Diagnostics","Pediatrics","Emergency","Neurology"];
const C = { cyan:"#22d3ee", blue:"#3b82f6", green:"#34d399", amber:"#fbbf24", red:"#fb7185", violet:"#a78bfa", muted:"#7f8ea8" };

const inr = (n) => "₹" + (n >= 1e7 ? (n/1e7).toFixed(2)+" Cr" : n >= 1e5 ? (n/1e5).toFixed(2)+" L" : Math.round(n).toLocaleString("en-IN"));
const pct = (n) => (n>=0?"+":"") + n.toFixed(1) + "%";

// deterministic pseudo-random so the demo is stable
function rng(seed){ let s = seed % 2147483647; if(s<=0) s+=2147483646; return ()=> (s=s*16807%2147483647)/2147483647; }
function linfit(ys){ const n=ys.length; const xs=ys.map((_,i)=>i); const mx=xs.reduce((a,b)=>a+b)/n, my=ys.reduce((a,b)=>a+b)/n;
  let num=0,den=0; for(let i=0;i<n;i++){num+=(xs[i]-mx)*(ys[i]-my);den+=(xs[i]-mx)**2;} const m=num/den, b=my-m*mx; return {m,b}; }
function forecast(ys, k){ const {m,b}=linfit(ys); const n=ys.length;
  const resid=ys.map((y,i)=>y-(m*i+b)); const sd=Math.sqrt(resid.reduce((a,r)=>a+r*r,0)/n);
  return Array.from({length:k},(_,j)=>{ const x=n+j; const v=m*x+b; return {v:Math.max(0,v), lo:Math.max(0,v-1.6*sd), hi:v+1.6*sd}; }); }
function anomalies(series, label, unit){ // z-score on MoM change
  const d=series.slice(1).map((v,i)=>v-series[i]); const mu=d.reduce((a,b)=>a+b,0)/d.length;
  const sd=Math.sqrt(d.reduce((a,b)=>a+(b-mu)**2,0)/d.length)||1; const out=[];
  d.forEach((v,i)=>{ const z=(v-mu)/sd; if(Math.abs(z)>=1.8) out.push({month:MONTHS[i+1],z,dir:v<0?"drop":"spike",label,unit,delta:v}); });
  return out; }

function buildData(){
  const r = rng(42);
  // base revenue per branch (monthly, ₹)
  const base = { Chennai:5.2e7, Bengaluru:4.8e7, Hyderabad:3.9e7, Mumbai:6.1e7, Delhi:4.4e7 };
  const branches = BRANCHES.map((name,bi)=>{
    const g = 0.012 + r()*0.02; // monthly growth
    const rev=[], pat=[], occ=[], opex=[], claims=[], sat=[], canc=[];
    for(let i=0;i<12;i++){
      const season = 1 + 0.06*Math.sin(i/2);
      let monthRev = base[name]*Math.pow(1+g,i)*season*(0.97+r()*0.06);
      // deliberate anomaly: Bengaluru opex spike + Dec profit dip system-wide
      let ox = monthRev*(0.62+r()*0.04);
      if(name==="Bengaluru" && i>=8) ox = monthRev*(0.79+r()*0.03);   // cost overrun
      if(i===6) monthRev *= 0.88;                                     // Dec dip
      rev.push(monthRev);
      opex.push(ox);
      pat.push(Math.round(monthRev/9800*(0.96+r()*0.08)));
      occ.push(Math.min(97, 70 + i*0.7 + (bi===3?6:0) + r()*6 - (name==="Bengaluru"&&i>=8?8:0)));
      claims.push(Math.round(monthRev*0.34/26000));
      sat.push(Math.min(96, 80 + i*0.5 + r()*4 - (name==="Bengaluru"&&i>=8?5:0)));
      canc.push(Math.round(pat[i]*(0.04 + (name==="Bengaluru"&&i>=8?0.03:0) + r()*0.02)));
    }
    return { name, rev, pat, occ, opex, claims, sat, canc,
      profit: rev.map((v,i)=>v-opex[i]) };
  });
  // aggregates
  const sum = (key,i)=> branches.reduce((a,b)=>a+b[key][i],0);
  const totalRev = MONTHS.map((_,i)=>sum("rev",i));
  const totalOpex = MONTHS.map((_,i)=>sum("opex",i));
  const totalProfit = totalRev.map((v,i)=>v-totalOpex[i]);
  const totalPat = MONTHS.map((_,i)=>sum("pat",i));
  const avgOcc = MONTHS.map((_,i)=>branches.reduce((a,b)=>a+b.occ[i],0)/branches.length);
  const avgSat = MONTHS.map((_,i)=>branches.reduce((a,b)=>a+b.sat[i],0)/branches.length);
  const totalClaims = MONTHS.map((_,i)=>sum("claims",i));
  const totalCanc = MONTHS.map((_,i)=>sum("canc",i));

  // departments (share of latest month revenue + growth)
  const depShares=[0.20,0.18,0.14,0.16,0.10,0.13,0.09];
  const depGrowth=[8.2,21.4,6.1,16.7,4.3,-2.1,11.5];
  const lastRev = totalRev[11];
  const departments = DEPTS.map((d,i)=>({ name:d, revenue: lastRev*depShares[i], growth: depGrowth[i],
    margin: 18+i*1.5+(i%2?4:-2) }));

  // forecasts (next quarter)
  const fcRev = forecast(totalRev,3);
  const fcPat = forecast(totalPat,3);
  const fcOcc = forecast(avgOcc,3);
  const fcOpex = forecast(totalOpex,3);
  const fcClaims = forecast(totalClaims,3);

  // anomalies / risks
  const risks = [
    ...anomalies(branches.find(b=>b.name==="Bengaluru").opex,"Bengaluru operating cost","₹"),
    ...anomalies(totalProfit,"Group net profit","₹"),
    ...anomalies(branches.find(b=>b.name==="Bengaluru").occ,"Bengaluru bed occupancy","%"),
  ];

  // health score components
  const marginNow = (totalProfit[11]/totalRev[11])*100;
  const occNow = avgOcc[11];
  const satNow = avgSat[11];
  const growthNow = (totalRev[11]/totalRev[10]-1)*100;
  const cancRate = (totalCanc[11]/totalPat[11])*100;
  const health = Math.round( Math.min(100,
     marginNow*1.4 + (occNow-60)*0.5 + (satNow-70)*0.6 + growthNow*1.5 - cancRate*2 + 18));

  return { branches, totalRev, totalOpex, totalProfit, totalPat, avgOcc, avgSat,
    totalClaims, totalCanc, departments, fcRev, fcPat, fcOcc, fcOpex, fcClaims, risks,
    marginNow, occNow, satNow, growthNow, cancRate, health, lastRev };
}

const DATA = buildData();

/* ---------- small components ---------- */
function useCountUp(target, dur=900){
  const [v,setV]=useState(0);
  useEffect(()=>{ let raf; const t0=performance.now();
    const tick=(t)=>{ const p=Math.min(1,(t-t0)/dur); setV(target*(1-Math.pow(1-p,3))); if(p<1) raf=requestAnimationFrame(tick); };
    raf=requestAnimationFrame(tick); return ()=>cancelAnimationFrame(raf); },[target,dur]);
  return v;
}

function Spark({data, color}){
  return (
    <ResponsiveContainer width="100%" height={38}>
      <AreaChart data={data.map((v,i)=>({i,v}))} margin={{top:4,bottom:0,left:0,right:0}}>
        <defs><linearGradient id={"sp"+color} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.5}/><stop offset="100%" stopColor={color} stopOpacity={0}/>
        </linearGradient></defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.6} fill={"url(#sp"+color+")"} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function Kpi({icon:Ic, label, value, fmt, delta, series, color, idx}){
  const v = useCountUp(value);
  return (
    <div className="card kpi fade" style={{animationDelay:(idx*0.06)+"s"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <span className="ttl up mono">{label}</span>
        <div className="ico" style={{color}}><Ic size={17}/></div>
      </div>
      <div className="val mono">{fmt(v)}</div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}>
        <span className={"delta "+(delta>=0?"pos":"neg")}>
          {delta>=0?<ArrowUpRight size={13}/>:<ArrowDownRight size={13}/>}{pct(delta)}<span style={{color:"var(--muted-2)",fontWeight:400,marginLeft:2}}>MoM</span>
        </span>
        <div style={{width:96,height:38}}><Spark data={series} color={color}/></div>
      </div>
    </div>
  );
}

function GlassChart({title, sub, right, children, h=270, delay=0}){
  return (
    <div className="card fade" style={{padding:"18px 18px 8px",animationDelay:delay+"s"}}>
      <div className="sectitle" style={{margin:"0 0 8px"}}>
        <div>
          <h2 style={{fontSize:13.5}}>{title}</h2>
          {sub && <div style={{fontSize:10.5,color:"var(--muted)",marginTop:3}} className="mono up">{sub}</div>}
        </div>
        {right}
      </div>
      <ResponsiveContainer width="100%" height={h}>{children}</ResponsiveContainer>
    </div>
  );
}

const AX = { stroke:"#3a4660", fontSize:10.5, fontFamily:"IBM Plex Mono" };
const grid = <CartesianGrid stroke="rgba(120,160,220,0.08)" vertical={false}/>;

/* ---------- pages ---------- */
function Overview({ai}){
  const d = DATA;
  const months = MONTHS.map((m,i)=>({ m, rev:Math.round(d.totalRev[i]/1e5), profit:Math.round(d.totalProfit[i]/1e5), opex:Math.round(d.totalOpex[i]/1e5) }));
  const fc = d.fcRev.map((f,i)=>({ m:["Jun","Jul","Aug"][i]+"'26", v:Math.round(f.v/1e5), lo:Math.round(f.lo/1e5), band:Math.round((f.hi-f.lo)/1e5) }));
  const revFcChart = [
    ...months.map(x=>({ m:x.m, actual:x.rev })),
    ...fc.map(x=>({ m:x.m, pred:x.v, lo:x.lo, band:x.band })),
  ];
  const branchBars = d.branches.map(b=>({ name:b.name, revenue:Math.round(b.rev[11]/1e5), profit:Math.round(b.profit[11]/1e5) }))
    .sort((a,b)=>b.revenue-a.revenue);
  const occData = d.branches.map(b=>({ name:b.name.slice(0,3), occ:Math.round(b.occ[11]) }));
  const health = useCountUp(d.health, 1200);
  const hc = d.health>=75?C.green:d.health>=55?C.amber:C.red;

  return (
    <div>
      {/* KPI row */}
      <div className="kgrid">
        <Kpi idx={0} icon={Banknote} label="Group Revenue · MTD" value={d.totalRev[11]} fmt={inr} delta={d.growthNow} series={d.totalRev.map(v=>v/1e5)} color={C.cyan}/>
        <Kpi idx={1} icon={TrendingUp} label="Net Margin" value={d.marginNow} fmt={v=>v.toFixed(1)+"%"} delta={(d.marginNow-(d.totalProfit[10]/d.totalRev[10]*100))} series={d.totalProfit.map((p,i)=>p/d.totalRev[i]*100)} color={C.green}/>
        <Kpi idx={2} icon={Users} label="Patient Volume" value={d.totalPat[11]} fmt={v=>Math.round(v).toLocaleString("en-IN")} delta={(d.totalPat[11]/d.totalPat[10]-1)*100} series={d.totalPat} color={C.blue}/>
        <Kpi idx={3} icon={BedDouble} label="Avg Bed Occupancy" value={d.occNow} fmt={v=>v.toFixed(1)+"%"} delta={d.occNow-d.avgOcc[10]} series={d.avgOcc} color={C.violet}/>
      </div>

      {/* AI exec summary + health */}
      <div className="grd" style={{gridTemplateColumns:"1fr 300px",marginTop:16}}>
        <AiSummaryCard ai={ai}/>
        <div className="card fade" style={{padding:18,animationDelay:".1s"}}>
          <span className="ttl up mono">Business Health Score</span>
          <div className="score-ring" style={{marginTop:6}}>
            <ResponsiveContainer width="100%" height={170}>
              <RadialBarChart innerRadius="74%" outerRadius="100%" data={[{v:d.health,fill:hc}]} startAngle={230} endAngle={-50}>
                <PolarAngleAxis type="number" domain={[0,100]} tick={false}/>
                <RadialBar background={{fill:"rgba(120,160,220,0.08)"}} dataKey="v" cornerRadius={20}/>
              </RadialBarChart>
            </ResponsiveContainer>
            <div style={{position:"absolute",textAlign:"center"}}>
              <div className="mono" style={{fontSize:38,fontWeight:700,color:hc,lineHeight:1}}>{Math.round(health)}</div>
              <div className="mono up" style={{fontSize:9,color:"var(--muted)"}}>/ 100</div>
            </div>
          </div>
          <div style={{fontSize:11.5,color:"var(--muted)",textAlign:"center",marginTop:4}}>
            {d.health>=75?"Strong — broad-based growth":"Stable with localized risk"}
          </div>
        </div>
      </div>

      {/* revenue forecast */}
      <div className="sectitle"><h2><TrendingUp size={16} color={C.cyan}/> Revenue Trajectory & AI Forecast <span className="pill mono up" style={{color:C.cyan,borderColor:"rgba(34,211,238,.3)"}}>Q1 FY26 predicted</span></h2></div>
      <GlassChart title="Group Revenue (₹ Lakh / month)" sub="Actuals · 12M  +  3M forecast (1.6σ band)">
        <ComposedChart data={revFcChart}>
          <defs>
            <linearGradient id="ga" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.cyan} stopOpacity={.35}/><stop offset="100%" stopColor={C.cyan} stopOpacity={0}/></linearGradient>
          </defs>
          {grid}
          <XAxis dataKey="m" {...AX}/><YAxis {...AX} width={42}/>
          <Tooltip/>
          <Area type="monotone" dataKey="actual" stroke={C.cyan} strokeWidth={2.4} fill="url(#ga)" name="Actual" dot={false}/>
          <Area type="monotone" dataKey="lo" stackId="b" stroke="none" fill="transparent"/>
          <Area type="monotone" dataKey="band" stackId="b" stroke="none" fill="rgba(167,139,250,0.18)"/>
          <Line type="monotone" dataKey="pred" stroke={C.violet} strokeWidth={2.4} strokeDasharray="5 4" name="Forecast" dot={{r:3,fill:C.violet}}/>
        </ComposedChart>
      </GlassChart>

      {/* branch perf + occupancy */}
      <div className="grd" style={{gridTemplateColumns:"1.4fr 1fr",marginTop:16}}>
        <GlassChart title="Branch Performance — Revenue vs Profit" sub="Current month · ₹ Lakh" h={250}>
          <BarChart data={branchBars} barGap={4}>
            {grid}<XAxis dataKey="name" {...AX}/><YAxis {...AX} width={42}/><Tooltip/><Legend wrapperStyle={{fontSize:11,fontFamily:"IBM Plex Mono"}}/>
            <Bar dataKey="revenue" name="Revenue" fill={C.cyan} radius={[5,5,0,0]} maxBarSize={34}/>
            <Bar dataKey="profit" name="Profit" fill={C.blue} radius={[5,5,0,0]} maxBarSize={34}/>
          </BarChart>
        </GlassChart>
        <GlassChart title="Bed Occupancy by Branch" sub="Current %" h={250}>
          <BarChart data={occData} layout="vertical">
            {grid}<XAxis type="number" domain={[0,100]} {...AX}/><YAxis type="category" dataKey="name" {...AX} width={40}/><Tooltip/>
            <Bar dataKey="occ" radius={[0,5,5,0]} maxBarSize={20}>
              {occData.map((e,i)=><Cell key={i} fill={e.occ>=85?C.green:e.occ>=72?C.cyan:C.amber}/>)}
            </Bar>
          </BarChart>
        </GlassChart>
      </div>

      {/* risk alerts */}
      <div className="sectitle"><h2><AlertTriangle size={16} color={C.amber}/> Active Risk Alerts</h2><span className="pill mono up" style={{color:C.amber,borderColor:"rgba(251,191,36,.3)"}}>{d.risks.length} flagged</span></div>
      <div className="grd" style={{gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))"}}>
        {d.risks.slice(0,3).map((rk,i)=>(
          <div className="bullet" key={i} style={{borderColor:"rgba(251,191,36,.2)"}}>
            <div className="b-ic" style={{background:"rgba(251,113,133,.12)",color:rk.dir==="drop"?C.red:C.amber}}>
              {rk.dir==="drop"?<TrendingDown size={16}/>:<Zap size={16}/>}
            </div>
            <div>
              <div style={{fontSize:13,fontWeight:600}}>{rk.label} <span className="mono" style={{color:rk.dir==="drop"?C.red:C.amber,fontSize:11}}>{rk.dir} · {rk.month}</span></div>
              <div style={{fontSize:11.5,color:"var(--muted)",marginTop:2}}>Anomaly score {Math.abs(rk.z).toFixed(1)}σ — {rk.dir==="drop"?"below":"above"} expected band. Recommend review.</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AiSummaryCard({ai}){
  const [txt,setTxt]=useState("");
  const [loading,setLoading]=useState(false);
  const run = useCallback(async()=>{
    setLoading(true); setTxt("");
    const prompt = `Write a crisp 3-sentence executive briefing for a hospital-group CEO from this month's data. Reference specific branches/numbers. Be decisive.\nData:${snapshot()}\nReturn ONLY the 3 sentences, no preamble.`;
    const r = await ai(prompt, true);
    setTxt(r || "Group revenue reached "+inr(DATA.totalRev[11])+" this month at a "+DATA.marginNow.toFixed(1)+"% net margin, led by Mumbai and Chennai. Bengaluru shows an operating-cost overrun beginning Q3 that is compressing branch profitability. Diagnostics and Oncology remain the strongest growth engines group-wide.");
    setLoading(false);
  },[ai]);
  useEffect(()=>{ run(); },[run]);
  return (
    <div className="card fade" style={{padding:18}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span className="ttl up mono" style={{display:"flex",alignItems:"center",gap:7,color:C.cyan}}><Sparkles size={13}/> AI Executive Briefing</span>
        <button className="btn" onClick={run} style={{padding:"5px 10px",fontSize:11}}>{loading?<Loader2 size={12} className="spin"/>:<Cpu size={12}/>}Regenerate</button>
      </div>
      <div style={{fontSize:14,lineHeight:1.72,marginTop:12,color:loading?"var(--muted)":"var(--txt)",minHeight:84}}>
        {loading? <span className="typing">Synthesizing today's performance<span>.</span><span>.</span><span>.</span></span> : txt}
      </div>
      <div style={{display:"flex",gap:8,marginTop:6,flexWrap:"wrap"}}>
        <span className="pill mono" style={{color:C.green,borderColor:"rgba(52,211,153,.25)"}}><TrendingUp size={11}/> {pct(DATA.growthNow)} MoM</span>
        <span className="pill mono" style={{color:C.cyan,borderColor:"rgba(34,211,238,.25)"}}>{DATA.totalPat[11].toLocaleString("en-IN")} patients</span>
        <span className="pill mono" style={{color:C.amber,borderColor:"rgba(251,191,36,.25)"}}>{DATA.risks.length} risks open</span>
      </div>
    </div>
  );
}

function Financial(){
  const d=DATA;
  const stack = MONTHS.map((m,i)=>{ const o={m}; d.branches.forEach(b=>o[b.name]=Math.round(b.rev[i]/1e5)); return o; });
  const margin = MONTHS.map((m,i)=>({m, margin:+(d.totalProfit[i]/d.totalRev[i]*100).toFixed(1), opex:Math.round(d.totalOpex[i]/1e5)}));
  const claims = MONTHS.map((m,i)=>({m, claims:d.totalClaims[i], approved:Math.round(d.totalClaims[i]*0.87)}));
  const cols=[C.cyan,C.blue,C.violet,C.green,C.amber];
  const lastRev=d.lastRev;
  return (
    <div>
      <div className="kgrid">
        <Kpi idx={0} icon={Banknote} label="Revenue YTD" value={d.totalRev.reduce((a,b)=>a+b,0)} fmt={inr} delta={d.growthNow} series={d.totalRev.map(v=>v/1e5)} color={C.cyan}/>
        <Kpi idx={1} icon={TrendingUp} label="Net Profit · MTD" value={d.totalProfit[11]} fmt={inr} delta={(d.totalProfit[11]/d.totalProfit[10]-1)*100} series={d.totalProfit.map(v=>v/1e5)} color={C.green}/>
        <Kpi idx={2} icon={ShieldCheck} label="Insurance Claims" value={d.totalClaims[11]} fmt={v=>Math.round(v).toLocaleString("en-IN")} delta={(d.totalClaims[11]/d.totalClaims[10]-1)*100} series={d.totalClaims} color={C.blue}/>
        <Kpi idx={3} icon={Gauge} label="Cost Ratio" value={d.totalOpex[11]/d.totalRev[11]*100} fmt={v=>v.toFixed(1)+"%"} delta={(d.totalOpex[11]/d.totalRev[11]-d.totalOpex[10]/d.totalRev[10])*100} series={d.totalOpex.map((o,i)=>o/d.totalRev[i]*100)} color={C.amber}/>
      </div>
      <div className="sectitle"><h2><Banknote size={16} color={C.cyan}/> Revenue Composition by Branch</h2></div>
      <GlassChart title="Stacked Revenue (₹ Lakh)" sub="Monthly contribution by branch">
        <AreaChart data={stack}>
          {grid}<XAxis dataKey="m" {...AX}/><YAxis {...AX} width={44}/><Tooltip/><Legend wrapperStyle={{fontSize:11,fontFamily:"IBM Plex Mono"}}/>
          {d.branches.map((b,i)=><Area key={b.name} type="monotone" dataKey={b.name} stackId="1" stroke={cols[i]} fill={cols[i]} fillOpacity={.22} strokeWidth={1.6}/>)}
        </AreaChart>
      </GlassChart>
      <div className="grd" style={{gridTemplateColumns:"1fr 1fr",marginTop:16}}>
        <GlassChart title="Margin vs Operating Cost" sub="Net margin % (line) · opex ₹L (bar)" h={250}>
          <ComposedChart data={margin}>
            {grid}<XAxis dataKey="m" {...AX}/><YAxis yAxisId="l" {...AX} width={40}/><YAxis yAxisId="r" orientation="right" {...AX} width={40}/><Tooltip/>
            <Bar yAxisId="r" dataKey="opex" name="Opex ₹L" fill="rgba(59,130,246,.35)" radius={[4,4,0,0]} maxBarSize={22}/>
            <Line yAxisId="l" dataKey="margin" name="Margin %" stroke={C.green} strokeWidth={2.4} dot={{r:2.5}}/>
          </ComposedChart>
        </GlassChart>
        <GlassChart title="Service-line Revenue Mix" sub="Share of current month" h={250}>
          <PieChart>
            <Pie data={d.departments} dataKey="revenue" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={2}>
              {d.departments.map((e,i)=><Cell key={i} fill={[C.cyan,C.blue,C.violet,C.green,C.amber,C.red,"#60a5fa"][i]}/>)}
            </Pie>
            <Tooltip formatter={(v)=>inr(v)}/><Legend wrapperStyle={{fontSize:10.5,fontFamily:"IBM Plex Mono"}}/>
          </PieChart>
        </GlassChart>
      </div>
      <GlassChart title="Insurance Claims — Filed vs Approved" sub="Monthly volume" delay={.05}>
        <BarChart data={claims} barGap={2}>
          {grid}<XAxis dataKey="m" {...AX}/><YAxis {...AX} width={44}/><Tooltip/><Legend wrapperStyle={{fontSize:11,fontFamily:"IBM Plex Mono"}}/>
          <Bar dataKey="claims" name="Filed" fill={C.blue} radius={[4,4,0,0]} maxBarSize={26}/>
          <Bar dataKey="approved" name="Approved" fill={C.green} radius={[4,4,0,0]} maxBarSize={26}/>
        </BarChart>
      </GlassChart>
    </div>
  );
}

function Operational(){
  const d=DATA;
  const radar = d.branches.map(b=>({ branch:b.name.slice(0,3),
    Occupancy:Math.round(b.occ[11]), Efficiency:Math.round(96-(b.canc[11]/b.pat[11]*100)*6), Utilization:Math.round(72+b.occ[11]*0.2) }));
  const apptEff = MONTHS.map((m,i)=>({ m, eff:Math.round(88+i*0.4-(d.totalCanc[i]/d.totalPat[i]*100)), cancel:+(d.totalCanc[i]/d.totalPat[i]*100).toFixed(1) }));
  const util = DEPTS.map((dp,i)=>({ name:dp.slice(0,4), staff: 68+ (i*4)%26 + (i===1?14:0), beds: 70+(i*5)%22 }));
  return (
    <div>
      <div className="kgrid">
        <Kpi idx={0} icon={BedDouble} label="Avg Occupancy" value={d.occNow} fmt={v=>v.toFixed(1)+"%"} delta={d.occNow-d.avgOcc[10]} series={d.avgOcc} color={C.cyan}/>
        <Kpi idx={1} icon={Users} label="Staff Utilization" value={81.4} fmt={v=>v.toFixed(1)+"%"} delta={2.3} series={[74,75,76,78,77,79,80,80,81,80,81,81.4]} color={C.green}/>
        <Kpi idx={2} icon={Activity} label="Appt. Efficiency" value={apptEff[11].eff} fmt={v=>v.toFixed(0)+"%"} delta={apptEff[11].eff-apptEff[10].eff} series={apptEff.map(a=>a.eff)} color={C.blue}/>
        <Kpi idx={3} icon={TrendingDown} label="Cancellation Rate" value={d.cancRate} fmt={v=>v.toFixed(1)+"%"} delta={d.cancRate-(d.totalCanc[10]/d.totalPat[10]*100)} series={d.totalCanc.map((c,i)=>c/d.totalPat[i]*100)} color={C.amber}/>
      </div>
      <div className="grd" style={{gridTemplateColumns:"1fr 1fr",marginTop:16}}>
        <GlassChart title="Operational Capability Matrix" sub="By branch · normalized" h={280}>
          <RadarChart data={radar} outerRadius={95}>
            <PolarGrid stroke="rgba(120,160,220,0.12)"/><PolarAngleAxis dataKey="branch" tick={{fill:"#7f8ea8",fontSize:11,fontFamily:"IBM Plex Mono"}}/>
            <Radar dataKey="Occupancy" stroke={C.cyan} fill={C.cyan} fillOpacity={.18}/>
            <Radar dataKey="Efficiency" stroke={C.green} fill={C.green} fillOpacity={.14}/>
            <Radar dataKey="Utilization" stroke={C.violet} fill={C.violet} fillOpacity={.12}/>
            <Legend wrapperStyle={{fontSize:11,fontFamily:"IBM Plex Mono"}}/><Tooltip/>
          </RadarChart>
        </GlassChart>
        <GlassChart title="Appointment Efficiency vs Cancellations" sub="Trend %" h={280}>
          <ComposedChart data={apptEff}>
            {grid}<XAxis dataKey="m" {...AX}/><YAxis yAxisId="l" domain={[60,100]} {...AX} width={36}/><YAxis yAxisId="r" orientation="right" {...AX} width={32}/><Tooltip/><Legend wrapperStyle={{fontSize:11,fontFamily:"IBM Plex Mono"}}/>
            <Area yAxisId="l" type="monotone" dataKey="eff" name="Efficiency %" stroke={C.green} fill="rgba(52,211,153,.14)" strokeWidth={2}/>
            <Line yAxisId="r" type="monotone" dataKey="cancel" name="Cancel %" stroke={C.amber} strokeWidth={2} dot={false}/>
          </ComposedChart>
        </GlassChart>
      </div>
      <div className="sectitle"><h2><Activity size={16} color={C.cyan}/> Resource Utilization by Department</h2></div>
      <GlassChart title="Staff vs Bed Utilization (%)" sub="Operational bottleneck scan">
        <BarChart data={util} barGap={4}>
          {grid}<XAxis dataKey="name" {...AX}/><YAxis domain={[0,100]} {...AX} width={36}/><Tooltip/><Legend wrapperStyle={{fontSize:11,fontFamily:"IBM Plex Mono"}}/>
          <Bar dataKey="staff" name="Staff %" fill={C.cyan} radius={[4,4,0,0]} maxBarSize={26}/>
          <Bar dataKey="beds" name="Beds %" fill={C.violet} radius={[4,4,0,0]} maxBarSize={26}/>
        </BarChart>
      </GlassChart>
      <div className="bullet" style={{marginTop:16,borderColor:"rgba(251,113,133,.25)"}}>
        <div className="b-ic" style={{background:"rgba(251,113,133,.12)",color:C.red}}><AlertTriangle size={16}/></div>
        <div><div style={{fontSize:13,fontWeight:600}}>Bottleneck detected — Oncology staff load at 96%</div>
        <div style={{fontSize:11.5,color:"var(--muted)",marginTop:2}}>Sustained over-utilization with rising cancellations at Bengaluru. Model suggests +3 FTE or shift rebalancing to recover ~6% throughput.</div></div>
      </div>
    </div>
  );
}

function Patient(){
  const d=DATA;
  const sat = MONTHS.map((m,i)=>({m, sat:+d.avgSat[i].toFixed(1), nps: Math.round(d.avgSat[i]-30) }));
  const retention=[{name:"New",v:34,fill:C.cyan},{name:"Returning",v:48,fill:C.blue},{name:"Loyal (3+)",v:18,fill:C.violet}];
  const sentiment=[{name:"Positive",v:64,fill:C.green},{name:"Neutral",v:24,fill:C.amber},{name:"Negative",v:12,fill:C.red}];
  const branchSat=d.branches.map(b=>({name:b.name.slice(0,3),sat:Math.round(b.sat[11])}));
  return (
    <div>
      <div className="kgrid">
        <Kpi idx={0} icon={HeartPulse} label="Satisfaction (CSAT)" value={d.satNow} fmt={v=>v.toFixed(1)+"%"} delta={d.satNow-d.avgSat[10]} series={d.avgSat} color={C.green}/>
        <Kpi idx={1} icon={Users} label="Patient Retention" value={66} fmt={v=>v.toFixed(0)+"%"} delta={1.8} series={[60,61,62,62,63,64,64,65,65,66,66,66]} color={C.cyan}/>
        <Kpi idx={2} icon={Sparkles} label="Net Promoter Score" value={52} fmt={v=>"+"+v.toFixed(0)} delta={4} series={[40,42,44,45,47,48,49,50,50,51,52,52]} color={C.blue}/>
        <Kpi idx={3} icon={TrendingDown} label="Complaint Rate" value={2.1} fmt={v=>v.toFixed(1)+"%"} delta={-0.4} series={[3.1,3,2.9,2.7,2.6,2.5,2.4,2.3,2.3,2.2,2.1,2.1]} color={C.amber}/>
      </div>
      <div className="grd" style={{gridTemplateColumns:"1.5fr 1fr",marginTop:16}}>
        <GlassChart title="Satisfaction & NPS Trend" sub="12-month" h={250}>
          <ComposedChart data={sat}>
            {grid}<XAxis dataKey="m" {...AX}/><YAxis yAxisId="l" domain={[60,100]} {...AX} width={36}/><YAxis yAxisId="r" orientation="right" {...AX} width={36}/><Tooltip/><Legend wrapperStyle={{fontSize:11,fontFamily:"IBM Plex Mono"}}/>
            <defs><linearGradient id="gs" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.green} stopOpacity={.35}/><stop offset="100%" stopColor={C.green} stopOpacity={0}/></linearGradient></defs>
            <Area yAxisId="l" type="monotone" dataKey="sat" name="CSAT %" stroke={C.green} fill="url(#gs)" strokeWidth={2.2}/>
            <Line yAxisId="r" type="monotone" dataKey="nps" name="NPS" stroke={C.cyan} strokeWidth={2} dot={false}/>
          </ComposedChart>
        </GlassChart>
        <GlassChart title="AI Sentiment Analysis" sub="Patient feedback NLP" h={250}>
          <PieChart>
            <Pie data={sentiment} dataKey="v" nameKey="name" innerRadius={50} outerRadius={92} paddingAngle={3}>
              {sentiment.map((e,i)=><Cell key={i} fill={e.fill}/>)}
            </Pie><Tooltip formatter={v=>v+"%"}/><Legend wrapperStyle={{fontSize:10.5,fontFamily:"IBM Plex Mono"}}/>
          </PieChart>
        </GlassChart>
      </div>
      <div className="grd" style={{gridTemplateColumns:"1fr 1.5fr",marginTop:16}}>
        <GlassChart title="Retention Cohorts" sub="Share of patients" h={230}>
          <PieChart><Pie data={retention} dataKey="v" nameKey="name" outerRadius={88}>{retention.map((e,i)=><Cell key={i} fill={e.fill}/>)}</Pie><Tooltip formatter={v=>v+"%"}/><Legend wrapperStyle={{fontSize:10.5,fontFamily:"IBM Plex Mono"}}/></PieChart>
        </GlassChart>
        <GlassChart title="Satisfaction by Branch" sub="Current CSAT %" h={230}>
          <BarChart data={branchSat}>{grid}<XAxis dataKey="name" {...AX}/><YAxis domain={[0,100]} {...AX} width={36}/><Tooltip/>
            <Bar dataKey="sat" radius={[5,5,0,0]} maxBarSize={42}>{branchSat.map((e,i)=><Cell key={i} fill={e.sat>=90?C.green:e.sat>=83?C.cyan:C.amber}/>)}</Bar>
          </BarChart>
        </GlassChart>
      </div>
    </div>
  );
}

/* ---------- AI Intelligence Center + Chatbot ---------- */
function snapshot(){
  const d=DATA;
  const last=11;
  return JSON.stringify({
    currency:"INR", period:"trailing 12 months, current month = May 2026",
    group:{ revenue_mtd:Math.round(d.totalRev[last]), net_margin_pct:+d.marginNow.toFixed(1),
      profit_mtd:Math.round(d.totalProfit[last]), patients_mtd:d.totalPat[last],
      avg_occupancy_pct:+d.occNow.toFixed(1), avg_csat_pct:+d.satNow.toFixed(1),
      mom_growth_pct:+d.growthNow.toFixed(1), cancellation_rate_pct:+d.cancRate.toFixed(1),
      health_score:d.health },
    revenue_series_lakh: d.totalRev.map(v=>Math.round(v/1e5)),
    profit_series_lakh: d.totalProfit.map(v=>Math.round(v/1e5)),
    months: MONTHS,
    branches: d.branches.map(b=>({name:b.name, revenue_mtd_lakh:Math.round(b.rev[last]/1e5),
      profit_mtd_lakh:Math.round(b.profit[last]/1e5), occupancy_pct:Math.round(b.occ[last]),
      csat_pct:Math.round(b.sat[last]), mom_growth_pct:+((b.rev[last]/b.rev[last-1]-1)*100).toFixed(1)})),
    departments: d.departments.map(x=>({name:x.name, revenue_lakh:Math.round(x.revenue/1e5), growth_pct:x.growth})),
    forecast_next_quarter_revenue_lakh: d.fcRev.map(f=>Math.round(f.v/1e5)),
    detected_risks: d.risks.map(r=>({metric:r.label, month:r.month, type:r.dir, sigma:+Math.abs(r.z).toFixed(1)})),
  });
}

const SYS = `You are "Xeralit Smart Ask", an elite healthcare business-intelligence analyst embedded in a hospital-group CEO dashboard. You are decisive, numerate, and speak in executive language — concise, insight-first, no hedging filler.

You are given a JSON snapshot of the group's live metrics. Ground EVERY claim in that data; cite specific branches, departments and numbers (currency is INR, amounts in ₹ Lakh unless stated). Never invent metrics absent from the data.

Format answers in compact markdown: a one-line headline insight, then 2-4 tight bullets, then (when useful) a **Recommendation:** line. Keep most answers under ~140 words.

CHART GENERATION: when a visual genuinely helps (trends, comparisons, breakdowns), append a fenced code block exactly like:
\`\`\`chart
{"type":"bar|line|area|pie","title":"...","x":"label","series":[{"name":"Revenue","field":"revenue"}],"data":[{"label":"Chennai","revenue":520}, ...]}
\`\`\`
Use ONLY numbers present in or derivable from the snapshot. Put the chart block AFTER your text. Omit it if a chart adds nothing.`;

function renderMarkdown(t){
  // minimal & safe-ish markdown -> html for chat bubbles
  let h = t
    .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
    .replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>")
    .replace(/^### (.*$)/gim,"<h4>$1</h4>")
    .replace(/^- (.*$)/gim,"•&nbsp;$1")
    .replace(/\n/g,"<br/>");
  return h;
}

function ChartRender({spec}){
  const cols=[C.cyan,C.blue,C.violet,C.green,C.amber,C.red];
  const t=spec.type;
  return (
    <div className="card" style={{padding:"12px 12px 4px",marginTop:10,background:"rgba(34,211,238,0.03)"}}>
      <div className="mono up" style={{fontSize:10,color:C.cyan,marginBottom:6}}>{spec.title||"Generated chart"}</div>
      <ResponsiveContainer width="100%" height={210}>
        {t==="pie"? (
          <PieChart><Pie data={spec.data} dataKey={spec.series[0].field} nameKey={spec.x} innerRadius={40} outerRadius={80}>
            {spec.data.map((e,i)=><Cell key={i} fill={cols[i%cols.length]}/>)}</Pie><Tooltip/><Legend wrapperStyle={{fontSize:10,fontFamily:"IBM Plex Mono"}}/></PieChart>
        ) : t==="line"||t==="area" ? (
          <AreaChart data={spec.data}>{grid}<XAxis dataKey={spec.x} {...AX}/><YAxis {...AX} width={40}/><Tooltip/><Legend wrapperStyle={{fontSize:10,fontFamily:"IBM Plex Mono"}}/>
            {spec.series.map((s,i)=><Area key={i} type="monotone" dataKey={s.field} name={s.name} stroke={cols[i%cols.length]} fill={cols[i%cols.length]} fillOpacity={.18} strokeWidth={2}/>)}
          </AreaChart>
        ) : (
          <BarChart data={spec.data}>{grid}<XAxis dataKey={spec.x} {...AX}/><YAxis {...AX} width={40}/><Tooltip/><Legend wrapperStyle={{fontSize:10,fontFamily:"IBM Plex Mono"}}/>
            {spec.series.map((s,i)=><Bar key={i} dataKey={s.field} name={s.name} fill={cols[i%cols.length]} radius={[4,4,0,0]} maxBarSize={34}/>)}
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

function parseAI(raw){
  let chart=null, text=raw;
  const m = raw.match(/```chart\s*([\s\S]*?)```/);
  if(m){ try{ chart=JSON.parse(m[1].trim()); }catch(e){ chart=null; } text = raw.replace(m[0],"").trim(); }
  return { text, chart };
}

const SUGGEST = [
  "Why did profits drop this month?","Which branch performed best?","Predict next quarter revenue.",
  "Which department has the highest growth?","Show operational risks.","Compare Chennai and Bengaluru branches.",
  "What are the biggest revenue drivers?",
];

function AICenter({ai}){
  const [msgs,setMsgs]=useState([{role:"assistant",text:"**Xeralit Smart Ask is online.** I have full visibility into the group's 12-month financial, operational and patient data across all 5 branches. Ask me anything — or tap a prompt below.",chart:null}]);
  const [input,setInput]=useState("");
  const [busy,setBusy]=useState(false);
  const logRef=useRef(null);
  useEffect(()=>{ if(logRef.current) logRef.current.scrollTop=logRef.current.scrollHeight; },[msgs,busy]);

  const ask = async(q)=>{
    if(!q.trim()||busy) return;
    const history=[...msgs,{role:"user",text:q,chart:null}];
    setMsgs(history); setInput(""); setBusy(true);
    const apiMsgs = history.filter(m=>!m.system).map(m=>({role:m.role==="assistant"?"assistant":"user", content:m.text}));
    apiMsgs[apiMsgs.length-1].content = `SNAPSHOT:${snapshot()}\n\nCEO QUESTION: ${q}`;
    const raw = await ai(null, false, apiMsgs);
    const {text,chart}=parseAI(raw|| "I couldn't reach the model just now — but based on the snapshot, group revenue is "+inr(DATA.totalRev[11])+" at "+DATA.marginNow.toFixed(1)+"% margin.");
    setMsgs(m=>[...m,{role:"assistant",text,chart}]);
    setBusy(false);
  };

  const d=DATA;
  return (
    <div className="grd" style={{gridTemplateColumns:"1fr 320px"}}>
      {/* chat */}
      <div className="card" style={{padding:18,display:"flex",flexDirection:"column"}}>
        <div className="sectitle" style={{margin:"0 0 12px"}}>
          <h2><BrainCircuit size={17} color={C.cyan}/> Smart Ask — Conversational BI</h2>
          <span className="pill mono up" style={{color:C.green,borderColor:"rgba(52,211,153,.3)"}}><span className="dot"/>live context</span>
        </div>
        <div className="chat">
          <div className="chatlog" ref={logRef}>
            {msgs.map((m,i)=>(
              <div className={"msg "+(m.role==="user"?"me":"")} key={i}>
                <div className="av" style={{background:m.role==="user"?"rgba(34,211,238,.15)":"rgba(167,139,250,.12)",color:m.role==="user"?C.cyan:C.violet}}>
                  {m.role==="user"?<Users size={15}/>:<Bot size={15}/>}
                </div>
                <div>
                  <div className={"bub "+(m.role==="user"?"me":"ai")} dangerouslySetInnerHTML={{__html:renderMarkdown(m.text)}}/>
                  {m.chart && <ChartRender spec={m.chart}/>}
                </div>
              </div>
            ))}
            {busy && (
              <div className="msg">
                <div className="av" style={{background:"rgba(167,139,250,.12)",color:C.violet}}><Bot size={15}/></div>
                <div className="bub ai typing">Analyzing<span>.</span><span>.</span><span>.</span></div>
              </div>
            )}
          </div>
          <div style={{display:"flex",gap:7,flexWrap:"wrap",margin:"12px 0 10px"}}>
            {SUGGEST.map((s,i)=><button className="chip" key={i} onClick={()=>ask(s)} disabled={busy}>{s}</button>)}
          </div>
          <div style={{display:"flex",gap:10,alignItems:"flex-end"}}>
            <textarea className="inp" rows={1} placeholder="Ask about revenue, branches, forecasts, risks…" value={input}
              onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();ask(input);}}}/>
            <button className="btn cy" onClick={()=>ask(input)} disabled={busy} style={{height:46}}>
              {busy?<Loader2 size={16} className="spin"/>:<Send size={16}/>}
            </button>
          </div>
        </div>
      </div>

      {/* AI side rail */}
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <div className="card fade" style={{padding:16}}>
          <span className="ttl up mono" style={{color:C.violet,display:"flex",gap:7,alignItems:"center"}}><Lightbulb size={13}/> AI Strategic Recommendations</span>
          <div style={{display:"flex",flexDirection:"column",gap:9,marginTop:11}}>
            {[
              {ic:Building2,c:C.green,t:"Expand diagnostics capacity",d:"21% growth in Oncology + Diagnostics demand — strongest ROI for capex."},
              {ic:Gauge,c:C.amber,t:"Audit Bengaluru cost base",d:"Opex ratio breached 79% from Q3; ~₹38L/mo recoverable."},
              {ic:Users,c:C.cyan,t:"Rebalance Oncology staffing",d:"96% load driving cancellations; +3 FTE projected +6% throughput."},
            ].map((x,i)=>(
              <div className="bullet" key={i} style={{padding:"11px 12px"}}>
                <div className="b-ic" style={{background:"rgba(120,160,220,.08)",color:x.c}}><x.ic size={15}/></div>
                <div><div style={{fontSize:12.5,fontWeight:600}}>{x.t}</div><div style={{fontSize:11,color:"var(--muted)",marginTop:2,lineHeight:1.5}}>{x.d}</div></div>
              </div>
            ))}
          </div>
        </div>
        <div className="card fade" style={{padding:16,animationDelay:".08s"}}>
          <span className="ttl up mono" style={{color:C.cyan,display:"flex",gap:7,alignItems:"center"}}><TrendingUp size={13}/> Forecast · Next Quarter</span>
          <div style={{marginTop:8}}>
            <ResponsiveContainer width="100%" height={120}>
              <AreaChart data={d.fcRev.map((f,i)=>({m:["Jun","Jul","Aug"][i],v:Math.round(f.v/1e5)}))}>
                <defs><linearGradient id="gf" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.cyan} stopOpacity={.4}/><stop offset="100%" stopColor={C.cyan} stopOpacity={0}/></linearGradient></defs>
                <XAxis dataKey="m" {...AX}/><Tooltip/><Area type="monotone" dataKey="v" stroke={C.cyan} fill="url(#gf)" strokeWidth={2}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mono" style={{fontSize:11.5,color:"var(--muted)",lineHeight:1.7,marginTop:4}}>
            Projected Q1&apos;26 revenue <strong style={{color:C.cyan}}>{inr(d.fcRev.reduce((a,b)=>a+b.v,0))}</strong><br/>
            Occupancy → <strong style={{color:C.green}}>{Math.round(d.fcOcc[2].v)}%</strong> · Claims → <strong style={{color:C.blue}}>{Math.round(d.fcClaims[2].v).toLocaleString("en-IN")}</strong>
          </div>
        </div>
        <div className="card fade" style={{padding:16,animationDelay:".16s"}}>
          <span className="ttl up mono" style={{color:C.red,display:"flex",gap:7,alignItems:"center"}}><RadarIcon size={13}/> Anomaly Detection</span>
          <div style={{display:"flex",flexDirection:"column",gap:8,marginTop:10}}>
            {d.risks.slice(0,3).map((r,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:11.5}}>
                <span style={{color:"var(--muted)"}}>{r.label}</span>
                <span className="mono" style={{color:r.dir==="drop"?C.red:C.amber}}>{Math.abs(r.z).toFixed(1)}σ {r.dir}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- shell ---------- */
const NAV = [
  {id:"overview", label:"CEO Overview", icon:LayoutDashboard, group:"Command"},
  {id:"financial", label:"Financial Intelligence", icon:Banknote, group:"Intelligence"},
  {id:"operational", label:"Operational Intelligence", icon:Activity, group:"Intelligence"},
  {id:"patient", label:"Patient Intelligence", icon:HeartPulse, group:"Intelligence"},
  {id:"ai", label:"AI Intelligence Center", icon:BrainCircuit, group:"Intelligence"},
];

export default function App(){
  const [page,setPage]=useState("overview");
  const [now,setNow]=useState(new Date());
  useEffect(()=>{ const t=setInterval(()=>setNow(new Date()),1000); return ()=>clearInterval(t); },[]);

  // in-artifact Anthropic call. prompt OR messages[]. returns text (best-effort).
  const ai = useCallback(async(prompt, _short, messages)=>{
    try{
      const body = {
        model:"claude-sonnet-4-20250514", max_tokens:1000, system:SYS,
        messages: messages || [{role:"user",content:prompt}],
      };
      const res = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body),
      });
      const data = await res.json();
      return (data.content||[]).filter(b=>b.type==="text").map(b=>b.text).join("\n").trim();
    }catch(e){ return null; }
  },[]);

  const Page = {overview:Overview, financial:Financial, operational:Operational, patient:Patient, ai:AICenter}[page];
  const title = NAV.find(n=>n.id===page).label;

  return (
    <div className="xer">
      <style dangerouslySetInnerHTML={{__html:STYLE + ".spin{animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}"}}/>
      <div className="shell">
        <aside className="side">
          <div className="brand">
            <div className="logo"><Stethoscope size={21} strokeWidth={2.5}/></div>
            <div><h1>XERALIT</h1><span className="mono up">Health Intelligence</span></div>
          </div>
          {["Command","Intelligence"].map(g=>(
            <div key={g}>
              <div className="navlabel mono up">{g}</div>
              {NAV.filter(n=>n.group===g).map(n=>(
                <div key={n.id} className={"navitem"+(page===n.id?" on":"")} onClick={()=>setPage(n.id)}>
                  <n.icon size={17}/>{n.label}
                  {n.id==="ai" && <span style={{marginLeft:"auto",fontSize:8,color:C.cyan}} className="mono up">AI</span>}
                </div>
              ))}
            </div>
          ))}
          <div style={{marginTop:"auto"}}>
            <div className="card" style={{padding:13}}>
              <div style={{display:"flex",alignItems:"center",gap:9}}>
                <div style={{width:32,height:32,borderRadius:9,background:"linear-gradient(135deg,#22d3ee,#3b82f6)",display:"grid",placeItems:"center",color:"#04121a",fontWeight:700,fontSize:13}}>AK</div>
                <div><div style={{fontSize:12.5,fontWeight:600}}>A. Krishnan</div><div className="mono" style={{fontSize:9.5,color:"var(--muted)"}}>Chief Executive</div></div>
              </div>
            </div>
          </div>
        </aside>

        <div className="main">
          <header className="topbar">
            <div>
              <div className="mono up" style={{fontSize:9.5,color:"var(--cyan)"}}>Executive Console · 5 Branches</div>
              <div style={{fontSize:19,fontWeight:600,marginTop:2}}>{title}</div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <span className="pill mono up" style={{color:C.green,borderColor:"rgba(52,211,153,.3)"}}><span className="dot"/> Systems nominal</span>
              <span className="pill mono" style={{color:"var(--muted)"}}>{now.toLocaleDateString("en-IN",{day:"2-digit",month:"short"})} · {now.toLocaleTimeString("en-IN",{hour12:false})}</span>
              <span className="pill mono up" style={{color:C.cyan,borderColor:"rgba(34,211,238,.3)"}}><Cpu size={12}/> AI online</span>
            </div>
          </header>
          <main className="page" key={page}>
            <Page ai={ai}/>
          </main>
        </div>
      </div>
    </div>
  );
}
