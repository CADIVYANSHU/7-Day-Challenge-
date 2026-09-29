import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
const db=createClient("https://qtcykwhaqrjzgwzasdwy.supabase.co","sb_publishable_oQ3mUyvAAc4dksqDjAvnxw_ARn-BJoX");
const OWNER="divyanshugarg14y@gmail.com",START="2026-09-29",END="2026-10-05",DAYS=7;
const SLOTS=[{id:"noon",label:"12:05 PM"},{id:"evening",label:"5:30 PM"},{id:"night",label:"10:30 PM"}];
const $=id=>document.getElementById(id);
const today=()=>new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kolkata",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
const dayDate=i=>{const d=new Date(Date.UTC(2026,8,29+i));return d.toISOString().slice(0,10)};
const escapeHtml=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let checkins=[],consumption=[],selected=null,session=null;
function notice(msg,bad=false){$("notice").textContent=msg;$("notice").className="notice"+(bad?" error":"")}
function setAuthMessage(msg,bad=false){$("authMsg").textContent=msg;$("authMsg").className=bad?"error":"muted"}
function showApp(s){session=s;const valid=s?.user?.email?.toLowerCase()===OWNER;$("auth").classList.toggle("hidden",valid);$("app").classList.toggle("hidden",!valid);if(valid)load().catch(e=>notice(e.message,true));else if(s)setAuthMessage("This account is not authorized for this challenge.",true)}
async function load(){const [u,c]=await Promise.all([db.from("check_ins").select("*").order("challenge_date"),db.from("consumption_logs").select("*").order("challenge_date",{ascending:false}).order("consumed_time",{ascending:false})]);if(u.error)throw u.error;if(c.error)throw c.error;checkins=u.data||[];consumption=c.data||[];render()}
function render(){const now=today(),day=now>=START&&now<=END?DAYS-(END.slice(-2)-now.slice(-2)):null;
$("todayTitle").textContent=new Date().toLocaleDateString("en-IN",{timeZone:"Asia/Kolkata",day:"numeric",month:"long",year:"numeric"});
$("dayBadge").textContent=day?"DAY "+day+" / 7":now<START?"STARTS 29 SEP":"CHALLENGE COMPLETE";
$("updates").textContent=checkins.filter(c=>c.challenge_date===now).length+"/3";
$("consumed").textContent=consumption.length;
let streak=0;for(let i=0;i<DAYS;i++){const date=dayDate(i);if(date>now)break;const count=checkins.filter(c=>c.challenge_date===date).length;const smoked=consumption.some(c=>c.challenge_date===date);if(smoked)streak=0;else if(count===3)streak++;}
$("streak").textContent=streak;
const chosen=$("dateSelect").value||((now>=START&&now<=END)?now:START);
$("dateSelect").innerHTML=Array.from({length:DAYS},(_,i)=>{const d=dayDate(i);return '<option value="'+d+'" '+(d===chosen?"selected":"")+' '+(d>now?"disabled":"")+'>Day '+(i+1)+' · '+d+'</option>'}).join("");
renderSlots();renderCalendar();renderLog()}
function renderSlots(){const date=$("dateSelect").value;const mine=checkins.filter(c=>c.challenge_date===date);
$("slots").innerHTML=SLOTS.map(s=>{const done=mine.find(c=>c.slot===s.id);return '<button type="button" class="slot '+(done?"done ":"")+(selected===s.id?"selected":"")+'" data-slot="'+s.id+'" '+(done||date>today()?"disabled":"")+'><strong>'+s.label+'</strong><small>'+(done?(done.smoked?"Recorded consumption":"Smoke-free update"):"Awaiting update")+'</small></button>'}).join("");
$("slots").querySelectorAll("[data-slot]").forEach(b=>b.addEventListener("click",()=>{selected=b.dataset.slot;$("formTitle").textContent="Check-in · "+SLOTS.find(s=>s.id===selected).label+" · "+date;$("checkin").classList.remove("hidden");$("formMsg").textContent="";renderSlots()}))}
function renderCalendar(){const now=today();$("calendar").innerHTML=Array.from({length:DAYS},(_,i)=>{const date=dayDate(i),mine=checkins.filter(c=>c.challenge_date===date),smoked=consumption.some(c=>c.challenge_date===date),cls=smoked?"consumption":mine.length===3?"clean":date>now?"future":"";return '<button type="button" data-day="'+date+'" class="'+cls+" "+(date===now?"today":"")+'"><strong>DAY '+(i+1)+'</strong><small>'+date.slice(5)+'</small><small>'+(smoked?"Consumption":mine.length===3?"Clean ✓":mine.length+"/3 logged")+'</small></button>'}).join("");
$("calendar").querySelectorAll("[data-day]").forEach(b=>b.addEventListener("click",()=>{const date=b.dataset.day,n=checkins.filter(c=>c.challenge_date===date).length,s=consumption.filter(c=>c.challenge_date===date).length;$("calendarMsg").textContent=date+": "+n+"/3 check-ins · "+s+" consumption entries";if(date<=today()){$("dateSelect").value=date;selected=null;$("checkin").classList.add("hidden");renderSlots()}}))}
function renderLog(){$("log").innerHTML=consumption.length?consumption.map(c=>'<article><strong>'+escapeHtml(c.challenge_date)+' · '+escapeHtml(c.consumed_time?.slice(0,5))+' · '+escapeHtml(c.quantity)+'</strong><p>Reason: '+escapeHtml(c.reason)+'</p></article>').join(""):'<p class="muted">No consumption recorded yet.</p>'}
$("login").addEventListener("submit",async e=>{e.preventDefault();const email=$("email").value.trim().toLowerCase();if(email!==OWNER)return setAuthMessage("Only Divyanshu's email is allowed.",true);setAuthMessage("Sending your sign-in link…");const {error}=await db.auth.signInWithOtp({email,options:{shouldCreateUser:true,emailRedirectTo:location.origin+location.pathname}});setAuthMessage(error?error.message:"Check your inbox for your private sign-in link.",!!error)});
$("refresh").addEventListener("click",()=>load().then(()=>notice("Progress refreshed.")).catch(e=>notice(e.message,true)));
$("signout").addEventListener("click",()=>db.auth.signOut().then(()=>{session=null;$("app").classList.add("hidden");$("auth").classList.remove("hidden")}));
$("dateSelect").addEventListener("change",()=>{selected=null;$("checkin").classList.add("hidden");renderSlots()});
$("smoked").addEventListener("change",()=>{const yes=$("smoked").value==="yes";$("smokeFields").classList.toggle("hidden",!yes);for(const id of ["quantity","smokeTime","reason"])$(id).required=yes});
$("cancel").addEventListener("click",()=>{selected=null;$("checkin").classList.add("hidden");renderSlots()});
$("checkin").addEventListener("submit",async e=>{e.preventDefault();const date=$("dateSelect").value;if(!selected||date<START||date>END||date>today())return;const smoked=$("smoked").value==="yes";const button=$("checkin").querySelector('[type="submit"]');button.disabled=true;$("formMsg").textContent="Saving…";try{const {error}=await db.rpc("submit_check_in",{p_challenge_date:date,p_slot:selected,p_smoked:smoked,p_quantity:smoked?$("quantity").value.trim():null,p_consumed_time:smoked?$("smokeTime").value:null,p_reason:smoked?$("reason").value.trim():null});if(error)throw error;$("checkin").reset();$("smokeFields").classList.add("hidden");$("checkin").classList.add("hidden");selected=null;await load();notice("Check-in saved. Thank you for being honest.")}catch(err){$("formMsg").textContent=err.message;$("formMsg").className="error"}finally{button.disabled=false}});
db.auth.getSession().then(({data,error})=>{if(error)setAuthMessage(error.message,true);else showApp(data.session)});
db.auth.onAuthStateChange((_event,s)=>{if(s?.user?.email?.toLowerCase()===OWNER&&!session)showApp(s);else if(!s&&session)showApp(null)});
