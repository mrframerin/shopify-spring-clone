var Ve=Object.defineProperty;var he=i=>{throw TypeError(i)};var Ie=(i,e,t)=>e in i?Ve(i,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):i[e]=t;var a=(i,e,t)=>Ie(i,typeof e!="symbol"?e+"":e,t),se=(i,e,t)=>e.has(i)||he("Cannot "+t);var f=(i,e,t)=>(se(i,e,"read from private field"),t?t.call(i):e.get(i)),F=(i,e,t)=>e.has(i)?he("Cannot add the same private member more than once"):e instanceof WeakSet?e.add(i):e.set(i,t),T=(i,e,t,s)=>(se(i,e,"write to private field"),s?s.call(i,t):e.set(i,t),t),g=(i,e,t)=>(se(i,e,"access private method"),t);var ve=(i,e,t,s)=>({set _(n){T(i,e,n,t)},get _(){return f(i,e,s)}});import{r as P}from"./chunk-EPOLDU6W-CgSudzSq.js";import{W as fe,a6 as Ue,R as ze,bk as Oe,e as Be,M as Ne,d as He,O as We,V as I,r as ne,L as pe,v as qe,C as we,t as w,u as me,y as Xe}from"./TierResolver-BdRQXF7g.js";import{u as Ye}from"./constants-D_Mco9k_.js";import{a as Ge}from"./reducedMotion-CdiMTSZU.js";import{u as je}from"./useStickyMountGate-DkOADX5n.js";import{r as Ze}from"./reportError-Dm_6XdSi.js";import{u as $e}from"./useCanvasPointer-ByEesUK5.js";import{o as Qe}from"./lenisManager-BGOTe4iO.js";import{b as Je,D as Ke,M as ke,a as et}from"./presets-ClUyafeV.js";const tt=14,it=10,st=.002,nt=.32,ot=8,rt=80,at=.01,lt=1/30;let ye=!1,N=0,re=0,H=0,K=0,ae=0;const ge=new WeakMap;function be(i,e){const t=performance.now(),s=e-i,n=Math.max(ot,Math.min(rt,t-K));K=t,re=Math.abs(s)<at?0:Math.max(-1,Math.min(1,s/n*nt))}function ut(i){const e=i.target;let t,s;if(e===document||e===window||e===null)s=window.scrollY,t=H,H=s;else if(e instanceof HTMLElement)s=e.scrollTop,t=ge.get(e)??s,ge.set(e,s);else return;be(t,s)}function ct(i){be(H,i.scroll),H=i.scroll}function dt(i){const e=Math.max(0,Math.min(i,lt)),t=1-Math.exp(-e*tt),s=Math.exp(-e*it);N+=(re-N)*t,re*=s,Math.abs(N)<st&&(N=0)}function De(i){const e=(i-ae)/1e3;ae=i,dt(e),requestAnimationFrame(De)}function ht(){ye||typeof window>"u"||(ye=!0,H=window.scrollY,K=performance.now(),ae=K,document.addEventListener("scroll",ut,{passive:!0,capture:!0}),Qe(i=>i.on("scroll",ct)),requestAnimationFrame(De))}function vt(){return ht(),N}function ce(){return performance.now()}function ft(){return typeof document>"u"?"unknown":document.visibilityState??"visible"}function Re(){return typeof document>"u"?!0:document.hidden!==!0}function pt(i=ce()){const e=Re();return{visibleElapsedMs:0,hiddenElapsedMs:0,segmentStartedAt:i,isVisible:e,everHidden:!e}}function j(i,e=ce()){const t=Math.max(0,e-i.segmentStartedAt);return i.isVisible?i.visibleElapsedMs+=t:i.hiddenElapsedMs+=t,i.segmentStartedAt=e,i.isVisible=Re(),i.everHidden||(i.everHidden=!i.isVisible),Me(i,e)}function Me(i,e=ce()){const t=Math.max(0,e-i.segmentStartedAt);return{visibilityState:ft(),everHidden:i.everHidden||!i.isVisible,visibleElapsedMs:Math.round(i.visibleElapsedMs+(i.isVisible?t:0)),hiddenElapsedMs:Math.round(i.hiddenElapsedMs+(i.isVisible?0:t))}}function mt(i,e,t){let s=null,n=!1;const r=()=>{s!==null&&(window.clearTimeout(s),s=null)},o=()=>{if(r(),n||!e.isVisible)return;const v=Math.max(0,i-e.visibleElapsedMs);s=window.setTimeout(()=>{if(j(e),e.isVisible&&e.visibleElapsedMs>=i){n=!0,l(),t(Me(e));return}o()},v)},u=()=>{j(e),o()},l=()=>{typeof document>"u"||document.removeEventListener("visibilitychange",u)};return typeof document<"u"&&document.addEventListener("visibilitychange",u),j(e),o(),{clear:()=>{n||(n=!0,j(e),r(),l())}}}function yt(i){return i instanceof Error?i.visibilityTelemetry??{}:{}}function gt(i,e){return Object.assign(i,{visibilityTelemetry:e}),i}let $=!1;const de=[];function xt(i,{visibilityAwareWatchdog:e=!1}={}){return new Promise((t,s)=>{de.push({task:i,resolve:t,reject:s,visibilityAwareWatchdog:e}),Fe()})}const St=30,xe=15e3;function Fe(){$||de.length!==0&&window.setTimeout(Tt,St)}function Tt(){if($)return;const i=de.shift();if(!i)return;$=!0;let e=!1;const t=()=>{e||(e=!0,s.clear(),$=!1,Fe())};let s;if(i.visibilityAwareWatchdog)s=mt(xe,pt(),n=>{i.reject(gt(new Error("warmup watchdog timeout"),n)),t()});else{const n=window.setTimeout(()=>{i.reject(new Error("warmup watchdog timeout")),t()},xe);s={clear:()=>window.clearTimeout(n)}}i.task().then(i.resolve,i.reject).finally(t)}const wt=1e3,Z=new Map;let U=null,Se=0;function Le(){if(U!==null)return U;if(typeof window>"u")return U=!1,U;const i=new URLSearchParams(window.location.search);let e=!1;try{e=window.localStorage.getItem("scenePerf")==="1"}catch{e=!1}return U=i.has("scenePerf")||e,U}function bt(i,e){if(!Le())return e();const t=performance.now();try{return e()}finally{Dt(i,performance.now()-t)}}function Dt(i,e){if(!Le())return;const t=Z.get(i)??{total:0,count:0,max:0};t.total+=e,t.count++,t.max=Math.max(t.max,e),Z.set(i,t);const s=performance.now();if(s-Se<wt)return;Se=s;const n=Array.from(Z,([r,o])=>({name:r,avg:`${(o.total/Math.max(1,o.count)).toFixed(2)}ms`,max:`${o.max.toFixed(2)}ms`,count:o.count})).sort((r,o)=>parseFloat(o.avg)-parseFloat(r.avg));console.table(n),Z.clear()}var b,E;class B{constructor(e,t,s){F(this,b);F(this,E);a(this,"uniform");const n={minFilter:s,magFilter:s,format:ze,type:Ue,depthBuffer:!1,stencilBuffer:!1,generateMipmaps:!1};T(this,b,new fe(e,t,n)),T(this,E,new fe(e,t,n)),this.uniform={value:f(this,b).texture}}get read(){return f(this,b).texture}get write(){return f(this,E)}swap(){const e=f(this,b);T(this,b,f(this,E)),T(this,E,e),this.uniform.value=f(this,b).texture}dispose(){f(this,b).dispose(),f(this,E).dispose()}}b=new WeakMap,E=new WeakMap;class L{constructor(e,t,s,n){a(this,"gl");a(this,"uniforms");a(this,"mesh");a(this,"scene");a(this,"camera");this.gl=e,this.uniforms=n;const r=new Oe(2,2),o=new Be({vertexShader:t,fragmentShader:s,uniforms:n,depthWrite:!1,depthTest:!1});this.mesh=new Ne(r,o),this.scene=new He,this.scene.add(this.mesh),this.camera=new We(-1,1,1,-1,0,1)}render(e){this.gl.setRenderTarget(e??null),this.gl.render(this.scene,this.camera)}dispose(){this.mesh.geometry.dispose(),this.mesh.material.dispose()}}function oe(i,e=1/60){const t=Math.max(0,Math.min(1,i));return t===0?0:Math.pow(t,Math.max(0,e)*60)}const C=`varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform vec2 texelSize;

void main() {
  vUv = uv;
  vL = vUv - vec2(texelSize.x, 0.0);
  vR = vUv + vec2(texelSize.x, 0.0);
  vT = vUv + vec2(0.0, texelSize.y);
  vB = vUv - vec2(0.0, texelSize.y);
  gl_Position = vec4(position, 1.0);
}

`,Rt=`varying vec2 vUv;
uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform vec2 texelSize;
uniform float dt;
uniform float dissipation;

void main() {
  vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
  gl_FragColor = dissipation * texture2D(uSource, coord);
  gl_FragColor.a = 1.0;
}

`,Mt=`varying vec2 vUv;
uniform sampler2D uTexture;
uniform float value;

void main() {
  gl_FragColor = value * texture2D(uTexture, vUv);
}

`,Ft=`varying highp vec2 vUv;
varying highp vec2 vL;
varying highp vec2 vR;
varying highp vec2 vT;
varying highp vec2 vB;
uniform sampler2D uVelocity;

void main() {
  float L = texture2D(uVelocity, vL).y;
  float R = texture2D(uVelocity, vR).y;
  float T = texture2D(uVelocity, vT).x;
  float B = texture2D(uVelocity, vB).x;
  float vorticity = R - L - T + B;
  gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
}

`,Lt=`// Display pass from Pavel Dobryakov's WebGL-Fluid-Simulation (MIT):
// straight passthrough of the dye texture.

varying vec2 vUv;
uniform sampler2D uTexture;

void main() {
  gl_FragColor = texture2D(uTexture, vUv);
}
`,Ct=`varying highp vec2 vUv;
varying highp vec2 vL;
varying highp vec2 vR;
varying highp vec2 vT;
varying highp vec2 vB;
uniform sampler2D uVelocity;

void main() {
  float L = texture2D(uVelocity, vL).x;
  float R = texture2D(uVelocity, vR).x;
  float T = texture2D(uVelocity, vT).y;
  float B = texture2D(uVelocity, vB).y;
  vec2 C = texture2D(uVelocity, vUv).xy;
  if (vL.x < 0.0) { L = -C.x; }
  if (vR.x > 1.0) { R = -C.x; }
  if (vT.y > 1.0) { T = -C.y; }
  if (vB.y < 0.0) { B = -C.y; }
  float div = 0.5 * (R - L + T - B);
  gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
}

`,_t=`varying highp vec2 vUv;
varying highp vec2 vL;
varying highp vec2 vR;
varying highp vec2 vT;
varying highp vec2 vB;
uniform sampler2D uPressure;
uniform sampler2D uVelocity;

void main() {
  float L = texture2D(uPressure, vL).x;
  float R = texture2D(uPressure, vR).x;
  float T = texture2D(uPressure, vT).x;
  float B = texture2D(uPressure, vB).x;
  vec2 velocity = texture2D(uVelocity, vUv).xy;
  velocity.xy -= vec2(R - L, T - B);
  gl_FragColor = vec4(velocity, 0.0, 1.0);
}

`,Pt=`varying highp vec2 vUv;
varying highp vec2 vL;
varying highp vec2 vR;
varying highp vec2 vT;
varying highp vec2 vB;
uniform sampler2D uPressure;
uniform sampler2D uDivergence;

void main() {
  float L = texture2D(uPressure, vL).x;
  float R = texture2D(uPressure, vR).x;
  float T = texture2D(uPressure, vT).x;
  float B = texture2D(uPressure, vB).x;
  float divergence = texture2D(uDivergence, vUv).x;
  float pressure = (L + R + B + T - divergence) * 0.25;
  gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
}

`,Et=`// Splat brush. Deposits \`color\` along the segment from \`prevPoint\` to \`point\`
// with a Gaussian falloff. Pavel Dobryakov's WebGL-Fluid-Simulation (MIT) uses
// the same additive exp(-d^2/radius) deposit; here the distance is measured to
// the stroke segment (standard point-to-segment SDF) so pointer motion paints a
// continuous round-tipped stroke instead of discrete dots. \`radius\` is the
// Gaussian variance (aspect-corrected on X).

varying vec2 vUv;

uniform sampler2D uTarget;
uniform float aspectRatio;
uniform vec3 color;
uniform vec2 point;
uniform vec2 prevPoint;
uniform float radius;

// Point-to-segment distance: the canonical 2D SDF from Inigo Quilez
// (https://iquilezles.org/articles/distfunctions2d/ — \`sdSegment\`),
// aspect-corrected on X so the brush stays round on non-square viewports.
float segmentDistance(vec2 uv, vec2 a, vec2 b) {
  vec2 pa = uv - a;
  vec2 ba = b - a;
  pa.x *= aspectRatio;
  ba.x *= aspectRatio;
  float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-6), 0.0, 1.0);
  return length(pa - ba * h);
}

void main() {
  float d = segmentDistance(vUv, prevPoint, point);
  // Guard the divisor: a zero radius would divide by zero and write NaNs that
  // poison the velocity FBO.
  vec3 splat = exp(-(d * d) / max(radius, 1e-6)) * color;
  vec3 base = texture2D(uTarget, vUv).xyz;
  gl_FragColor = vec4(base + splat, 1.0);
}
`,At=`varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform sampler2D uVelocity;
uniform sampler2D uCurl;
uniform float curl;
uniform float dt;

void main() {
  float L = texture2D(uCurl, vL).x;
  float R = texture2D(uCurl, vR).x;
  float T = texture2D(uCurl, vT).x;
  float B = texture2D(uCurl, vB).x;
  float C = texture2D(uCurl, vUv).x;
  vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
  force /= length(force) + 0.0001;
  force *= curl * C;
  force.y *= -1.0;
  vec2 vel = texture2D(uVelocity, vUv).xy;
  gl_FragColor = vec4(vel + force * dt, 0.0, 1.0);
}

`,Te=i=>w.clamp(Math.floor(i),ke,et),Vt={simSize:Ke,dyeSize:Je,densityDissipation:.97,velocityDissipation:.98,pressureDissipation:.8,pressureIterations:10,curl:30,splatRadius:.25};var D,ee,te,V,z,d,le,Ce,ue,_e,Pe,Q,J;class It{constructor(e,t={}){F(this,d);a(this,"gl");a(this,"config");a(this,"fbos");F(this,D,[]);a(this,"passes");a(this,"width",0);a(this,"height",0);a(this,"aspect",1);a(this,"simW",0);a(this,"simH",0);a(this,"dyeW",0);a(this,"dyeH",0);F(this,ee,new I);F(this,te,new I);F(this,V,0);F(this,z,null);this.gl=e,this.config={...Vt,...t},g(this,d,ue).call(this,1),g(this,d,_e).call(this),this.reset()}setTextureSizes(e,t){if(!Number.isFinite(e)||!Number.isFinite(t))return!1;const s=Te(e),n=Te(t);return s===this.config.simSize&&n===this.config.dyeSize?!1:(this.config.simSize=s,this.config.dyeSize=n,g(this,d,le).call(this,this.aspect),this.width>0&&this.height>0&&this.passes.display.uniforms.texelSize.value.set(1/this.width,1/this.height),!0)}setSize(e,t){this.width=e,this.height=t;const s=e/t;Math.abs(s-this.aspect)>.01&&(this.aspect=s,g(this,d,le).call(this,s)),this.passes.display.uniforms.texelSize.value.set(1/e,1/t)}async compileAsync(){await Promise.all(Object.values(this.passes).map(e=>this.gl.compileAsync(e.scene,e.camera)))}update(e){g(this,d,Ce).call(this);const{fbos:t,passes:s,config:n}=this;g(this,d,Q).call(this);try{s.curl.uniforms.uVelocity.value=t.velocity.read,s.curl.render(t.curl.write),t.curl.swap(),s.vorticity.uniforms.uVelocity.value=t.velocity.read,s.vorticity.uniforms.uCurl.value=t.curl.read,s.vorticity.uniforms.curl.value=n.curl,s.vorticity.uniforms.dt.value=e,s.vorticity.render(t.velocity.write),t.velocity.swap(),s.divergence.uniforms.uVelocity.value=t.velocity.read,s.divergence.render(t.divergence.write),t.divergence.swap(),s.clear.uniforms.uTexture.value=t.pressure.read,s.clear.uniforms.value.value=oe(n.pressureDissipation,e),s.clear.render(t.pressure.write),t.pressure.swap(),s.pressure.uniforms.uDivergence.value=t.divergence.read;for(let r=0;r<n.pressureIterations;r++)s.pressure.uniforms.uPressure.value=t.pressure.read,s.pressure.render(t.pressure.write),t.pressure.swap();s.gradientSubtract.uniforms.uPressure.value=t.pressure.read,s.gradientSubtract.uniforms.uVelocity.value=t.velocity.read,s.gradientSubtract.render(t.velocity.write),t.velocity.swap(),s.advection.uniforms.texelSize.value.set(1/this.simW,1/this.simH),s.advection.uniforms.uVelocity.value=t.velocity.read,s.advection.uniforms.uSource.value=t.velocity.read,s.advection.uniforms.dissipation.value=oe(n.velocityDissipation,e),s.advection.uniforms.dt.value=e,s.advection.render(t.velocity.write),t.velocity.swap(),s.advection.uniforms.texelSize.value.set(1/this.dyeW,1/this.dyeH),s.advection.uniforms.uVelocity.value=t.velocity.read,s.advection.uniforms.uSource.value=t.density.read,s.advection.uniforms.dissipation.value=oe(n.densityDissipation,e),s.advection.render(t.density.write),t.density.swap()}finally{g(this,d,J).call(this)}for(const r of f(this,D))r.armed=!0}render(e=null){g(this,d,Q).call(this);try{this.passes.display.uniforms.uTexture.value=this.fbos.density.read,this.passes.display.render(e)}finally{g(this,d,J).call(this)}}splat(e,t,s,n,r,o,u=e,l=t){const v=f(this,ee).set(e/this.width,1-t/this.height),c=f(this,te).set(u/this.width,1-l/this.height),p=o/200;g(this,d,Q).call(this);try{const h=this.passes.splat;h.uniforms.uTarget.value=this.fbos.velocity.read,h.uniforms.radius.value=p*p,h.uniforms.aspectRatio.value=this.width/this.height,h.uniforms.point.value.copy(v),h.uniforms.prevPoint.value.copy(c),h.uniforms.color.value.set(s,-n,0),h.render(this.fbos.velocity.write),this.fbos.velocity.swap(),h.uniforms.uTarget.value=this.fbos.density.read,h.uniforms.color.value.set(r.r,r.g,r.b),h.render(this.fbos.density.write),this.fbos.density.swap()}finally{g(this,d,J).call(this)}}updateConfig(e,t){this.config[e]=t}get velocityTexture(){return this.fbos.velocity.read}reset(){const e=this.gl.getRenderTarget(),t=new we;this.gl.getClearColor(t);const s=this.gl.getClearAlpha();this.gl.setClearColor(0,0);for(const n of Object.values(this.fbos))this.gl.setRenderTarget(n.write),this.gl.clear(),n.swap(),this.gl.setRenderTarget(n.write),this.gl.clear(),n.swap();this.gl.setRenderTarget(e),this.gl.setClearColor(t,s)}dispose(){for(const e of f(this,D))for(const t of Object.values(e.fbos))t.dispose();T(this,D,[]);for(const e of Object.values(this.fbos))e.dispose();for(const e of Object.values(this.passes))e.dispose()}}D=new WeakMap,ee=new WeakMap,te=new WeakMap,V=new WeakMap,z=new WeakMap,d=new WeakSet,le=function(e){f(this,D).push({fbos:this.fbos,armed:!1}),g(this,d,ue).call(this,e,!1),g(this,d,Pe).call(this)},Ce=function(){f(this,D).length!==0&&T(this,D,f(this,D).filter(e=>{if(!e.armed)return!0;for(const t of Object.values(e.fbos))t.dispose();return!1}))},ue=function(e,t=!0){if(this.fbos&&t)for(const v of Object.values(this.fbos))v.dispose();const{simSize:s,dyeSize:n}=this.config;let r=s,o=s,u=n,l=n;e>1?(o=Math.round(s/e),l=Math.round(n/e)):(r=Math.round(s*e),u=Math.round(n*e)),this.fbos={density:new B(u,l,pe),velocity:new B(r,o,pe),divergence:new B(r,o,ne),curl:new B(r,o,ne),pressure:new B(r,o,ne)},this.simW=r,this.simH=o,this.dyeW=u,this.dyeH=l},_e=function(){const{simSize:e}=this.config,t=()=>({value:new I(1/e,1/e)});this.passes={curl:new L(this.gl,C,Ft,{texelSize:t(),uVelocity:{value:null}}),vorticity:new L(this.gl,C,At,{texelSize:t(),uVelocity:{value:null},uCurl:{value:null},curl:{value:this.config.curl},dt:{value:1/60}}),divergence:new L(this.gl,C,Ct,{texelSize:t(),uVelocity:{value:null}}),clear:new L(this.gl,C,Mt,{texelSize:t(),uTexture:{value:null},value:{value:this.config.pressureDissipation}}),pressure:new L(this.gl,C,Pt,{texelSize:t(),uPressure:{value:null},uDivergence:{value:null}}),gradientSubtract:new L(this.gl,C,_t,{texelSize:t(),uPressure:{value:null},uVelocity:{value:null}}),advection:new L(this.gl,C,Rt,{texelSize:t(),uVelocity:{value:null},uSource:{value:null},dt:{value:1/60},dissipation:{value:this.config.velocityDissipation}}),display:new L(this.gl,C,Lt,{texelSize:{value:new I},uTexture:{value:null}}),splat:new L(this.gl,C,Et,{uTarget:{value:null},aspectRatio:{value:1},point:{value:new I},prevPoint:{value:new I},color:{value:new qe},radius:{value:(this.config.splatRadius/200)**2}})}},Pe=function(){const e=1/this.simW,t=1/this.simH,s=[this.passes.curl,this.passes.vorticity,this.passes.divergence,this.passes.clear,this.passes.pressure,this.passes.gradientSubtract];for(const n of s)n.uniforms.texelSize.value.set(e,t)},Q=function(){ve(this,V)._++===0&&T(this,z,this.gl.getRenderTarget())},J=function(){T(this,V,Math.max(0,f(this,V)-1)),f(this,V)===0&&(this.gl.setRenderTarget(f(this,z)),T(this,z,null))};const Ut=.018,zt=.72,Ot=8,Bt=.02,Nt=.3,Ht=.9,Wt=5,qt=50,Xt=65,Yt=2,Gt=500,jt=1e4;class Zt{constructor(e,t){a(this,"fluid");a(this,"color",new we);a(this,"mouse",{x:0,y:0,px:0,py:0,inside:!1});a(this,"handPointers",new Map);a(this,"handPointerActiveIds",new Set);a(this,"lastActiveAt",0);a(this,"lastStepTime",-1);a(this,"lastScrollPaintStepTime",-1);a(this,"scrollClear",0);a(this,"lastPointerProcessTime",-1);a(this,"lastScrollClearTime",-1);a(this,"activeCompile",null);a(this,"disposeRequested",!1);a(this,"disposed",!1);this.fluid=new It(e,t)}configure(e,t){return this.disposeRequested||this.disposed?!1:this.fluid.setTextureSizes(e,t)}resize(e,t){this.disposeRequested||this.disposed||(this.fluid.setSize(e,t),this.mouse.inside=!1,this.handPointers.clear())}compileAsync(){return this.disposeRequested||this.disposed?Promise.resolve():this.activeCompile?this.activeCompile:(this.activeCompile=this.fluid.compileAsync().finally(()=>{this.activeCompile=null,this.disposeRequested&&this.disposeNow()}),this.activeCompile)}reset(){this.disposeRequested||this.disposed||(this.fluid.reset(),this.mouse.x=0,this.mouse.y=0,this.mouse.px=0,this.mouse.py=0,this.mouse.inside=!1,this.handPointers.clear(),this.handPointerActiveIds.clear(),this.lastActiveAt=0,this.lastStepTime=-1,this.lastScrollPaintStepTime=-1,this.lastPointerProcessTime=-1,this.lastScrollClearTime=-1,this.scrollClear=0)}get densityTexture(){return this.fluid.fbos.density.read}get velocityTexture(){return this.fluid.fbos.velocity.read}update(e,t,s,n,r,o){if(this.disposeRequested||this.disposed)return this.velocityTexture;if(this.fluid.updateConfig("curl",s.pointcloud.fluid.curl),o!==this.lastScrollClearTime){this.lastScrollClearTime=o;const v=w.smoothstep(Math.abs(t.scrollVelocity),Bt,Nt);this.scrollClear=w.damp(this.scrollClear,v,Wt,e)}const u=this.scrollClear,l=s.pointcloud.fluid.velocityDissipation;if(this.fluid.updateConfig("velocityDissipation",w.lerp(l,Math.min(l,Ht),u)),this.fluid.updateConfig("densityDissipation",s.pointcloud.fluid.densityDissipation),this.fluid.updateConfig("pressureDissipation",s.pointcloud.fluid.pressure),t.pointerActive||(this.mouse.inside=!1),t.pointerActive&&s.pointcloud.fluid.enabled&&n>0&&r>0&&o!==this.lastPointerProcessTime){this.lastPointerProcessTime=o;const v=t.pointer,c=(v.x*.5+.5)*n,p=(-v.y*.5+.5)*r,h=performance.now(),x=this.mouse.inside&&h-this.lastActiveAt<80;this.mouse.px=x?this.mouse.x:c,this.mouse.py=x?this.mouse.y:p,this.mouse.x=c,this.mouse.y=p,this.mouse.inside=!0,this.lastActiveAt=h;const R=this.mouse.x-this.mouse.px,y=this.mouse.y-this.mouse.py;if(R!==0||y!==0){const m=Math.hypot(R,y)/Math.max(e,1e-4),M=1+(Yt-1)*w.smoothstep(m,Gt,jt),S=s.pointcloud.fluid.splatForce*M;this.color.setHSL(o*.1%1,.8,.5),this.fluid.splat(this.mouse.x,this.mouse.y,R*S,y*S,this.color,s.pointcloud.fluid.splatRadius*qt,this.mouse.px,this.mouse.py)}}return this.paintHandFluidPointers(t,s,n,r,o),this.paintScrollFluidRects(t,s,n,r,o,e),t.transitionRole!=="warmup"&&o!==this.lastStepTime&&(this.lastStepTime=o,bt("cloudTexture.sharedFluid",()=>this.fluid.update(Math.min(e,1/30)))),this.fluid.fbos.velocity.read}paintHandFluidPointers(e,t,s,n,r){const o=e.handFluidPointers;if(!o||o.length===0||e.transitionRole==="warmup"||!t.pointcloud.fluid.enabled||s<=0||n<=0){(!o||o.length===0)&&this.handPointers.clear();return}const u=this.handPointerActiveIds;u.clear();for(const l of o){const v=w.clamp(l.x,0,1)*s,c=w.clamp(l.y,0,1)*n,p=this.handPointers.get(l.id);if(this.handPointers.set(l.id,{x:v,y:c}),u.add(l.id),!p)continue;const h=v-p.x,x=c-p.y;Math.hypot(h,x)<=.001||(this.color.setHSL((r*.11+l.id*.08)%1,.74,.54),this.fluid.splat(v,c,h*t.pointcloud.fluid.splatForce*l.strength*1.35,x*t.pointcloud.fluid.splatForce*l.strength*1.35,this.color,t.pointcloud.fluid.splatRadius*Xt,p.x,p.y))}for(const l of this.handPointers.keys())u.has(l)||this.handPointers.delete(l)}paintScrollFluidRects(e,t,s,n,r,o){const u=e.scrollFluidRects,l=e.scrollVelocity;if(!u||e.transitionRole==="warmup"||!t.pointcloud.fluid.enabled||s<=0||n<=0||r===this.lastScrollPaintStepTime||Math.abs(l)<Ut)return;const v=Math.max(window.innerWidth,1),c=Math.max(window.innerHeight,1),p=e.scrollFluidRectInfluences,h=Math.min(Ot,u.length/4),x=w.clamp(o*60,.25,2),R=w.clamp(l,-1,1)*zt*x;if(!(Math.abs(R)<1e-4)){this.lastScrollPaintStepTime=r,this.color.setHSL((r*.07+.11)%1,.55,.54);for(let y=0;y<h;y++){const m=y*4,M=u[m],S=u[m+1],W=u[m+2],A=u[m+3];if(W<=0||A<=0)continue;const ie=Math.max(0,S),q=Math.min(c,S+A),O=w.clamp((q-ie)/Math.max(A,1),0,1);if(O<=0)continue;const _=Math.max(0,(p==null?void 0:p[y])??1);if(_<=0)continue;const X=(M+W*.5)/v*s,Y=(S+A*.5)/c*n,G=R*_,Ee=Math.sin(r*1.7+y*1.91)*Math.abs(G)*.28,Ae=w.clamp(Math.min(W,A)*.045*(s/v),9,23);this.fluid.splat(X,Y,Ee,-G*O,this.color,Ae)}}}dispose(){this.disposed||this.disposeRequested||(this.disposeRequested=!0,this.activeCompile||this.disposeNow())}disposeNow(){this.disposed||(this.disposed=!0,this.fluid.dispose())}}const k=new WeakMap;function $t(i,e){const t=k.get(i);if(t)return t.refs++,t.fluid;const s=new Zt(i,e);return k.set(i,{fluid:s,refs:1}),s}function Qt(i,e){if(!i||!e)return;const t=k.get(i);!t||t.fluid!==e||(t.refs--,t.refs<=0&&(k.delete(i),e.dispose()))}function ai({fluid:i,fluidVelocityRef:e,driveFluid:t=!0,scrollVelocity:s=0,motion:n}){const r=me(m=>m.gl),o=me(m=>m.size),u=$e(),l=i.simSize,v=i.dyeSize,c=P.useMemo(()=>$t(r,{simSize:l,dyeSize:v}),[r]);P.useEffect(()=>()=>Qt(r,c),[r,c]),P.useEffect(()=>{c.resize(Math.max(1,o.width),Math.max(1,o.height))},[c,o.height,o.width]);const p=je(),h=P.useRef(!1);P.useEffect(()=>{if(!p)return;let m=!1;return xt(async()=>{m||(await c.compileAsync(),!m&&(c.update(1/60,{transitionRole:"solo",pointer:{x:0,y:0},pointerActive:!1,scrollVelocity:0},{pointcloud:{fluid:i}},Math.max(1,o.width),Math.max(1,o.height),0),m||(h.current=!0)))},{visibilityAwareWatchdog:!0}).catch(M=>{m||Ze(M,"FluidField.warmup",{...yt(M)})}),()=>{m=!0}},[p,c]);const x=P.useRef(0),R=P.useRef({transitionRole:"solo",pointer:{x:0,y:0},pointerActive:!1,scrollVelocity:0}),y=P.useRef(null);return Xe((m,M)=>{var q,O;const S=((q=n==null?void 0:n.current)==null?void 0:q.transition)??0;if(S<=-1||S>=1){e.current=c.velocityTexture;return}const A=Math.min(M,1/30),ie=S>=0&&S<1;if(t&&ie&&h.current){c.configure(l,v)&&(c.reset(),x.current=0),x.current+=A;const _=R.current;_.pointer.x=u.current.x,_.pointer.y=u.current.y,_.pointerActive=u.current.active;const X=Ye.getState().preferReducedMotion;_.scrollVelocity=X?0:((O=n==null?void 0:n.current)==null?void 0:O.scrollVelocity)||s||vt();let Y=i;X&&((!y.current||y.current.src!==i)&&(y.current={src:i,out:{...i,splatForce:i.splatForce*Ge}}),Y=y.current.out);const G=c.update(M,_,{pointcloud:{fluid:Y}},Math.max(1,o.width),Math.max(1,o.height),x.current);e.current=G}else e.current=c.velocityTexture}),null}export{ai as F,yt as a,pt as c,xt as e,vt as g,mt as s};
//# sourceMappingURL=FluidField-DiEOQ-IH.js.map
