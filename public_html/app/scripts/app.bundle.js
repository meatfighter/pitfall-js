"use strict";(self.webpackChunkpitfall_js=self.webpackChunkpitfall_js||[]).push([[524],{699:(e,t,n)=>{n.r(t),n.d(t,{init:()=>et});const o=5,i=new AudioContext;let r=!0;document.addEventListener("visibilitychange",(()=>{"visible"===document.visibilityState?(r=!0,"suspended"===i.state&&i.resume()):"hidden"===document.visibilityState&&(r=!1,"running"===i.state&&i.suspend())}));const s=i.createGain();s.connect(i.destination),s.gain.value=.1;const c=[],a=new Map;function l(e){s.gain.value=e/100}let d=0,u=0,A=!1,m=!1,h=!1,g=null,w=!1;class v{timestampDown=0;xDown=0;yDown=0;x=0;y=0}const f=new Map;function y(){null!==g&&(clearTimeout(g),g=null),w&&(document.body.style.cursor="default",w=!1)}function O(){y(),g=window.setTimeout((()=>{document.body.style.cursor="none",w=!0}),3e3)}function R(e){e.preventDefault();const t=window.innerWidth,n=window.innerHeight,o=t>=n;for(let t=e.changedTouches.length-1;t>=0;--t){const i=e.changedTouches[t];let r,s;switch(o?(r=i.clientX,s=i.clientY):(r=n-1-i.clientY,s=i.clientX),e.type){case"touchstart":{const e=new v;e.timestampDown=Date.now(),e.xDown=e.x=r,e.yDown=e.y=s,f.set(i.identifier,e);break}case"touchmove":{O();const e=f.get(i.identifier);e&&(e.x=r,e.y=s);break}case"touchend":case"touchcancel":{const e=f.get(i.identifier);e&&(r<64&&s<64&&e.xDown<64&&e.yDown<64&&He(),f.delete(i.identifier));break}}}let i=null;for(const[t,n]of Array.from(f)){(!i||n.timestampDown>i.timestampDown)&&(i=n);e:{for(let n=e.touches.length-1;n>=0;--n)if(e.touches[n].identifier===t)break e;f.delete(t)}}i?i.x<t/2?(m=!0,h=!1):(m=!1,h=!0):m=h=!1}function E(e){if(!e.clientX||!e.clientY)return;const t=window.innerWidth,n=window.innerHeight;let o,i;t>=n?(o=e.clientX,i=e.clientY):(o=n-1-e.clientY,i=e.clientX),o<64&&i<64&&He()}function p(e){switch(e.code){case"KeyA":case"ArrowLeft":d=u+1;break;case"KeyD":case"ArrowRight":u=d+1;break;case"Escape":He();break;default:A=!0}}function L(e){switch(e.code){case"KeyA":case"ArrowLeft":d=0;break;case"KeyD":case"ArrowRight":u=0;break;case"Escape":break;default:A=!1}}const C="pitfall-store";class B{highScore=0;volume=10;autofire=function(){const e="ontouchstart"in window||navigator.maxTouchPoints>0,t=window.matchMedia("(hover: hover)").matches,n=window.matchMedia("(pointer: coarse)").matches;return e&&!t&&n}();tracer=!1;fast=!1}let I;function b(){localStorage.setItem(C,JSON.stringify(I))}class k{save(){b()}}class x{r;g;b;constructor(e,t,n){this.r=e,this.g=t,this.b=n}}var Y,D;!function(e){e[e.WIDTH=152]="WIDTH",e[e.HEIGHT=180]="HEIGHT"}(Y||(Y={})),function(e){e[e.WIDTH=3.8]="WIDTH",e[e.HEIGHT=2.3684210526315788]="HEIGHT"}(D||(D={}));const H=new Array(256),G=new Array(2),S=new Array(2),N=new Array(2),T=new Array(2),M=new Array(2),P=new Array(2),F=new Array(2),W=new Array(2),j=new Array(2),Z=new Array(2),Q=new Array(2),z=new Array(2),K=new Array(2),V=new Array(2),X=new Array(2),$=new Array(2);let J,U,q,_,ee;const te=new Array(256);async function ne(e,t,n){return new Promise((o=>{const i=new ImageData(e,t);n(i),createImageBitmap(i).then((e=>o({imageBitmap:e,imageData:i})))}))}function oe(e,t,n,o,i,r,s,c,a){a.push(ne(8,i,(s=>{if(r)for(let r=0;r<i;++r){const c=i-1-r,a=e.charCodeAt(n+c),l=t[e.charCodeAt(o+c)];for(let e=0,t=1;e<8;++e,t<<=1)a&t&&ie(s,e,r,l)}else for(let r=0;r<i;++r){const c=i-1-r,a=e.charCodeAt(n+c),l=t[e.charCodeAt(o+c)];for(let e=0,t=128;e<8;++e,t>>=1)a&t&&ie(s,e,r,l)}})).then((({imageBitmap:e,imageData:t})=>{s(e),c&&c(function(e){const t=new Array(e.height),{data:n}=e;for(let o=0,i=3;o<e.height;++o){t[o]=new Array(e.width);for(let r=0;r<e.width;++r,i+=4)t[o][r]=0!==n[i]}return t}(t))})))}function ie(e,t,n,o){const i=4*(n*e.width+t),r=e.data;r[i]=o.r,r[i+1]=o.g,r[i+2]=o.b,r[i+3]=255}let re;const se=1e3/60,ce=5;let ae=!1,le=0,de=0,ue=0;function Ae(){ae||(ae=!0,ue=0,le=requestAnimationFrame(he),de=performance.now())}function me(){ae&&(ae=!1,cancelAnimationFrame(le))}function he(){if(!ae)return;le=requestAnimationFrame(he),Ge();const e=performance.now(),t=e-de;de=e,ue+=t;let n=0;for(;ue>=se&&ae;)if(ue-=se,++n>ce){ue=0,de=performance.now();break}}let ge,we,ve,fe,ye,Oe,Re,Ee=null,pe=!1;function Le(){!pe&&null===Ee&&"wakeLock"in navigator&&(pe=!0,navigator.wakeLock.request("screen").then((e=>{pe&&(Ee=e,Ee.addEventListener("release",(()=>{pe||(Ee=null)})))})).catch((e=>{})).finally((()=>pe=!1)))}let Ce,Be,Ie,be,ke=null,xe=!1;function Ye(){if(null!==ke&&(ke(),ke=null),xe)return;const e=matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);e.addEventListener("change",Ye),ke=()=>e.removeEventListener("change",Ye),Se()}function De(){xe||(xe=!0,me(),window.removeEventListener("click",E),window.removeEventListener("mousemove",O),window.removeEventListener("mouseenter",O),window.removeEventListener("mouseleave",y),y(),window.removeEventListener("keydown",p),window.removeEventListener("keyup",L),window.removeEventListener("touchstart",R),window.removeEventListener("touchmove",R),window.removeEventListener("touchend",R),window.removeEventListener("touchcancel",R),d=0,u=0,A=!1,m=!1,h=!1,f.clear(),null!==Ee&&"wakeLock"in navigator&&(pe=!1,Ee.release().then((()=>{pe||(Ee=null)})).catch((e=>{}))),window.removeEventListener("beforeunload",Te),window.removeEventListener("resize",Se),window.removeEventListener("focus",Ne),window.removeEventListener("blur",Ne),document.removeEventListener("visibilitychange",Ne),null!==ke&&(ke(),ke=null),re.save())}function He(){De(),Pe()}function Ge(){ve?Re&&(ve.imageSmoothingEnabled=!1,ve.fillStyle="#0F0F0F",ve.fillRect(0,0,fe,ye),Re.imageSmoothingEnabled=!1,function(e){for(let t=0;t<2;++t)for(let n=0;n<8;++n)e.drawImage(G[t][n],8*n,8+22*t);for(let t=0;t<11;++t)e.drawImage(te[12][t],8*t,0)}(Re),ve.drawImage(Oe,Ie,be,Ce,Be),ve.imageSmoothingEnabled=!0,ve.fillStyle="#FFFFFF",ve.fillRect(27,21,18,1),ve.fillRect(27,27,18,1),ve.fillRect(27,33,18,1)):Se()}function Se(){if(xe)return;ve=null,we=document.getElementById("main-canvas"),we.style.display="none";const e=window.innerWidth,t=window.innerHeight;we.style.display="block",we.style.width=`${e}px`,we.style.height=`${t}px`,we.style.position="absolute",we.style.left="0px",we.style.top="0px",ge=window.devicePixelRatio||1,we.width=Math.floor(ge*e),we.height=Math.floor(ge*t);const n=new DOMMatrix;e>=t?(fe=e,ye=t,n.a=n.d=ge,n.b=n.c=n.e=n.f=0):(fe=t,ye=e,n.a=n.d=n.e=0,n.c=ge,n.b=-n.c,n.f=ge*t),ve=we.getContext("2d"),ve&&(ve.setTransform(n),Be=ye,Ce=Be*D.WIDTH/D.HEIGHT,Ce>fe?(Ce=fe,Be=Ce*D.HEIGHT/D.WIDTH,Ie=0,be=Math.round((ye-Be)/2)):(Ie=Math.round((fe-Ce)/2),be=0),Ge())}function Ne(){!xe&&"visible"===document.visibilityState&&document.hasFocus()?(Le(),Ae()):me()}function Te(){De()}let Me=!1;function Pe(){document.body.style.backgroundColor="#0F0F0F",window.addEventListener("resize",Ze),window.addEventListener("touchmove",We,{passive:!1}),document.getElementById("main-content").innerHTML=`\n            <div id="start-container">\n                <div id="start-div">\n                    <div id="high-score-div">High Score: ${I.highScore}</div>\n                    <div class="volume-div">\n                        <span class="left-volume-label material-icons" id="left-volume-span" \n                                lang="en">volume_mute</span>\n                        <input type="range" id="volume-input" min="0" max="100" step="any" value="10">\n                        <span class="right-volume-label" id="right-volume-span" lang="en">100</span>\n                    </div>\n                    <div class="checkboxes-div">\n                        <div class="checkbox-item">\n                            <input type="checkbox" id="autofire-checkbox" name="autofire-checkbox">\n                            <label for="autofire-checkbox">\n                                <span class="custom-checkbox"></span>\n                                Autofire\n                            </label>\n                        </div>\n                        <div class="checkbox-item">\n                            <input type="checkbox" id="tracer-checkbox" name="tracer-checkbox">\n                            <label for="tracer-checkbox">\n                                <span class="custom-checkbox"></span>\n                                Tracer\n                            </label>\n                        </div>\n                        <div class="checkbox-item">\n                            <input type="checkbox" id="fast-checkbox" name="fast-checkbox">\n                            <label for="fast-checkbox">\n                                <span class="custom-checkbox"></span>\n                                Fast\n                            </label>\n                        </div>\n                    </div>\n                    <div id="go-div">\n                        <button id="start-button">Start</button>\n                    </div>\n                </div>\n            </div>`,l(I.volume);const e=document.getElementById("volume-input");e.addEventListener("input",je),e.value=String(I.volume),document.getElementById("autofire-checkbox").checked=I.autofire,document.getElementById("tracer-checkbox").checked=I.tracer,document.getElementById("fast-checkbox").checked=I.fast,document.getElementById("start-button").addEventListener("click",Fe),Ze()}function Fe(){l(I.volume);const e=document.getElementById("autofire-checkbox");I.autofire=e.checked;const t=document.getElementById("tracer-checkbox");I.tracer=t.checked;const n=document.getElementById("fast-checkbox");I.fast=n.checked,function(){window.removeEventListener("resize",Ze),window.removeEventListener("touchmove",We),document.getElementById("volume-input").removeEventListener("input",je),document.getElementById("start-button").removeEventListener("click",Fe);const e=document.getElementById("autofire-checkbox");I.autofire=e.checked;const t=document.getElementById("tracer-checkbox");I.tracer=t.checked;const n=document.getElementById("fast-checkbox");I.fast=n.checked,b()}(),xe=!1,re=new k,document.body.style.backgroundColor="#C2BCB1",Oe=new OffscreenCanvas(Y.WIDTH,Y.HEIGHT),Re=Oe.getContext("2d"),document.getElementById("main-content").innerHTML='<canvas id="main-canvas" class="canvas" width="1" height="1"></canvas>',we=document.getElementById("main-canvas"),we.style.touchAction="none",window.addEventListener("beforeunload",Te),window.addEventListener("resize",Se),window.addEventListener("focus",Ne),window.addEventListener("blur",Ne),document.addEventListener("visibilitychange",Ne),Le(),Ye(),window.addEventListener("click",E),window.addEventListener("mousemove",O),window.addEventListener("mouseenter",O),window.addEventListener("mouseleave",y),O(),window.addEventListener("touchstart",R,{passive:!1}),window.addEventListener("touchmove",R,{passive:!1}),window.addEventListener("touchend",R,{passive:!1}),window.addEventListener("touchcancel",R,{passive:!1}),window.addEventListener("keydown",p),window.addEventListener("keyup",L),d=0,u=0,A=!1,m=!1,h=!1,f.clear(),Ae()}function We(e){let t=e.target;for(;null!==t;){if("volume-input"===t.id){if(Me)return;const n=t,o=parseFloat(n.max),i=parseFloat(n.min),r=n.getBoundingClientRect(),s=(1-(e.touches[0].clientY-r.top)/r.height)*(o-i)+i;return n.value=s.toString(),void n.dispatchEvent(new Event("input"))}t=t.parentElement}e.preventDefault()}function je(){const e=document.getElementById("left-volume-span"),t=document.getElementById("volume-input"),n=document.getElementById("right-volume-span");I.volume=100*(+t.value-+t.min)/(+t.max-+t.min),t.style.setProperty("--thumb-position",`${I.volume}%`),0===I.volume?e.textContent="volume_off":I.volume<33?e.textContent="volume_mute":I.volume<66?e.textContent="volume_down":e.textContent="volume_up",n.textContent=String(Math.round(I.volume))}function Ze(){const e=document.getElementById("start-container"),t=document.getElementById("start-div"),n=document.getElementById("left-volume-span"),o=document.getElementById("right-volume-span");e.style.width=e.style.height="",e.style.left=e.style.top="",e.style.display="none",t.style.left=t.style.top=t.style.transform="",t.style.display="none";const i=window.innerWidth,r=window.innerHeight;if(Me=i>=r,e.style.left="0px",e.style.top="0px",e.style.width=`${i}px`,e.style.height=`${r}px`,e.style.display="block",t.style.display="flex",n.style.width="",n.style.display="inline-block",n.style.textAlign="center",n.textContent="🔇",n.style.transform="",o.style.width="",o.style.display="inline-block",o.style.textAlign="center",o.textContent="100",Me){const e=n.getBoundingClientRect().width;n.style.width=`${e}px`;const s=o.getBoundingClientRect().width;o.style.width=`${s}px`;const c=t.getBoundingClientRect();t.style.left=(i-c.width)/2+"px",t.style.top=(r-c.height)/2+"px"}else{const e=n.getBoundingClientRect().height;n.style.width=`${e}px`;const s=o.getBoundingClientRect().height;o.style.width=`${s}px`,t.style.transform="rotate(-90deg)";const c=t.getBoundingClientRect();t.style.left=(i-c.height)/2+"px",t.style.top=(r-c.width)/2+"px"}o.textContent=String(I.volume),je()}let Qe,ze=!1;function Ke(e){if(Qe){if(e===Qe.style.color)return;Qe.style.color=e}const t="progress-bar-style";let n=document.getElementById(t);n||(n=document.createElement("style"),n.id=t,document.head.appendChild(n)),n.innerText=`\n        #loading-progress::-webkit-progress-value {\n            background-color: ${e} !important;\n        }\n        #loading-progress::-moz-progress-bar {\n            background-color: ${e} !important;\n        }\n    `}function Ve(e){Qe&&(Qe.value=100*e.data,Ke("#48D800"))}function Xe(e){n.e(96).then(n.t.bind(n,710,23)).then((({default:t})=>{(new t).loadAsync(e).then((e=>Object.entries(e.files).forEach((e=>{const[t,n]=e;var o,r;n.dir||t.endsWith(".mp3")&&(o=t,r=n,c.push(r.async("arraybuffer").then((e=>i.decodeAudioData(e))).then((e=>a.set(o,e)))))}))))})),async function(){return Promise.all(c).then((()=>c.length=0))}().then((()=>{document.getElementById("loading-progress").value=100,setTimeout((()=>{!function(){if(I)return;const e=localStorage.getItem(C);if(e)try{I=JSON.parse(e)}catch{I=new B}else I=new B}(),async function(){let e;!function(e){e[e.CLIMBCOLTAB=0]="CLIMBCOLTAB",e[e.RUNCOLTAB=22]="RUNCOLTAB",e[e.LOGCOLOR=43]="LOGCOLOR",e[e.FIRECOLOR=59]="FIRECOLOR",e[e.COBRACOLOR=75]="COBRACOLOR",e[e.CROCOCOLOR=91]="CROCOCOLOR",e[e.MONEYBAGCOLOR=107]="MONEYBAGCOLOR",e[e.SCORPIONCOLOR=123]="SCORPIONCOLOR",e[e.WALLCOLOR=139]="WALLCOLOR",e[e.RINGCOLOR=155]="RINGCOLOR",e[e.GOLDBARCOLOR=171]="GOLDBARCOLOR",e[e.SILVERBARCOLOR=187]="SILVERBARCOLOR",e[e.PFLEAVESTAB=203]="PFLEAVESTAB",e[e.HARRY0=219]="HARRY0",e[e.HARRY1=241]="HARRY1",e[e.HARRY2=263]="HARRY2",e[e.HARRY3=285]="HARRY3",e[e.HARRY4=307]="HARRY4",e[e.HARRY5=329]="HARRY5",e[e.HARRY6=351]="HARRY6",e[e.HARRY7=373]="HARRY7",e[e.BRANCHTAB=395]="BRANCHTAB",e[e.ONEHOLE=404]="ONEHOLE",e[e.THREEHOLES=412]="THREEHOLES",e[e.PIT=420]="PIT",e[e.LOG0=428]="LOG0",e[e.FIRE0=444]="FIRE0",e[e.COBRA0=460]="COBRA0",e[e.COBRA1=476]="COBRA1",e[e.CROCO0=492]="CROCO0",e[e.CROCO1=508]="CROCO1",e[e.MONEYBAG=524]="MONEYBAG",e[e.SCORPION0=540]="SCORPION0",e[e.SCORPION1=556]="SCORPION1",e[e.WALL=572]="WALL",e[e.BAR0=588]="BAR0",e[e.BAR1=604]="BAR1",e[e.RING=620]="RING",e[e.ZERO=636]="ZERO",e[e.ONE=644]="ONE",e[e.TWO=652]="TWO",e[e.THREE=660]="THREE",e[e.FOUR=668]="FOUR",e[e.SIX=684]="SIX",e[e.SEVEN=692]="SEVEN",e[e.EIGHT=700]="EIGHT",e[e.NINE=708]="NINE",e[e.COLON=716]="COLON"}(e||(e={}));const t=function(){const e=new Array(256),t=atob("AAAAPz8+ZGRjhISDoqKhurq50tLR6urpPT0AXl4Ke3sVmZkgtLQqzc005uY+/f1IcSMAhj0LmVcYrW8mvYYyzZs+3LBJ6sJUhhUAmi8OrkgewGEv0Xc+4I1N76Jb/bVoigAAnhMSsSgnwj080lFQ4mRj73V0/YaFeQBYjRJuoCeEsTuYwE6q0GG83XHM6oLcRQB4XRKPciekiDu5m07KrmHcv3Hs0IL7DgCFKROZQyitXT2/dFHQi2TfoXXutYb7AACKEhOdJCiwNz3BSVHRWmTganXueYb7ABV9EjGTJEynN2e7SYDMWpfdaq7tecL7ACdYEkV0JGKNN36nSZe+WrDUasfoed37ADUmEldCJHZdN5V2SbGOWsylauW7ef3PADkAE1sSKHknPZc8UbNQZM1jdeZ0hv2FDjIAK1QRR3MjY5M2fbBIlctZreVpwv14Jy4ARU4PYmshfogzl6NDsLxTx9Ri3epwPSMAXkINe18dmXsttJY7za9K5sdX/d1k");for(let n=0;n<=255;++n){const o=3*(n>>1),i=new x(t.charCodeAt(o),t.charCodeAt(o+1),t.charCodeAt(o+2));e[n]=i,H[n]=`#${(i.r<<16|i.g<<8|i.b).toString(16).padStart(6,"0")}`}return e}(),n=atob("0tLS0tLS0tLS0tLSyMjIyMjISkpKEtLS0tLS0tLS0tLIyMjIyMjISkpKEhISEhISEhISEhISEhISEhISEhISEj4+Pi4uLi4uLi4uAAAGAAYAAAAAAAAAAABCQtLS0tLS0tLS0tLS0tLS0tIGBgYGBgYGBgYGBgYSBgYGDg4ODg4ODg4ODg4ODg4ODgZCQkIGQkJCBkJCQgZCQkJCQh4eHh4eHh4eDg4ODg4OHh4eHh4eHh4ODg4ODg4ODgYGBgYGBgYODg4ODg4ODg7/z4MBfz0YAP/+vBj+/HgwAAAAAAAzctoeHBhYWHw+GhgQGBgYAACAgMNiYjY+HBgYPD46OBgYEBgYGAAQICIkNDIWHhwYGBwcGBgYGBAYGBgADAgoKD4KDhwYGBwcGBgYGBgQGBgYAAACQ0R0FBwcGBgYPD46OBgYEBgYGAAYEBwYGBgYGBgYGBgcHhoYGBAYGBgAAAAAAAAAY/L23MDAwMDA8NCQ0NDAADAQEBAWFBQWEhYeHBg4ODweGgIYGBgYftuZmZmZmZl/f3///////3h4eP//////AAEDD3////8AGCRaWlpmfl52fl52PBgAAMPnfjwYPHx8eDg4MDAQEAD++fn5+WAQCAwMCDgwQAAA/vn5+vpgEAgMDAg4MIAAAAAAAAD/qwMDCy664IAAAAAAAAAA/6tV/wYEAAAAAAAAPnd3Y3tjb2M2NhwIHDYAhTI9ePjGgpCI2HAAAAAAAEkzPHj6xJKI2HAAAAAAAAD+urq6/u7u7v66urr+7u7uAPj8/v5+PgAQAFQAkgAQAAD4/P7+fj4AACgAVAAQAAAAADhsREREbDgQOHw4AAAAPGZmZmZmZjw8GBgYGBg4GH5gYDwGBkY8PEYGDAwGRjwMDAx+TCwcDHxGBgZ8YGB+PGZmZnxgYjwYGBgYDAZCfjxmZjw8ZmY8PEYGPmZmZjwAGBgAABgYAA=="),o=[];for(let i=0;i<2;++i){G[i]=new Array(8),S[i]=new Array(8);for(let r=0;r<8;++r){let s=r<=5?5-r:r;oe(n,t,e.HARRY0+22*r,7===r?e.CLIMBCOLTAB:e.RUNCOLTAB,22,1===i,(e=>G[i][s]=e),(e=>S[i][s]=e),o)}}for(let i=0;i<2;++i){const r=1===i;N[i]=new Array(2),T[i]=new Array(2),oe(n,t,e.COBRA1,e.COBRACOLOR,16,r,(e=>N[i][0]=e),(e=>T[i][0]=e),o),oe(n,t,e.COBRA0,e.COBRACOLOR,16,r,(e=>N[i][1]=e),(e=>T[i][1]=e),o),M[i]=new Array(2),P[i]=new Array(2),oe(n,t,e.CROCO1,e.CROCOCOLOR,16,r,(e=>M[i][0]=e),(e=>P[i][0]=e),o),oe(n,t,e.CROCO0,e.CROCOCOLOR,16,r,(e=>M[i][1]=e),(e=>P[i][1]=e),o),F[i]=new Array(2),W[i]=new Array(2),oe(n,t,e.SCORPION1,e.SCORPIONCOLOR,16,r,(e=>F[i][0]=e),(e=>W[i][0]=e),o),oe(n,t,e.SCORPION0,e.SCORPIONCOLOR,16,r,(e=>F[i][1]=e),(e=>W[i][1]=e),o)}oe(n,t,e.LOG0,e.LOGCOLOR,16,!0,(e=>j[0]=e),(e=>Z[0]=e),o),oe(n,t,e.LOG0,e.LOGCOLOR,16,!1,(e=>j[1]=e),(e=>Z[1]=e),o),oe(n,t,e.FIRE0,e.FIRECOLOR,16,!0,(e=>Q[0]=e),(e=>z[0]=e),o),oe(n,t,e.FIRE0,e.FIRECOLOR,16,!1,(e=>Q[1]=e),(e=>z[1]=e),o),oe(n,t,e.BAR1,e.GOLDBARCOLOR,16,!1,(e=>K[0]=e),(e=>V[0]=e),o),oe(n,t,e.BAR0,e.GOLDBARCOLOR,16,!1,(e=>K[1]=e),(e=>V[1]=e),o),oe(n,t,e.BAR1,e.SILVERBARCOLOR,16,!1,(e=>X[0]=e),(e=>$[0]=e),o),oe(n,t,e.BAR0,e.SILVERBARCOLOR,16,!1,(e=>X[1]=e),(e=>$[1]=e),o),oe(n,t,e.MONEYBAG,e.MONEYBAGCOLOR,16,!1,(e=>J=e),(e=>U=e),o),oe(n,t,e.RING,e.RINGCOLOR,16,!1,(e=>q=e),(e=>_=e),o),oe(n,t,e.WALL,e.WALLCOLOR,16,!1,(e=>ee=e),null,o);for(let i=0;i<256;++i){const r=t[i];te[i]=new Array(11);for(let t=0;t<11;++t)o.push(ne(8,8,(o=>{const i=e.ZERO+8*(t+1)-1;for(let e=0;e<8;++e){const t=n.charCodeAt(i-e);for(let n=0,i=128;n<8;++n,i>>=1)t&i&&ie(o,n,e,r)}})).then((({imageBitmap:e})=>te[i][t]=e)))}await Promise.all(o)}().then((()=>{window.removeEventListener("resize",Je),window.removeEventListener("touchmove",$e),"serviceWorker"in navigator&&navigator.serviceWorker.removeEventListener("message",Ve),Pe()}))}),10)}))}function $e(e){e.preventDefault()}function Je(){const e=document.getElementById("progress-container"),t=document.getElementById("progress-div");e.style.width=e.style.height="",e.style.left=e.style.top="",e.style.display="none",t.style.top=t.style.left=t.style.transform="",t.style.display="none";const n=window.innerWidth,o=window.innerHeight;if(ze=n>=o,e.style.left="0px",e.style.top="0px",e.style.width=`${n}px`,e.style.height=`${o}px`,e.style.display="block",t.style.display="flex",ze){const e=t.getBoundingClientRect();t.style.left=(n-e.width)/2+"px",t.style.top=(o-e.height)/2+"px"}else{t.style.transform="rotate(-90deg)";const e=t.getBoundingClientRect();t.style.left=(n-e.height)/2+"px",t.style.top=(o-e.width)/2+"px"}}let Ue=!1;function qe(e){e.preventDefault()}function _e(){const e=document.getElementById("death-div");e.style.top=e.style.left=e.style.transform="",e.style.display="none";const t=window.innerWidth,n=window.innerHeight;if(Ue=t>=n,e.style.display="flex",Ue){const o=e.getBoundingClientRect();e.style.left=(t-o.width)/2+"px",e.style.top=(n-o.height)/2+"px"}else{e.style.transform="rotate(-90deg)";const o=e.getBoundingClientRect();e.style.left=(t-o.height)/2+"px",e.style.top=(n-o.width)/2+"px"}}function et(){window.addEventListener("error",(e=>{console.error(`Caught in global handler: ${e.message}`,{source:e.filename,lineno:e.lineno,colno:e.colno,error:e.error}),e.preventDefault(),window.addEventListener("resize",_e),window.addEventListener("touchmove",qe,{passive:!1}),document.getElementById("main-content").innerHTML='<div id="death-div"><span id="fatal-error">&#x1F480;</span></div>',_e()})),window.addEventListener("unhandledrejection",(e=>e.preventDefault())),document.addEventListener("dblclick",(e=>e.preventDefault()),{passive:!1}),window.addEventListener("resize",Je),window.addEventListener("touchmove",$e,{passive:!1}),document.getElementById("main-content").innerHTML='\n            <div id="progress-container">\n                <div id="progress-div">\n                    <progress id="loading-progress" value="0" max="100"></progress>\n                </div>\n            </div>',Qe=document.getElementById("loading-progress"),"serviceWorker"in navigator&&navigator.serviceWorker.addEventListener("message",Ve),Je(),async function(){for(let t=o-1;t>=0;--t)try{const t=await fetch("resources.zip");if(!t.ok)continue;const n=t.headers.get("Content-Length");if(!n)continue;const o=parseInt(n);if(isNaN(o)||o<=0)continue;const i=t.body;if(null===i)continue;const r=i.getReader(),s=[];let c=0;for(;;){const{done:t,value:n}=await r.read();if(t)break;s.push(n),c+=n.length,e=c/o,Qe.value=100*e,Ke("#0075FF")}const a=new Uint8Array(c);let l=0;return s.forEach((e=>{a.set(e,l),l+=e.length})),a}catch(e){if(0===t)throw e}var e;throw new Error("Failed to fetch.")}().then(Xe)}}}]);