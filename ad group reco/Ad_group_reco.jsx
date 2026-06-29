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
  {id:1,campaign:"Cheetos — Display Prospecting",  adGroup:"Cheetos Puffs Awareness",    currentSpend:3200,currentRSV:7800, currentROAS:2.4,rsvImpact:-420, spendReleased:3200},
  {id:2,campaign:"Tostitos — Display NB",          adGroup:"Tostitos Party Size NB",     currentSpend:2750,currentRSV:6100, currentROAS:2.2,rsvImpact:-310, spendReleased:2750},
  {id:3,campaign:"Lay's — Display Retarget",       adGroup:"Lay's Stax Low-Intent RT",   currentSpend:1840,currentRSV:4600, currentROAS:2.5,rsvImpact:-190, spendReleased:1840},
  {id:4,campaign:"Doritos — Sponsored Products NB",adGroup:"Doritos NB Generic KW",      currentSpend:2100,currentRSV:5400, currentROAS:2.6,rsvImpact:-280, spendReleased:2100},
  {id:5,campaign:"Quaker — Display Prospecting",   adGroup:"Quaker Granola Bars Cold",   currentSpend:1100,currentRSV:2700, currentROAS:2.5,rsvImpact:-140, spendReleased:1100},
  {id:6,campaign:"Gatorade — Display NB",          adGroup:"Gatorade Zero Awareness",    currentSpend:3900,currentRSV:9200, currentROAS:2.4,rsvImpact:-510, spendReleased:3900},
  {id:7,campaign:"Pepsi — Sponsored Display",      adGroup:"Pepsi Wild Cherry RT Broad", currentSpend:1650,currentRSV:3900, currentROAS:2.4,rsvImpact:-200, spendReleased:1650},
  {id:8,campaign:"Lay's — Sponsored Products NB",  adGroup:"Lay's Kettle Chip Generic",  currentSpend:980, currentRSV:2500, currentROAS:2.6,rsvImpact:-120, spendReleased:980 },
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

// ── BUDGET TRANSITION DELTA ───────────────────────────────────────────────────
// Returns the net budget impact of accepting a bid-change row,
// accounting for its current decision state to avoid double-counting.
function transitionDelta(currentDec, spendChange) {
  // Already accepted → accepting again changes nothing
  if (currentDec === "accepted") return 0;
  // Pending or Declined → Accepted: apply the full budget impact
  if (spendChange > 0) return -spendChange;   // increase consumes budget
  return Math.abs(spendChange);               // decrease frees budget
}

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

