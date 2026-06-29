import { useState, useMemo } from "react";

// ── TOKENS ────────────────────────────────────────────────────────────────────
const C = {
  bg:"#F4F5F7", surface:"#FFFFFF", border:"#E2E4E8", borderLight:"#ECEEF1",
  text:"#1A1D23", textSub:"#6B7280", textMuted:"#9CA3AF",
  blue:"#2563EB", blueLight:"#EFF4FF",
  purple:"#7C3AED",
  orange:"#EA580C",
  green:"#16A34A", greenLight:"#F0FBF4",
  red:"#DC2626", redLight:"#FFF1F1",
  yellow:"#D97706",
};

// ── FORMATTERS ────────────────────────────────────────────────────────────────
function fmtCurrency(n) {
  if (n == null) return "—";
  const abs = Math.abs(n), sign = n < 0 ? "-" : "";
  if (abs >= 1_000_000) return `${sign}$${(abs/1_000_000).toFixed(1)}M`;
  if (abs >= 1_000)     return `${sign}$${(abs/1_000).toFixed(1)}K`;
  return `${sign}$${abs}`;
}
function fmtPct(n) { return `${n>=0?"+":""}${n.toFixed(1)}%`; }
function fmtBid(n) { return `$${n.toFixed(2)}`; }

// ── MOCK DATA — PAUSE RECS ────────────────────────────────────────────────────
const PAUSE_RECS = [
  {id:1,campaign:"Cheetos — Display Prospecting",  adGroup:"Cheetos Puffs Awareness",    currentSpend:3200,currentRSV:7800, currentROAS:2.4,rsvImpact:-420, projectedSpendReduction:3200},
  {id:2,campaign:"Tostitos — Display NB",          adGroup:"Tostitos Party Size NB",     currentSpend:2750,currentRSV:6100, currentROAS:2.2,rsvImpact:-310, projectedSpendReduction:2750},
  {id:3,campaign:"Lay's — Display Retarget",       adGroup:"Lay's Stax Low-Intent RT",   currentSpend:1840,currentRSV:4600, currentROAS:2.5,rsvImpact:-190, projectedSpendReduction:1840},
  {id:4,campaign:"Doritos — Sponsored Products NB",adGroup:"Doritos NB Generic KW",      currentSpend:2100,currentRSV:5400, currentROAS:2.6,rsvImpact:-280, projectedSpendReduction:2100},
  {id:5,campaign:"Quaker — Display Prospecting",   adGroup:"Quaker Granola Bars Cold",   currentSpend:1100,currentRSV:2700, currentROAS:2.5,rsvImpact:-140, projectedSpendReduction:1100},
  {id:6,campaign:"Gatorade — Display NB",          adGroup:"Gatorade Zero Awareness",    currentSpend:3900,currentRSV:9200, currentROAS:2.4,rsvImpact:-510, projectedSpendReduction:3900},
  {id:7,campaign:"Pepsi — Sponsored Display",      adGroup:"Pepsi Wild Cherry RT Broad", currentSpend:1650,currentRSV:3900, currentROAS:2.4,rsvImpact:-200, projectedSpendReduction:1650},
  {id:8,campaign:"Lay's — Sponsored Products NB",  adGroup:"Lay's Kettle Chip Generic",  currentSpend:980, currentRSV:2500, currentROAS:2.6,rsvImpact:-120, projectedSpendReduction:980 },
];

// ── MOCK DATA — AD GROUP BID RECS ─────────────────────────────────────────────
const AD_GROUP_RECS = [
  {id:1,campaign:"Lay's — Search Brand",   adGroup:"Lay's Classic Core",        currentBid:0.85,recommendedBid:1.10,baselineRSV:18400,optimizedRSV:22100,spendChange: 1800,optimizedROAS:5.1},
  {id:2,campaign:"Doritos — Search Brand", adGroup:"Doritos Bold Flavors",       currentBid:0.92,recommendedBid:1.20,baselineRSV:15900,optimizedRSV:19400,spendChange: 2200,optimizedROAS:4.9},
  {id:3,campaign:"Pepsi — Search Brand",   adGroup:"Pepsi Zero Sugar Push",      currentBid:1.05,recommendedBid:1.35,baselineRSV:22100,optimizedRSV:27600,spendChange: 2600,optimizedROAS:5.2},
  {id:4,campaign:"Gatorade — Search Brand",adGroup:"Gatorade Endurance Pack",    currentBid:0.78,recommendedBid:0.95,baselineRSV:13800,optimizedRSV:16500,spendChange: 1400,optimizedROAS:5.0},
  {id:5,campaign:"Cheetos — Search Brand", adGroup:"Cheetos Crunchy Core",       currentBid:1.12,recommendedBid:0.90,baselineRSV:9400, optimizedRSV:9100, spendChange:-1100,optimizedROAS:5.3},
  {id:6,campaign:"Tostitos — Search Brand",adGroup:"Tostitos Salsa & Chips",     currentBid:0.98,recommendedBid:0.75,baselineRSV:7800, optimizedRSV:7500, spendChange: -900,optimizedROAS:5.2},
  {id:7,campaign:"Quaker — Search Brand",  adGroup:"Quaker Oats Morning Boost",  currentBid:0.65,recommendedBid:0.82,baselineRSV:5900, optimizedRSV:7200, spendChange:  850,optimizedROAS:4.9},
  {id:8,campaign:"Lay's — Sponsored Brand",adGroup:"Lay's Oven Baked Lineup",    currentBid:0.55,recommendedBid:0.45,baselineRSV:4100, optimizedRSV:3900, spendChange: -600,optimizedROAS:5.1},
];

// ── MOCK DATA — KEYWORD RECS ──────────────────────────────────────────────────
const KEYWORD_RECS = [
  {id:1, campaign:"Lay's — Search Brand",   adGroup:"Lay's Classic Core",       keyword:"lay's chips",         matchType:"Exact", currentBid:0.72,recommendedBid:0.90,baselineRSV:4200, optimizedRSV:5100, spendChange: 420, optimizedROAS:5.2},
  {id:2, campaign:"Lay's — Search Brand",   adGroup:"Lay's Classic Core",       keyword:"potato chips",        matchType:"Broad", currentBid:0.38,recommendedBid:0.28,baselineRSV:1800, optimizedRSV:1700, spendChange:-280, optimizedROAS:5.4},
  {id:3, campaign:"Doritos — Search Brand", adGroup:"Doritos Bold Flavors",     keyword:"doritos nacho cheese",matchType:"Exact", currentBid:0.80,recommendedBid:1.00,baselineRSV:3600, optimizedRSV:4400, spendChange: 380, optimizedROAS:5.0},
  {id:4, campaign:"Doritos — Search Brand", adGroup:"Doritos Bold Flavors",     keyword:"tortilla chips",      matchType:"Phrase",currentBid:0.45,recommendedBid:0.35,baselineRSV:2100, optimizedRSV:2000, spendChange:-220, optimizedROAS:5.3},
  {id:5, campaign:"Pepsi — Search Brand",   adGroup:"Pepsi Zero Sugar Push",    keyword:"pepsi zero sugar",    matchType:"Exact", currentBid:0.95,recommendedBid:1.15,baselineRSV:5200, optimizedRSV:6300, spendChange: 490, optimizedROAS:5.3},
  {id:6, campaign:"Pepsi — Search Brand",   adGroup:"Pepsi Zero Sugar Push",    keyword:"diet pepsi",          matchType:"Phrase",currentBid:0.60,recommendedBid:0.48,baselineRSV:2400, optimizedRSV:2300, spendChange:-310, optimizedROAS:5.5},
  {id:7, campaign:"Gatorade — Search Brand",adGroup:"Gatorade Endurance Pack",  keyword:"gatorade endurance",  matchType:"Exact", currentBid:0.85,recommendedBid:1.05,baselineRSV:3800, optimizedRSV:4700, spendChange: 360, optimizedROAS:5.1},
  {id:8, campaign:"Gatorade — Search Brand",adGroup:"Gatorade Endurance Pack",  keyword:"sports drinks",       matchType:"Broad", currentBid:0.50,recommendedBid:0.38,baselineRSV:1600, optimizedRSV:1500, spendChange:-190, optimizedROAS:5.3},
  {id:9, campaign:"Quaker — Search Brand",  adGroup:"Quaker Oats Morning Boost",keyword:"quaker oats",         matchType:"Exact", currentBid:0.55,recommendedBid:0.70,baselineRSV:2200, optimizedRSV:2700, spendChange: 280, optimizedROAS:4.9},
  {id:10,campaign:"Quaker — Search Brand",  adGroup:"Quaker Oats Morning Boost",keyword:"instant oatmeal",     matchType:"Phrase",currentBid:0.40,recommendedBid:0.30,baselineRSV:1400, optimizedRSV:1350, spendChange:-160, optimizedROAS:5.1},
];

const CHART_DATA = {
  weeks:    ["W8","W9","W10","W11","W12","W13","W14","W15","W16"],
  actual:   [1.21,1.34,1.28,1.41,null,null,null,null,null],
  baseline: [null,null,null,null,1.52,1.58,1.61,1.66,1.70],
  optimized:[null,null,null,null,1.68,1.76,1.82,1.89,1.95],
};

// ── SHARED COMPONENTS ─────────────────────────────────────────────────────────
const Badge = ({ color="gray", children }) => {
  const map = {
    blue:{background:C.blueLight,color:C.blue}, green:{background:C.greenLight,color:C.green},
    red:{background:C.redLight,color:C.red},    yellow:{background:"#FEF3C7",color:C.yellow},
    gray:{background:"#F1F3F4",color:C.textSub},
  };
  return <span style={{...map[color],fontSize:11,fontWeight:600,padding:"2px 7px",borderRadius:4,whiteSpace:"nowrap"}}>{children}</span>;
};

const Chip = ({ active, children, onClick }) => (
  <button onClick={onClick} style={{background:active?C.blue:C.surface,color:active?"#fff":C.textSub,border:`1px solid ${active?C.blue:C.border}`,borderRadius:5,fontSize:12,fontWeight:600,padding:"4px 12px",cursor:"pointer"}}>{children}</button>
);

const FilterSelect = ({ label }) => (
  <select style={{fontSize:12,color:C.textSub,background:C.surface,border:`1px solid ${C.border}`,borderRadius:5,padding:"4px 8px",cursor:"pointer"}}><option>{label}</option></select>
);

const KpiCard = ({ label, value, sub }) => (
  <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:"14px 18px",flex:1}}>
    <div style={{fontSize:11,color:C.textMuted,fontWeight:600,textTransform:"uppercase",letterSpacing:0.5,marginBottom:4}}>{label}</div>
    <div style={{fontSize:22,fontWeight:700,color:C.text,letterSpacing:-0.5}}>{value}</div>
    {sub && <div style={{fontSize:11,color:C.textSub,marginTop:2}}>{sub}</div>}
  </div>
);

function TableToolbar({ allSelected, someSelected, selSize, onToggleAll, onAccept, onDecline, s, daisy=false }) {
  if (daisy) {
    return (
      <div className="flex items-center gap-3 px-4 py-2 border-b border-base-300 bg-base-100">
        <label className="flex items-center gap-2 cursor-pointer text-xs text-base-content/70 select-none">
          <input
            type="checkbox"
            className="checkbox checkbox-xs"
            checked={allSelected}
            ref={el=>{if(el)el.indeterminate=someSelected;}}
            onChange={onToggleAll}
          />
          Select all
        </label>
        <span className="flex-1 text-xs text-base-content/40">
          {selSize>0?`${selSize} row${selSize>1?"s":""} selected`:"No rows selected"}
        </span>
        <button
          className={`btn btn-xs btn-success ${!selSize?"btn-disabled opacity-40":""}`}
          disabled={!selSize}
          onClick={onAccept}
        >Accept</button>
        <button
          className={`btn btn-xs btn-error btn-outline ${!selSize?"btn-disabled opacity-40":""}`}
          disabled={!selSize}
          onClick={onDecline}
        >Decline</button>
      </div>
    );
  }
  return (
    <div style={s.toolRow}>
      <label style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",fontSize:12}}>
        <input type="checkbox" checked={allSelected} ref={el=>{if(el)el.indeterminate=someSelected;}} onChange={onToggleAll} style={{width:14,height:14,cursor:"pointer",accentColor:C.blue}}/>
        Select all
      </label>
      <span style={s.countLabel}>{selSize>0?`${selSize} row${selSize>1?"s":""} selected`:"No rows selected"}</span>
      <button style={{...s.btnPrimary,opacity:selSize?1:0.4}} disabled={!selSize} onClick={onAccept}>Accept</button>
      <button style={{...s.btnDanger,opacity:selSize?1:0.4}} disabled={!selSize} onClick={onDecline}>Decline</button>
    </div>
  );
}

