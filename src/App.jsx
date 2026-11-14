import React, { useMemo, useState, useRef, useEffect } from "react";
import {
  Compass, MessageCircle, UserRound, SlidersHorizontal,
  MapPin, Wallet, Moon, Sparkles, X, Check, CheckCheck, ArrowRight, ArrowLeft, Users,
  ShieldCheck, RotateCcw, ChevronRight, Send, Info, Plus
} from "lucide-react";
import { demoUsers, starterProfile, questions } from "./data";
import { compatibility, explainMatch } from "./matching";

/* ── Bunk'd architectural doorway icon (SVG, sharp at all sizes) ── */
function DoorIcon({ size = 20, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M4 22V3.5C4 2.67 4.67 2 5.5 2H18.5C19.33 2 20 2.67 20 3.5V22"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.5 22V8C8.5 7.45 8.95 7 9.5 7H14.5C15.05 7 15.5 7.45 15.5 8V22"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line x1="2" y1="22" x2="22" y2="22" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

const read = (key, fallbackKey, fallback) => {
  try {
    const value = localStorage.getItem(key);
    if (value !== null) return JSON.parse(value);
    if (fallbackKey) {
      const legacyValue = localStorage.getItem(fallbackKey);
      if (legacyValue !== null) return JSON.parse(legacyValue);
    }
    return fallback;
  } catch {
    return fallback;
  }
};

const money = n => `₹${Number(n).toLocaleString("en-IN")}`;

// Pre-seeded starter messages for demonstrative reciprocal matches
const STARTER_MESSAGES = {
  u1: [
    {
      id: "init_u1",
      sender: "u1",
      text: "Hey! Stoked we matched 🙌 We both love keeping shared spaces clean and staying up late. Have you found any 2BHK/3BHK places in Rohini yet?",
      timestamp: "10:30 AM",
      isRead: false
    }
  ],
  u4: [
    {
      id: "init_u4",
      sender: "u4",
      text: "Hey there! Loved seeing our daily habits and budget align so well. Are you planning to move in around December?",
      timestamp: "11:15 AM",
      isRead: false
    }
  ],
  u6: [
    {
      id: "init_u6",
      sender: "u6",
      text: "Hi! Great to connect with another quiet, book-loving flatmate. Are you still looking around North Delhi?",
      timestamp: "1:45 PM",
      isRead: false
    }
  ]
};

const getInitialMessages = person => {
  if (STARTER_MESSAGES[person.id]) {
    return [...STARTER_MESSAGES[person.id]];
  }
  return [
    {
      id: `init_${person.id}`,
      sender: person.id,
      text: `Hey! Great to connect on Bunk'd. Are you currently exploring flat options in ${person.location}?`,
      timestamp: "Just now",
      isRead: false
    }
  ];
};

const getSimulatedReply = (person, userText) => {
  const lower = (userText || "").toLowerCase();

  if (lower.includes("rent") || lower.includes("budget") || lower.includes("price") || lower.includes("₹") || lower.includes("cost")) {
    return `My monthly budget is around ₹${Number(person.budgetMin).toLocaleString()} to ₹${Number(person.budgetMax).toLocaleString()}. If we split a 2BHK or 3BHK, it should comfortably fit our budget!`;
  }
  if (lower.includes("location") || lower.includes("where") || lower.includes("area") || lower.includes("place") || lower.includes("metro") || lower.includes("rohini") || lower.includes("delhi")) {
    return `I'm focusing mainly on ${person.location} near public transit or the metro station. Have you checked out any specific societies or pockets yet?`;
  }
  if (lower.includes("move") || lower.includes("when") || lower.includes("date") || lower.includes("timeline") || lower.includes("month")) {
    return `I'm planning to move in around ${person.moveIn || "next month"}. Does that timeline work for you?`;
  }
  if (lower.includes("cook") || lower.includes("food") || lower.includes("kitchen") || lower.includes("eat") || lower.includes("non-veg") || lower.includes("veg")) {
    return `I'm ${person.food.toLowerCase()}! I usually keep the kitchen tidy right after cooking. We can definitely share kitchen setups and split basic groceries.`;
  }
  if (lower.includes("meet") || lower.includes("call") || lower.includes("whatsapp") || lower.includes("number") || lower.includes("visit") || lower.includes("see") || lower.includes("weekend")) {
    return `Yes, let's definitely do that! I'm free this weekend to grab coffee or check out a couple of shortlisted flats together.`;
  }
  if (lower.includes("clean") || lower.includes("maid") || lower.includes("tidy") || lower.includes("chore")) {
    return `I'm definitely ${person.cleanliness.toLowerCase()}. Having a regular maid for common areas would keep things super clean and peaceful!`;
  }
  if (lower.includes("sleep") || lower.includes("night") || lower.includes("morning") || lower.includes("wake") || lower.includes("owl") || lower.includes("bird")) {
    return `I'm a ${person.sleep.toLowerCase()} myself, so our daily schedules should match up really nicely!`;
  }

  const defaults = [
    `That sounds great! I'm looking for a relaxed, respectful vibe at home. When are you hoping to finalize a place?`,
    `Totally agree! I'm scouting a few listings near ${person.location} this week. I can share the links with you if you'd like!`,
    `Awesome! Love that we share similar daily rhythms. Have you lived with flatmates before?`,
    `Sounds like a solid plan. Let's make a shortlist of places and set up a flat visit together soon!`
  ];
  return defaults[Math.floor(Math.random() * defaults.length)];
};

function App() {
  const [profile, setProfile] = useState(() => read("bunkd_profile", "livein_profile", null));
  const [likes, setLikes] = useState(() => read("bunkd_likes", "livein_likes", []));
  const [passes, setPasses] = useState(() => read("bunkd_passes", "livein_passes", []));
  const [matches, setMatches] = useState(() => read("bunkd_matches", "livein_matches", []));
  const [messages, setMessages] = useState(() => read("bunkd_messages", "livein_messages", {}));
  const [activeChatId, setActiveChatId] = useState(null);
  const [typingStatus, setTypingStatus] = useState({});
  const [active, setActive] = useState("Discover");
  const [index, setIndex] = useState(0);
  const [filter, setFilter] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState("");
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(starterProfile);
  const [celebration, setCelebration] = useState(null);

  // Swipe animation and dragging state
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [exitDirection, setExitDirection] = useState(null);
  const dragStartRef = useRef({ x: 0, y: 0, active: false, pointerId: null });

  const persist = (key, value, setter) => {
    setter(value);
    localStorage.setItem(key, JSON.stringify(value));
  };

  const notify = msg => {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  };

  // Seed initial conversations for existing matches if empty
  useEffect(() => {
    if (matches.length > 0) {
      let changed = false;
      const updated = { ...messages };
      matches.forEach(m => {
        if (!updated[m.id]) {
          updated[m.id] = getInitialMessages(m);
          changed = true;
        }
      });
      if (changed) {
        persist("bunkd_messages", updated, setMessages);
      }
    }
  }, [matches]);

  const candidates = useMemo(() => demoUsers.filter(u => {
    if (likes.includes(u.id) || passes.includes(u.id)) return false;
    if (filter !== "All" && u.location !== filter) return false;
    if (profile && (u.budgetMax < profile.budgetMin || u.budgetMin > profile.budgetMax)) return false;
    return true;
  }), [likes, passes, filter, profile]);

  const current = candidates[index] || candidates[0];
  const nextCandidate = candidates[index + 1] || candidates[1];
  const result = current && profile ? compatibility(profile, current) : null;
  const nextResult = nextCandidate && profile ? compatibility(profile, nextCandidate) : null;

  const totalUnread = useMemo(() => {
    let count = 0;
    Object.values(messages).forEach(thread => {
      if (Array.isArray(thread)) {
        count += thread.filter(m => m.sender !== "me" && !m.isRead).length;
      }
    });
    return count;
  }, [messages]);

  const saveProfile = () => {
    if (!form.name.trim()) return notify("Please enter your name first.");
    persist("bunkd_profile", form, setProfile);
    setActive("Discover");
    notify("Your profile is ready. Let's find your flatmate!");
  };

  const act = type => {
    if (!current) return;
    if (type === "like") {
      const next = [...likes, current.id];
      persist("bunkd_likes", next, setLikes);
      // Demo simulation: selected profiles reciprocate to make the mutual match flow demonstrable.
      const reciprocates = ["u1", "u4", "u6"].includes(current.id);
      if (reciprocates) {
        const updated = [...matches.filter(m => m.id !== current.id), current];
        persist("bunkd_matches", updated, setMatches);

        // Pre-seed conversation with greeting
        setMessages(prev => {
          if (!prev[current.id]) {
            const initial = { ...prev, [current.id]: getInitialMessages(current) };
            localStorage.setItem("bunkd_messages", JSON.stringify(initial));
            return initial;
          }
          return prev;
        });

        setCelebration({
          person: current,
          result: result
        });
      } else {
        notify(`You liked ${current.name}`);
      }
    } else {
      persist("bunkd_passes", [...passes, current.id], setPasses);
      notify(`Passed ${current.name}`);
    }
    setIndex(0);
  };

  // Open chat directly with a specific match and mark unread as read
  const openChatWith = person => {
    setCelebration(null);
    setActive("Chat");
    setActiveChatId(person.id);

    // Mark messages in this thread as read
    setMessages(prev => {
      const thread = prev[person.id] || getInitialMessages(person);
      const updatedThread = thread.map(m => ({ ...m, isRead: true }));
      const updated = { ...prev, [person.id]: updatedThread };
      localStorage.setItem("bunkd_messages", JSON.stringify(updated));
      return updated;
    });
  };

  const sendMessage = (personId, text) => {
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg = {
      id: Date.now().toString(),
      sender: "me",
      text,
      timestamp: time,
      isRead: true
    };

    const currentThread = messages[personId] || [];
    const nextThread = [...currentThread, userMsg];
    const nextMessages = { ...messages, [personId]: nextThread };
    persist("bunkd_messages", nextMessages, setMessages);

    // Simulate typing and reply from the matched person
    const matchedPerson = matches.find(m => m.id === personId);
    if (!matchedPerson) return;

    // Show typing indicator after a brief pause
    setTimeout(() => {
      setTypingStatus(prev => ({ ...prev, [personId]: true }));
    }, 450);

    // Append realistic response
    setTimeout(() => {
      const replyTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const replyText = getSimulatedReply(matchedPerson, text);
      const replyMsg = {
        id: (Date.now() + 1).toString(),
        sender: personId,
        text: replyText,
        timestamp: replyTime,
        isRead: active === "Chat" && activeChatId === personId
      };

      setMessages(prev => {
        const thread = prev[personId] || [];
        const updated = { ...prev, [personId]: [...thread, replyMsg] };
        localStorage.setItem("bunkd_messages", JSON.stringify(updated));
        return updated;
      });

      setTypingStatus(prev => ({ ...prev, [personId]: false }));
    }, 1700);
  };

  // Trigger swipe exit animation smoothly
  const triggerSwipeExit = (type, startX = 0, startY = 0) => {
    if (exitDirection) return;
    setIsDragging(false);
    setExitDirection(type);
    const screenWidth = typeof window !== "undefined" ? window.innerWidth : 600;
    const exitTargetX = type === "like" ? Math.max(screenWidth, 650) : -Math.max(screenWidth, 650);
    setDragOffset({ x: exitTargetX, y: startY });

    setTimeout(() => {
      act(type);
      setExitDirection(null);
      setDragOffset({ x: 0, y: 0 });
    }, 280);
  };

  // Drag and Pointer Events for active swipe card
  const handlePointerDown = e => {
    if (exitDirection) return;
    if (e.target.closest("button") || e.target.closest("input") || e.target.closest("select") || e.target.closest("a")) {
      return;
    }
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      active: true,
      pointerId: e.pointerId
    };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (err) {}
  };

  const handlePointerMove = e => {
    if (!dragStartRef.current.active || exitDirection) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;

    if (!isDragging && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) {
      setIsDragging(true);
    }
    setDragOffset({ x: dx, y: dy });
  };

  const handlePointerUp = e => {
    if (!dragStartRef.current.active) return;
    const finalDx = e.clientX ? e.clientX - dragStartRef.current.x : dragOffset.x;
    const finalDy = e.clientY ? e.clientY - dragStartRef.current.y : dragOffset.y;
    dragStartRef.current.active = false;

    try {
      e.currentTarget.releasePointerCapture(dragStartRef.current.pointerId);
    } catch (err) {}

    const SWIPE_THRESHOLD = 90;

    if (finalDx > SWIPE_THRESHOLD) {
      triggerSwipeExit("like", finalDx, finalDy);
    } else if (finalDx < -SWIPE_THRESHOLD) {
      triggerSwipeExit("pass", finalDx, finalDy);
    } else {
      // Snap back smoothly
      setIsDragging(false);
      setDragOffset({ x: 0, y: 0 });
    }
  };

  const resetDemo = (fullReset = false) => {
    [
      "bunkd_likes", "bunkd_passes", "bunkd_matches", "bunkd_messages",
      "livein_likes", "livein_passes", "livein_matches", "livein_messages",
      "roomsync_likes", "roomsync_passes", "roomsync_matches", "roomsync_messages"
    ].forEach(k => localStorage.removeItem(k));
    setLikes([]);
    setPasses([]);
    setMatches([]);
    setMessages({});
    setActiveChatId(null);
    setFilter("All");
    setIndex(0);
    setCelebration(null);

    if (fullReset) {
      localStorage.removeItem("bunkd_profile");
      localStorage.removeItem("livein_profile");
      localStorage.removeItem("roomsync_profile");
      setProfile(null);
      setForm(starterProfile);
      setStep(0);
      notify("Profile reset — restart onboarding");
    } else {
      if (!profile) {
        const demoUser = { ...starterProfile, name: "Aakarsh" };
        persist("bunkd_profile", demoUser, setProfile);
      }
      notify("All 6 flatmate profiles restored!");
    }
  };

  if (!profile) {
    return <Onboarding form={form} setForm={setForm} step={step} setStep={setStep} onFinish={saveProfile} />;
  }

  const nav = [
    ["Discover", Compass],
    ["Matches", Users],
    ["Chat", MessageCircle],
    ["Profile", UserRound]
  ];

  // Dynamic stamp opacity based on horizontal drag
  const likeOpacity = Math.min(1, Math.max(0, (dragOffset.x - 20) / 70));
  const nopeOpacity = Math.min(1, Math.max(0, (-dragOffset.x - 20) / 70));

  // Dynamic card transforms
  const rotation = isDragging || exitDirection ? dragOffset.x * 0.08 : 0;
  const cardTransform = isDragging
    ? `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0) rotate(${rotation}deg)`
    : exitDirection
    ? `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0) rotate(${dragOffset.x > 0 ? 18 : -18}deg)`
    : `translate3d(0px, 0px, 0) rotate(0deg)`;

  const cardTransition = isDragging
    ? "none"
    : "transform 0.28s cubic-bezier(0.175, 0.885, 0.32, 1.275)";

  const userAvatar = profile.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=600";

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon"><DoorIcon size={20} color="white" /></div>
          <span>Bunk<span className="brand-accent">'d</span></span>
        </div>
        <div className="side-label">MENU</div>
        {nav.map(([label, Icon]) => {
          let countBadge = "";
          if (label === "Matches" && matches.length) countBadge = matches.length;
          if (label === "Chat" && totalUnread) countBadge = totalUnread;

          return (
            <button
              key={label}
              className={`nav-item ${active === label ? "active" : ""}`}
              onClick={() => { setActive(label); setIndex(0); }}
            >
              <Icon size={18} />
              {label}
              <span className="nav-count">{countBadge}</span>
            </button>
          );
        })}
        <div className="sidebar-bottom">
          <div className="side-card">
            <Sparkles size={18} />
            <b>Find flatmates on your wavelength.</b>
            <p>Bunk'd compares everyday habits, schedules, and living routines to find compatible roommates.</p>
          </div>
          <button className="nav-item" style={{ fontSize: "12px", color: "var(--text-muted)" }} onClick={() => resetDemo(false)}>
            <RotateCcw size={16} /> Reset demo
          </button>
          <div className="mini-user">
            <div className="avatar-small">
              {profile.avatar ? <img src={profile.avatar} alt="" /> : profile.name[0]?.toUpperCase()}
            </div>
            <div>
              <b>{profile.name}</b>
              <small>{profile.location}</small>
            </div>
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div>
            <div className="eyebrow">YOUR NEXT FLAT STARTS HERE</div>
            <h1>
              {active === "Discover"
                ? "Find your kind of people"
                : active === "Matches"
                ? "Your flatmate connections"
                : active === "Chat"
                ? "Direct Messages"
                : "Your lifestyle profile"}
            </h1>
          </div>
          <div className="top-actions">
            <span className="online-dot" /> <span className="top-status">Demo mode</span>
            <button className="icon-button" onClick={() => setActive("Profile")} aria-label="My Profile">
              <UserRound size={18} />
            </button>
          </div>
        </header>

        {active === "Discover" && (
          <section className="content">
            <div className="section-heading">
              <div>
                <h2>Discover flatmates</h2>
                <p>Swipe right to like or left to pass. Mutual interest unlocks direct chat.</p>
              </div>
              <button className="filter-button" onClick={() => setShowFilters(!showFilters)}>
                <SlidersHorizontal size={16} /> Filters
              </button>
            </div>

            {showFilters && (
              <div className="filter-panel">
                <label>
                  Preferred locality
                  <select value={filter} onChange={e => { setFilter(e.target.value); setIndex(0); }}>
                    <option>All</option>
                    {[...new Set(demoUsers.map(u => u.location))].map(x => (
                      <option key={x}>{x}</option>
                    ))}
                  </select>
                </label>
                <span className="filter-note">
                  Your budget: {money(profile.budgetMin)}–{money(profile.budgetMax)}
                </span>
              </div>
            )}

            <div className="discover-layout">
              <div className="card-stage">
                {current ? (
                  <div className="card-stack-stage">
                    {/* Background card preview */}
                    {nextCandidate && (
                      <div
                        className="person-card card-underneath"
                        style={{
                          transform: `scale(${0.95 + Math.min(0.05, Math.abs(dragOffset.x) / 1000)}) translateY(${14 - Math.min(14, Math.abs(dragOffset.x) / 30)}px)`,
                          opacity: 0.82 + Math.min(0.18, Math.abs(dragOffset.x) / 350)
                        }}
                      >
                        <div className="person-photo" style={{ backgroundImage: `url(${nextCandidate.avatar})` }}>
                          <div className="photo-top">
                            <span className="verified"><ShieldCheck size={13} /> Flatmate</span>
                            <span className="score-badge"><Sparkles size={13} /> {nextResult?.score}% match</span>
                          </div>
                          <div className="photo-gradient" />
                          <div className="person-name">
                            <h2>{nextCandidate.name}, {nextCandidate.age}</h2>
                            <p>{nextCandidate.occupation} · {nextCandidate.college}</p>
                          </div>
                        </div>
                        <div className="person-info">
                          <div className="person-facts">
                            <span><MapPin size={15} />{nextCandidate.location}</span>
                            <span><Wallet size={15} />{money(nextCandidate.budgetMin)}–{money(nextCandidate.budgetMax)}</span>
                          </div>
                          <p className="person-bio">{nextCandidate.bio}</p>
                          <div className="tag-row">
                            {nextCandidate.tags.map(t => <span className="tag" key={t}>{t}</span>)}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Active Swipeable Card */}
                    <div
                      key={current.id}
                      className="person-card swipeable-card"
                      style={{
                        transform: cardTransform,
                        transition: cardTransition
                      }}
                      onPointerDown={handlePointerDown}
                      onPointerMove={handlePointerMove}
                      onPointerUp={handlePointerUp}
                      onPointerCancel={handlePointerUp}
                    >
                      <div className="person-photo" style={{ backgroundImage: `url(${current.avatar})` }}>
                        {/* Stamp Badges */}
                        {likeOpacity > 0.05 && (
                          <div className="stamp-badge stamp-like" style={{ opacity: likeOpacity }}>
                            CONNECT
                          </div>
                        )}
                        {nopeOpacity > 0.05 && (
                          <div className="stamp-badge stamp-nope" style={{ opacity: nopeOpacity }}>
                            PASS
                          </div>
                        )}

                        <div className="photo-top">
                          <span className="verified"><ShieldCheck size={13} /> Flatmate</span>
                          <span className="score-badge"><Sparkles size={13} /> {result?.score}% match</span>
                        </div>
                        <div className="photo-gradient" />
                        <div className="person-name">
                          <h2>{current.name}, {current.age}</h2>
                          <p>{current.occupation} · {current.college}</p>
                        </div>
                      </div>

                      <div className="person-info">
                        <div className="person-facts">
                          <span><MapPin size={15} />{current.location}</span>
                          <span><Wallet size={15} />{money(current.budgetMin)}–{money(current.budgetMax)}</span>
                        </div>
                        <p className="person-bio">{current.bio}</p>
                        <div className="tag-row">
                          {current.tags.map(t => <span className="tag" key={t}>{t}</span>)}
                        </div>
                        <div className="compat-box">
                          <div className="compat-head">
                            <span><Sparkles size={15} /> Why you might click</span>
                            <b>{result?.score}%</b>
                          </div>
                          <div className="score-track">
                            <div style={{ width: `${result?.score}%` }} />
                          </div>
                          <div className="strengths">
                            {result?.strengths.slice(0, 2).map(s => (
                              <span key={s}><Check size={12} />{s.split(" (")[0]}</span>
                            ))}
                          </div>
                        </div>
                        {result?.hardConflicts.length > 0 && (
                          <div className="conflict-note">
                            <ShieldCheck size={14} /> Discuss: {result.hardConflicts[0]}
                          </div>
                        )}
                        <div className="card-actions">
                          <button
                            className="pass-action"
                            onClick={e => { e.stopPropagation(); triggerSwipeExit("pass"); }}
                            onPointerDown={e => e.stopPropagation()}
                            aria-label="Pass"
                          >
                            <X size={24} />
                          </button>
                          <button
                            className="details-action"
                            onClick={e => { e.stopPropagation(); setSelected(current); }}
                            onPointerDown={e => e.stopPropagation()}
                          >
                            View profile <ChevronRight size={15} />
                          </button>
                          <button
                            className="like-action"
                            onClick={e => { e.stopPropagation(); triggerSwipeExit("like"); }}
                            onPointerDown={e => e.stopPropagation()}
                            aria-label="Interested"
                            title="Interested in connecting"
                          >
                            <Check size={26} strokeWidth={2.8} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="empty-state">
                    <div className="empty-icon"><Compass size={32} /></div>
                    <h3>You've seen everyone!</h3>
                    <p>Try changing your location filter or reset the demo to explore profiles again.</p>
                    <button className="primary-button" onClick={() => { setFilter("All"); setIndex(0); notify("Filters cleared"); }}>
                      Clear filters
                    </button>
                  </div>
                )}
                <div className="card-counter">
                  {Math.min(likes.length + passes.length + (current ? 1 : 0), demoUsers.length)} of {demoUsers.length} profiles explored
                </div>
              </div>

              <aside className="insight-column">
                <div className="insight-card purple-card">
                  <div className="insight-icon"><DoorIcon size={18} color="var(--primary)" /></div>
                  <span className="eyebrow">YOUR MATCHING STYLE</span>
                  <h3>Compatibility over coincidence.</h3>
                  <p>Bunk'd compares everyday habits, sleep rhythms, cleanliness, and social routines for peaceful living.</p>
                </div>
                <div className="insight-card">
                  <span className="eyebrow">YOUR PREFERENCES</span>
                  <h3>{profile.location}</h3>
                  <div className="preference-line"><MapPin size={15} /> {profile.location}</div>
                  <div className="preference-line"><Wallet size={15} /> {money(profile.budgetMin)} – {money(profile.budgetMax)}</div>
                  <div className="preference-line"><Moon size={15} /> {profile.sleep}</div>
                  <button className="text-button" onClick={() => setActive("Profile")}>
                    Edit preferences <ArrowRight size={14} />
                  </button>
                </div>
                <div className="tip-card">
                  <ShieldCheck size={20} />
                  <div>
                    <b>Take your time</b>
                    <p>Discuss schedules and household expectations before signing a lease.</p>
                  </div>
                </div>
              </aside>
            </div>
          </section>
        )}

        {active === "Matches" && (
          <section className="content">
            <div className="section-heading">
              <div>
                <h2>People you connected with</h2>
                <p>Mutual interest unlocks direct messaging. Click any match to open chat or view details.</p>
              </div>
              <span className="count-pill">{matches.length} matches</span>
            </div>
            {matches.length ? (
              <div className="match-grid">
                {matches.map(person => (
                  <MatchCard
                    key={person.id}
                    person={person}
                    profile={profile}
                    onChat={() => openChatWith(person)}
                    onViewProfile={e => {
                      e.stopPropagation();
                      setSelected(person);
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-state wide">
                <div className="empty-icon"><Users size={32} /></div>
                <h3>Your matches will show up here</h3>
                <p>Express interest in profiles in Discover. Seeded flatmates will reciprocate so you can test the mutual match experience!</p>
                <button className="primary-button" onClick={() => setActive("Discover")}>
                  Explore flatmates
                </button>
              </div>
            )}
          </section>
        )}

        {active === "Chat" && (
          <section className="content chat-content-section">
            <ChatView
              matches={matches}
              messages={messages}
              activeChatId={activeChatId}
              setActiveChatId={id => {
                setActiveChatId(id);
                // Mark thread as read
                if (id) {
                  setMessages(prev => {
                    const thread = prev[id] || [];
                    const updatedThread = thread.map(m => ({ ...m, isRead: true }));
                    const updated = { ...prev, [id]: updatedThread };
                    localStorage.setItem("bunkd_messages", JSON.stringify(updated));
                    return updated;
                  });
                }
              }}
              onSendMessage={sendMessage}
              typingStatus={typingStatus}
              profile={profile}
              onViewProfile={p => setSelected(p)}
              onExplore={() => setActive("Discover")}
            />
          </section>
        )}

        {active === "Profile" && (
          <section className="content profile-content">
            <div className="section-heading">
              <div>
                <h2>Your lifestyle profile</h2>
                <p>This is what helps us match you with compatible flatmates.</p>
              </div>
              <button className="filter-button" onClick={() => { setForm(profile); setStep(0); setProfile(null); }}>
                Edit profile
              </button>
            </div>
            <div className="profile-summary">
              <div className="profile-initial">
                {profile.avatar ? <img src={profile.avatar} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} /> : profile.name[0]}
              </div>
              <div>
                <h2>{profile.name}, {profile.age}</h2>
                <p>{profile.occupation} · {profile.college}</p>
                <span className="location-tag"><MapPin size={13} /> {profile.location}</span>
              </div>
            </div>
            <div className="details-grid">
              {Object.entries({
                Budget: `${money(profile.budgetMin)} – ${money(profile.budgetMax)}`,
                Sleep: profile.sleep,
                Cleanliness: profile.cleanliness,
                Social: profile.social,
                Guests: profile.guests,
                Smoking: profile.smoking,
                Food: profile.food,
                Noise: profile.noise,
                "Personal space": profile.personalSpace
              }).map(([k, v]) => (
                <div className="detail-tile" key={k}>
                  <small>{k}</small>
                  <b>{v}</b>
                </div>
              ))}
            </div>
            <button className="danger-link" onClick={() => resetDemo(true)}>
              <RotateCcw size={16} /> Reset demo profile
            </button>
          </section>
        )}

        <footer className="footer">
          Bunk'd <span>·</span> Find your perfect flatmate <span>·</span> Lifestyle Matching Platform
        </footer>
      </main>

      {/* Match Celebration Modal */}
      {celebration && (
        <MatchCelebrationModal
          userAvatar={userAvatar}
          userName={profile.name}
          matchPerson={celebration.person}
          result={celebration.result}
          onSendMessage={openChatWith}
          onKeepSwiping={() => setCelebration(null)}
        />
      )}

      {selected && (
        <ProfileModal
          person={selected}
          profile={profile}
          onClose={() => setSelected(null)}
          onChat={matches.some(m => m.id === selected.id) ? () => { setSelected(null); openChatWith(selected); } : null}
        />
      )}
      {toast && <div className="toast"><Check size={16} />{toast}</div>}
    </div>
  );
}

function MatchCelebrationModal({ userAvatar, userName, matchPerson, result, onSendMessage, onKeepSwiping }) {
  return (
    <div className="match-celebration-backdrop" onClick={onKeepSwiping}>
      <div className="match-celebration-card" onClick={e => e.stopPropagation()}>
        <div className="celebration-badge-top">
          <Sparkles size={13} /> Mutual Connection
        </div>
        <h1>It's a Match!</h1>
        <p className="match-subtitle">
          You and <b>{matchPerson.name}</b> are mutually interested in sharing a flat.
        </p>

        <div className="match-avatars-row">
          <div className="match-avatar-circle left-avatar">
            <img src={userAvatar} alt={userName} />
          </div>
          <div className="match-connection-center">
            <DoorIcon size={22} color="white" />
          </div>
          <div className="match-avatar-circle right-avatar">
            <img src={matchPerson.avatar} alt={matchPerson.name} />
          </div>
        </div>

        <div className="match-score-pill">
          <Sparkles size={14} /> {result?.score}% Lifestyle Compatibility
        </div>

        <p className="match-explanation-quote">
          {explainMatch(result, matchPerson)}
        </p>

        <div className="celebration-actions">
          <button className="celebration-primary-btn" onClick={() => onSendMessage(matchPerson)}>
            <Send size={16} /> Send a Message
          </button>
          <button className="celebration-secondary-btn" onClick={onKeepSwiping}>
            Keep Swiping
          </button>
        </div>
      </div>
    </div>
  );
}

function ChatView({
  matches,
  messages,
  activeChatId,
  setActiveChatId,
  onSendMessage,
  typingStatus,
  profile,
  onViewProfile,
  onExplore
}) {
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef(null);

  const activePerson = useMemo(() => {
    if (activeChatId) {
      return matches.find(m => m.id === activeChatId) || null;
    }
    return matches.length > 0 ? matches[0] : null;
  }, [matches, activeChatId]);

  // Default to first match on desktop if no activeChatId set
  useEffect(() => {
    if (!activeChatId && matches.length > 0 && typeof window !== "undefined" && window.innerWidth > 720) {
      setActiveChatId(matches[0].id);
    }
  }, [matches, activeChatId, setActiveChatId]);

  // Scroll to bottom whenever messages or typing change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeChatId, typingStatus]);

  const activeMessages = activePerson ? messages[activePerson.id] || [] : [];
  const activeCompatibility = activePerson && profile ? compatibility(profile, activePerson) : null;

  const handleSend = (textToSend = inputText) => {
    const trimmed = textToSend.trim();
    if (!trimmed || !activePerson) return;
    onSendMessage(activePerson.id, trimmed);
    setInputText("");
  };

  const handleKeyDown = e => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Generate dynamic contextual icebreaker chips based on compatibility
  const icebreakers = useMemo(() => {
    if (!activePerson) return [];
    const loc = activePerson.location;
    const topStrength = activeCompatibility?.strengths?.[0]?.split(" (")[0]?.toLowerCase() || "lifestyle habits";

    return [
      `Hey ${activePerson.name}! Great to match. How's your flat hunt going?`,
      `Saw we both align on ${topStrength}! Looking around ${loc}?`,
      `What's your target move-in timeline for a flat in ${loc}?`
    ];
  }, [activePerson, activeCompatibility]);

  if (matches.length === 0) {
    return (
      <div className="chat-empty-container">
        <div className="empty-state wide">
          <div className="empty-icon"><MessageCircle size={34} /></div>
          <h3>No active chats yet</h3>
          <p>
            Connect with flatmates in Discover. When you both express mutual interest, your direct conversation opens here!
          </p>
          <button className="primary-button" onClick={onExplore}>
            Explore Flatmates
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-layout-card">
      {/* Conversations Sidebar Pane */}
      <div className={`chat-sidebar-pane ${activeChatId ? "mobile-hidden" : ""}`}>
        <div className="chat-sidebar-header">
          <h2>Messages</h2>
          <span className="chat-count-pill">{matches.length} matches</span>
        </div>

        {/* Matches Horizontal Story Tray */}
        <div className="chat-matches-tray">
          <span className="tray-label">NEW MATCHES</span>
          <div className="tray-scroll">
            {matches.map(person => {
              const isSelected = activePerson?.id === person.id;
              const thread = messages[person.id] || [];
              const hasUnread = thread.some(m => m.sender !== "me" && !m.isRead);

              return (
                <button
                  key={person.id}
                  className={`tray-avatar-item ${isSelected ? "selected" : ""}`}
                  onClick={() => setActiveChatId(person.id)}
                  title={`Chat with ${person.name}`}
                >
                  <div className="tray-avatar-ring">
                    <img src={person.avatar} alt={person.name} />
                    {hasUnread && <span className="unread-dot-badge" />}
                  </div>
                  <span className="tray-name">{person.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Conversations List */}
        <div className="chat-threads-list">
          <span className="threads-label">CONVERSATIONS</span>
          {matches.map(person => {
            const isSelected = activePerson?.id === person.id;
            const thread = messages[person.id] || [];
            const lastMsg = thread[thread.length - 1];
            const unreadCount = thread.filter(m => m.sender !== "me" && !m.isRead).length;

            return (
              <button
                key={person.id}
                className={`chat-thread-item ${isSelected ? "active" : ""}`}
                onClick={() => setActiveChatId(person.id)}
              >
                <div className="thread-avatar-wrapper">
                  <img src={person.avatar} alt={person.name} />
                  <span className="online-indicator-dot" />
                </div>
                <div className="thread-content">
                  <div className="thread-top">
                    <span className="thread-name">{person.name}</span>
                    <span className="thread-time">{lastMsg ? lastMsg.timestamp : "Just now"}</span>
                  </div>
                  <div className="thread-bottom">
                    <p className="thread-snippet">
                      {lastMsg
                        ? (lastMsg.sender === "me" ? "You: " : "") + lastMsg.text
                        : `Matched with ${person.name}!`}
                    </p>
                    {unreadCount > 0 && <span className="thread-unread-pill">{unreadCount}</span>}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Conversation Pane */}
      {activePerson ? (
        <div className={`chat-conversation-pane ${!activeChatId ? "mobile-hidden" : ""}`}>
          {/* Conversation Header */}
          <div className="chat-header">
            <button
              className="chat-back-btn"
              onClick={() => setActiveChatId(null)}
              aria-label="Back to conversations"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="chat-header-user" onClick={() => onViewProfile(activePerson)}>
              <div className="chat-header-avatar">
                <img src={activePerson.avatar} alt={activePerson.name} />
                <span className="online-indicator-dot" />
              </div>
              <div>
                <h3>{activePerson.name}, {activePerson.age}</h3>
                <p className="chat-user-status">Active now · {activePerson.location}</p>
              </div>
            </div>
            <div className="chat-header-actions">
              {activeCompatibility && (
                <button
                  className="chat-compat-pill"
                  onClick={() => onViewProfile(activePerson)}
                  title="View full lifestyle compatibility breakdown"
                >
                  <Sparkles size={13} />
                  <span>{activeCompatibility.score}% Match</span>
                </button>
              )}
              <button
                className="icon-button"
                onClick={() => onViewProfile(activePerson)}
                title="View Profile Details"
                aria-label="View profile"
              >
                <Info size={18} />
              </button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="chat-messages-scroll">
            {/* Match Header Intro Box */}
            <div className="chat-match-intro">
              <div className="intro-dual-avatars">
                <img src={profile.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=600"} alt={profile.name} className="intro-avatar user" />
                <div className="intro-connection-badge"><DoorIcon size={12} color="white" /></div>
                <img src={activePerson.avatar} alt={activePerson.name} className="intro-avatar match" />
              </div>
              <h4>You and {activePerson.name} connected</h4>
              <p>
                {activeCompatibility
                  ? `${activeCompatibility.score}% Lifestyle compatibility · ${activePerson.location}`
                  : `Both exploring flatmates in ${activePerson.location}`}
              </p>
              <span className="intro-tip">
                <ShieldCheck size={13} /> Discuss everyday routines, budget splits, and visit potential flats together.
              </span>
            </div>

            {/* Render Messages */}
            {activeMessages.map(msg => {
              const isMe = msg.sender === "me";
              return (
                <div key={msg.id} className={`chat-message-row ${isMe ? "outgoing" : "incoming"}`}>
                  {!isMe && (
                    <img
                      src={activePerson.avatar}
                      alt={activePerson.name}
                      className="chat-bubble-avatar"
                    />
                  )}
                  <div className="chat-bubble-container">
                    <div className={`chat-bubble ${isMe ? "me" : "them"}`}>
                      <p>{msg.text}</p>
                    </div>
                    <span className="chat-message-time">
                      {msg.timestamp}
                      {isMe && <CheckCheck size={13} className="read-receipt-icon" />}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {typingStatus[activePerson.id] && (
              <div className="chat-message-row incoming typing-row">
                <img src={activePerson.avatar} alt="" className="chat-bubble-avatar" />
                <div className="chat-bubble them typing-bubble">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Icebreakers Bar */}
          {icebreakers.length > 0 && (
            <div className="chat-icebreakers-bar">
              <span className="icebreakers-label"><Sparkles size={12} /> Starters:</span>
              <div className="icebreakers-scroll">
                {icebreakers.map((starter, i) => (
                  <button
                    key={i}
                    className="icebreaker-chip"
                    onClick={() => handleSend(starter)}
                  >
                    {starter}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Bar */}
          <div className="chat-input-bar">
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${activePerson.name}...`}
              className="chat-text-input"
            />
            <button
              className="chat-send-button"
              onClick={() => handleSend()}
              disabled={!inputText.trim()}
              aria-label="Send message"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      ) : (
        <div className="chat-conversation-pane empty">
          <p>Select a match to start messaging</p>
        </div>
      )}
    </div>
  );
}

function Onboarding({ form, setForm, step, setStep, onFinish }) {
  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const q = questions[step - 1];
  const total = questions.length + 1;
  const next = () => {
    if (step === 0 && !form.name.trim()) return;
    if (step < total - 1) setStep(step + 1);
    else onFinish();
  };

  return (
    <div className="onboarding">
      <div className="onboard-brand">
        <div className="brand-icon"><DoorIcon size={20} color="white" /></div>
        <span>Bunk<span className="brand-accent">'d</span></span>
      </div>
      <div className="onboard-wrap">
        <div className="onboard-top">
          <span>LET'S GET TO KNOW YOU</span>
          <span>{step + 1} / {total}</span>
        </div>
        <div className="progress-track">
          <div style={{ width: `${((step + 1) / total) * 100}%` }} />
        </div>
        {step === 0 ? (
          <>
            <div className="onboard-icon"><Users size={24} /></div>
            <h1>First, the basics.</h1>
            <p className="lead">A little about you helps us find flatmates on your wavelength.</p>
            <div className="form-grid">
              <Field label="Your name">
                <input value={form.name} onChange={e => update("name", e.target.value)} placeholder="e.g. Aakarsh" />
              </Field>
              <Field label="Age">
                <input type="number" min="18" value={form.age} onChange={e => update("age", e.target.value)} />
              </Field>
              <Field label="I am a">
                <select value={form.occupation} onChange={e => update("occupation", e.target.value)}>
                  <option>Student</option>
                  <option>Working professional</option>
                  <option>Freelancer</option>
                </select>
              </Field>
              <Field label="College / workplace">
                <input value={form.college} onChange={e => update("college", e.target.value)} placeholder="Your college or workplace" />
              </Field>
              <Field label="Preferred locality">
                <input value={form.location} onChange={e => update("location", e.target.value)} placeholder="e.g. Rohini" />
              </Field>
              <Field label="Move-in timing">
                <select value={form.moveIn} onChange={e => update("moveIn", e.target.value)}>
                  <option>Flexible</option>
                  <option>November</option>
                  <option>December</option>
                  <option>January</option>
                  <option>February</option>
                </select>
              </Field>
              <Field label="Minimum monthly budget (₹)">
                <input type="number" value={form.budgetMin} onChange={e => update("budgetMin", e.target.value)} />
              </Field>
              <Field label="Maximum monthly budget (₹)">
                <input type="number" value={form.budgetMax} onChange={e => update("budgetMax", e.target.value)} />
              </Field>
            </div>
          </>
        ) : (
          <>
            <div className="onboard-icon"><Sparkles size={24} /></div>
            <div className="step-kicker">YOUR LIFESTYLE · {String(step).padStart(2, "0")}</div>
            <h1>{q.title}</h1>
            <p className="lead">{q.subtitle}</p>
            <div className="option-list">
              {q.options.map(opt => (
                <button
                  key={opt}
                  className={`option-card ${form[q.key] === opt ? "chosen" : ""}`}
                  onClick={() => update(q.key, opt)}
                >
                  <span>{opt}</span>
                  {form[q.key] === opt ? <Check size={18} /> : <span className="option-radio" />}
                </button>
              ))}
            </div>
            {step === 4 && (
              <label className="checkline">
                <input
                  type="checkbox"
                  checked={!!form.smokingHard}
                  onChange={e => update("smokingHard", e.target.checked)}
                />
                Make smoke-free living a non-negotiable preference
              </label>
            )}
          </>
        )}
        <div className="onboard-actions">
          <button className="back-button" disabled={step === 0} onClick={() => setStep(step - 1)}>
            Back
          </button>
          <button className="primary-button" onClick={next}>
            {step === total - 1 ? "Create my profile" : "Continue"} <ArrowRight size={16} />
          </button>
        </div>
        <p className="privacy-note">
          <ShieldCheck size={14} /> Your preferences are stored in this browser for this demo.
        </p>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function MatchCard({ person, profile, onChat, onViewProfile }) {
  const result = compatibility(profile, person);
  return (
    <div className="match-card" onClick={onChat}>
      <img src={person.avatar} alt={person.name} />
      <div className="match-card-info">
        <b>{person.name}, {person.age}</b>
        <span>{person.location}</span>
        <small><Sparkles size={12} /> {result.score}% compatible</small>
      </div>
      <div className="match-card-actions">
        <button
          className="match-chat-action-btn"
          onClick={e => {
            e.stopPropagation();
            onChat();
          }}
          title="Chat with flatmate"
        >
          <MessageCircle size={16} />
          <span>Chat</span>
        </button>
        <button
          className="match-info-action-btn"
          onClick={onViewProfile}
          title="View profile details"
          aria-label="View profile"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

function ProfileModal({ person, profile, onClose, onChat }) {
  const r = compatibility(profile, person);
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="profile-modal" onClick={e => e.stopPropagation()}>
        {/* Floating Close Button - stays pinned and accessible while scrolling */}
        <button className="modal-close" onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        {/* Scrollable container with modern sleek scrollbar */}
        <div className="modal-scroll-content">
          <div className="modal-photo-container">
            <img className="modal-photo" src={person.avatar} alt={person.name} />
            <div className="modal-photo-gradient" />
            <div className="modal-photo-badges">
              <span className="verified"><ShieldCheck size={13} /> Flatmate</span>
              <span className="score-badge"><Sparkles size={13} /> {r.score}% Match</span>
            </div>
            <div className="modal-photo-overlay-info">
              <h2>{person.name}, {person.age}</h2>
              <p>{person.occupation} · {person.college}</p>
            </div>
          </div>

          <div className="modal-body">
            <div className="modal-meta-row">
              <span><MapPin size={15} /> {person.location}</span>
              <span><Wallet size={15} /> {money(person.budgetMin)}–{money(person.budgetMax)} / mo</span>
            </div>

            {person.bio && <p className="modal-bio">{person.bio}</p>}

            {person.tags && person.tags.length > 0 && (
              <div className="tag-row modal-tags">
                {person.tags.map(t => (
                  <span className="tag" key={t}>{t}</span>
                ))}
              </div>
            )}

            {/* Why you could get along */}
            <div className="modal-section">
              <div className="modal-section-header">
                <Sparkles size={16} className="section-icon-primary" />
                <h3>Why you could get along</h3>
                <span className="section-badge">{r.score}% overall</span>
              </div>
              <div className="strengths-list">
                {r.strengths.map(x => (
                  <div className="reason-row" key={x}>
                    <Check size={15} />
                    <span>{x}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Things to discuss */}
            <div className="modal-section">
              <div className="modal-section-header">
                <MessageCircle size={16} className="section-icon-discuss" />
                <h3>Things to discuss</h3>
              </div>
              {r.conflicts.length ? (
                <div className="conflicts-list">
                  {r.conflicts.map(x => (
                    <div className="reason-row caution" key={x}>
                      <MessageCircle size={15} />
                      <span>{x}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="muted-text">No major lifestyle differences detected in the answers provided.</p>
              )}
            </div>

            {/* About their lifestyle */}
            <div className="modal-section">
              <div className="modal-section-header">
                <Users size={16} className="section-icon-lifestyle" />
                <h3>About their lifestyle</h3>
              </div>
              <div className="details-grid compact">
                {Object.entries({
                  Sleep: person.sleep,
                  Cleanliness: person.cleanliness,
                  Social: person.social,
                  Guests: person.guests,
                  Food: person.food,
                  Noise: person.noise,
                  "Move-in": person.moveIn || "Flexible",
                  "Room type": person.roomType || "Either"
                }).map(([k, v]) => (
                  <div className="detail-tile" key={k}>
                    <small>{k}</small>
                    <b>{v}</b>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Chat with Matched Flatmate */}
            {onChat && (
              <div className="modal-chat-action-container">
                <button className="primary-button modal-chat-btn" onClick={onChat}>
                  <MessageCircle size={18} /> Chat with {person.name}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