function TableToolbar({ allSelected, someSelected, selSize, onToggleAll, onAccept, onDecline, s }) {
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
                background:"none",border:"none",cursor:canClick?"pointer":"default",
                padding:"6px 10px",borderRadius:6,
                background: curr ? C.blueLight : "none",
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
  const cols = modelMetrics.map((m,i)=>({
    label: m.label,
    modelVal: m.value,
    modelColor: m.color,
    acceptedVal: acceptedMetrics[i].value,
    acceptedColor: acceptedMetrics[i].color,
  }));
  return (
    <div style={{
      background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,
      marginBottom:16,overflow:"hidden",
    }}>
      <div style={{display:"flex",borderBottom:`1px solid ${C.border}`}}>
        {/* Label column */}
        <div style={{width:160,flexShrink:0,borderRight:`1px solid ${C.border}`,padding:"10px 14px"}}>
          <div style={{fontSize:10,color:C.textMuted,fontWeight:600,textTransform:"uppercase",letterSpacing:0.4,marginBottom:2}}>Metric</div>
        </div>
        {/* Model scenario */}
        <div style={{flex:1,borderRight:`1px solid ${C.border}`,padding:"10px 14px",background:"#FAF8FF"}}>
          <div style={{fontSize:10,fontWeight:700,color:C.purple,textTransform:"uppercase",letterSpacing:0.4}}>Model scenario</div>
          <div style={{fontSize:10,color:C.textMuted,marginTop:1}}>All recommendations</div>
        </div>
        {/* Your scenario */}
        <div style={{flex:1,padding:"10px 14px",background:"#F0FBF4"}}>
          <div style={{fontSize:10,fontWeight:700,color:C.green,textTransform:"uppercase",letterSpacing:0.4}}>Your accepted scenario</div>
          <div style={{fontSize:10,color:C.textMuted,marginTop:1}}>{reviewedCount} reviewed · {pendingCount} pending</div>
        </div>
      </div>
      {cols.map((col,i)=>(
        <div key={i} style={{display:"flex",borderBottom:i<cols.length-1?`1px solid ${C.borderLight}`:"none"}}>
          <div style={{width:160,flexShrink:0,borderRight:`1px solid ${C.border}`,padding:"8px 14px",fontSize:12,color:C.textSub,fontWeight:500}}>{col.label}</div>
          <div style={{flex:1,borderRight:`1px solid ${C.border}`,padding:"8px 14px",background:"#FAF8FF"}}>
            <span style={{fontSize:13,fontWeight:700,color:col.modelColor||C.purple}}>{col.modelVal}</span>
          </div>
          <div style={{flex:1,padding:"8px 14px",background:"#F0FBF4"}}>
            <span style={{fontSize:13,fontWeight:700,color:col.acceptedColor||C.green}}>{col.acceptedVal}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── BUDGET STRIP ──────────────────────────────────────────────────────────────
function BudgetStrip({items}) {
  return (
    <div style={{display:"flex",gap:0,borderBottom:`1px solid ${C.border}`,background:C.bg}}>
      {items.map(({label,value,color},i)=>(
        <div key={i} style={{flex:1,padding:"10px 14px",borderRight:i<items.length-1?`1px solid ${C.border}`:"none"}}>
          <div style={{fontSize:10,color:C.textMuted,fontWeight:600,textTransform:"uppercase",letterSpacing:0.4,marginBottom:3}}>{label}</div>
          <div style={{fontSize:15,fontWeight:700,color}}>{fmtCurrency(value)}</div>
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
  const [agBudgetError,setAgBudgetError] = useState(null);
  const [kwBudgetError,setKwBudgetError] = useState(null);

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

  const releasedSpend=useMemo(()=>PAUSE_RECS.filter(r=>pauseDec[r.id]==="accepted").reduce((s,r)=>s+r.spendReleased,0),[pauseDec]);
  const pauseDecidedCount=Object.keys(pauseDec).length;
  const pauseAcceptedCount=Object.values(pauseDec).filter(v=>v==="accepted").length;
  const pauseDeclinedCount=Object.values(pauseDec).filter(v=>v==="declined").length;
  const pauseRSVImpact=useMemo(()=>PAUSE_RECS.filter(r=>pauseDec[r.id]==="accepted").reduce((s,r)=>s+r.rsvImpact,0),[pauseDec]);

  // ── AD GROUP BIDS ─────────────────────────────────────────────────────────
  const agSel=selected.adGroup, agDec=decisions.adGroup;
  const agAllIds=AD_GROUP_RECS.map(r=>r.id);
  const agAllSel=agAllIds.every(id=>agSel.has(id));
  const agSomeSel=agSel.size>0&&!agAllSel;
  const setAgSel=fn=>setSelected(p=>({...p,adGroup:fn(p.adGroup)}));
  const setAgDec=fn=>setDecisions(p=>({...p,adGroup:fn(p.adGroup)}));
  const agToggleAll=()=>setAgSel(s=>agAllSel?new Set():new Set(agAllIds));
  const agToggleRow=id=>{setAgBudgetError(null);setAgSel(s=>{const n=new Set(s);n.has(id)?n.delete(id):n.add(id);return n;});};

  const agSavings  =useMemo(()=>AD_GROUP_RECS.filter(r=>agDec[r.id]==="accepted"&&r.spendChange<0).reduce((s,r)=>s+Math.abs(r.spendChange),0),[agDec]);
  const agAllocated=useMemo(()=>AD_GROUP_RECS.filter(r=>agDec[r.id]==="accepted"&&r.spendChange>0).reduce((s,r)=>s+r.spendChange,0),[agDec]);
  const agDecidedCount  =Object.keys(agDec).length;
  const agAcceptedCount =Object.values(agDec).filter(v=>v==="accepted").length;
  const agDeclinedCount =Object.values(agDec).filter(v=>v==="declined").length;
  const agRSVLift=useMemo(()=>AD_GROUP_RECS.filter(r=>agDec[r.id]==="accepted").reduce((s,r)=>s+(r.optimizedRSV-r.baselineRSV),0),[agDec]);

  const agAccept=()=>{
    // Transition-based delta: skip rows already accepted.
    // Include existing keyword decisions so backward edits can't create a global deficit.
    const delta=AD_GROUP_RECS.filter(r=>agSel.has(r.id)).reduce((s,r)=>s+transitionDelta(agDec[r.id],r.spendChange),0);
    const projected=releasedSpend+agSavings-agAllocated+kwSavings-kwAllocated+delta;
    if(projected<0){setAgBudgetError(Math.abs(projected));return;}
    setAgBudgetError(null);
    setAgDec(p=>{const n={...p};agSel.forEach(id=>{n[id]="accepted";});return n;});
    setAgSel(()=>new Set());
  };
  const agDecline=()=>{setAgBudgetError(null);setAgDec(p=>{const n={...p};agSel.forEach(id=>{n[id]="declined";});return n;});setAgSel(()=>new Set());};

  // ── KEYWORD BIDS ─────────────────────────────────────────────────────────
  const kwSel=selected.keyword, kwDec=decisions.keyword;
  const kwAllIds=KEYWORD_RECS.map(r=>r.id);
  const kwAllSel=kwAllIds.every(id=>kwSel.has(id));
  const kwSomeSel=kwSel.size>0&&!kwAllSel;
  const setKwSel=fn=>setSelected(p=>({...p,keyword:fn(p.keyword)}));
  const setKwDec=fn=>setDecisions(p=>({...p,keyword:fn(p.keyword)}));
  const kwToggleAll=()=>setKwSel(s=>kwAllSel?new Set():new Set(kwAllIds));
  const kwToggleRow=id=>{setKwBudgetError(null);setKwSel(s=>{const n=new Set(s);n.has(id)?n.delete(id):n.add(id);return n;});};

  const kwSavings  =useMemo(()=>KEYWORD_RECS.filter(r=>kwDec[r.id]==="accepted"&&r.spendChange<0).reduce((s,r)=>s+Math.abs(r.spendChange),0),[kwDec]);
  const kwAllocated=useMemo(()=>KEYWORD_RECS.filter(r=>kwDec[r.id]==="accepted"&&r.spendChange>0).reduce((s,r)=>s+r.spendChange,0),[kwDec]);
  const kwDecidedCount  =Object.keys(kwDec).length;
  const kwAcceptedCount =Object.values(kwDec).filter(v=>v==="accepted").length;
  const kwDeclinedCount =Object.values(kwDec).filter(v=>v==="declined").length;
  const kwRSVLift=useMemo(()=>KEYWORD_RECS.filter(r=>kwDec[r.id]==="accepted").reduce((s,r)=>s+(r.optimizedRSV-r.baselineRSV),0),[kwDec]);

  // Budget carried into Step 3 = releasedSpend + agSavings - agAllocated
  const budgetAfterAg=useMemo(()=>releasedSpend+agSavings-agAllocated,[releasedSpend,agSavings,agAllocated]);

  const kwAccept=()=>{
    const delta=KEYWORD_RECS.filter(r=>kwSel.has(r.id)).reduce((s,r)=>s+transitionDelta(kwDec[r.id],r.spendChange),0);
    const projected=budgetAfterAg+kwSavings-kwAllocated+delta;
    if(projected<0){setKwBudgetError(Math.abs(projected));return;}
    setKwBudgetError(null);
    setKwDec(p=>{const n={...p};kwSel.forEach(id=>{n[id]="accepted";});return n;});
    setKwSel(()=>new Set());
  };
  const kwDecline=()=>{setKwBudgetError(null);setKwDec(p=>{const n={...p};kwSel.forEach(id=>{n[id]="declined";});return n;});setKwSel(()=>new Set());};

  // ── GLOBAL BUDGET ─────────────────────────────────────────────────────────
  const globalRemaining=useMemo(()=>releasedSpend+agSavings-agAllocated+kwSavings-kwAllocated,[releasedSpend,agSavings,agAllocated,kwSavings,kwAllocated]);
  const budgetDeficit=globalRemaining<0;

  // ── REVIEW & PUSH METRICS ─────────────────────────────────────────────────
  const totalAccepted=pauseAcceptedCount+agAcceptedCount+kwAcceptedCount;
  const projectedRSVLift=pauseRSVImpact+agRSVLift+kwRSVLift;
  const acceptedBidRecs=useMemo(()=>[...AD_GROUP_RECS.filter(r=>agDec[r.id]==="accepted"),...KEYWORD_RECS.filter(r=>kwDec[r.id]==="accepted")],[agDec,kwDec]);
  const projectedROAS=useMemo(()=>{
    if(acceptedBidRecs.length===0) return null;
    const weighted=acceptedBidRecs.reduce((s,r)=>s+r.optimizedROAS*r.optimizedRSV,0);
    const totalRSV=acceptedBidRecs.reduce((s,r)=>s+r.optimizedRSV,0);
    return totalRSV>0?(weighted/totalRSV).toFixed(1):null;
  },[acceptedBidRecs]);

  // ── NAVIGATION GUARDS (Option A) ─────────────────────────────────────────
  const canContinueStep1=pauseDecidedCount>0;
  const canContinueStep2=agDecidedCount>0&&!budgetDeficit;
  const canContinueStep3=kwDecidedCount>0&&!budgetDeficit;
  const canPush=!budgetDeficit&&totalAccepted>0&&pushStatus==="idle";

  // ── GUIDED NAVIGATION ─────────────────────────────────────────────────────
  const navigateGuided = (i) => {
    setGuidedStep(i);
    setGuidedVisitedMax(prev=>Math.max(prev,i));
  };

  // ── MODEL SCENARIO CALCULATIONS ──────────────────────────────────────────
  // Pause model scenario
  const modelPauseSpendReduction = useMemo(()=>PAUSE_RECS.reduce((s,r)=>s+r.spendReleased,0),[]);
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

  // Accepted ROAS for ad groups
  const acceptedAgROAS = useMemo(()=>{
    const rows=AD_GROUP_RECS.filter(r=>agDec[r.id]==="accepted");
    if(!rows.length) return null;
    const w=rows.reduce((s,r)=>s+r.optimizedROAS*r.optimizedRSV,0);
    const t=rows.reduce((s,r)=>s+r.optimizedRSV,0);
    return t>0?(w/t).toFixed(1):null;
  },[agDec]);

  // Accepted ROAS for keywords
  const acceptedKwROAS = useMemo(()=>{
    const rows=KEYWORD_RECS.filter(r=>kwDec[r.id]==="accepted");
    if(!rows.length) return null;
    const w=rows.reduce((s,r)=>s+r.optimizedROAS*r.optimizedRSV,0);
    const t=rows.reduce((s,r)=>s+r.optimizedRSV,0);
    return t>0?(w/t).toFixed(1):null;
  },[kwDec]);

  // Accepted ROAS for pauses (current ROAS of accepted rows)
  const acceptedPauseROAS = useMemo(()=>{
    const rows=PAUSE_RECS.filter(r=>pauseDec[r.id]==="accepted");
    if(!rows.length) return null;
    const totalRSV=rows.reduce((s,r)=>s+r.currentRSV,0);
    const totalSp=rows.reduce((s,r)=>s+r.currentSpend,0);
    return totalSp>0?(totalRSV/totalSp).toFixed(1):null;
  },[pauseDec]);

  // Accepted pause spend reduction
  const acceptedPauseSpendReduction=useMemo(()=>PAUSE_RECS.filter(r=>pauseDec[r.id]==="accepted").reduce((s,r)=>s+r.spendReleased,0),[pauseDec]);
  // accepted ag spend change
  const acceptedAgSpendChange=useMemo(()=>AD_GROUP_RECS.filter(r=>agDec[r.id]==="accepted").reduce((s,r)=>s+r.spendChange,0),[agDec]);
  // accepted kw spend change
  const acceptedKwSpendChange=useMemo(()=>KEYWORD_RECS.filter(r=>kwDec[r.id]==="accepted").reduce((s,r)=>s+r.spendChange,0),[kwDec]);

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

  const RecommendationsPage = () => (
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

      <div style={{...s.main, maxWidth:1160}}>
        {/* PAGE TITLE */}
        <div style={{marginBottom:20}}>
          <h1 style={{...s.h1, fontSize:17, marginBottom:4}}>Campaign Optimization Recommendations</h1>
          <div style={{fontSize:12,color:C.textSub}}>Review AI-generated optimization packages, assess projected impact, and apply approved changes to Skai.</div>
        </div>

        {/* KPI SUMMARY */}
        <div style={{display:"flex",gap:12,marginBottom:20}}>
          {[
            {label:"Projected RSV opportunity", value:"+$48.1K", sub:"Across pending recommendations", color:C.green},
            {label:"Pending reviews",           value:String(pendingCount), sub:"Action required",              color:pendingCount>0?C.yellow:C.textSub},
            {label:"Applied this month",        value:String(appliedCount), sub:"Packages pushed to Skai",      color:C.text},
            {label:"Spend reallocated",         value:"$27.4K", sub:"Across applied packages",         color:C.text},
          ].map(({label,value,sub,color},i)=>(
            <div key={i} style={{flex:1,background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:"14px 18px"}}>
              <div style={{fontSize:11,color:C.textMuted,fontWeight:600,textTransform:"uppercase",letterSpacing:0.4,marginBottom:4}}>{label}</div>
              <div style={{fontSize:22,fontWeight:700,color,letterSpacing:-0.5,marginBottom:2}}>{value}</div>
              <div style={{fontSize:11,color:C.textSub}}>{sub}</div>
            </div>
          ))}
        </div>

        {/* RECOMMENDATIONS CARD */}
        <div style={s.panel}>
          <div style={{...s.panelHead, flexDirection:"column", alignItems:"flex-start", gap:4}}>
            <span style={s.panelTitle}>My Recommendations</span>
            <span style={{fontSize:12,color:C.textSub}}>Open a recommendation package to review projected impact, approve changes, and submit updates to Skai.</span>
          </div>

          {/* Visual-only tabs */}
          <div style={{display:"flex",borderBottom:`1px solid ${C.border}`,padding:"0 16px"}}>
            {["All","Pending","Applied","Rejected","Expired"].map((tab,i)=>(
              <div key={tab} style={{padding:"9px 14px",fontSize:13,fontWeight:i===0?700:500,color:i===0?C.blue:C.textSub,borderBottom:i===0?`2px solid ${C.blue}`:"2px solid transparent",cursor:"default",marginBottom:-1}}>{tab}</div>
            ))}
          </div>

          {/* TABLE */}
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Recommendation</th>
                  <th style={s.th}>Retailer / Customer group</th>
                  <th style={s.th}>Optimization target</th>
                  <th style={s.th}>Recommended changes</th>
                  <th style={s.th}>Projected RSV impact</th>
                  <th style={s.th}>Projected spend change</th>
                  <th style={s.th}>Status</th>
                  <th style={s.th}>Created</th>
                </tr>
              </thead>
              <tbody>
                {RECS_LIST.map(r=>{
                  const rowStatus = r.statusKey==="wk12" ? wk12Status : r.status;
                  const isClickable = r.id==="wk12" || rowStatus==="Applied";
                  const handleRowClick = r.id==="wk12" ? ()=>setCurrentView("optimization") : undefined;
                  return (
                    <tr key={r.id} style={{background:"#fff"}}>
                      <td style={s.td}>
                        <div style={{display:"flex",flexDirection:"column",gap:2}}>
                          <span
                            onClick={handleRowClick}
                            style={{fontWeight:700,color:isClickable?C.blue:C.text,cursor:isClickable?"pointer":"default",fontSize:13}}
                          >{r.label}</span>
                          <span style={{fontSize:11,color:C.textMuted}}>{r.dateRange}</span>
                        </div>
                      </td>
                      <td style={s.td}>{r.retailer}</td>
                      <td style={s.td}>{r.optTarget}</td>
                      <td style={{...s.td,fontSize:12,color:C.textSub}}>{r.changes}</td>
                      <td style={{...s.td,fontWeight:600,color:r.rsvImpact>0?C.green:C.red}}>
                        {r.rsvImpact>0?"+":""}{fmtCurrency(r.rsvImpact)}
                      </td>
                      <td style={{...s.td,fontWeight:600,color:r.spendChange<0?C.green:"#D97706"}}>
                        {r.spendChange>=0?"+":""}{fmtCurrency(r.spendChange)}
                      </td>
                      <td style={s.td}><Badge color={statusColor[rowStatus]||"gray"}>{rowStatus}</Badge></td>
                      <td style={{...s.td,color:C.textSub,fontSize:12}}>{r.created}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
    const netSpendChangeG = acceptedAgSpendChange + acceptedKwSpendChange - acceptedPauseSpendReduction;
    const baselineSpendG  = 284000;
    const baselineRSVG    = 1700000;
    const optimizedSpendG = baselineSpendG + netSpendChangeG;
    const optimizedRSVG   = baselineRSVG + projectedRSVLift;
    const barWG = (val, max) => `${Math.min(100, Math.max(4, (val / max) * 100)).toFixed(1)}%`;
    const spendMaxG = Math.max(baselineSpendG, Math.abs(optimizedSpendG)) * 1.05;
    const rsvMaxG   = Math.max(baselineRSVG, Math.abs(optimizedRSVG)) * 1.05;
    const readinessG = totalAccepted===0
      ? { label:"No accepted changes — accept at least one recommendation", color:C.textSub, bg:C.bg, border:C.border }
      : { label:"Ready to push", color:C.green, bg:"#F0FBF4", border:C.green };

    return (
      <div style={s.page}>
        <PageTopBar/>
        <div style={{maxWidth:1160,margin:"0 auto",padding:"20px 24px 80px"}}>

          {/* BACK + TITLE ROW */}
          <a style={s.back} onClick={()=>setCurrentView("recommendations")}>← Back to Recommendations</a>
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:12}}>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:3}}>
                <h1 style={s.h1}>Weekly Bid Optimization — WK12</h1>
                <Badge color={pushStatus==="success"?"green":"yellow"}>{pushStatus==="success"?"Pushed":"Pending"}</Badge>
              </div>
              <div style={s.sub}>Mar 17–23, 2026 · Walmart – US – Total Walmart · Target: {target}</div>
            </div>
            <ModeSwitcher/>
          </div>

          {/* GUIDED STEPPER */}
          <div style={{marginBottom:20}}>
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

          {/* ── STEP 0: OVERVIEW ─────────────────────────────────────────── */}
          {guidedStep===0&&(
            <div>
              <div style={{marginBottom:20}}>
                <h2 style={{fontSize:15,fontWeight:700,color:C.text,margin:"0 0 4px"}}>Weekly Optimization Overview</h2>
                <div style={{fontSize:12,color:C.textSub}}>Review the model's projected opportunity before evaluating individual recommendations.</div>
              </div>

              {/* KPI cards — model scenario values */}
              <div style={{display:"flex",gap:12,marginBottom:16}}>
                <KpiCard label="Current Weekly Spend"    value="$261K"   sub="Baseline this week"/>
                <KpiCard label="Projected Optimized Spend" value="$284K" sub="+8.8% vs current"/>
                <KpiCard label="Projected RSV Lift"      value="+$32.4K" sub="Across all model recs"/>
                <KpiCard label="Projected ROAS"          value="5.1x"    sub="Model scenario"/>
              </div>

              {/* Forecast panel */}
              <div style={s.panel}>
                <div style={s.panelHead}>
                  <span style={s.panelTitle}>Projected RSV Performance</span>
                  <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                    <FilterSelect label="Brand: All"/><FilterSelect label="Campaign: All"/><FilterSelect label="View by: Weekly"/>
                  </div>
                </div>
                <div style={s.panelBody}>
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

              {/* Recommendation categories */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:20}}>
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
                  <div key={i} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:"14px 16px"}}>
                    <div style={{fontSize:11,fontWeight:700,color:C.textSub,textTransform:"uppercase",letterSpacing:0.4,marginBottom:6}}>{cat.title}</div>
                    <div style={{fontSize:20,fontWeight:700,color:C.text,marginBottom:10}}>{cat.count} recommendations</div>
                    {cat.metrics.map((m,j)=>(
                      <div key={j} style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",borderTop:`1px solid ${C.borderLight}`,paddingTop:6,marginTop:6}}>
                        <span style={{fontSize:11,color:C.textSub}}>{m.label}</span>
                        <span style={{fontSize:12,fontWeight:700,color:m.color}}>{m.value}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── STEP 1: PAUSE ────────────────────────────────────────────── */}
          {guidedStep===1&&(
            <div>
              <div style={{marginBottom:16}}>
                <h2 style={{fontSize:15,fontWeight:700,color:C.text,margin:"0 0 4px"}}>Pause Recommendations</h2>
                <div style={{fontSize:12,color:C.textSub}}>Review underperforming ad groups and decide which pause recommendations should be included in your scenario.</div>
              </div>

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
                  {label:"Projected spend reduction", value:fmtCurrency(acceptedPauseSpendReduction),      color:C.green},
                  {label:"Projected RSV impact",     value:pauseAcceptedCount>0?fmtCurrency(pauseRSVImpact):"—", color:C.red},
                  {label:"Average ROAS",             value:acceptedPauseROAS?`${acceptedPauseROAS}x`:"—", color:C.purple},
                ]}
              />

              <div style={s.panel}>
                <TableToolbar allSelected={pauseAllSel} someSelected={pauseSomeSel} selSize={pauseSel.size} onToggleAll={pauseToggleAll} onAccept={pauseAccept} onDecline={pauseDecline} s={s}/>
                <div style={s.tableWrap}>
                  <table style={s.table}>
                    <thead><tr>
                      <th style={{...s.th,width:36}}></th>
                      <th style={s.th}>Campaign</th><th style={s.th}>Ad Group</th>
                      <th style={s.th}>Current Spend</th><th style={s.th}>Current RSV</th>
                      <th style={s.th}>Current ROAS<div style={{fontSize:10,color:C.textMuted,fontWeight:400,textTransform:"none",letterSpacing:0,marginTop:1}}>Target ≥ 2.8x</div></th>
                      <th style={s.th}>Projected RSV Impact</th><th style={s.th}>Spend Released</th><th style={s.th}>Decision</th>
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
                            <td style={{...s.td,color:C.green,fontWeight:600}}>{fmtCurrency(r.spendReleased)}</td>
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
                <div style={{...s.summaryRow,fontSize:11}}>
                  {pauseReviewedCount} reviewed · {PAUSE_RECS.length-pauseReviewedCount} pending
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: AD GROUPS ────────────────────────────────────────── */}
          {guidedStep===2&&(
            <div>
              <div style={{marginBottom:16}}>
                <h2 style={{fontSize:15,fontWeight:700,color:C.text,margin:"0 0 4px"}}>Ad Group Bid Recommendations</h2>
                <div style={{fontSize:12,color:C.textSub}}>Review recommended Ad Group bid changes and evaluate their projected performance impact.</div>
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
                  {label:"Projected spend change",value:agAcceptedCount>0?(acceptedAgSpendChange>=0?"+":"")+fmtCurrency(acceptedAgSpendChange):"—", color:acceptedAgSpendChange>0?C.yellow:C.green},
                  {label:"Projected RSV lift",   value:agAcceptedCount>0?"+"+fmtCurrency(agRSVLift):"—", color:C.green},
                  {label:"Projected ROAS",       value:acceptedAgROAS?`${acceptedAgROAS}x`:"—",        color:C.purple},
                ]}
              />

              <div style={s.panel}>
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
                            <td style={{...s.td,color:isIncrease?C.text:C.green,fontWeight:600}}>
                              {isIncrease?"+":""}{fmtCurrency(r.spendChange)}
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
                <div style={{...s.summaryRow,fontSize:11}}>
                  {agReviewedCount} reviewed · {AD_GROUP_RECS.length-agReviewedCount} pending
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 3: KEYWORDS ─────────────────────────────────────────── */}
          {guidedStep===3&&(
            <div>
              <div style={{marginBottom:16}}>
                <h2 style={{fontSize:15,fontWeight:700,color:C.text,margin:"0 0 4px"}}>Keyword Bid Recommendations</h2>
                <div style={{fontSize:12,color:C.textSub}}>Review granular keyword bid changes and evaluate their projected performance impact.</div>
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
                  {label:"Projected spend change",value:kwAcceptedCount>0?(acceptedKwSpendChange>=0?"+":"")+fmtCurrency(acceptedKwSpendChange):"—", color:acceptedKwSpendChange>0?C.yellow:C.green},
                  {label:"Projected RSV lift",   value:kwAcceptedCount>0?"+"+fmtCurrency(kwRSVLift):"—", color:C.green},
                  {label:"Projected ROAS",       value:acceptedKwROAS?`${acceptedKwROAS}x`:"—",      color:C.purple},
                ]}
              />

              <div style={s.panel}>
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
                            <td style={{...s.td,color:isIncrease?C.text:C.green,fontWeight:600}}>
                              {isIncrease?"+":""}{fmtCurrency(r.spendChange)}
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
                <div style={{...s.summaryRow,fontSize:11}}>
                  {kwReviewedCount} reviewed · {KEYWORD_RECS.length-kwReviewedCount} pending
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 4: REVIEW & PUSH ────────────────────────────────────── */}
          {guidedStep===4&&(
            <div>
              {pushStatus==="success" ? (
                <div style={{padding:"28px 0 12px",maxWidth:480}}>
                  <div style={{fontWeight:800,fontSize:17,color:C.green,marginBottom:6}}>Recommendations successfully pushed</div>
                  <div style={{fontSize:13,color:C.textSub,marginBottom:16,lineHeight:1.6}}>
                    {totalAccepted} accepted changes pushed to <strong>Skai</strong> · {pushTimestamp}
                  </div>
                  <div style={{display:"flex",gap:24,borderTop:`1px solid ${C.border}`,paddingTop:14}}>
                    <div><div style={{fontSize:11,color:C.textMuted,marginBottom:2}}>Net RSV lift</div><div style={{fontSize:16,fontWeight:700,color:projectedRSVLift>=0?C.green:C.red}}>{fmtCurrency(projectedRSVLift)}</div></div>
                    <div><div style={{fontSize:11,color:C.textMuted,marginBottom:2}}>Net spend change</div><div style={{fontSize:16,fontWeight:700,color:netSpendChangeG<=0?C.green:C.yellow}}>{netSpendChangeG>=0?"+":""}{fmtCurrency(netSpendChangeG)}</div></div>
                    <div><div style={{fontSize:11,color:C.textMuted,marginBottom:2}}>Projected ROAS</div><div style={{fontSize:16,fontWeight:700,color:C.purple}}>{projectedROAS?`${projectedROAS}x`:"—"}</div></div>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{marginBottom:16}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                      <div>
                        <h2 style={{fontSize:15,fontWeight:700,color:C.text,margin:"0 0 4px"}}>Review &amp; Push</h2>
                        <div style={{fontSize:12,color:C.textSub}}>Review the net impact of your accepted scenario before pushing to Skai.</div>
                      </div>
                      <div style={{padding:"5px 12px",borderRadius:20,background:readinessG.bg,border:`1px solid ${readinessG.border}`,fontSize:11,fontWeight:700,color:readinessG.color,whiteSpace:"nowrap",flexShrink:0,marginLeft:16}}>
                        {readinessG.label}
                      </div>
                    </div>
                  </div>

                  {/* Net impact card */}
                  <div style={{background:C.surface,border:`1px solid ${C.purple}44`,borderRadius:8,padding:"16px 18px",marginBottom:16}}>
                    <div style={{fontWeight:700,fontSize:13,color:C.text,marginBottom:12}}>Net impact of selected optimizations</div>
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

                  {/* Selected actions */}
                  <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:"16px 18px",marginBottom:16}}>
                    <div style={{fontWeight:700,fontSize:13,color:C.text,marginBottom:12}}>Selected actions</div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:0}}>
                      <div style={{paddingRight:18,borderRight:`1px solid ${C.borderLight}`}}>
                        <div style={{fontSize:11,color:C.textMuted,fontWeight:600,marginBottom:8}}>Actions</div>
                        {[["Ad groups paused",pauseAcceptedCount],["Ad group bids updated",agAcceptedCount],["Keyword bids updated",kwAcceptedCount],["Total accepted changes",totalAccepted]].map(([label,val],i)=>(
                          <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:i<3?`1px solid ${C.borderLight}`:"none"}}>
                            <span style={{fontSize:12,color:i===3?C.text:C.textSub,fontWeight:i===3?600:400}}>{label}</span>
                            <span style={{fontSize:12,fontWeight:600,color:C.text}}>{val}</span>
                          </div>
                        ))}
                      </div>
                      <div style={{paddingLeft:18}}>
                        <div style={{fontSize:11,color:C.textMuted,fontWeight:600,marginBottom:8}}>Impact contribution</div>
                        {[
                          ["Pause spend change",    fmtCurrency(-acceptedPauseSpendReduction),C.green],
                          ["Pause RSV impact",      fmtCurrency(pauseRSVImpact),              pauseRSVImpact>=0?C.green:C.red],
                          ["Ad Group spend change", (acceptedAgSpendChange>=0?"+":"")+fmtCurrency(acceptedAgSpendChange), acceptedAgSpendChange>0?C.yellow:C.green],
                          ["Ad Group RSV lift",     agAcceptedCount>0?"+"+fmtCurrency(agRSVLift):"—", C.green],
                          ["Ad Group ROAS",         acceptedAgROAS?`${acceptedAgROAS}x`:"—", C.purple],
                          ["Keyword spend change",  (acceptedKwSpendChange>=0?"+":"")+fmtCurrency(acceptedKwSpendChange), acceptedKwSpendChange>0?C.yellow:C.green],
                          ["Keyword RSV lift",      kwAcceptedCount>0?"+"+fmtCurrency(kwRSVLift):"—", C.green],
                          ["Keyword ROAS",          acceptedKwROAS?`${acceptedKwROAS}x`:"—", C.purple],
                        ].map(([label,val,color],i)=>(
                          <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:i<7?`1px solid ${C.borderLight}`:"none"}}>
                            <span style={{fontSize:12,color:C.textSub}}>{label}</span>
                            <span style={{fontSize:12,fontWeight:600,color}}>{val}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

        </div>{/* end main */}

        {/* GUIDED STICKY FOOTER */}
        <div style={s.footer}>
          {guidedStep===0&&(
            <>
              <button style={s.btnGhost} onClick={handleSaveDraft}>{savedDraft?"✓ Draft saved":"Save Draft"}</button>
              <button style={s.btnPrimary} onClick={()=>navigateGuided(1)}>Start Review →</button>
            </>
          )}
          {guidedStep===1&&(
            <>
              <button style={s.btnGhost} onClick={()=>navigateGuided(0)}>← Back to Overview</button>
              <button style={s.btnGhost} onClick={handleSaveDraft}>{savedDraft?"✓ Draft saved":"Save Draft"}</button>
              <button style={{...s.btnPrimary,opacity:gCanContinuePause?1:0.4,cursor:gCanContinuePause?"pointer":"not-allowed"}} disabled={!gCanContinuePause} onClick={()=>navigateGuided(2)}>Continue to Ad Groups →</button>
            </>
          )}
          {guidedStep===2&&(
            <>
              <button style={s.btnGhost} onClick={()=>navigateGuided(1)}>← Back to Pause</button>
              <button style={s.btnGhost} onClick={handleSaveDraft}>{savedDraft?"✓ Draft saved":"Save Draft"}</button>
              <button style={{...s.btnPrimary,opacity:gCanContinueAg?1:0.4,cursor:gCanContinueAg?"pointer":"not-allowed"}} disabled={!gCanContinueAg} onClick={()=>navigateGuided(3)}>Continue to Keywords →</button>
            </>
          )}
          {guidedStep===3&&(
            <>
              <button style={s.btnGhost} onClick={()=>navigateGuided(2)}>← Back to Ad Groups</button>
              <button style={s.btnGhost} onClick={handleSaveDraft}>{savedDraft?"✓ Draft saved":"Save Draft"}</button>
              <button style={{...s.btnPrimary,opacity:gCanContinueKw?1:0.4,cursor:gCanContinueKw?"pointer":"not-allowed"}} disabled={!gCanContinueKw} onClick={()=>navigateGuided(4)}>Continue to Review →</button>
            </>
          )}
          {guidedStep===4&&pushStatus!=="success"&&(
            <>
              <button style={s.btnGhost} onClick={()=>navigateGuided(3)}>← Back to Keywords</button>
              <button style={s.btnGhost} onClick={handleSaveDraft}>{savedDraft?"✓ Draft saved":"Save Draft"}</button>
              {pushStatus==="idle"&&(
                <button style={{...s.btnGreen,opacity:totalAccepted>0?1:0.4,cursor:totalAccepted>0?"pointer":"not-allowed"}} disabled={totalAccepted===0} onClick={handlePush}>Push recommendations to Skai →</button>
              )}
              {pushStatus==="pushing"&&<button style={s.btnGhost} disabled>Pushing recommendations to Skai…</button>}
            </>
          )}
          {guidedStep===4&&pushStatus==="success"&&(
            <button style={{...s.btnGhost,color:C.green,borderColor:C.green}} disabled>✓ Pushed to Skai</button>
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
          <KpiCard label="Optimized Spend"            value="$284K"  sub="vs $261K baseline"/>
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

        {/* GLOBAL BUDGET DEFICIT WARNING */}
        {budgetDeficit&&(
          <div style={{...s.errBanner,margin:"0 0 16px",fontSize:13}}>
            Accepted recommendations exceed the available reallocation budget by {fmtCurrency(Math.abs(globalRemaining))}. Adjust earlier decisions before continuing.
          </div>
        )}

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
                <div style={{fontSize:12,color:C.textSub}}>Review ad groups recommended for pausing. Accepting a recommendation pauses the ad group and releases its spend for reallocation.</div>
              </div>
              <TableToolbar allSelected={pauseAllSel} someSelected={pauseSomeSel} selSize={pauseSel.size} onToggleAll={pauseToggleAll} onAccept={pauseAccept} onDecline={pauseDecline} s={s}/>
              <div style={s.tableWrap}>
                <table style={s.table}>
                  <thead><tr>
                    <th style={{...s.th,width:36}}></th>
                    <th style={s.th}>Campaign</th><th style={s.th}>Ad Group</th>
                    <th style={s.th}>Current Spend</th><th style={s.th}>Current RSV</th>
                    <th style={s.th}>Current ROAS<div style={{fontSize:10,color:C.textMuted,fontWeight:400,textTransform:"none",letterSpacing:0,marginTop:1}}>Target ≥ 2.8x</div></th>
                    <th style={s.th}>Projected RSV Impact</th><th style={s.th}>Spend Released</th><th style={s.th}>Decision</th>
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
                          <td style={{...s.td,color:C.green,fontWeight:600}}>{fmtCurrency(r.spendReleased)}</td>
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
                {releasedSpend>0&&<span style={{color:C.green,fontWeight:600}}>Spend released: {fmtCurrency(releasedSpend)}</span>}
              </div>
            </>
          )}

          {/* ── STEP 2 ────────────────────────────────────────────────────── */}
          {activeStep===2&&(
            <>
              <div style={s.stepHead}>
                <div style={{fontWeight:700,fontSize:14,marginBottom:4}}>Step 2 — Ad Group Bid Recommendations</div>
                <div style={{fontSize:12,color:C.textSub}}>Review recommended ad group bid changes and allocate the spend released from accepted pauses.</div>
              </div>
              <BudgetStrip items={[
                {label:"Released from pauses",      value:releasedSpend,  color:C.green},
                {label:"Savings from bid decreases",value:agSavings,      color:C.green},
                {label:"Allocated to bid increases", value:agAllocated,    color:C.text},
                {label:"Remaining available",        value:releasedSpend+agSavings-agAllocated, color:(releasedSpend+agSavings-agAllocated)>=0?C.green:C.red},
              ]}/>
              {agBudgetError&&<div style={s.errBanner}>These recommendations exceed the available reallocation budget by {fmtCurrency(agBudgetError)}.</div>}
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
                          <td style={{...s.td,color:isIncrease?C.text:C.green,fontWeight:600}}>
                            {isIncrease?"+":""}{fmtCurrency(r.spendChange)}
                            <div style={{fontSize:10,color:C.textMuted,fontWeight:400,marginTop:1}}>{isIncrease?"additional allocation":"savings"}</div>
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
                {agSavings>0&&<span style={{color:C.green,fontWeight:600}}>Savings captured: {fmtCurrency(agSavings)}</span>}
              </div>
            </>
          )}

          {/* ── STEP 3 ────────────────────────────────────────────────────── */}
          {activeStep===3&&(
            <>
              <div style={s.stepHead}>
                <div style={{fontWeight:700,fontSize:14,marginBottom:4}}>Step 3 — Keyword Bid Recommendations</div>
                <div style={{fontSize:12,color:C.textSub}}>Fine-tune keyword bids using the budget carried forward from Ad Group recommendations.</div>
              </div>
              <BudgetStrip items={[
                {label:"Budget carried from Step 2",       value:budgetAfterAg,             color:budgetAfterAg>=0?C.green:C.red},
                {label:"Savings from keyword bid decreases",value:kwSavings,                color:C.green},
                {label:"Allocated to keyword bid increases",value:kwAllocated,              color:C.text},
                {label:"Remaining available",              value:budgetAfterAg+kwSavings-kwAllocated, color:(budgetAfterAg+kwSavings-kwAllocated)>=0?C.green:C.red},
              ]}/>
              {kwBudgetError&&<div style={s.errBanner}>These recommendations exceed the available reallocation budget by {fmtCurrency(kwBudgetError)}.</div>}
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
                          <td style={{...s.td,color:isIncrease?C.text:C.green,fontWeight:600}}>
                            {isIncrease?"+":""}{fmtCurrency(r.spendChange)}
                            <div style={{fontSize:10,color:C.textMuted,fontWeight:400,marginTop:1}}>{isIncrease?"additional allocation":"savings"}</div>
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
                {kwSavings>0&&<span style={{color:C.green,fontWeight:600}}>Savings captured: {fmtCurrency(kwSavings)}</span>}
              </div>
            </>
          )}

          {/* ── STEP 4: REVIEW & PUSH ─────────────────────────────────────── */}
          {activeStep===4&&(()=>{
            // Derived values for Step 4 display
            const netSpendChange = agAllocated + kwAllocated - releasedSpend - agSavings - kwSavings;
            const baselineSpend  = 284000; // matches KPI card $284K
            const baselineRSV    = 1700000; // $1.70M, last baseline forecast week
            const optimizedSpend = baselineSpend + netSpendChange;
            const optimizedRSV   = baselineRSV + projectedRSVLift;

            // Bar chart helper — proportional width, max 100%
            const barW = (val, max) => `${Math.min(100, Math.max(4, (val / max) * 100)).toFixed(1)}%`;
            const spendMax  = Math.max(baselineSpend, optimizedSpend) * 1.05;
            const rsvMax    = Math.max(baselineRSV, Math.abs(optimizedRSV)) * 1.05;

            // Readiness
            const readiness = budgetDeficit
              ? { label:"Budget adjustment required", color:C.red,     bg:"#FFF1F1", border:C.red    }
              : totalAccepted===0
              ? { label:"No accepted changes",        color:C.textSub, bg:C.bg,      border:C.border }
              : { label:"Ready to push",              color:C.green,   bg:"#F0FBF4", border:C.green  };

            // One-line summaries
            const pauseSummary  = `${pauseAcceptedCount} accepted · ${pauseDeclinedCount} declined · ${fmtCurrency(releasedSpend)} released · ${fmtCurrency(pauseRSVImpact)} RSV impact`;
            const agSummary     = `${agAcceptedCount} accepted · ${agDeclinedCount} declined · ${fmtCurrency(agAllocated)} allocated · ${fmtCurrency(agRSVLift)} RSV lift`;
            const kwSummary     = `${kwAcceptedCount} accepted · ${kwDeclinedCount} declined · ${fmtCurrency(kwAllocated)} allocated · ${fmtCurrency(kwRSVLift)} RSV lift`;

            // Budget flow steps
            const budgetFlow = [
              { label:"Released from pauses",  sign:"+", value:releasedSpend,  color:C.green },
              { label:"Ad Group savings",       sign:"+", value:agSavings,      color:C.green },
              { label:"Keyword savings",        sign:"+", value:kwSavings,      color:C.green },
              { label:"Ad Group allocations",   sign:"−", value:agAllocated,    color:C.textSub },
              { label:"Keyword allocations",    sign:"−", value:kwAllocated,    color:C.textSub },
            ];

            // Shared inner styles (scoped to Step 4)
            const sec = { marginBottom:20 };
            const secTitle = { fontSize:11, fontWeight:700, color:C.textMuted, textTransform:"uppercase", letterSpacing:0.5, marginBottom:10 };
            const card = { background:C.surface, border:`1px solid ${C.border}`, borderRadius:8, padding:"16px 18px", marginBottom:16 };
            const detailRow = { display:"flex", justifyContent:"space-between", alignItems:"baseline", padding:"5px 0", borderBottom:`1px solid ${C.borderLight}` };
            const detailLabel = { fontSize:12, color:C.textSub };
            const detailVal = (color) => ({ fontSize:12, fontWeight:600, color:color||C.text });

            return (
              <div style={{padding:"20px 20px 4px"}}>
                {pushStatus==="success" ? (
                  /* ── SUCCESS STATE ── */
                  <div style={{padding:"28px 0 12px", maxWidth:480, margin:"0 auto"}}>
                    <div style={{fontWeight:800, fontSize:17, color:C.green, marginBottom:6}}>Recommendations successfully pushed</div>
                    <div style={{fontSize:13, color:C.textSub, marginBottom:16, lineHeight:1.6}}>
                      {totalAccepted} accepted changes pushed to <strong>Skai</strong> · {pushTimestamp}
                    </div>
                    <div style={{display:"flex", gap:24, borderTop:`1px solid ${C.border}`, paddingTop:14}}>
                      <div>
                        <div style={{fontSize:11, color:C.textMuted, marginBottom:2}}>Net RSV lift</div>
                        <div style={{fontSize:16, fontWeight:700, color:projectedRSVLift>=0?C.green:C.red}}>{fmtCurrency(projectedRSVLift)}</div>
                      </div>
                      <div>
                        <div style={{fontSize:11, color:C.textMuted, marginBottom:2}}>Net spend change</div>
                        <div style={{fontSize:16, fontWeight:700, color:netSpendChange<=0?C.green:"#D97706"}}>{netSpendChange>=0?"+":""}{fmtCurrency(netSpendChange)}</div>
                      </div>
                      <div>
                        <div style={{fontSize:11, color:C.textMuted, marginBottom:2}}>Remaining budget</div>
                        <div style={{fontSize:16, fontWeight:700, color:globalRemaining>=0?C.green:C.red}}>{fmtCurrency(globalRemaining)}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* ── STEP HEADER + READINESS ── */}
                    <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:18}}>
                      <div>
                        <div style={{fontWeight:700, fontSize:15, color:C.text, marginBottom:3}}>Review &amp; Push</div>
                        <div style={{fontSize:12, color:C.textSub}}>Review the final impact and budget allocation of the recommendations selected for this optimization package.</div>
                      </div>
                      <div style={{flexShrink:0, marginLeft:16, padding:"5px 12px", borderRadius:20, background:readiness.bg, border:`1px solid ${readiness.border}`, fontSize:11, fontWeight:700, color:readiness.color, whiteSpace:"nowrap"}}>
                        {readiness.label}
                        {budgetDeficit&&<span style={{fontWeight:400, marginLeft:6}}>— exceeds budget by {fmtCurrency(Math.abs(globalRemaining))}</span>}
                        {!budgetDeficit&&totalAccepted===0&&<span style={{fontWeight:400, marginLeft:6}}>— accept at least one recommendation</span>}
                      </div>
                    </div>

                    {/* ── 1. NET IMPACT CARD ── */}
                    <div style={{...card, borderColor:C.purple+"44"}}>
                      <div style={{marginBottom:12}}>
                        <div style={{fontWeight:700, fontSize:13, color:C.text}}>Net impact of selected optimizations</div>
                        <div style={{fontSize:11, color:C.textSub, marginTop:2}}>Combined weekly effect of all accepted recommendations.</div>
                      </div>
                      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:20}}>
                        {/* Left: bar comparisons */}
                        <div>
                          {/* Weekly Spend */}
                          <div style={{marginBottom:14}}>
                            <div style={{fontSize:11, color:C.textMuted, marginBottom:6}}>Weekly spend</div>
                            <div style={{marginBottom:5}}>
                              <div style={{display:"flex", justifyContent:"space-between", marginBottom:3}}>
                                <span style={{fontSize:11, color:C.textSub}}>Current</span>
                                <span style={{fontSize:12, fontWeight:600, color:C.textSub}}>{fmtCurrency(baselineSpend)}</span>
                              </div>
                              <div style={{height:7, background:C.borderLight, borderRadius:4}}>
                                <div style={{width:barW(baselineSpend, spendMax), height:"100%", background:C.textMuted, borderRadius:4}}/>
                              </div>
                            </div>
                            <div>
                              <div style={{display:"flex", justifyContent:"space-between", marginBottom:3}}>
                                <span style={{fontSize:11, color:C.purple}}>Optimized</span>
                                <span style={{fontSize:12, fontWeight:700, color:C.purple}}>{fmtCurrency(optimizedSpend)}</span>
                              </div>
                              <div style={{height:7, background:C.borderLight, borderRadius:4}}>
                                <div style={{width:barW(Math.max(0,optimizedSpend), spendMax), height:"100%", background:C.purple, borderRadius:4}}/>
                              </div>
                            </div>
                          </div>
                          {/* Projected RSV */}
                          <div>
                            <div style={{fontSize:11, color:C.textMuted, marginBottom:6}}>Projected RSV</div>
                            <div style={{marginBottom:5}}>
                              <div style={{display:"flex", justifyContent:"space-between", marginBottom:3}}>
                                <span style={{fontSize:11, color:C.textSub}}>Baseline</span>
                                <span style={{fontSize:12, fontWeight:600, color:C.textSub}}>{fmtCurrency(baselineRSV)}</span>
                              </div>
                              <div style={{height:7, background:C.borderLight, borderRadius:4}}>
                                <div style={{width:barW(baselineRSV, rsvMax), height:"100%", background:C.textMuted, borderRadius:4}}/>
                              </div>
                            </div>
                            <div>
                              <div style={{display:"flex", justifyContent:"space-between", marginBottom:3}}>
                                <span style={{fontSize:11, color:C.purple}}>Optimized</span>
                                <span style={{fontSize:12, fontWeight:700, color:C.purple}}>{fmtCurrency(optimizedRSV)}</span>
                              </div>
                              <div style={{height:7, background:C.borderLight, borderRadius:4}}>
                                <div style={{width:barW(Math.max(0,optimizedRSV), rsvMax), height:"100%", background:C.purple, borderRadius:4}}/>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Right: three key outcomes */}
                        <div style={{display:"flex", flexDirection:"column", justifyContent:"center", gap:14, borderLeft:`1px solid ${C.borderLight}`, paddingLeft:20}}>
                          <div>
                            <div style={{fontSize:11, color:C.textMuted, marginBottom:2}}>Net RSV lift</div>
                            <div style={{fontSize:26, fontWeight:800, color:projectedRSVLift>=0?C.green:C.red, letterSpacing:-0.5}}>{projectedRSVLift!==0?fmtCurrency(projectedRSVLift):"—"}</div>
                          </div>
                          <div>
                            <div style={{fontSize:11, color:C.textMuted, marginBottom:2}}>Net spend change</div>
                            <div style={{fontSize:26, fontWeight:800, color:netSpendChange<=0?C.green:"#D97706", letterSpacing:-0.5}}>{netSpendChange>=0?"+":""}{fmtCurrency(netSpendChange)}</div>
                          </div>
                          <div>
                            <div style={{fontSize:11, color:C.textMuted, marginBottom:2}}>Projected ROAS</div>
                            <div style={{fontSize:26, fontWeight:800, color:C.purple, letterSpacing:-0.5}}>{projectedROAS?`${projectedROAS}x`:"—"}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ── 2. PACKAGE SUMMARY ── */}
                    <div style={{...card}}>
                      <div style={{fontWeight:700, fontSize:13, color:C.text, marginBottom:12}}>Optimization package summary</div>
                      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:0}}>
                        {/* Left: actions */}
                        <div style={{paddingRight:18, borderRight:`1px solid ${C.borderLight}`}}>
                          <div style={{fontSize:11, color:C.textMuted, fontWeight:600, marginBottom:8}}>Actions selected</div>
                          {[
                            ["Ad groups paused",       pauseAcceptedCount],
                            ["Ad group bids updated",  agAcceptedCount],
                            ["Keyword bids updated",   kwAcceptedCount],
                            ["Total accepted changes", totalAccepted],
                          ].map(([label, val], i) => (
                            <div key={i} style={{...detailRow, borderBottom: i<3 ? `1px solid ${C.borderLight}` : "none"}}>
                              <span style={{...detailLabel, fontWeight: i===3 ? 600 : 400, color: i===3 ? C.text : C.textSub}}>{label}</span>
                              <span style={{...detailVal(i===3?C.text:undefined)}}>{val}</span>
                            </div>
                          ))}
                        </div>
                        {/* Right: impact */}
                        <div style={{paddingLeft:18}}>
                          <div style={{fontSize:11, color:C.textMuted, fontWeight:600, marginBottom:8}}>Net projected impact</div>
                          {[
                            ["Net RSV impact",              fmtCurrency(projectedRSVLift),  projectedRSVLift>=0?C.green:C.red ],
                            ["Net spend impact",            `${netSpendChange>=0?"+":""}${fmtCurrency(netSpendChange)}`, netSpendChange<=0?C.green:"#D97706"],
                            ["Projected ROAS",              projectedROAS?`${projectedROAS}x`:"—", C.purple],
                            ["Remaining unallocated budget",fmtCurrency(globalRemaining),   globalRemaining>=0?C.green:C.red ],
                          ].map(([label, val, color], i) => (
                            <div key={i} style={{...detailRow, borderBottom: i<3 ? `1px solid ${C.borderLight}` : "none"}}>
                              <span style={detailLabel}>{label}</span>
                              <span style={detailVal(color)}>{val}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* ── 3. BUDGET ALLOCATION FLOW ── */}
                    <div style={{...card}}>
                      <div style={{fontWeight:700, fontSize:13, color:C.text, marginBottom:14}}>Budget allocation</div>
                      <div style={{display:"flex", flexDirection:"column", gap:0}}>
                        {budgetFlow.map(({label, sign, value, color}, i) => (
                          <div key={i} style={{display:"flex", alignItems:"center", justifyContent:"space-between", padding:"7px 0", borderBottom:`1px solid ${C.borderLight}`}}>
                            <div style={{display:"flex", alignItems:"center", gap:8}}>
                              <span style={{width:16, fontSize:13, fontWeight:700, color, textAlign:"center"}}>{sign}</span>
                              <span style={{fontSize:12, color:C.textSub}}>{label}</span>
                            </div>
                            <span style={{fontSize:13, fontWeight:600, color}}>{fmtCurrency(value)}</span>
                          </div>
                        ))}
                        {/* Final = remaining */}
                        <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 0 2px"}}>
                          <div style={{display:"flex", alignItems:"center", gap:8}}>
                            <span style={{width:16, fontSize:13, fontWeight:700, color:globalRemaining>=0?C.green:C.red, textAlign:"center"}}>=</span>
                            <span style={{fontSize:13, fontWeight:700, color:C.text}}>Remaining unallocated</span>
                          </div>
                          <span style={{fontSize:16, fontWeight:800, color:globalRemaining>=0?C.green:C.red}}>{fmtCurrency(globalRemaining)}</span>
                        </div>
                      </div>
                    </div>

                    {/* ── 4. OPERATIONAL DETAIL ── */}
                    <div style={sec}>
                      <div style={secTitle}>Decision detail</div>
                      {[
                        { title:"Pause recommendations",       summary:pauseSummary,  secondary:[["Pending", PAUSE_RECS.length-pauseDecidedCount],["Spend released",fmtCurrency(releasedSpend)],["RSV impact",fmtCurrency(pauseRSVImpact)]] },
                        { title:"Ad group bid recommendations", summary:agSummary,    secondary:[["Pending", AD_GROUP_RECS.length-agDecidedCount],["Savings",fmtCurrency(agSavings)],["Allocation",fmtCurrency(agAllocated)],["RSV lift",fmtCurrency(agRSVLift)]] },
                        { title:"Keyword bid recommendations",  summary:kwSummary,    secondary:[["Pending", KEYWORD_RECS.length-kwDecidedCount], ["Savings",fmtCurrency(kwSavings)], ["Allocation",fmtCurrency(kwAllocated)],["RSV lift",fmtCurrency(kwRSVLift)]] },
                      ].map(({title, summary, secondary}, i) => (
                        <div key={i} style={{borderBottom:`1px solid ${C.border}`, padding:"10px 0"}}>
                          <div style={{fontSize:12, fontWeight:600, color:C.text, marginBottom:4}}>{title}</div>
                          <div style={{fontSize:12, color:C.textSub, marginBottom:5}}>{summary}</div>
                          <div style={{display:"flex", gap:16, flexWrap:"wrap"}}>
                            {secondary.map(([label, val], j) => (
                              <div key={j}>
                                <span style={{fontSize:11, color:C.textMuted}}>{label}: </span>
                                <span style={{fontSize:11, fontWeight:600, color:C.text}}>{val}</span>
                              </div>
                            ))}
                          </div>
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