// ── FORECAST CHART ────────────────────────────────────────────────────────────
function ForecastChart() {
  const W=720,H=180,PL=40,PR=16,PT=16,PB=28,cw=W-PL-PR,ch=H-PT-PB;
  const {weeks,actual,baseline,optimized}=CHART_DATA, n=weeks.length;
  const xs=i=>PL+(i/(n-1))*cw;
  const allVals=[...actual,...baseline,...optimized].filter(v=>v!=null);
  const minY=Math.min(...allVals)*0.88, maxY=Math.max(...allVals)*1.06;
  const ys=v=>PT+ch-((v-minY)/(maxY-minY))*ch;
  const pathOf=s=>{const pts=s.map((v,i)=>v!=null?`${xs(i)},${ys(v)}`:null).filter(Boolean);return pts.length<2?"":"M"+pts.join(" L");};
  const dashedOf=s=>{const segs=[];let seg=[];s.forEach((v,i)=>{if(v!=null)seg.push(`${xs(i)},${ys(v)}`);else if(seg.length){segs.push(seg);seg=[];}});if(seg.length)segs.push(seg);return segs.map(g=>"M"+g.join(" L")).join(" ");};
  const divX=xs(3.5);
  const yLabels=[minY,(minY+maxY)/2,maxY].map(v=>({y:ys(v),label:`$${v.toFixed(1)}M`}));
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{display:"block"}}>
      {yLabels.map(({y,label})=><g key={label}><line x1={PL} y1={y} x2={W-PR} y2={y} stroke={C.borderLight} strokeWidth={1}/><text x={PL-4} y={y+4} fontSize={9} fill={C.textMuted} textAnchor="end">{label}</text></g>)}
      <line x1={divX} y1={PT} x2={divX} y2={H-PB} stroke={C.border} strokeWidth={1} strokeDasharray="3,3"/>
      <text x={divX+4} y={PT+10} fontSize={9} fill={C.textMuted}>Current week</text>
      <path d={pathOf(actual)} fill="none" stroke={C.textSub} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
      <path d={pathOf(baseline)} fill="none" stroke={C.orange} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
      <path d={dashedOf(optimized)} fill="none" stroke={C.purple} strokeWidth={2} strokeDasharray="5,3" strokeLinecap="round" strokeLinejoin="round"/>
      {actual.map((v,i)=>v!=null&&<circle key={i} cx={xs(i)} cy={ys(v)} r={3} fill={C.textSub}/>)}
      {weeks.map((w,i)=><text key={w} x={xs(i)} y={H-4} fontSize={9} fill={C.textMuted} textAnchor="middle">{w}</text>)}
    </svg>
  );
}

// ── STEPPER (Option A) ────────────────────────────────────────────────────────
const STEP_LABELS=["Pause Recs","Ad Group Bids","Keyword Bids","Review & Push"];
function Stepper({active}) {
  return (
    <div style={{display:"flex",alignItems:"center"}}>
      {STEP_LABELS.map((label,i)=>{
        const done=i<active,curr=i===active;
        return (
          <div key={i} style={{display:"flex",alignItems:"center"}}>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <div style={{width:22,height:22,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,background:done?C.green:curr?C.blue:"#E2E4E8",color:done||curr?"#fff":C.textMuted}}>{done?"✓":i+1}</div>
              <span style={{fontSize:12,fontWeight:curr?700:500,color:curr?C.blue:done?C.green:C.textMuted}}>{label}</span>
            </div>
            {i<STEP_LABELS.length-1&&<div style={{width:32,height:1,background:C.border,margin:"0 10px"}}/>}
          </div>
        );
      })}
    </div>
  );
}

// ── GUIDED STEPPER (Option B) ─────────────────────────────────────────────────
const GUIDED_STEPS = ["Overview","Pause","Ad Groups","Keywords","Review"];
function GuidedStepper({ active, visitedMax, pauseReviewed, agReviewed, kwReviewed, anyDecision, onStep }) {
  const counts = [null, pauseReviewed, agReviewed, kwReviewed, null];
  const totals  = [null, PAUSE_RECS.length, AD_GROUP_RECS.length, KEYWORD_RECS.length, null];
  return (
    <div style={{display:"flex",alignItems:"center",gap:0}}>
      {GUIDED_STEPS.map((label,i)=>{
        const done = i < active && i <= visitedMax;
        const curr = i === active;
        const canClick =
          i <= visitedMax ||
          (i === 4 && anyDecision);
        const count = counts[i];
        const total = totals[i];
        return (
          <div key={i} style={{display:"flex",alignItems:"center"}}>
            <button
              onClick={()=>canClick&&onStep(i)}
              disabled={!canClick}
              style={{
                display:"flex",alignItems:"center",gap:5,
                border:"none",cursor:canClick?"pointer":"default",
                padding:"6px 10px",borderRadius:6,
                background: curr ? C.blueLight : "transparent",
              }}
            >
              <div style={{
                width:18,height:18,borderRadius:"50%",display:"flex",alignItems:"center",
                justifyContent:"center",fontSize:10,fontWeight:700,flexShrink:0,
                background:done?C.green:curr?C.blue:"#E2E4E8",
                color:done||curr?"#fff":C.textMuted,
              }}>
                {done?"✓":i+1}
              </div>
              <span style={{fontSize:12,fontWeight:curr?700:500,color:curr?C.blue:done?C.green:canClick?C.textSub:C.textMuted,whiteSpace:"nowrap"}}>
                {label}
                {count!=null&&total!=null&&<span style={{fontWeight:400,color:C.textMuted,marginLeft:3}}>{count}/{total}</span>}
              </span>
            </button>
            {i<GUIDED_STEPS.length-1&&<div style={{width:20,height:1,background:C.border}}/>}
          </div>
        );
      })}
    </div>
  );
}

// ── SCENARIO IMPACT STRIP ─────────────────────────────────────────────────────
function ScenarioImpactStrip({ modelMetrics, acceptedMetrics, reviewedCount, pendingCount }) {
  return (
    <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,marginBottom:14,padding:"14px 16px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div>
          <div style={{fontSize:12,fontWeight:700,color:C.text}}>Scenario impact</div>
          <div style={{fontSize:11,color:C.textMuted,marginTop:2}}>Updates after you accept or decline recommendations.</div>
        </div>
        <div style={{fontSize:11,color:C.textSub}}>{reviewedCount} reviewed · {pendingCount} pending</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1.2fr 1fr 1fr",columnGap:14,rowGap:0}}>
        <div style={{fontSize:10,color:C.textMuted,padding:"0 0 7px"}}>Metric</div>
        <div style={{fontSize:10,fontWeight:700,color:C.purple,padding:"0 0 7px"}}>Model scenario</div>
        <div style={{fontSize:10,fontWeight:700,color:C.blue,padding:"0 0 7px"}}>Your accepted scenario</div>
        {modelMetrics.map((metric,i)=>(
          <>
            <div key={`l-${i}`} style={{fontSize:11,color:C.textSub,padding:"7px 0",borderTop:`1px solid ${C.borderLight}`}}>{metric.label}</div>
            <div key={`m-${i}`} style={{fontSize:12,fontWeight:700,color:metric.color||C.purple,padding:"7px 0",borderTop:`1px solid ${C.borderLight}`}}>{metric.value}</div>
            <div key={`a-${i}`} style={{fontSize:12,fontWeight:700,color:acceptedMetrics[i].color||C.blue,padding:"7px 0",borderTop:`1px solid ${C.borderLight}`}}>{acceptedMetrics[i].value}</div>
          </>
        ))}
      </div>
    </div>
  );
}

function StepImpactSummary({ accepted, spendChange, rsvLift, projROAS }) {
  const spendColor = spendChange == null ? C.textMuted : spendChange < 0 ? C.green : C.orange;
  const rsvColor = rsvLift == null ? C.textMuted : rsvLift >= 0 ? C.green : C.red;
  const items = [
    {label:"Accepted",value:String(accepted),color:C.text},
    {label:"Projected spend change",value:spendChange==null?"—":`${spendChange>=0?"+":""}${fmtCurrency(spendChange)}`,color:spendColor},
    {label:"Projected RSV lift",value:rsvLift==null?"—":`${rsvLift>=0?"+":""}${fmtCurrency(rsvLift)}`,color:rsvColor},
    {label:"Projected ROAS",value:projROAS?`${projROAS}x`:"—",color:C.purple},
  ];
  return (
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:0,background:C.bg,borderBottom:`1px solid ${C.border}`}}>
      {items.map((item,i)=>(
        <div key={item.label} style={{padding:"10px 14px",borderRight:i<items.length-1?`1px solid ${C.border}`:"none"}}>
          <div style={{fontSize:10,color:C.textMuted,marginBottom:3}}>{item.label}</div>
          <div style={{fontSize:15,fontWeight:700,color:item.color}}>{item.value}</div>
        </div>
      ))}
    </div>
  );
}

