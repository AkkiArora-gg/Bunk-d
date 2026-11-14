import React, { useMemo, useState } from "react";
import {
  Home, Compass, Heart, MessageCircle, UserRound, SlidersHorizontal,
  MapPin, Wallet, Moon, Sparkles, X, Check, ArrowRight, Users,
  ShieldCheck, RotateCcw, ChevronRight, Coffee, LogOut
} from "lucide-react";
import { demoUsers, starterProfile, questions } from "./data";
import { compatibility, explainMatch } from "./matching";

const read = (key, fallback) => {
  try { const value=localStorage.getItem(key); return value?JSON.parse(value):fallback; }
  catch { return fallback; }
};
const money = n => `₹${Number(n).toLocaleString("en-IN")}`;

function App() {
  const [profile,setProfile] = useState(()=>read("roomsync_profile",null));
  const [likes,setLikes] = useState(()=>read("roomsync_likes",[]));
  const [passes,setPasses] = useState(()=>read("roomsync_passes",[]));
  const [matches,setMatches] = useState(()=>read("roomsync_matches",[]));
  const [active,setActive] = useState("Discover");
  const [index,setIndex] = useState(0);
  const [filter,setFilter] = useState("All");
  const [showFilters,setShowFilters] = useState(false);
  const [selected,setSelected] = useState(null);
  const [toast,setToast] = useState("");
  const [step,setStep] = useState(0);
  const [form,setForm] = useState(starterProfile);

  const persist = (key,value,setter) => { setter(value); localStorage.setItem(key,JSON.stringify(value)); };
  const notify = msg => { setToast(msg); setTimeout(()=>setToast(""),2200); };
  const candidates = useMemo(()=>demoUsers.filter(u=>{
    if(likes.includes(u.id)||passes.includes(u.id)) return false;
    if(filter!=="All" && u.location!==filter) return false;
    if(profile && (u.budgetMax<profile.budgetMin || u.budgetMin>profile.budgetMax)) return false;
    return true;
  }),[likes,passes,filter,profile]);
  const current = candidates[index] || candidates[0];
  const result = current && profile ? compatibility(profile,current) : null;

  const saveProfile = () => {
    if(!form.name.trim()) return notify("Please enter your name first.");
    persist("roomsync_profile",form,setProfile);
    setActive("Discover");
    notify("Your profile is ready. Let's find your match!");
  };

  const act = type => {
    if(!current) return;
    if(type==="like") {
      const next=[...likes,current.id]; persist("roomsync_likes",next,setLikes);
      // Demo simulation: selected profiles reciprocate to make the match flow demonstrable.
      const reciprocates=["u1","u4","u6"].includes(current.id);
      if(reciprocates) {
        const updated=[...matches.filter(m=>m.id!==current.id),current];
        persist("roomsync_matches",updated,setMatches);
        notify(`It's a match with ${current.name}!`);
      } else notify(`You liked ${current.name}`);
    } else {
      persist("roomsync_passes",[...passes,current.id],setPasses);
      notify("Profile passed");
    }
    setIndex(0);
  };

  const resetDemo = () => {
    ["roomsync_profile","roomsync_likes","roomsync_passes","roomsync_matches"].forEach(k=>localStorage.removeItem(k));
    setProfile(null); setLikes([]); setPasses([]); setMatches([]); setForm(starterProfile);
    setStep(0); setActive("Discover"); setIndex(0); notify("Demo reset");
  };

  if(!profile) return <Onboarding form={form} setForm={setForm} step={step} setStep={setStep} onFinish={saveProfile} />;

  const nav = [
    ["Discover",Compass],["Matches",Heart],["Profile",UserRound]
  ];

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-icon"><Home size={20}/></div><span>room<span className="brand-accent">sync</span></span></div>
      <div className="side-label">MENU</div>
      {nav.map(([label,Icon])=><button key={label} className={`nav-item ${active===label?"active":""}`} onClick={()=>{setActive(label);setIndex(0)}}><Icon size={18}/>{label}<span className="nav-count">{label==="Matches"?matches.length:""}</span></button>)}
      <div className="sidebar-bottom">
        <div className="side-card"><Sparkles size={18}/><b>Good living starts with a good match.</b><p>Find people who fit your lifestyle, not just your budget.</p></div>
        <button className="nav-item muted" onClick={resetDemo}><RotateCcw size={17}/>Reset demo</button>
        <div className="mini-user"><div className="avatar-small">{profile.name[0]?.toUpperCase()}</div><div><b>{profile.name}</b><small>{profile.location}</small></div></div>
      </div>
    </aside>

    <main className="main-area">
      <header className="topbar">
        <div><div className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</div><h1>{active==="Discover"?"Find your kind of people":active==="Matches"?"Your connections":"Your profile"}</h1></div>
        <div className="top-actions"><span className="online-dot"/> <span className="top-status">Demo mode</span><button className="icon-button" onClick={()=>setActive("Profile")}><UserRound size={18}/></button></div>
      </header>

      {active==="Discover" && <section className="content">
        <div className="section-heading"><div><h2>Discover flatmates</h2><p>People who could make a place feel like home.</p></div><button className="filter-button" onClick={()=>setShowFilters(!showFilters)}><SlidersHorizontal size={16}/> Filters</button></div>
        {showFilters && <div className="filter-panel"><label>Preferred locality<select value={filter} onChange={e=>{setFilter(e.target.value);setIndex(0)}}><option>All</option>{[...new Set(demoUsers.map(u=>u.location))].map(x=><option key={x}>{x}</option>)}</select></label><span className="filter-note">Your budget: {money(profile.budgetMin)}–{money(profile.budgetMax)}</span></div>}
        <div className="discover-layout">
          <div className="card-stage">
            {current ? <ProfileCard person={current} result={result} onDetails={()=>setSelected(current)} onLike={()=>act("like")} onPass={()=>act("pass")}/> :
              <div className="empty-state"><div className="empty-icon"><Compass size={30}/></div><h3>You've seen everyone!</h3><p>Try changing your filters or reset the demo to explore again.</p><button className="primary-button" onClick={()=>{setFilter("All");setIndex(0);notify("Filters cleared")}}>Clear filters</button></div>}
            <div className="card-counter">{Math.min(likes.length+passes.length+1,demoUsers.length)} of {demoUsers.length} profiles explored</div>
          </div>
          <aside className="insight-column">
            <div className="insight-card purple-card"><div className="insight-icon"><Sparkles size={18}/></div><span className="eyebrow">YOUR MATCHING STYLE</span><h3>Compatibility over coincidence.</h3><p>RoomSync compares the everyday habits that make shared living work.</p></div>
            <div className="insight-card"><span className="eyebrow">YOUR PREFERENCES</span><h3>{profile.location}</h3><div className="preference-line"><MapPin size={15}/> {profile.location}</div><div className="preference-line"><Wallet size={15}/> {money(profile.budgetMin)} – {money(profile.budgetMax)}</div><div className="preference-line"><Moon size={15}/> {profile.sleep}</div><button className="text-button" onClick={()=>setActive("Profile")}>Edit preferences <ArrowRight size={14}/></button></div>
            <div className="tip-card"><ShieldCheck size={18}/><div><b>Take your time</b><p>Discuss expectations before making living arrangements.</p></div></div>
          </aside>
        </div>
      </section>}

      {active==="Matches" && <section className="content">
        <div className="section-heading"><div><h2>People you connected with</h2><p>Mutual interest is a great place to start.</p></div><span className="count-pill">{matches.length} matches</span></div>
        {matches.length ? <div className="match-grid">{matches.map(person=><MatchCard key={person.id} person={person} profile={profile} onClick={()=>setSelected(person)}/>)}</div> :
          <div className="empty-state wide"><div className="empty-icon"><Heart size={30}/></div><h3>Your matches will show up here</h3><p>Like profiles in Discover. A few demo profiles will reciprocate so you can preview the match experience.</p><button className="primary-button" onClick={()=>setActive("Discover")}>Explore flatmates</button></div>}
      </section>}

      {active==="Profile" && <section className="content profile-content">
        <div className="section-heading"><div><h2>Your lifestyle profile</h2><p>This is what helps us find compatible people.</p></div><button className="filter-button" onClick={()=>{setForm(profile);setStep(0);setProfile(null)}}>Edit profile</button></div>
        <div className="profile-summary"><div className="profile-initial">{profile.name[0]}</div><div><h2>{profile.name}, {profile.age}</h2><p>{profile.occupation} · {profile.college}</p><span className="location-tag"><MapPin size={13}/>{profile.location}</span></div></div>
        <div className="details-grid">{Object.entries({Budget:`${money(profile.budgetMin)} – ${money(profile.budgetMax)}`,Sleep:profile.sleep,Cleanliness:profile.cleanliness,Social:profile.social,Guests:profile.guests,Smoking:profile.smoking,Food:profile.food,Noise:profile.noise,"Personal space":profile.personalSpace}).map(([k,v])=><div className="detail-tile" key={k}><small>{k}</small><b>{v}</b></div>)}</div>
        <button className="danger-link" onClick={resetDemo}><LogOut size={15}/> Reset demo profile</button>
      </section>}
      <footer className="footer">RoomSync <span>·</span> Find your kind of roommate <span>·</span> Hackathon demo</footer>
    </main>

    {selected && <ProfileModal person={selected} profile={profile} onClose={()=>setSelected(null)}/>}
    {toast && <div className="toast"><Check size={16}/>{toast}</div>}
  </div>;
}

function Onboarding({form,setForm,step,setStep,onFinish}) {
  const update=(k,v)=>setForm(p=>({...p,[k]:v}));
  const q=questions[step-1];
  const total=questions.length+1;
  const next=()=>{if(step===0&&!form.name.trim())return; if(step<total-1)setStep(step+1);else onFinish()};
  return <div className="onboarding">
    <div className="onboard-brand"><div className="brand-icon"><Home size={20}/></div>room<span>sync</span></div>
    <div className="onboard-wrap">
      <div className="onboard-top"><span>LET'S GET TO KNOW YOU</span><span>{step+1} / {total}</span></div>
      <div className="progress-track"><div style={{width:`${(step+1)/total*100}%`}}/></div>
      {step===0 ? <><div className="onboard-icon"><Users size={22}/></div><h1>First, the basics.</h1><p className="lead">A little about you helps us find people on your wavelength.</p>
        <div className="form-grid">
          <Field label="Your name"><input value={form.name} onChange={e=>update("name",e.target.value)} placeholder="e.g. Aakarsh"/></Field>
          <Field label="Age"><input type="number" min="18" value={form.age} onChange={e=>update("age",e.target.value)} /></Field>
          <Field label="I am a"><select value={form.occupation} onChange={e=>update("occupation",e.target.value)}><option>Student</option><option>Working professional</option><option>Freelancer</option></select></Field>
          <Field label="College / workplace"><input value={form.college} onChange={e=>update("college",e.target.value)} placeholder="Your college or workplace"/></Field>
          <Field label="Preferred locality"><input value={form.location} onChange={e=>update("location",e.target.value)} placeholder="e.g. Rohini"/></Field>
          <Field label="Move-in timing"><select value={form.moveIn} onChange={e=>update("moveIn",e.target.value)}><option>Flexible</option><option>November</option><option>December</option><option>January</option><option>February</option></select></Field>
          <Field label="Minimum monthly budget (₹)"><input type="number" value={form.budgetMin} onChange={e=>update("budgetMin",e.target.value)}/></Field>
          <Field label="Maximum monthly budget (₹)"><input type="number" value={form.budgetMax} onChange={e=>update("budgetMax",e.target.value)}/></Field>
        </div>
      </> : <><div className="onboard-icon"><Sparkles size={22}/></div><div className="step-kicker">YOUR LIFESTYLE · {String(step).padStart(2,"0")}</div><h1>{q.title}</h1><p className="lead">{q.subtitle}</p>
        <div className="option-list">{q.options.map(opt=><button key={opt} className={`option-card ${form[q.key]===opt?"chosen":""}`} onClick={()=>update(q.key,opt)}><span>{opt}</span>{form[q.key]===opt?<Check size={18}/>:<span className="option-radio"/>}</button>)}</div>
        {step===4 && <label className="checkline"><input type="checkbox" checked={!!form.smokingHard} onChange={e=>update("smokingHard",e.target.checked)}/> Make smoke-free living a non-negotiable preference</label>}
      </>}
      <div className="onboard-actions"><button className="back-button" disabled={step===0} onClick={()=>setStep(step-1)}>Back</button><button className="primary-button" onClick={next}>{step===total-1?"Create my profile":"Continue"} <ArrowRight size={16}/></button></div>
      <p className="privacy-note"><ShieldCheck size={14}/> Your preferences are stored in this browser for this demo.</p>
    </div>
  </div>;
}

function Field({label,children}) { return <label className="field"><span>{label}</span>{children}</label>; }

function ProfileCard({person,result,onDetails,onLike,onPass}) {
  return <div className="person-card">
    <div className="person-photo" style={{backgroundImage:`url(${person.avatar})`}}>
      <div className="photo-top"><span className="verified"><ShieldCheck size={13}/> Profile</span><span className="score-badge"><Sparkles size={13}/>{result?.score}% match</span></div>
      <div className="photo-gradient"/><div className="person-name"><h2>{person.name}, {person.age}</h2><p>{person.occupation} · {person.college}</p></div>
    </div>
    <div className="person-info">
      <div className="person-facts"><span><MapPin size={15}/>{person.location}</span><span><Wallet size={15}/>{money(person.budgetMin)}–{money(person.budgetMax)}</span></div>
      <p className="person-bio">{person.bio}</p>
      <div className="tag-row">{person.tags.map(t=><span className="tag" key={t}>{t}</span>)}</div>
      <div className="compat-box"><div className="compat-head"><span><Sparkles size={15}/> Why you might click</span><b>{result?.score}%</b></div><div className="score-track"><div style={{width:`${result?.score}%`}}/></div><div className="strengths">{result?.strengths.slice(0,2).map(s=><span key={s}><Check size={12}/>{s.split(" (")[0]}</span>)}</div></div>
      {result?.hardConflicts.length>0 && <div className="conflict-note"><ShieldCheck size={14}/> Discuss: {result.hardConflicts[0]}</div>}
      <div className="card-actions"><button className="pass-action" onClick={onPass} aria-label="Pass"><X size={22}/></button><button className="details-action" onClick={onDetails}>View profile <ChevronRight size={15}/></button><button className="like-action" onClick={onLike} aria-label="Like"><Heart size={21} fill="currentColor"/></button></div>
    </div>
  </div>;
}

function MatchCard({person,profile,onClick}) {
  const result=compatibility(profile,person);
  return <button className="match-card" onClick={onClick}><img src={person.avatar} alt=""/><div className="match-card-info"><b>{person.name}, {person.age}</b><span>{person.location}</span><small><Sparkles size={12}/>{result.score}% compatible</small></div><ChevronRight size={18}/></button>;
}

function ProfileModal({person,profile,onClose}) {
  const r=compatibility(profile,person);
  return <div className="modal-backdrop" onClick={onClose}><div className="profile-modal" onClick={e=>e.stopPropagation()}>
    <button className="modal-close" onClick={onClose}><X size={19}/></button><img className="modal-photo" src={person.avatar} alt=""/>
    <div className="modal-body"><span className="score-badge inline"><Sparkles size={13}/>{r.score}% compatible</span><h2>{person.name}, {person.age}</h2><p className="muted-text">{person.occupation} · {person.college} · {person.location}</p><p>{person.bio}</p>
      <div className="modal-section"><h3>Why you could get along</h3>{r.strengths.map(x=><div className="reason-row" key={x}><Check size={15}/>{x}</div>)}</div>
      <div className="modal-section"><h3>Things to discuss</h3>{r.conflicts.length?r.conflicts.map(x=><div className="reason-row caution" key={x}><MessageCircle size={15}/>{x}</div>):<p className="muted-text">No major lifestyle differences detected in the answers provided.</p>}</div>
      <div className="modal-section"><h3>About their lifestyle</h3><div className="details-grid compact">{Object.entries({Sleep:person.sleep,Cleanliness:person.cleanliness,Social:person.social,Guests:person.guests,Food:person.food,Noise:person.noise}).map(([k,v])=><div className="detail-tile" key={k}><small>{k}</small><b>{v}</b></div>)}</div></div>
    </div>
  </div></div>;
}

export default App;