// ── REVIEW SUMMARY SECTION ────────────────────────────────────────────────────
function ReviewSection({title, rows, s}) {
  return (
    <div style={{border:`1px solid ${C.border}`,borderRadius:7,marginBottom:12,overflow:"hidden"}}>
      <div style={{background:C.bg,padding:"8px 14px",fontWeight:700,fontSize:12,color:C.textSub,textTransform:"uppercase",letterSpacing:0.4,borderBottom:`1px solid ${C.border}`}}>{title}</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:0}}>
        {rows.map(({label,value,color},i)=>(
          <div key={i} style={{padding:"8px 14px",borderBottom:i<rows.length-2?`1px solid ${C.borderLight}`:"none",borderRight:i%2===0?`1px solid ${C.borderLight}`:"none"}}>
            <div style={{fontSize:11,color:C.textMuted,marginBottom:2}}>{label}</div>
            <div style={{fontSize:13,fontWeight:600,color:color||C.text}}>{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [target,setTarget]         = useState("RSV");
  const [activeStep,setActiveStep] = useState(1);      // Option A step (1–4)
  const [guidedStep,setGuidedStep] = useState(0);      // Option B step (0–4)
  const [guidedVisitedMax,setGuidedVisitedMax] = useState(0);
  const [savedDraft,setSavedDraft] = useState(false);
  const [pushStatus,setPushStatus] = useState("idle"); // idle | pushing | success
  const [pushTimestamp,setPushTimestamp] = useState(null);
  const [experienceMode,setExperienceMode] = useState("guided"); // guided | contained

  const [currentView,setCurrentView] = useState("recommendations"); // recommendations | optimization

  const [selected,setSelected] = useState({pause:new Set(),adGroup:new Set(),keyword:new Set()});
  const [decisions,setDecisions] = useState({pause:{},adGroup:{},keyword:{}});

  // ── PAUSE ─────────────────────────────────────────────────────────────────
  const pauseSel=selected.pause, pauseDec=decisions.pause;
  const pauseAllIds=PAUSE_RECS.map(r=>r.id);
  const pauseAllSel=pauseAllIds.every(id=>pauseSel.has(id));
  const pauseSomeSel=pauseSel.size>0&&!pauseAllSel;
  const setPauseSel=fn=>setSelected(p=>({...p,pause:fn(p.pause)}));
  const setPauseDec=fn=>setDecisions(p=>({...p,pause:fn(p.pause)}));
  const pauseToggleAll=()=>setPauseSel(s=>pauseAllSel?new Set():new Set(pauseAllIds));
  const pauseToggleRow=id=>setPauseSel(s=>{const n=new Set(s);n.has(id)?n.delete(id):n.add(id);return n;});
  const pauseAccept=()=>{setPauseDec(p=>{const n={...p};pauseSel.forEach(id=>{n[id]="accepted";});return n;});setPauseSel(()=>new Set());};
  const pauseDecline=()=>{setPauseDec(p=>{const n={...p};pauseSel.forEach(id=>{n[id]="declined";});return n;});setPauseSel(()=>new Set());};

  const pauseSpendReduction=useMemo(()=>PAUSE_RECS.filter(r=>pauseDec[r.id]==="accepted").reduce((s,r)=>s+r.projectedSpendReduction,0),[pauseDec]);
  const pauseRSVImpact=useMemo(()=>PAUSE_RECS.filter(r=>pauseDec[r.id]==="accepted").reduce((s,r)=>s+r.rsvImpact,0),[pauseDec]);
  const pauseDecidedCount=Object.keys(pauseDec).length;
  const pauseAcceptedCount=Object.values(pauseDec).filter(v=>v==="accepted").length;
  const pauseDeclinedCount=Object.values(pauseDec).filter(v=>v==="declined").length;

  // ── AD GROUP BIDS ─────────────────────────────────────────────────────────
  const agSel=selected.adGroup, agDec=decisions.adGroup;
  const agAllIds=AD_GROUP_RECS.map(r=>r.id);
  const agAllSel=agAllIds.every(id=>agSel.has(id));
  const agSomeSel=agSel.size>0&&!agAllSel;
  const setAgSel=fn=>setSelected(p=>({...p,adGroup:fn(p.adGroup)}));
  const setAgDec=fn=>setDecisions(p=>({...p,adGroup:fn(p.adGroup)}));
  const agToggleAll=()=>setAgSel(s=>agAllSel?new Set():new Set(agAllIds));
  const agToggleRow=id=>setAgSel(s=>{const n=new Set(s);n.has(id)?n.delete(id):n.add(id);return n;});
  const agAccept=()=>{setAgDec(p=>{const n={...p};agSel.forEach(id=>{n[id]="accepted";});return n;});setAgSel(()=>new Set());};
  const agDecline=()=>{setAgDec(p=>{const n={...p};agSel.forEach(id=>{n[id]="declined";});return n;});setAgSel(()=>new Set());};

  const agSpendChange=useMemo(()=>AD_GROUP_RECS.filter(r=>agDec[r.id]==="accepted").reduce((s,r)=>s+r.spendChange,0),[agDec]);
  const agRSVLift=useMemo(()=>AD_GROUP_RECS.filter(r=>agDec[r.id]==="accepted").reduce((s,r)=>s+(r.optimizedRSV-r.baselineRSV),0),[agDec]);
  const agProjectedROAS=useMemo(()=>{const rows=AD_GROUP_RECS.filter(r=>agDec[r.id]==="accepted");if(!rows.length)return null;const w=rows.reduce((s,r)=>s+r.optimizedROAS*r.optimizedRSV,0);const t=rows.reduce((s,r)=>s+r.optimizedRSV,0);return t>0?(w/t).toFixed(1):null;},[agDec]);
  const agDecidedCount=Object.keys(agDec).length;
  const agAcceptedCount=Object.values(agDec).filter(v=>v==="accepted").length;
  const agDeclinedCount=Object.values(agDec).filter(v=>v==="declined").length;

  // ── KEYWORD BIDS ──────────────────────────────────────────────────────────
  const kwSel=selected.keyword, kwDec=decisions.keyword;
  const kwAllIds=KEYWORD_RECS.map(r=>r.id);
  const kwAllSel=kwAllIds.every(id=>kwSel.has(id));
  const kwSomeSel=kwSel.size>0&&!kwAllSel;
  const setKwSel=fn=>setSelected(p=>({...p,keyword:fn(p.keyword)}));
  const setKwDec=fn=>setDecisions(p=>({...p,keyword:fn(p.keyword)}));
  const kwToggleAll=()=>setKwSel(s=>kwAllSel?new Set():new Set(kwAllIds));
  const kwToggleRow=id=>setKwSel(s=>{const n=new Set(s);n.has(id)?n.delete(id):n.add(id);return n;});
  const kwAccept=()=>{setKwDec(p=>{const n={...p};kwSel.forEach(id=>{n[id]="accepted";});return n;});setKwSel(()=>new Set());};
  const kwDecline=()=>{setKwDec(p=>{const n={...p};kwSel.forEach(id=>{n[id]="declined";});return n;});setKwSel(()=>new Set());};

  const kwSpendChange=useMemo(()=>KEYWORD_RECS.filter(r=>kwDec[r.id]==="accepted").reduce((s,r)=>s+r.spendChange,0),[kwDec]);
  const kwRSVLift=useMemo(()=>KEYWORD_RECS.filter(r=>kwDec[r.id]==="accepted").reduce((s,r)=>s+(r.optimizedRSV-r.baselineRSV),0),[kwDec]);
  const kwProjectedROAS=useMemo(()=>{const rows=KEYWORD_RECS.filter(r=>kwDec[r.id]==="accepted");if(!rows.length)return null;const w=rows.reduce((s,r)=>s+r.optimizedROAS*r.optimizedRSV,0);const t=rows.reduce((s,r)=>s+r.optimizedRSV,0);return t>0?(w/t).toFixed(1):null;},[kwDec]);
  const kwDecidedCount=Object.keys(kwDec).length;
  const kwAcceptedCount=Object.values(kwDec).filter(v=>v==="accepted").length;
  const kwDeclinedCount=Object.values(kwDec).filter(v=>v==="declined").length;

  // ── REVIEW & PUSH METRICS ─────────────────────────────────────────────────
  const totalAccepted=pauseAcceptedCount+agAcceptedCount+kwAcceptedCount;
  const projectedRSVLift=pauseRSVImpact+agRSVLift+kwRSVLift;
  const acceptedBidRecs=useMemo(()=>[...AD_GROUP_RECS.filter(r=>agDec[r.id]==="accepted"),...KEYWORD_RECS.filter(r=>kwDec[r.id]==="accepted")],[agDec,kwDec]);
  const projectedROAS=useMemo(()=>{if(!acceptedBidRecs.length)return null;const w=acceptedBidRecs.reduce((s,r)=>s+r.optimizedROAS*r.optimizedRSV,0);const t=acceptedBidRecs.reduce((s,r)=>s+r.optimizedRSV,0);return t>0?(w/t).toFixed(1):null;},[acceptedBidRecs]);

  // ── NAVIGATION GUARDS (Option A) ─────────────────────────────────────────
  const canContinueStep1=pauseDecidedCount>0;
  const canContinueStep2=agDecidedCount>0;
  const canContinueStep3=kwDecidedCount>0;
  const canPush=totalAccepted>0&&pushStatus==="idle";

  // ── GUIDED NAVIGATION ─────────────────────────────────────────────────────
  const navigateGuided = (i) => {
    setGuidedStep(i);
    setGuidedVisitedMax(prev=>Math.max(prev,i));
  };

  // ── MODEL SCENARIO CALCULATIONS ──────────────────────────────────────────
  // Pause model scenario
  const modelPauseSpendReduction = useMemo(()=>PAUSE_RECS.reduce((s,r)=>s+r.projectedSpendReduction,0),[]);
  const modelPauseRSVImpact      = useMemo(()=>PAUSE_RECS.reduce((s,r)=>s+r.rsvImpact,0),[]);
  const modelPauseROAS           = useMemo(()=>{const total=PAUSE_RECS.reduce((s,r)=>s+r.currentRSV,0);const sp=PAUSE_RECS.reduce((s,r)=>s+r.currentSpend,0);return sp>0?(total/sp).toFixed(1):null;},[]);

  // Ad Group model scenario
  const modelAgSpendChange = useMemo(()=>AD_GROUP_RECS.reduce((s,r)=>s+r.spendChange,0),[]);
  const modelAgRSVLift     = useMemo(()=>AD_GROUP_RECS.reduce((s,r)=>s+(r.optimizedRSV-r.baselineRSV),0),[]);
  const modelAgROAS        = useMemo(()=>{const w=AD_GROUP_RECS.reduce((s,r)=>s+r.optimizedROAS*r.optimizedRSV,0);const t=AD_GROUP_RECS.reduce((s,r)=>s+r.optimizedRSV,0);return t>0?(w/t).toFixed(1):null;},[]);

  // Keyword model scenario
  const modelKwSpendChange = useMemo(()=>KEYWORD_RECS.reduce((s,r)=>s+r.spendChange,0),[]);
  const modelKwRSVLift     = useMemo(()=>KEYWORD_RECS.reduce((s,r)=>s+(r.optimizedRSV-r.baselineRSV),0),[]);
  const modelKwROAS        = useMemo(()=>{const w=KEYWORD_RECS.reduce((s,r)=>s+r.optimizedROAS*r.optimizedRSV,0);const t=KEYWORD_RECS.reduce((s,r)=>s+r.optimizedRSV,0);return t>0?(w/t).toFixed(1):null;},[]);

  // Stepper state for guided mode
  const pauseReviewedCount = pauseAcceptedCount+pauseDeclinedCount;
  const agReviewedCount    = agAcceptedCount+agDeclinedCount;
  const kwReviewedCount    = kwAcceptedCount+kwDeclinedCount;
  const anyDecision        = pauseReviewedCount+agReviewedCount+kwReviewedCount > 0;

  // Guided canContinue (at least one decision in current step category)
  const gCanContinuePause   = pauseReviewedCount > 0;
  const gCanContinueAg      = agReviewedCount > 0;
  const gCanContinueKw      = kwReviewedCount > 0;

  const forecastTitle=target==="RSV"?"Projected RSV Performance":"Projected Incremental Sales Performance";
  const handleSaveDraft=()=>{setSavedDraft(true);setTimeout(()=>setSavedDraft(false),2000);};

  const handlePush=()=>{
    if(!canPush) return;
    setPushStatus("pushing");
    setTimeout(()=>{
      setPushStatus("success");
      setPushTimestamp(new Date().toLocaleString("en-US",{month:"short",day:"numeric",year:"numeric",hour:"2-digit",minute:"2-digit"}));
    },2000);
  };

  // ── STYLES ────────────────────────────────────────────────────────────────
  const s={
    page:      {background:C.bg,minHeight:"100vh",fontFamily:"'Inter','Segoe UI',sans-serif",fontSize:14,color:C.text},
    topbar:    {background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"0 24px",height:44,display:"flex",alignItems:"center",justifyContent:"space-between"},
    topLeft:   {display:"flex",alignItems:"center",gap:16},
    topRight:  {display:"flex",alignItems:"center",gap:12},
    avatar:    {width:28,height:28,borderRadius:"50%",background:C.blue,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700},
    main:      {maxWidth:1160,margin:"0 auto",padding:"20px 24px 80px"},
    back:      {fontSize:12,color:C.blue,cursor:"pointer",textDecoration:"none",marginBottom:12,display:"inline-flex",alignItems:"center",gap:4},
    titleRow:  {marginBottom:16},
    h1:        {fontSize:18,fontWeight:700,color:C.text,margin:0},
    sub:       {fontSize:12,color:C.textSub,marginTop:3},
    row:       {display:"flex",gap:12,alignItems:"center",marginBottom:16,flexWrap:"wrap"},
    kpiRow:    {display:"flex",gap:12,marginBottom:16},
    panel:     {background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,marginBottom:16},
    panelHead: {padding:"11px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between"},
    panelTitle:{fontSize:13,fontWeight:700,color:C.text},
    panelBody: {padding:16},
    legend:    {display:"flex",gap:16,marginTop:8},
    legendItem:{display:"flex",alignItems:"center",gap:5,fontSize:11,color:C.textSub},
    tableWrap: {overflowX:"auto"},
    table:     {width:"100%",borderCollapse:"collapse"},
    th:        {fontSize:11,fontWeight:600,color:C.textMuted,textTransform:"uppercase",letterSpacing:0.4,padding:"8px 10px",background:C.bg,borderBottom:`1px solid ${C.border}`,textAlign:"left",whiteSpace:"nowrap"},
    td:        {fontSize:13,color:C.text,padding:"9px 10px",borderBottom:`1px solid ${C.borderLight}`,whiteSpace:"nowrap"},
    toolRow:   {display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderBottom:`1px solid ${C.border}`},
    countLabel:{fontSize:12,color:C.textSub,flex:1},
    summaryRow:{display:"flex",alignItems:"center",gap:16,padding:"10px 14px",background:C.bg,borderTop:`1px solid ${C.border}`,fontSize:12,color:C.textSub},
    footer:    {position:"fixed",bottom:0,left:0,right:0,background:C.surface,borderTop:`1px solid ${C.border}`,padding:"12px 24px",display:"flex",justifyContent:"flex-end",alignItems:"center",gap:10,zIndex:100},
    btnPrimary:{background:C.blue,color:"#fff",border:"none",borderRadius:6,fontSize:12,fontWeight:600,padding:"6px 14px",cursor:"pointer"},
    btnGhost:  {background:C.surface,color:C.textSub,border:`1px solid ${C.border}`,borderRadius:6,fontSize:12,fontWeight:600,padding:"6px 14px",cursor:"pointer"},
    btnDanger: {background:C.surface,color:C.red,border:`1px solid ${C.red}`,borderRadius:6,fontSize:12,fontWeight:600,padding:"6px 14px",cursor:"pointer"},
    btnGreen:  {background:C.green,color:"#fff",border:"none",borderRadius:6,fontSize:12,fontWeight:600,padding:"6px 14px",cursor:"pointer"},
    stepHead:  {padding:"14px 16px",borderBottom:`1px solid ${C.border}`},
    errBanner: {margin:"10px 14px 0",padding:"9px 12px",background:C.redLight,border:`1px solid ${C.red}`,borderRadius:6,fontSize:12,color:C.red,fontWeight:600},
    warnBanner:{margin:"10px 14px 0",padding:"9px 12px",background:"#FEF3C7",border:`1px solid ${C.yellow}`,borderRadius:6,fontSize:12,color:C.yellow,fontWeight:600},
  };

  const legendItems=[
    {label:"Historical Actual",color:C.textSub,dash:false},
    {label:"Baseline Forecast",color:C.orange,dash:false},
    {label:"Optimized Forecast",color:C.purple,dash:true},
  ];

  // ── RENDER ────────────────────────────────────────────────────────────────

  // ── RECOMMENDATIONS PAGE ──────────────────────────────────────────────────
  const wk12Status = pushStatus==="success" ? "Applied" : "Pending";
  const appliedCount = pushStatus==="success" ? 4 : 3;
  const pendingCount = pushStatus==="success" ? 0 : 1;

  const RECS_LIST = [
    {
      id:"wk12", label:"WK12", dateRange:"Mar 17–23, 2026",
      retailer:"Walmart – US – Total Walmart", optTarget:"RSV",
      changes:"2 pauses · 4 ad groups · 8 keywords",
      rsvImpact:18200, spendChange:-710,
      created:"2 hours ago", statusKey:"wk12",
    },
    {
      id:"wk11", label:"WK11", dateRange:"Mar 10–16, 2026",
      retailer:"Walmart – US – Total Walmart", optTarget:"RSV",
      changes:"3 pauses · 5 ad groups · 11 keywords",
      rsvImpact:12300, spendChange:-420,
      status:"Applied", created:"1 week ago",
    },
    {
      id:"wk10", label:"WK10", dateRange:"Mar 3–9, 2026",
      retailer:"Walmart – US – Total Walmart", optTarget:"RSV",
      changes:"1 pause · 3 ad groups · 7 keywords",
      rsvImpact:5100, spendChange:280,
      status:"Rejected", created:"2 weeks ago",
    },
    {
      id:"wk9", label:"WK9", dateRange:"Feb 24–Mar 2, 2026",
      retailer:"Walmart – US – Total Walmart", optTarget:"RSV",
      changes:"4 pauses · 6 ad groups · 14 keywords",
      rsvImpact:22300, spendChange:-1100,
      status:"Expired", created:"3 weeks ago",
    },
  ];

  const statusColor = { Pending:"yellow", Applied:"green", Rejected:"red", Expired:"gray" };

  // Status → DaisyUI badge variant mapping for landing page
  const landingBadgeVariant = {
    Pending:  "badge-warning",
    Applied:  "badge-success",
    Rejected: "badge-error",
    Expired:  "badge-ghost",
  };

  const RecommendationsPage = () => (
    <div data-theme="galileo" className="min-h-screen bg-base-200" style={{fontFamily:"Inter,-apple-system,sans-serif"}}>

      {/* ── TOP BAR ──────────────────────────────────────────────────── */}
      <div className="navbar bg-base-100 border-b border-base-300 sticky top-0 z-50 px-5" style={{boxShadow:"var(--shadow-sm)"}}>
        <div className="flex-1 gap-2">
          <span className="text-sm font-bold" style={{color:"var(--ai)"}}>Galileo</span>
          <span className="text-base-content/30">|</span>
          <span className="text-xs text-base-content/50">Campaign Management</span>
        </div>
        <div className="flex-none flex items-center gap-3">
          <span className="text-xs text-base-content/50">Shirley Chisholm</span>
          <div className="avatar avatar-placeholder">
            <div className="bg-neutral text-neutral-content w-7 rounded-full text-xs font-semibold">
              SC
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-6 py-6">

        {/* ── PAGE TITLE ───────────────────────────────────────────────── */}
        <div className="mb-5">
          <h1 className="text-lg font-semibold text-base-content mb-1">Campaign Optimization Recommendations</h1>
          <p className="text-xs text-base-content/50">Review AI-generated optimization packages, assess projected impact, and apply approved changes to Skai.</p>
        </div>

        {/* ── KPI SUMMARY ──────────────────────────────────────────────── */}
        <div className="stats stats-horizontal shadow bg-base-100 border border-base-300 w-full mb-5">
          <div className="stat">
            <div className="stat-title text-xs font-semibold uppercase tracking-wide">Projected RSV opportunity</div>
            <div className="stat-value text-xl font-bold text-success">+$48.1K</div>
            <div className="stat-desc text-xs">Across pending recommendations</div>
          </div>
          <div className="stat">
            <div className="stat-title text-xs font-semibold uppercase tracking-wide">Pending reviews</div>
            <div className={`stat-value text-xl font-bold ${pendingCount > 0 ? "text-warning" : "text-base-content/50"}`}>{pendingCount}</div>
            <div className="stat-desc text-xs">Action required</div>
          </div>
          <div className="stat">
            <div className="stat-title text-xs font-semibold uppercase tracking-wide">Applied this month</div>
            <div className="stat-value text-xl font-bold text-base-content">{appliedCount}</div>
            <div className="stat-desc text-xs">Packages pushed to Skai</div>
          </div>
          <div className="stat">
            <div className="stat-title text-xs font-semibold uppercase tracking-wide">Projected spend impact</div>
            <div className="stat-value text-xl font-bold text-base-content">$27.4K</div>
            <div className="stat-desc text-xs">Across applied packages</div>
          </div>
        </div>

        {/* ── RECOMMENDATIONS CARD ─────────────────────────────────────── */}
        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body p-0">

            {/* Card header */}
            <div className="px-5 pt-5 pb-3">
              <h2 className="card-title text-sm font-semibold">My Recommendations</h2>
              <p className="text-xs text-base-content/50 mt-0.5">Open a recommendation package to review projected impact, approve changes, and submit updates to Skai.</p>
            </div>

            {/* Visual-only tabs */}
            <div className="tabs tabs-bordered border-b border-base-300 px-1">
              {["All","Pending","Applied","Rejected","Expired"].map((tab, i) => (
                <span key={tab} className={`tab tab-sm ${i === 0 ? "tab-active font-semibold" : "text-base-content/50"}`}>{tab}</span>
              ))}
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto">
              <table className="table table-sm w-full">
                <thead>
                  <tr className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">
                    <th>Recommendation</th>
                    <th>Retailer / Customer group</th>
                    <th>Optimization target</th>
                    <th>Recommended changes</th>
                    <th>Projected RSV impact</th>
                    <th>Projected spend change</th>
                    <th>Status</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {RECS_LIST.map(r => {
                    const rowStatus = r.statusKey === "wk12" ? wk12Status : r.status;
                    const isClickable = r.id === "wk12" || rowStatus === "Applied";
                    const handleRowClick = r.id === "wk12" ? () => setCurrentView("optimization") : undefined;
                    const badgeVariant = landingBadgeVariant[rowStatus] || "badge-ghost";
                    return (
                      <tr key={r.id} className="hover:bg-base-200/50 transition-colors">
                        <td>
                          <div className="flex flex-col gap-0.5">
                            <span
                              onClick={handleRowClick}
                              className={`text-sm font-semibold ${isClickable ? "text-primary cursor-pointer hover:underline" : "text-base-content cursor-default"}`}
                            >{r.label}</span>
                            <span className="text-xs text-base-content/40">{r.dateRange}</span>
                          </div>
                        </td>
                        <td className="text-sm">{r.retailer}</td>
                        <td className="text-sm">{r.optTarget}</td>
                        <td className="text-xs text-base-content/50">{r.changes}</td>
                        <td className={`text-sm font-semibold ${r.rsvImpact > 0 ? "text-success" : "text-error"}`}>
                          {r.rsvImpact > 0 ? "+" : ""}{fmtCurrency(r.rsvImpact)}
                        </td>
                        <td className={`text-sm font-semibold ${r.spendChange < 0 ? "text-success" : "text-warning"}`}>
                          {r.spendChange >= 0 ? "+" : ""}{fmtCurrency(r.spendChange)}
                        </td>
                        <td>
                          <span className={`badge badge-sm ${badgeVariant}`}>{rowStatus}</span>
                        </td>
                        <td className="text-xs text-base-content/50">{r.created}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      </div>
    </div>
  );

  if (currentView==="recommendations") return <RecommendationsPage/>;

  // ── SHARED PAGE HEADER (used by both modes) ───────────────────────────────
  const PageTopBar = () => (
    <div style={s.topbar}>
      <div style={s.topLeft}>
        <span style={{fontWeight:700,fontSize:13,color:C.blue,letterSpacing:0.2}}>Galileo</span>
        <span style={{color:C.border}}>|</span>
        <span style={{fontSize:12,color:C.textSub}}>Campaign Management</span>
      </div>
      <div style={s.topRight}>
        <span style={{fontSize:12,color:C.textSub}}>Shirley Chisholm</span>
        <div style={s.avatar}>SC</div>
      </div>
    </div>
  );

  // ── MODE SWITCHER ─────────────────────────────────────────────────────────
  const ModeSwitcher = () => (
    <div style={{display:"flex",alignItems:"center",gap:6,background:C.bg,border:`1px solid ${C.border}`,borderRadius:6,padding:"2px",marginLeft:12}}>
      <button
        onClick={()=>setExperienceMode("contained")}
        style={{
          fontSize:11,fontWeight:600,padding:"4px 10px",borderRadius:4,border:"none",cursor:"pointer",
          background:experienceMode==="contained"?C.surface:"transparent",
          color:experienceMode==="contained"?C.text:C.textMuted,
          boxShadow:experienceMode==="contained"?"0 1px 2px rgba(0,0,0,0.08)":"none",
        }}
      >Option A — Contained</button>
      <button
        onClick={()=>setExperienceMode("guided")}
        style={{
          fontSize:11,fontWeight:600,padding:"4px 10px",borderRadius:4,border:"none",cursor:"pointer",
          background:experienceMode==="guided"?C.surface:"transparent",
          color:experienceMode==="guided"?C.blue:C.textMuted,
          boxShadow:experienceMode==="guided"?"0 1px 2px rgba(0,0,0,0.08)":"none",
        }}
      >Option B — Guided</button>
    </div>
  );

  // ── GUIDED MODE RENDER ────────────────────────────────────────────────────
  if (experienceMode==="guided") {
    // Derived for Review step
    const netSpendChangeG = agSpendChange + kwSpendChange - pauseSpendReduction;
    const baselineSpendG  = 284000;
    const baselineRSVG    = 1700000;
    const optimizedSpendG = baselineSpendG + netSpendChangeG;
    const optimizedRSVG   = baselineRSVG + projectedRSVLift;
    const barWG = (val, max) => `${Math.min(100, Math.max(4, (val / max) * 100)).toFixed(1)}%`;
    const spendMaxG = Math.max(baselineSpendG, Math.abs(optimizedSpendG)) * 1.05;
    const rsvMaxG   = Math.max(baselineRSVG, Math.abs(optimizedRSVG)) * 1.05;
    const readyToPush = totalAccepted > 0;

    return (
      <div data-theme="galileo" className="min-h-screen bg-base-200" style={{fontFamily:"Inter,-apple-system,sans-serif"}}>

        {/* ── TOP BAR ───────────────────────────────────────────────────── */}
        <div className="navbar bg-base-100 border-b border-base-300 sticky top-0 z-50 px-5" style={{boxShadow:"var(--shadow-sm)"}}>
          <div className="flex-1 gap-2">
            <span className="text-sm font-bold" style={{color:"var(--ai)"}}>Galileo</span>
            <span className="text-base-content/30">|</span>
            <span className="text-xs text-base-content/50">Campaign Management</span>
          </div>
          <div className="flex-none flex items-center gap-3">
            {/* Mode switcher — preserved exactly */}
            <ModeSwitcher/>
            <span className="text-xs text-base-content/50">Shirley Chisholm</span>
            <div className="avatar avatar-placeholder">
              <div className="bg-neutral text-neutral-content w-7 rounded-full text-xs font-semibold">SC</div>
            </div>
          </div>
        </div>

        {/* ── PAGE CONTENT ──────────────────────────────────────────────── */}
        <div className="max-w-screen-xl mx-auto px-6 py-5 pb-24">

          {/* Back link */}
          <button
            onClick={()=>setCurrentView("recommendations")}
            className="text-xs text-primary flex items-center gap-1 mb-4 hover:underline cursor-pointer bg-transparent border-none p-0"
          >
            ← Back to Recommendations
          </button>

          {/* Title row */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-lg font-bold text-base-content m-0">Weekly Bid Optimization — WK12</h1>
                <span className={`badge badge-sm ${pushStatus==="success" ? "badge-success" : "badge-warning"}`}>
                  {pushStatus==="success" ? "Pushed" : "Pending"}
                </span>
              </div>
              <p className="text-xs text-base-content/50 m-0">
                Mar 17–23, 2026 · Walmart – US – Total Walmart · Target: {target}
              </p>
              <p className="text-xs text-base-content/40 mt-1 m-0">
                Review AI-generated recommendations designed to improve RSV and campaign efficiency before pushing changes to Skai.
              </p>
            </div>
          </div>

          {/* Guided stepper */}
          <div className="mb-5 bg-base-100 border border-base-300 rounded-lg px-4 py-3" style={{boxShadow:"var(--shadow-sm)"}}>
            <GuidedStepper
              active={guidedStep}
              visitedMax={guidedVisitedMax}
              pauseReviewed={pauseReviewedCount}
              agReviewed={agReviewedCount}
              kwReviewed={kwReviewedCount}
              anyDecision={anyDecision}
              onStep={navigateGuided}
            />
          </div>

          {/* ── STEP 0: OVERVIEW ──────────────────────────────────────────── */}
          {guidedStep===0&&(
            <div>
              <div className="mb-5">
                <h2 className="text-base font-bold text-base-content mb-1">Weekly Optimization Overview</h2>
                <p className="text-xs text-base-content/50">Review the model's projected opportunity before evaluating individual recommendations.</p>
              </div>

              {/* KPI stats strip */}
              <div className="stats stats-horizontal shadow bg-base-100 border border-base-300 w-full mb-4">
                {[
                  {label:"Current Weekly Spend",       value:"$261K",   desc:"Baseline this week"},
                  {label:"Projected Optimized Spend",  value:"$284K",   desc:"+8.8% vs current"},
                  {label:"Projected RSV Lift",         value:"+$32.4K", desc:"Across all model recs"},
                  {label:"Projected ROAS",             value:"5.1x",    desc:"Model scenario"},
                ].map((k,i)=>(
                  <div key={i} className="stat">
                    <div className="stat-title text-xs font-medium">{k.label}</div>
                    <div className="stat-value text-xl font-bold text-base-content">{k.value}</div>
                    <div className="stat-desc text-xs">{k.desc}</div>
                  </div>
                ))}
              </div>

              {/* Forecast card — chart internals untouched */}
              <div className="card bg-base-100 border border-base-300 shadow-sm mb-4">
                <div className="card-body p-0">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-base-300">
                    <span className="text-sm font-semibold text-base-content">Projected RSV Performance</span>
                    <div className="flex gap-2 flex-wrap">
                      <FilterSelect label="Brand: All"/>
                      <FilterSelect label="Campaign: All"/>
                      <FilterSelect label="View by: Weekly"/>
                    </div>
                  </div>
                  <div className="px-4 pt-3 pb-2">
                    <ForecastChart/>
                    <div style={s.legend}>
                      {[{label:"Historical Actual",color:C.textSub,dash:false},{label:"Baseline Forecast",color:C.orange,dash:false},{label:"Optimized Forecast",color:C.purple,dash:true}].map(({label,color,dash})=>(
                        <div key={label} style={s.legendItem}>
                          <div style={{width:24,height:2,background:dash?"transparent":color,borderTop:dash?`2px dashed ${color}`:"none",flexShrink:0}}/>
                          {label}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommendation category cards */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                  { title:"Pause Recommendations", count:PAUSE_RECS.length,
                    metrics:[
                      {label:"Projected spend reduction", value:fmtCurrency(modelPauseSpendReduction), color:C.green},
                      {label:"Projected RSV impact",      value:fmtCurrency(modelPauseRSVImpact),      color:C.red},
                    ]},
                  { title:"Ad Group Bid Recommendations", count:AD_GROUP_RECS.length,
                    metrics:[
                      {label:"Projected spend change", value:(modelAgSpendChange>=0?"+":"")+fmtCurrency(modelAgSpendChange), color:modelAgSpendChange>0?C.yellow:C.green},
                      {label:"Projected RSV lift",     value:"+"+fmtCurrency(modelAgRSVLift), color:C.green},
                    ]},
                  { title:"Keyword Bid Recommendations", count:KEYWORD_RECS.length,
                    metrics:[
                      {label:"Projected spend change", value:(modelKwSpendChange>=0?"+":"")+fmtCurrency(modelKwSpendChange), color:modelKwSpendChange>0?C.yellow:C.green},
                      {label:"Projected RSV lift",     value:"+"+fmtCurrency(modelKwRSVLift), color:C.green},
                    ]},
                ].map((cat,i)=>(
                  <div key={i} className="card bg-base-100 border border-base-300 shadow-sm">
                    <div className="card-body p-4">
                      <div className="text-xs font-bold text-base-content/50 uppercase tracking-wide mb-1">{cat.title}</div>
                      <div className="text-xl font-bold text-base-content mb-3">{cat.count} recommendations</div>
                      {cat.metrics.map((m,j)=>(
                        <div key={j} className="flex justify-between items-baseline border-t border-base-200 pt-2 mt-2">
                          <span className="text-xs text-base-content/50">{m.label}</span>
                          <span className="text-xs font-bold" style={{color:m.color}}>{m.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── STEP 1: PAUSE ─────────────────────────────────────────────── */}
          {guidedStep===1&&(
            <div>
              <div className="mb-4">
                <h2 className="text-base font-bold text-base-content mb-1">Pause Recommendations</h2>
                <p className="text-xs text-base-content/50">Review ad groups recommended for pausing based on projected RSV, sales, and ROAS impact.</p>
              </div>

              {/* ScenarioImpactStrip — internals unchanged */}
              <ScenarioImpactStrip
                reviewedCount={pauseReviewedCount}
                pendingCount={PAUSE_RECS.length-pauseReviewedCount}
                modelMetrics={[
                  {label:"Recommendations",          value:PAUSE_RECS.length,                             color:C.purple},
                  {label:"Projected spend reduction", value:fmtCurrency(modelPauseSpendReduction),         color:C.green},
                  {label:"Projected RSV impact",     value:fmtCurrency(modelPauseRSVImpact),              color:C.red},
                  {label:"Average ROAS",             value:modelPauseROAS?`${modelPauseROAS}x`:"—",       color:C.purple},
                ]}
                acceptedMetrics={[
                  {label:"Accepted pauses",          value:pauseAcceptedCount,                            color:C.green},
                  {label:"Projected spend reduction", value:fmtCurrency(pauseSpendReduction),             color:C.green},
                  {label:"Projected RSV impact",     value:pauseAcceptedCount>0?fmtCurrency(pauseRSVImpact):"—", color:C.red},
                  {label:"Average ROAS",             value:modelPauseROAS?`${modelPauseROAS}x`:"—",       color:C.purple},
                ]}
              />

              {/* Table card */}
              <div className="card bg-base-100 border border-base-300 shadow-sm">
                <div className="card-body p-0">
                  <TableToolbar daisy allSelected={pauseAllSel} someSelected={pauseSomeSel} selSize={pauseSel.size} onToggleAll={pauseToggleAll} onAccept={pauseAccept} onDecline={pauseDecline} s={s}/>
                  <div className="overflow-x-auto">
                    <table className="table table-sm w-full">
                      <thead>
                        <tr className="text-xs font-semibold text-base-content/50 uppercase tracking-wide bg-base-200">
                          <th className="w-9"></th>
                          <th>Campaign</th>
                          <th>Ad Group</th>
                          <th>Current Spend</th>
                          <th>Current RSV</th>
                          <th>
                            Current ROAS
                            <div className="text-xs font-normal normal-case tracking-normal text-base-content/40 mt-0.5">Target ≥ 2.8x</div>
                          </th>
                          <th>Projected RSV Impact</th>
                          <th>Projected Spend Reduction</th>
                          <th>Decision</th>
                        </tr>
                      </thead>
                      <tbody>
                        {PAUSE_RECS.map(r=>{
                          const dec=pauseDec[r.id];
                          const rowCls=dec==="accepted"?"bg-success/5":dec==="declined"?"bg-error/5":"";
                          return (
                            <tr key={r.id} className={`${rowCls} hover:bg-base-200/50 transition-colors`}>
                              <td className="text-center">
                                <input type="checkbox" className="checkbox checkbox-xs" checked={pauseSel.has(r.id)} onChange={()=>pauseToggleRow(r.id)}/>
                              </td>
                              <td className="text-sm font-medium text-base-content">{r.campaign}</td>
                              <td className="text-sm text-base-content/70">{r.adGroup}</td>
                              <td className="text-sm">{fmtCurrency(r.currentSpend)}</td>
                              <td className="text-sm">{fmtCurrency(r.currentRSV)}</td>
                              <td className="text-sm font-semibold text-error">{r.currentROAS.toFixed(1)}x</td>
                              <td className="text-sm font-semibold text-error">
                                {fmtCurrency(r.rsvImpact)}
                                <div className="text-xs font-normal text-base-content/40 mt-0.5">{fmtPct((r.rsvImpact/r.currentRSV)*100)}</div>
                              </td>
                              <td className="text-sm font-semibold text-success">{fmtCurrency(r.projectedSpendReduction)}</td>
                              <td>
                                {!dec&&<span className="badge badge-sm badge-ghost">Pending</span>}
                                {dec==="accepted"&&<span className="badge badge-sm badge-success">Accepted</span>}
                                {dec==="declined"&&<span className="badge badge-sm badge-error">Declined</span>}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div className="px-4 py-2 bg-base-200 border-t border-base-300 text-xs text-base-content/50 flex items-center gap-3">
                    <span className="font-medium text-success">{pauseAcceptedCount} accepted</span>
                    <span>·</span>
                    <span className="font-medium text-error">{pauseDeclinedCount} declined</span>
                    <span>·</span>
                    <span>{PAUSE_RECS.length-pauseDecidedCount} pending</span>
                    {pauseSpendReduction>0&&(
                      <>
                        <span className="ml-auto font-semibold text-success">
                          Projected spend reduction: {fmtCurrency(pauseSpendReduction)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: AD GROUPS ─────────────────────────────────────────── */}
          {guidedStep===2&&(
            <div>
              <div className="mb-4">
                <h2 className="text-base font-bold text-base-content mb-1">Ad Group Bid Recommendations</h2>
                <p className="text-xs text-base-content/50">Review recommended bid changes for active ad groups before applying updates in Skai.</p>
              </div>

              <ScenarioImpactStrip
                reviewedCount={agReviewedCount}
                pendingCount={AD_GROUP_RECS.length-agReviewedCount}
                modelMetrics={[
                  {label:"Recommendations",      value:AD_GROUP_RECS.length,                           color:C.purple},
                  {label:"Projected spend change",value:(modelAgSpendChange>=0?"+":"")+fmtCurrency(modelAgSpendChange), color:modelAgSpendChange>0?C.yellow:C.green},
                  {label:"Projected RSV lift",   value:"+"+fmtCurrency(modelAgRSVLift),                color:C.green},
                  {label:"Projected ROAS",       value:modelAgROAS?`${modelAgROAS}x`:"—",              color:C.purple},
                ]}
                acceptedMetrics={[
                  {label:"Accepted changes",     value:agAcceptedCount,                                color:C.green},
                  {label:"Projected spend change",value:agAcceptedCount>0?(agSpendChange>=0?"+":"")+fmtCurrency(agSpendChange):"—", color:agSpendChange>0?C.yellow:C.green},
                  {label:"Projected RSV lift",   value:agAcceptedCount>0?"+"+fmtCurrency(agRSVLift):"—", color:C.green},
                  {label:"Projected ROAS",       value:agProjectedROAS?`${agProjectedROAS}x`:"—",        color:C.purple},
                ]}
              />

              <div className="card bg-base-100 border border-base-300 shadow-sm">
                <div className="card-body p-0">
                  <TableToolbar daisy allSelected={agAllSel} someSelected={agSomeSel} selSize={agSel.size} onToggleAll={agToggleAll} onAccept={agAccept} onDecline={agDecline} s={s}/>
                  <div className="overflow-x-auto">
                    <table className="table table-sm w-full">
                      <thead>
                        <tr className="text-xs font-semibold text-base-content/50 uppercase tracking-wide bg-base-200">
                          <th className="w-9"></th>
                          <th>Campaign</th>
                          <th>Ad Group</th>
                          <th>Current Bid</th>
                          <th>Recommended Bid</th>
                          <th>Bid Change</th>
                          <th>Baseline RSV</th>
                          <th>Optimized RSV</th>
                          <th>Spend Change</th>
                          <th>Opt. ROAS</th>
                          <th>Decision</th>
                        </tr>
                      </thead>
                      <tbody>
                        {AD_GROUP_RECS.map(r=>{
                          const dec=agDec[r.id];
                          const bidChangePct=((r.recommendedBid-r.currentBid)/r.currentBid)*100;
                          const isIncrease=r.spendChange>0;
                          const rowCls=dec==="accepted"?"bg-success/5":dec==="declined"?"bg-error/5":"";
                          return (
                            <tr key={r.id} className={`${rowCls} hover:bg-base-200/50 transition-colors`}>
                              <td className="text-center">
                                <input type="checkbox" className="checkbox checkbox-xs" checked={agSel.has(r.id)} onChange={()=>agToggleRow(r.id)}/>
                              </td>
                              <td className="text-sm font-medium text-base-content">{r.campaign}</td>
                              <td className="text-sm text-base-content/70">{r.adGroup}</td>
                              <td className="text-sm text-base-content/70">{fmtBid(r.currentBid)}</td>
                              <td className="text-sm font-semibold text-primary">{fmtBid(r.recommendedBid)}</td>
                              <td className={`text-sm font-semibold ${bidChangePct>=0?"text-info":"text-success"}`}>{fmtPct(bidChangePct)}</td>
                              <td className="text-sm text-base-content/70">{fmtCurrency(r.baselineRSV)}</td>
                              <td className="text-sm font-semibold text-primary">{fmtCurrency(r.optimizedRSV)}</td>
                              <td className={`text-sm font-semibold ${isIncrease?"text-warning":"text-success"}`}>
                                {isIncrease?"+":""}{fmtCurrency(r.spendChange)}
                              </td>
                              <td className="text-sm">{r.optimizedROAS.toFixed(1)}x</td>
                              <td>
                                {!dec&&<span className="badge badge-sm badge-ghost">Pending</span>}
                                {dec==="accepted"&&<span className="badge badge-sm badge-success">Accepted</span>}
                                {dec==="declined"&&<span className="badge badge-sm badge-error">Declined</span>}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div className="px-4 py-2 bg-base-200 border-t border-base-300 text-xs text-base-content/50 flex items-center gap-3">
                    <span className="font-medium text-success">{agAcceptedCount} accepted</span>
                    <span>·</span>
                    <span className="font-medium text-error">{agDeclinedCount} declined</span>
                    <span>·</span>
                    <span>{AD_GROUP_RECS.length-agDecidedCount} pending</span>
                    {agAcceptedCount>0&&(
                      <span className={`ml-auto font-semibold ${agSpendChange<=0?"text-success":"text-warning"}`}>
                        Projected spend change: {agSpendChange>=0?"+":""}{fmtCurrency(agSpendChange)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 3: KEYWORDS ──────────────────────────────────────────── */}
          {guidedStep===3&&(
            <div>
              <div className="mb-4">
                <h2 className="text-base font-bold text-base-content mb-1">Keyword Bid Recommendations</h2>
                <p className="text-xs text-base-content/50">Review keyword-level bid changes designed to improve the selected optimization target.</p>
              </div>

              <ScenarioImpactStrip
                reviewedCount={kwReviewedCount}
                pendingCount={KEYWORD_RECS.length-kwReviewedCount}
                modelMetrics={[
                  {label:"Recommendations",      value:KEYWORD_RECS.length,                            color:C.purple},
                  {label:"Projected spend change",value:(modelKwSpendChange>=0?"+":"")+fmtCurrency(modelKwSpendChange), color:modelKwSpendChange>0?C.yellow:C.green},
                  {label:"Projected RSV lift",   value:"+"+fmtCurrency(modelKwRSVLift),               color:C.green},
                  {label:"Projected ROAS",       value:modelKwROAS?`${modelKwROAS}x`:"—",             color:C.purple},
                ]}
                acceptedMetrics={[
                  {label:"Accepted changes",     value:kwAcceptedCount,                               color:C.green},
                  {label:"Projected spend change",value:kwAcceptedCount>0?(kwSpendChange>=0?"+":"")+fmtCurrency(kwSpendChange):"—", color:kwSpendChange>0?C.yellow:C.green},
                  {label:"Projected RSV lift",   value:kwAcceptedCount>0?"+"+fmtCurrency(kwRSVLift):"—", color:C.green},
                  {label:"Projected ROAS",       value:kwProjectedROAS?`${kwProjectedROAS}x`:"—",      color:C.purple},
                ]}
              />

              <div className="card bg-base-100 border border-base-300 shadow-sm">
                <div className="card-body p-0">
                  <TableToolbar daisy allSelected={kwAllSel} someSelected={kwSomeSel} selSize={kwSel.size} onToggleAll={kwToggleAll} onAccept={kwAccept} onDecline={kwDecline} s={s}/>
                  <div className="overflow-x-auto">
                    <table className="table table-sm w-full">
                      <thead>
                        <tr className="text-xs font-semibold text-base-content/50 uppercase tracking-wide bg-base-200">
                          <th className="w-9"></th>
                          <th>Campaign</th>
                          <th>Ad Group</th>
                          <th>Keyword</th>
                          <th>Match Type</th>
                          <th>Current Bid</th>
                          <th>Recommended Bid</th>
                          <th>Bid Change</th>
                          <th>Optimized RSV</th>
                          <th>Spend Change</th>
                          <th>Opt. ROAS</th>
                          <th>Decision</th>
                        </tr>
                      </thead>
                      <tbody>
                        {KEYWORD_RECS.map(r=>{
                          const dec=kwDec[r.id];
                          const bidChangePct=((r.recommendedBid-r.currentBid)/r.currentBid)*100;
                          const isIncrease=r.spendChange>0;
                          const rowCls=dec==="accepted"?"bg-success/5":dec==="declined"?"bg-error/5":"";
                          return (
                            <tr key={r.id} className={`${rowCls} hover:bg-base-200/50 transition-colors`}>
                              <td className="text-center">
                                <input type="checkbox" className="checkbox checkbox-xs" checked={kwSel.has(r.id)} onChange={()=>kwToggleRow(r.id)}/>
                              </td>
                              <td className="text-sm font-medium text-base-content">{r.campaign}</td>
                              <td className="text-sm text-base-content/70">{r.adGroup}</td>
                              <td className="text-sm text-base-content/70">{r.keyword}</td>
                              <td><span className="badge badge-sm badge-ghost">{r.matchType}</span></td>
                              <td className="text-sm text-base-content/70">{fmtBid(r.currentBid)}</td>
                              <td className="text-sm font-semibold text-primary">{fmtBid(r.recommendedBid)}</td>
                              <td className={`text-sm font-semibold ${bidChangePct>=0?"text-info":"text-success"}`}>{fmtPct(bidChangePct)}</td>
                              <td className="text-sm font-semibold text-primary">{fmtCurrency(r.optimizedRSV)}</td>
                              <td className={`text-sm font-semibold ${isIncrease?"text-warning":"text-success"}`}>
                                {isIncrease?"+":""}{fmtCurrency(r.spendChange)}
                              </td>
                              <td className="text-sm">{r.optimizedROAS.toFixed(1)}x</td>
                              <td>
                                {!dec&&<span className="badge badge-sm badge-ghost">Pending</span>}
                                {dec==="accepted"&&<span className="badge badge-sm badge-success">Accepted</span>}
                                {dec==="declined"&&<span className="badge badge-sm badge-error">Declined</span>}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div className="px-4 py-2 bg-base-200 border-t border-base-300 text-xs text-base-content/50 flex items-center gap-3">
                    <span className="font-medium text-success">{kwAcceptedCount} accepted</span>
                    <span>·</span>
                    <span className="font-medium text-error">{kwDeclinedCount} declined</span>
                    <span>·</span>
                    <span>{KEYWORD_RECS.length-kwDecidedCount} pending</span>
                    {kwAcceptedCount>0&&(
                      <span className={`ml-auto font-semibold ${kwSpendChange<=0?"text-success":"text-warning"}`}>
                        Projected spend change: {kwSpendChange>=0?"+":""}{fmtCurrency(kwSpendChange)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 4: REVIEW & PUSH ─────────────────────────────────────── */}
          {guidedStep===4&&(
            <div>
              {pushStatus==="success" ? (
                /* Success state */
                <div className="card bg-base-100 border border-base-300 shadow-sm max-w-lg">
                  <div className="card-body p-6">
                    <div className="text-lg font-extrabold text-success mb-1">Recommendations successfully pushed</div>
                    <p className="text-sm text-base-content/50 mb-4">
                      {totalAccepted} accepted changes pushed to <strong>Skai</strong> · {pushTimestamp}
                    </p>
                    <div className="flex gap-6 border-t border-base-300 pt-4">
                      <div>
                        <div className="text-xs text-base-content/40 mb-1">Net RSV lift</div>
                        <div className="text-base font-bold text-success">{fmtCurrency(projectedRSVLift)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-base-content/40 mb-1">Net spend change</div>
                        <div className={`text-base font-bold ${netSpendChangeG<=0?"text-success":"text-warning"}`}>
                          {netSpendChangeG>=0?"+":""}{fmtCurrency(netSpendChangeG)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-base-content/40 mb-1">Projected ROAS</div>
                        <div className="text-base font-bold text-primary">{projectedROAS?`${projectedROAS}x`:"—"}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Review header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-base font-bold text-base-content mb-1">Review &amp; Push</h2>
                      <p className="text-xs text-base-content/50">Confirm accepted recommendations and push approved changes to Skai.</p>
                    </div>
                    <span className={`badge badge-sm ml-4 shrink-0 ${readyToPush ? "badge-success" : "badge-ghost"}`}>
                      {readyToPush ? "Ready to push" : "No accepted changes"}
                    </span>
                  </div>

                  {/* Net impact card — bar chart internals unchanged */}
                  <div className="card bg-base-100 border border-base-300 shadow-sm mb-4" style={{borderColor:`${C.purple}44`}}>
                    <div className="card-body p-4">
                      <div className="text-sm font-bold text-base-content mb-3">Net impact of selected optimizations</div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
                        <div>
                          <div style={{marginBottom:14}}>
                            <div style={{fontSize:11,color:C.textMuted,marginBottom:6}}>Weekly spend</div>
                            {[{label:"Current",val:baselineSpendG,color:C.textSub},{label:"Optimized",val:optimizedSpendG,color:C.purple}].map((row,i)=>(
                              <div key={i} style={{marginBottom:5}}>
                                <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:11,color:row.color}}>{row.label}</span><span style={{fontSize:12,fontWeight:i===1?700:600,color:row.color}}>{fmtCurrency(row.val)}</span></div>
                                <div style={{height:7,background:C.borderLight,borderRadius:4}}><div style={{width:barWG(Math.max(0,row.val),spendMaxG),height:"100%",background:row.color,borderRadius:4}}/></div>
                              </div>
                            ))}
                          </div>
                          <div>
                            <div style={{fontSize:11,color:C.textMuted,marginBottom:6}}>Projected RSV</div>
                            {[{label:"Baseline",val:baselineRSVG,color:C.textSub},{label:"Optimized",val:optimizedRSVG,color:C.purple}].map((row,i)=>(
                              <div key={i} style={{marginBottom:5}}>
                                <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:11,color:row.color}}>{row.label}</span><span style={{fontSize:12,fontWeight:i===1?700:600,color:row.color}}>{fmtCurrency(row.val)}</span></div>
                                <div style={{height:7,background:C.borderLight,borderRadius:4}}><div style={{width:barWG(Math.max(0,row.val),rsvMaxG),height:"100%",background:row.color,borderRadius:4}}/></div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div style={{display:"flex",flexDirection:"column",justifyContent:"center",gap:14,borderLeft:`1px solid ${C.borderLight}`,paddingLeft:20}}>
                          <div><div style={{fontSize:11,color:C.textMuted,marginBottom:2}}>Net RSV lift</div><div style={{fontSize:26,fontWeight:800,color:projectedRSVLift>=0?C.green:C.red,letterSpacing:-0.5}}>{projectedRSVLift!==0?fmtCurrency(projectedRSVLift):"—"}</div></div>
                          <div><div style={{fontSize:11,color:C.textMuted,marginBottom:2}}>Net spend change</div><div style={{fontSize:26,fontWeight:800,color:netSpendChangeG<=0?C.green:C.yellow,letterSpacing:-0.5}}>{netSpendChangeG>=0?"+":""}{fmtCurrency(netSpendChangeG)}</div></div>
                          <div><div style={{fontSize:11,color:C.textMuted,marginBottom:2}}>Projected ROAS</div><div style={{fontSize:26,fontWeight:800,color:C.purple,letterSpacing:-0.5}}>{projectedROAS?`${projectedROAS}x`:"—"}</div></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Selected actions card */}
                  <div className="card bg-base-100 border border-base-300 shadow-sm mb-4">
                    <div className="card-body p-4">
                      <div className="text-sm font-bold text-base-content mb-3">Selected actions</div>
                      <div className="grid grid-cols-2 gap-0">
                        <div className="pr-5 border-r border-base-300">
                          <div className="text-xs font-semibold text-base-content/40 uppercase tracking-wide mb-2">Actions</div>
                          {[["Ad groups paused",pauseAcceptedCount],["Ad group bids updated",agAcceptedCount],["Keyword bids updated",kwAcceptedCount],["Total accepted changes",totalAccepted]].map(([label,val],i)=>(
                            <div key={i} className={`flex justify-between py-1.5 ${i<3?"border-b border-base-200":""}`}>
                              <span className={`text-xs ${i===3?"font-semibold text-base-content":"text-base-content/60"}`}>{label}</span>
                              <span className="text-xs font-semibold text-base-content">{val}</span>
                            </div>
                          ))}
                        </div>
                        <div className="pl-5">
                          <div className="text-xs font-semibold text-base-content/40 uppercase tracking-wide mb-2">Impact contribution</div>
                          {[
                            ["Pause spend change",    fmtCurrency(-pauseSpendReduction),"text-success"],
                            ["Pause RSV impact",      fmtCurrency(pauseRSVImpact),      pauseRSVImpact>=0?"text-success":"text-error"],
                            ["Ad Group spend change", (agSpendChange>=0?"+":"")+fmtCurrency(agSpendChange), agSpendChange>0?"text-warning":"text-success"],
                            ["Ad Group RSV lift",     agAcceptedCount>0?"+"+fmtCurrency(agRSVLift):"—", "text-success"],
                            ["Ad Group ROAS",         agProjectedROAS?`${agProjectedROAS}x`:"—", "text-primary"],
                            ["Keyword spend change",  (kwSpendChange>=0?"+":"")+fmtCurrency(kwSpendChange), kwSpendChange>0?"text-warning":"text-success"],
                            ["Keyword RSV lift",      kwAcceptedCount>0?"+"+fmtCurrency(kwRSVLift):"—", "text-success"],
                            ["Keyword ROAS",          kwProjectedROAS?`${kwProjectedROAS}x`:"—", "text-primary"],
                          ].map(([label,val,colorCls],i)=>(
                            <div key={i} className={`flex justify-between py-1.5 ${i<7?"border-b border-base-200":""}`}>
                              <span className="text-xs text-base-content/60">{label}</span>
                              <span className={`text-xs font-semibold ${colorCls}`}>{val}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

        </div>{/* end page content */}

        {/* ── GUIDED STICKY FOOTER ──────────────────────────────────────── */}
        <div className="fixed bottom-0 left-0 right-0 bg-base-100 border-t border-base-300 px-6 py-3 flex justify-end items-center gap-2 z-50" style={{boxShadow:"var(--shadow-md)"}}>
          {guidedStep===0&&(
            <>
              <button className="btn btn-sm btn-ghost" onClick={handleSaveDraft}>{savedDraft?"✓ Draft saved":"Save Draft"}</button>
              <button className="btn btn-sm btn-primary" onClick={()=>navigateGuided(1)}>Start Review →</button>
            </>
          )}
          {guidedStep===1&&(
            <>
              <button className="btn btn-sm btn-ghost" onClick={()=>navigateGuided(0)}>← Back to Overview</button>
              <button className="btn btn-sm btn-ghost" onClick={handleSaveDraft}>{savedDraft?"✓ Draft saved":"Save Draft"}</button>
              <button className={`btn btn-sm btn-primary ${!gCanContinuePause?"btn-disabled opacity-40":""}`} disabled={!gCanContinuePause} onClick={()=>navigateGuided(2)}>Continue to Ad Groups →</button>
            </>
          )}
          {guidedStep===2&&(
            <>
              <button className="btn btn-sm btn-ghost" onClick={()=>navigateGuided(1)}>← Back to Pause</button>
              <button className="btn btn-sm btn-ghost" onClick={handleSaveDraft}>{savedDraft?"✓ Draft saved":"Save Draft"}</button>
              <button className={`btn btn-sm btn-primary ${!gCanContinueAg?"btn-disabled opacity-40":""}`} disabled={!gCanContinueAg} onClick={()=>navigateGuided(3)}>Continue to Keywords →</button>
            </>
          )}
          {guidedStep===3&&(
            <>
              <button className="btn btn-sm btn-ghost" onClick={()=>navigateGuided(2)}>← Back to Ad Groups</button>
              <button className="btn btn-sm btn-ghost" onClick={handleSaveDraft}>{savedDraft?"✓ Draft saved":"Save Draft"}</button>
              <button className={`btn btn-sm btn-primary ${!gCanContinueKw?"btn-disabled opacity-40":""}`} disabled={!gCanContinueKw} onClick={()=>navigateGuided(4)}>Continue to Review →</button>
            </>
          )}
          {guidedStep===4&&pushStatus!=="success"&&(
            <>
              <button className="btn btn-sm btn-ghost" onClick={()=>navigateGuided(3)}>← Back to Keywords</button>
              <button className="btn btn-sm btn-ghost" onClick={handleSaveDraft}>{savedDraft?"✓ Draft saved":"Save Draft"}</button>
              {pushStatus==="idle"&&(
                <button
                  className={`btn btn-sm btn-success ${totalAccepted===0?"btn-disabled opacity-40":""}`}
                  disabled={totalAccepted===0}
                  onClick={handlePush}
                >
                  Push recommendations to Skai →
                </button>
              )}
              {pushStatus==="pushing"&&(
                <button className="btn btn-sm btn-ghost" disabled>
                  <span className="loading loading-spinner loading-xs"></span>
                  Pushing to Skai…
                </button>
              )}
            </>
          )}
          {guidedStep===4&&pushStatus==="success"&&(
            <button className="btn btn-sm btn-success btn-outline" disabled>✓ Pushed to Skai</button>
          )}
        </div>

      </div>
    );
  }

  // ── OPTION A (CONTAINED) MODE ─────────────────────────────────────────────
  return (
    <div style={s.page}>

      {/* TOP BAR */}
      <div style={s.topbar}>
        <div style={s.topLeft}>
          <span style={{fontWeight:700,fontSize:13,color:C.blue,letterSpacing:0.2}}>Galileo</span>
          <span style={{color:C.border}}>|</span>
          <span style={{fontSize:12,color:C.textSub}}>Campaign Management</span>
        </div>
        <div style={s.topRight}>
          <span style={{fontSize:12,color:C.textSub}}>Shirley Chisholm</span>
          <div style={s.avatar}>SC</div>
        </div>
      </div>

      <div style={s.main}>
        <a style={s.back} onClick={()=>setCurrentView("recommendations")}>← Back to Recommendations</a>

        {/* PAGE TITLE */}
        <div style={s.titleRow}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <h1 style={s.h1}>Weekly Bid Optimization — WK12</h1>
            <Badge color={pushStatus==="success"?"green":"yellow"}>{pushStatus==="success"?"Pushed":"Pending"}</Badge>
            <ModeSwitcher/>
          </div>
          <div style={s.sub}>Mar 17–23, 2026 · Walmart – US – Total Walmart</div>
        </div>

        {/* TARGET SELECTOR */}
        <div style={s.row}>
          <span style={{fontSize:12,fontWeight:600,color:C.textSub}}>Optimization Target</span>
          <Chip active={target==="RSV"} onClick={()=>setTarget("RSV")}>RSV</Chip>
          <Chip active={target==="Incremental Sales"} onClick={()=>setTarget("Incremental Sales")}>
            Incremental Sales&nbsp;<span style={{fontSize:10,fontWeight:600,background:"#FEF3C7",color:C.yellow,borderRadius:3,padding:"1px 5px",verticalAlign:"middle"}}>Preview</span>
          </Chip>
        </div>
        {target==="Incremental Sales"&&(
          <div style={{fontSize:12,color:C.textSub,background:"#ECEEF1",border:`1px solid ${C.border}`,borderRadius:6,padding:"8px 12px",marginBottom:16}}>
            Prototype preview — detailed incremental sales data will be connected in a later iteration.
          </div>
        )}

        {/* KPI CARDS */}
        <div style={s.kpiRow}>
          <KpiCard label="Current Weekly Spend"        value="$284K"  sub="Before selected recommendations"/>
          <KpiCard label="Optimized Attributed Sales" value="$1.42M" sub="+8.4% vs baseline"/>
          <KpiCard label="Optimized Total Sales"      value="$2.86M" sub="+6.2% vs baseline"/>
          <KpiCard label="Optimized ROAS"             value="5.0x"   sub="vs 4.6x baseline"/>
        </div>

        {/* FORECAST PANEL */}
        <div style={s.panel}>
          <div style={s.panelHead}>
            <span style={s.panelTitle}>{forecastTitle}</span>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              <FilterSelect label="Brand: All"/><FilterSelect label="Campaign: All"/>
              <FilterSelect label="Ad Group: All"/><FilterSelect label="Ad: All"/>
              <FilterSelect label="Keyword: All"/><FilterSelect label="View by: Weekly"/>
            </div>
          </div>
          <div style={s.panelBody}>
            <ForecastChart/>
            <div style={s.legend}>
              {legendItems.map(({label,color,dash})=>(
                <div key={label} style={s.legendItem}>
                  <div style={{width:24,height:2,background:dash?"transparent":color,borderTop:dash?`2px dashed ${color}`:"none",flexShrink:0}}/>
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RECOMMENDATION REVIEW PANEL */}
        <div style={s.panel}>
          <div style={s.panelHead}>
            <span style={s.panelTitle}>Recommendation Review</span>
            <Stepper active={activeStep-1}/>
          </div>

          {/* ── STEP 1 ────────────────────────────────────────────────────── */}
          {activeStep===1&&(
            <>
              <div style={s.stepHead}>
                <div style={{fontWeight:700,fontSize:14,marginBottom:4}}>Step 1 — Pause Recommendations</div>
                <div style={{fontSize:12,color:C.textSub}}>Review underperforming ad groups recommended for pausing and assess their projected spend and RSV impact.</div>
              </div>
              <TableToolbar allSelected={pauseAllSel} someSelected={pauseSomeSel} selSize={pauseSel.size} onToggleAll={pauseToggleAll} onAccept={pauseAccept} onDecline={pauseDecline} s={s}/>
              <div style={s.tableWrap}>
                <table style={s.table}>
                  <thead><tr>
                    <th style={{...s.th,width:36}}></th>
                    <th style={s.th}>Campaign</th><th style={s.th}>Ad Group</th>
                    <th style={s.th}>Current Spend</th><th style={s.th}>Current RSV</th>
                    <th style={s.th}>Current ROAS<div style={{fontSize:10,color:C.textMuted,fontWeight:400,textTransform:"none",letterSpacing:0,marginTop:1}}>Target ≥ 2.8x</div></th>
                    <th style={s.th}>Projected RSV Impact</th><th style={s.th}>Projected Spend Reduction</th><th style={s.th}>Decision</th>
                  </tr></thead>
                  <tbody>
                    {PAUSE_RECS.map(r=>{
                      const dec=pauseDec[r.id];
                      const rowBg=dec==="accepted"?C.greenLight:dec==="declined"?C.redLight:"#fff";
                      return (
                        <tr key={r.id} style={{background:rowBg}}>
                          <td style={{...s.td,textAlign:"center"}}><input type="checkbox" checked={pauseSel.has(r.id)} onChange={()=>pauseToggleRow(r.id)} style={{width:14,height:14,cursor:"pointer",accentColor:C.blue}}/></td>
                          <td style={s.td}><div style={{fontWeight:500}}>{r.campaign}</div></td>
                          <td style={s.td}>{r.adGroup}</td>
                          <td style={s.td}>{fmtCurrency(r.currentSpend)}</td>
                          <td style={s.td}>{fmtCurrency(r.currentRSV)}</td>
                          <td style={{...s.td,color:C.red}}>{r.currentROAS.toFixed(1)}x</td>
                          <td style={{...s.td,color:C.red,fontWeight:600}}>{fmtCurrency(r.rsvImpact)}<div style={{fontSize:11,fontWeight:400,color:C.textMuted,marginTop:1}}>{fmtPct((r.rsvImpact/r.currentRSV)*100)}</div></td>
                          <td style={{...s.td,color:C.green,fontWeight:600}}>{fmtCurrency(r.projectedSpendReduction)}</td>
                          <td style={s.td}>
                            {!dec&&<Badge color="gray">Pending</Badge>}
                            {dec==="accepted"&&<Badge color="green">Accepted</Badge>}
                            {dec==="declined"&&<Badge color="red">Declined</Badge>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div style={s.summaryRow}>
                <span>{pauseAcceptedCount} accepted · {pauseDeclinedCount} declined · {PAUSE_RECS.length-pauseDecidedCount} pending</span>
                {pauseSpendReduction>0&&<span style={{color:C.green,fontWeight:600}}>Projected spend reduction: {fmtCurrency(pauseSpendReduction)}</span>}
              </div>
            </>
          )}

          {/* ── STEP 2 ────────────────────────────────────────────────────── */}
          {activeStep===2&&(
            <>
              <div style={s.stepHead}>
                <div style={{fontWeight:700,fontSize:14,marginBottom:4}}>Step 2 — Ad Group Bid Recommendations</div>
                <div style={{fontSize:12,color:C.textSub}}>Review recommended ad group bid changes and assess their projected spend, RSV, and ROAS impact.</div>
              </div>
              <StepImpactSummary accepted={agAcceptedCount} spendChange={agAcceptedCount>0?agSpendChange:null} rsvLift={agAcceptedCount>0?agRSVLift:null} projROAS={agProjectedROAS}/>
              <TableToolbar allSelected={agAllSel} someSelected={agSomeSel} selSize={agSel.size} onToggleAll={agToggleAll} onAccept={agAccept} onDecline={agDecline} s={s}/>
              <div style={s.tableWrap}>
                <table style={s.table}>
                  <thead><tr>
                    <th style={{...s.th,width:36}}></th>
                    <th style={s.th}>Campaign</th><th style={s.th}>Ad Group</th>
                    <th style={s.th}>Current Bid</th><th style={s.th}>Recommended Bid</th>
                    <th style={s.th}>Bid Change</th><th style={s.th}>Baseline RSV</th>
                    <th style={s.th}>Optimized RSV</th><th style={s.th}>Spend Change</th>
                    <th style={s.th}>Opt. ROAS</th><th style={s.th}>Decision</th>
                  </tr></thead>
                  <tbody>
                    {AD_GROUP_RECS.map(r=>{
                      const dec=agDec[r.id];
                      const bidChangePct=((r.recommendedBid-r.currentBid)/r.currentBid)*100;
                      const isIncrease=r.spendChange>0;
                      return (
                        <tr key={r.id}>
                          <td style={{...s.td,textAlign:"center"}}><input type="checkbox" checked={agSel.has(r.id)} onChange={()=>agToggleRow(r.id)} style={{width:14,height:14,cursor:"pointer",accentColor:C.blue}}/></td>
                          <td style={s.td}><div style={{fontWeight:500}}>{r.campaign}</div></td>
                          <td style={s.td}>{r.adGroup}</td>
                          <td style={s.td}>{fmtBid(r.currentBid)}</td>
                          <td style={{...s.td,fontWeight:600}}>{fmtBid(r.recommendedBid)}</td>
                          <td style={{...s.td,color:bidChangePct>=0?C.blue:C.green,fontWeight:600}}>{fmtPct(bidChangePct)}</td>
                          <td style={s.td}>{fmtCurrency(r.baselineRSV)}</td>
                          <td style={{...s.td,color:C.purple,fontWeight:600}}>{fmtCurrency(r.optimizedRSV)}</td>
                          <td style={{...s.td,color:isIncrease?C.orange:C.green,fontWeight:600}}>
                            {isIncrease?"+":""}{fmtCurrency(r.spendChange)}
                            <div style={{fontSize:10,color:C.textMuted,fontWeight:400,marginTop:1}}>{isIncrease?"projected increase":"projected reduction"}</div>
                          </td>
                          <td style={s.td}>{r.optimizedROAS.toFixed(1)}x</td>
                          <td style={s.td}>
                            {!dec&&<Badge color="gray">Pending</Badge>}
                            {dec==="accepted"&&<Badge color="green">Accepted</Badge>}
                            {dec==="declined"&&<Badge color="red">Declined</Badge>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div style={s.summaryRow}>
                <span>{agAcceptedCount} accepted · {agDeclinedCount} declined · {AD_GROUP_RECS.length-agDecidedCount} pending</span>
                {agAcceptedCount>0&&<span style={{color:agSpendChange<=0?C.green:C.orange,fontWeight:600}}>Projected spend change: {agSpendChange>=0?"+":""}{fmtCurrency(agSpendChange)}</span>}
              </div>
            </>
          )}

          {/* ── STEP 3 ────────────────────────────────────────────────────── */}
          {activeStep===3&&(
            <>
              <div style={s.stepHead}>
                <div style={{fontWeight:700,fontSize:14,marginBottom:4}}>Step 3 — Keyword Bid Recommendations</div>
                <div style={{fontSize:12,color:C.textSub}}>Fine-tune keyword bids and review their projected spend, RSV, and ROAS impact.</div>
              </div>
              <StepImpactSummary accepted={kwAcceptedCount} spendChange={kwAcceptedCount>0?kwSpendChange:null} rsvLift={kwAcceptedCount>0?kwRSVLift:null} projROAS={kwProjectedROAS}/>
              <TableToolbar allSelected={kwAllSel} someSelected={kwSomeSel} selSize={kwSel.size} onToggleAll={kwToggleAll} onAccept={kwAccept} onDecline={kwDecline} s={s}/>
              <div style={s.tableWrap}>
                <table style={s.table}>
                  <thead><tr>
                    <th style={{...s.th,width:36}}></th>
                    <th style={s.th}>Campaign</th><th style={s.th}>Ad Group</th>
                    <th style={s.th}>Keyword</th><th style={s.th}>Match Type</th>
                    <th style={s.th}>Current Bid</th><th style={s.th}>Recommended Bid</th>
                    <th style={s.th}>Bid Change</th><th style={s.th}>Optimized RSV</th>
                    <th style={s.th}>Spend Change</th><th style={s.th}>Opt. ROAS</th>
                    <th style={s.th}>Decision</th>
                  </tr></thead>
                  <tbody>
                    {KEYWORD_RECS.map(r=>{
                      const dec=kwDec[r.id];
                      const bidChangePct=((r.recommendedBid-r.currentBid)/r.currentBid)*100;
                      const isIncrease=r.spendChange>0;
                      return (
                        <tr key={r.id}>
                          <td style={{...s.td,textAlign:"center"}}><input type="checkbox" checked={kwSel.has(r.id)} onChange={()=>kwToggleRow(r.id)} style={{width:14,height:14,cursor:"pointer",accentColor:C.blue}}/></td>
                          <td style={s.td}><div style={{fontWeight:500}}>{r.campaign}</div></td>
                          <td style={s.td}>{r.adGroup}</td>
                          <td style={s.td}>{r.keyword}</td>
                          <td style={s.td}><Badge color="gray">{r.matchType}</Badge></td>
                          <td style={s.td}>{fmtBid(r.currentBid)}</td>
                          <td style={{...s.td,fontWeight:600}}>{fmtBid(r.recommendedBid)}</td>
                          <td style={{...s.td,color:bidChangePct>=0?C.blue:C.green,fontWeight:600}}>{fmtPct(bidChangePct)}</td>
                          <td style={{...s.td,color:C.purple,fontWeight:600}}>{fmtCurrency(r.optimizedRSV)}</td>
                          <td style={{...s.td,color:isIncrease?C.orange:C.green,fontWeight:600}}>
                            {isIncrease?"+":""}{fmtCurrency(r.spendChange)}
                            <div style={{fontSize:10,color:C.textMuted,fontWeight:400,marginTop:1}}>{isIncrease?"projected increase":"projected reduction"}</div>
                          </td>
                          <td style={s.td}>{r.optimizedROAS.toFixed(1)}x</td>
                          <td style={s.td}>
                            {!dec&&<Badge color="gray">Pending</Badge>}
                            {dec==="accepted"&&<Badge color="green">Accepted</Badge>}
                            {dec==="declined"&&<Badge color="red">Declined</Badge>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div style={s.summaryRow}>
                <span>{kwAcceptedCount} accepted · {kwDeclinedCount} declined · {KEYWORD_RECS.length-kwDecidedCount} pending</span>
                {kwAcceptedCount>0&&<span style={{color:kwSpendChange<=0?C.green:C.orange,fontWeight:600}}>Projected spend change: {kwSpendChange>=0?"+":""}{fmtCurrency(kwSpendChange)}</span>}
              </div>
            </>
          )}

          {/* ── STEP 4: REVIEW & PUSH ─────────────────────────────────────── */}
          {activeStep===4&&(()=>{
            const pauseSpendChange=-pauseSpendReduction;
            const netSpendChange=pauseSpendChange+agSpendChange+kwSpendChange;
            const currentWeeklySpend=284000;
            const optimizedWeeklySpend=currentWeeklySpend+netSpendChange;
            const baselineRSV=1700000;
            const optimizedRSV=baselineRSV+projectedRSVLift;
            const card={background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:"16px 18px",marginBottom:14};
            const metric=(label,value,color)=><div><div style={{fontSize:11,color:C.textMuted,marginBottom:2}}>{label}</div><div style={{fontSize:22,fontWeight:800,color}}>{value}</div></div>;
            return (
              <div style={{padding:"20px"}}>
                {pushStatus==="success"?(
                  <div style={{maxWidth:560,margin:"0 auto",padding:"28px 0"}}>
                    <div style={{fontSize:18,fontWeight:800,color:C.green,marginBottom:6}}>Recommendations successfully pushed</div>
                    <div style={{fontSize:13,color:C.textSub,marginBottom:18}}>{totalAccepted} accepted changes sent to <strong>Skai</strong> · {pushTimestamp}</div>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:20,borderTop:`1px solid ${C.border}`,paddingTop:16}}>
                      {metric("Net RSV lift",fmtCurrency(projectedRSVLift),projectedRSVLift>=0?C.green:C.red)}
                      {metric("Net spend change",`${netSpendChange>=0?"+":""}${fmtCurrency(netSpendChange)}`,netSpendChange<=0?C.green:C.orange)}
                      {metric("Optimized weekly spend",fmtCurrency(optimizedWeeklySpend),C.purple)}
                    </div>
                  </div>
                ):(
                  <>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
                      <div>
                        <div style={{fontSize:15,fontWeight:700,marginBottom:3}}>Review &amp; Push</div>
                        <div style={{fontSize:12,color:C.textSub}}>Confirm the selected recommendations and their projected impact before sending changes to Skai.</div>
                      </div>
                      <Badge color={totalAccepted>0?"green":"gray"}>{totalAccepted>0?"Ready to push":"No accepted changes"}</Badge>
                    </div>
                    <div style={{...card,borderColor:C.purple+"44"}}>
                      <div style={{fontSize:13,fontWeight:700,marginBottom:12}}>Net impact of selected recommendations</div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24}}>
                        <div>
                          {[["Weekly spend",currentWeeklySpend,optimizedWeeklySpend],["Projected RSV",baselineRSV,optimizedRSV]].map(([label,current,optimized])=>(
                            <div key={label} style={{marginBottom:14}}>
                              <div style={{fontSize:11,color:C.textMuted,marginBottom:6}}>{label}</div>
                              <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}><span style={{color:C.textSub}}>Current</span><strong>{fmtCurrency(current)}</strong></div>
                              <div style={{display:"flex",justifyContent:"space-between",fontSize:12}}><span style={{color:C.purple}}>Optimized</span><strong style={{color:C.purple}}>{fmtCurrency(optimized)}</strong></div>
                            </div>
                          ))}
                        </div>
                        <div style={{display:"grid",gap:14,borderLeft:`1px solid ${C.borderLight}`,paddingLeft:20}}>
                          {metric("Net RSV lift",fmtCurrency(projectedRSVLift),projectedRSVLift>=0?C.green:C.red)}
                          {metric("Net spend change",`${netSpendChange>=0?"+":""}${fmtCurrency(netSpendChange)}`,netSpendChange<=0?C.green:C.orange)}
                          {metric("Projected ROAS",projectedROAS?`${projectedROAS}x`:"—",C.purple)}
                        </div>
                      </div>
                    </div>
                    <div style={card}>
                      <div style={{fontSize:13,fontWeight:700,marginBottom:12}}>Selected actions</div>
                      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
                        {[["Ad groups paused",pauseAcceptedCount],["Ad group bids",agAcceptedCount],["Keyword bids",kwAcceptedCount],["Total changes",totalAccepted]].map(([label,value])=>(
                          <div key={label}><div style={{fontSize:11,color:C.textMuted}}>{label}</div><div style={{fontSize:18,fontWeight:700,marginTop:2}}>{value}</div></div>
                        ))}
                      </div>
                    </div>
                    <div style={card}>
                      <div style={{fontSize:13,fontWeight:700,marginBottom:12}}>Impact contribution</div>
                      {[
                        ["Pause recommendations",pauseSpendChange,pauseRSVImpact,null],
                        ["Ad group bids",agSpendChange,agRSVLift,agProjectedROAS],
                        ["Keyword bids",kwSpendChange,kwRSVLift,kwProjectedROAS],
                      ].map(([label,spend,rsv,roas],i)=>(
                        <div key={label} style={{display:"grid",gridTemplateColumns:"1.5fr 1fr 1fr 0.8fr",gap:12,padding:"9px 0",borderTop:i?`1px solid ${C.borderLight}`:"none",alignItems:"center"}}>
                          <div style={{fontSize:12,fontWeight:600}}>{label}</div>
                          <div style={{fontSize:11,color:C.textSub}}>Spend <strong style={{color:spend<=0?C.green:C.orange}}>{spend>=0?"+":""}{fmtCurrency(spend)}</strong></div>
                          <div style={{fontSize:11,color:C.textSub}}>RSV <strong style={{color:rsv>=0?C.green:C.red}}>{fmtCurrency(rsv)}</strong></div>
                          <div style={{fontSize:11,color:C.textSub}}>ROAS <strong style={{color:C.purple}}>{roas?`${roas}x`:"—"}</strong></div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })()}

        </div>{/* end panel */}
      </div>{/* end main */}

      {/* STICKY FOOTER */}
      <div style={s.footer}>
        {activeStep===2&&<button style={s.btnGhost} onClick={()=>setActiveStep(1)} disabled={pushStatus==="pushing"}>← Back to Pause Recommendations</button>}
        {activeStep===3&&<button style={s.btnGhost} onClick={()=>setActiveStep(2)} disabled={pushStatus==="pushing"}>← Back to Ad Group Bids</button>}
        {activeStep===4&&pushStatus!=="success"&&<button style={s.btnGhost} onClick={()=>setActiveStep(3)} disabled={pushStatus==="pushing"}>← Back to Keyword Bids</button>}

        {pushStatus==="success"?(
          <button style={{...s.btnGhost,color:C.green,borderColor:C.green}} disabled>✓ Pushed to Skai</button>
        ):(
          <button style={{...s.btnGhost,color:savedDraft?C.green:undefined}} onClick={handleSaveDraft} disabled={pushStatus==="pushing"}>
            {savedDraft?"✓ Draft saved":"Save Draft"}
          </button>
        )}

        {activeStep===1&&<button style={{...s.btnPrimary,opacity:canContinueStep1?1:0.4,cursor:canContinueStep1?"pointer":"not-allowed"}} disabled={!canContinueStep1} onClick={()=>setActiveStep(2)}>Continue to Ad Group Bids →</button>}
        {activeStep===2&&<button style={{...s.btnPrimary,opacity:canContinueStep2?1:0.4,cursor:canContinueStep2?"pointer":"not-allowed"}} disabled={!canContinueStep2} onClick={()=>setActiveStep(3)}>Continue to Keyword Bids →</button>}
        {activeStep===3&&<button style={{...s.btnPrimary,opacity:canContinueStep3?1:0.4,cursor:canContinueStep3?"pointer":"not-allowed"}} disabled={!canContinueStep3} onClick={()=>setActiveStep(4)}>Continue to Review & Push →</button>}
        {activeStep===4&&pushStatus==="idle"&&(
          <button style={{...s.btnGreen,opacity:canPush?1:0.4,cursor:canPush?"pointer":"not-allowed"}} disabled={!canPush} onClick={handlePush}>
            Push recommendations to Skai →
          </button>
        )}
        {activeStep===4&&pushStatus==="pushing"&&(
          <button style={{...s.btnGhost}} disabled>Pushing recommendations to Skai…</button>
        )}
      </div>

    </div>
  );
}
