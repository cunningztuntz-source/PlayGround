import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js';

const mount = document.querySelector('#game');
const scene = new THREE.Scene();
scene.background = new THREE.Color('#a9c5c6');
scene.fog = new THREE.Fog('#a9c5c6', 25, 68);
const camera = new THREE.PerspectiveCamera(54, innerWidth / innerHeight, .1, 150);
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.8));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
mount.appendChild(renderer.domElement);

const mat = (color, roughness=.8, metalness=0) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
const concrete = mat('#929995'), concreteDark = mat('#606b6a'), paleConcrete = mat('#b8bdb2'), lime = mat('#d7ff32', .55), steel = mat('#68777a', .36, .72), wood = mat('#aa7652'), black = mat('#20252a'), shirt = mat('#20262c'), pants = mat('#37424b'), skin = mat('#dbac87'), white = mat('#e6e1d6'), orange = mat('#d75c2b');
scene.add(new THREE.HemisphereLight('#e5ffff', '#53605b', 2.0));
const sun = new THREE.DirectionalLight('#fff0d6', 3.2); sun.position.set(-12, 23, 14); sun.castShadow = true; sun.shadow.mapSize.set(2048,2048); sun.shadow.camera.left=-30;sun.shadow.camera.right=30;sun.shadow.camera.top=30;sun.shadow.camera.bottom=-30;scene.add(sun);

const ground = new THREE.Mesh(new THREE.PlaneGeometry(90,90), mat('#758581'));
ground.rotation.x=-Math.PI/2;ground.position.y=-.12;ground.receiveShadow=true;scene.add(ground);
const arena = new THREE.Mesh(new THREE.BoxGeometry(28,.35,28), concrete); arena.position.y=-.22; arena.receiveShadow=true;arena.castShadow=true;scene.add(arena);
const arenaTop = new THREE.Mesh(new THREE.PlaneGeometry(27.5,27.5), mat('#a1a69c'));arenaTop.rotation.x=-Math.PI/2;arenaTop.position.y=-.035;arenaTop.receiveShadow=true;scene.add(arenaTop);
// expansion joints and faded court lines
for(let i=-12;i<=12;i+=4){const line=new THREE.Mesh(new THREE.BoxGeometry(.035,.012,26),mat('#737f7b'));line.position.set(i,.004,0);scene.add(line);const cross=new THREE.Mesh(new THREE.BoxGeometry(26,.012,.035),mat('#737f7b'));cross.position.set(0,.005,i);scene.add(cross)}
const paintLine=(x,z,w,d,c='#d7ff32')=>{let m=new THREE.Mesh(new THREE.BoxGeometry(w,.018,d),mat(c));m.position.set(x,.02,z);scene.add(m)};
paintLine(0,0,8,.055);paintLine(0,0,.055,8);paintLine(-10,0,.04,24,'#dfdfcb');paintLine(10,0,.04,24,'#dfdfcb');

// Quarterpipes have a smooth curved riding surface; profile is height from the flat.
function quarterpipe(zSign, color=concreteDark, width=8){
  const group=new THREE.Group(); const segments=24, rows=12, depth=4.2, verts=[], indices=[];
  for(let j=0;j<=rows;j++){const t=j/rows;const z=zSign*(8.1+t*depth);const y=2.65*(1-Math.cos(t*Math.PI/2));for(let i=0;i<=segments;i++){const x=(i/segments-.5)*width;verts.push(x,y,z)}}
  for(let j=0;j<rows;j++)for(let i=0;i<segments;i++){const a=j*(segments+1)+i,b=a+segments+1;indices.push(a,b,a+1,b,b+1,a+1)}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));geo.setIndex(indices);geo.computeVertexNormals();
  const surf=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color,roughness:.88,side:THREE.DoubleSide}));surf.castShadow=true;surf.receiveShadow=true;group.add(surf);
  // side cheeks and coping
  for(const x of [-width/2,width/2]){const cheek=new THREE.Mesh(new THREE.BoxGeometry(.18,1.35,depth),mat('#697472'));cheek.position.set(x,.45,zSign*10.15);group.add(cheek)}
  const coping=new THREE.Mesh(new THREE.CylinderGeometry(.11,.11,width+.2,12),steel);coping.rotation.z=Math.PI/2;coping.position.set(0,2.65,zSign*12.3);coping.castShadow=true;group.add(coping);
  const lip=new THREE.Mesh(new THREE.BoxGeometry(width, .05,.15),lime);lip.position.set(0,.1,zSign*8.15);group.add(lip);
  scene.add(group);
}
quarterpipe(-1);quarterpipe(1,mat('#78837e'));
// box ledges / manual pads
function box(x,z,w,d,h,color=concreteDark){const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),color);b.position.set(x,h/2,z);b.castShadow=true;b.receiveShadow=true;scene.add(b);const edge=new THREE.Mesh(new THREE.BoxGeometry(w+.025,.07,d+.025),steel);edge.position.set(x,h,z);edge.castShadow=true;scene.add(edge);return b}
box(-7,0,2.6,6,.72,mat('#77827c'));box(7,0,2.6,6,.72,mat('#77827c'));box(0,-5,4,2.2,.65,mat('#727e79'));box(0,5,4,2.2,.65,mat('#727e79'));
// rails with posts, several obstacle directions
function rail(x,z,length,alongZ=true,height=.78){const bar=new THREE.Mesh(new THREE.CylinderGeometry(.075,.075,length,12),steel);if(alongZ){bar.rotation.x=Math.PI/2;bar.position.set(x,height,z)}else{bar.rotation.z=Math.PI/2;bar.position.set(x,height,z)}bar.castShadow=true;scene.add(bar);const n=Math.max(2,Math.floor(length/2));for(let i=0;i<=n;i++){const p=new THREE.Mesh(new THREE.CylinderGeometry(.055,.075,height,8),steel);if(alongZ)p.position.set(x,height/2,z-length/2+length*i/n);else p.position.set(x-length/2+length*i/n,height/2,z);p.castShadow=true;scene.add(p)}}
rail(-4.2,0,9,true,.9);rail(4.2,0,9,true,.9);rail(0,-3.3,6,false,.82);rail(0,3.3,6,false,.82);
// benches and workshop dressing
for(const z of [-2.4,2.4]){const bench=new THREE.Group();const seat=new THREE.Mesh(new THREE.BoxGeometry(1.7,.12,.42),wood);seat.position.y=.6;bench.add(seat);for(const x of [-.6,.6]){const leg=new THREE.Mesh(new THREE.BoxGeometry(.1,.6,.1),black);leg.position.set(x,.3,0);bench.add(leg)}bench.position.set(10,0,z);scene.add(bench)}
// perimeter barriers and graphic wall panels
for(const side of [-1,1]){const wall=new THREE.Mesh(new THREE.BoxGeometry(28,1.2,.25),mat('#3c494d'));wall.position.set(0,.58,side*14);wall.castShadow=true;scene.add(wall);for(let x=-12;x<=12;x+=4){const panel=new THREE.Mesh(new THREE.BoxGeometry(2.4,.62,.03),mat(x%8===0?'#d7ff32':'#d95d35'));panel.position.set(x,.65,side*13.86);scene.add(panel)}}
// small urban scene beyond the park
for(let i=0;i<20;i++){const x=(i%5-2)*12+(Math.random()-.5)*3,z=-27-Math.floor(i/5)*8;const h=2+Math.random()*5;const b=new THREE.Mesh(new THREE.BoxGeometry(3+Math.random()*2,h,3),mat(['#b1b8ae','#87918b','#c4b8a2'][i%3]));b.position.set(x,h/2-.2,z);scene.add(b);for(let yy=.8;yy<h-.4;yy+=1.1){for(let xx=-.8;xx<=.8;xx+=1.5){const win=new THREE.Mesh(new THREE.PlaneGeometry(.55,.55),mat('#596a6d',.5));win.position.set(x+xx,yy,z+1.51);scene.add(win)}}}
// grungy park decals, arrows and a large painted logo
const logo=new THREE.Group();const logoBase=new THREE.Mesh(new THREE.CircleGeometry(2.2,48),mat('#d7ff32'));logoBase.rotation.x=-Math.PI/2;logoBase.position.y=.012;logoBase.position.z=0;scene.add(logoBase);
const logoText=document.createElement('canvas');logoText.width=512;logoText.height=192;const ctx=logoText.getContext('2d');ctx.clearRect(0,0,512,192);ctx.fillStyle='#192329';ctx.font='900 120px Impact, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('BAM',256,92);const tex=new THREE.CanvasTexture(logoText);tex.colorSpace=THREE.SRGBColorSpace;const decal=new THREE.Mesh(new THREE.PlaneGeometry(3.2,1.2),new THREE.MeshBasicMaterial({map:tex,transparent:true,side:THREE.DoubleSide,depthWrite:false}));decal.rotation.x=-Math.PI/2;decal.position.set(0,.025,0);scene.add(decal);

// Rider and board
const rider=new THREE.Group();scene.add(rider);const board=new THREE.Group();rider.add(board);
const deck=new THREE.Mesh(new THREE.BoxGeometry(.42,.12,1.12),mat('#d95e32',.45));deck.position.y=.15;deck.castShadow=true;board.add(deck);
const grip=new THREE.Mesh(new THREE.BoxGeometry(.35,.025,.91),black);grip.position.y=.22;board.add(grip);
for(const z of [-.36,.36]){const truck=new THREE.Mesh(new THREE.BoxGeometry(.38,.07,.12),steel);truck.position.set(0,.09,z);board.add(truck);for(const x of [-.21,.21]){const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.105,.105,.08,16),mat('#e6d6ad',.55));wheel.rotation.z=Math.PI/2;wheel.position.set(x,.02,z);wheel.castShadow=true;board.add(wheel)}}
const body=new THREE.Group();body.position.y=.94;rider.add(body);
function limb(parent, radius, length, material, pos){const m=new THREE.Mesh(new THREE.CylinderGeometry(radius*.82,radius,length,9),material);m.position.set(...pos);m.castShadow=true;parent.add(m);return m}
const torso=new THREE.Mesh(new THREE.BoxGeometry(.57,.72,.32),shirt);torso.position.y=.16;torso.castShadow=true;body.add(torso);
const head=new THREE.Mesh(new THREE.SphereGeometry(.24,16,12),skin);head.position.set(0,.7,0);head.castShadow=true;body.add(head);
const hair=new THREE.Mesh(new THREE.SphereGeometry(.255,14,9,0,Math.PI*2,0,Math.PI*.65),black);hair.position.set(0,.76,-.015);hair.castShadow=true;body.add(hair);
const band=new THREE.Mesh(new THREE.TorusGeometry(.24,.035,6,16),mat('#d7ff32'));band.position.set(0,.72,0);band.rotation.x=Math.PI/2;body.add(band);
const armL=limb(body,.095,.56,shirt,[-.39,.2,0]),armR=limb(body,.095,.56,shirt,[.39,.2,0]);armL.rotation.z=-.42;armR.rotation.z=.42;
const foreL=limb(body,.075,.42,skin,[-.5,-.22,.04]),foreR=limb(body,.075,.42,skin,[.5,-.22,.04]);foreL.rotation.z=.25;foreR.rotation.z=-.25;
const legL=limb(rider,.14,.56,pants,[-.17,.54,0]),legR=limb(rider,.14,.56,pants,[.17,.54,0]);
for(const x of [-.17,.17]){const shoe=new THREE.Mesh(new THREE.BoxGeometry(.25,.13,.36),white);shoe.position.set(x,.23,.05);shoe.castShadow=true;rider.add(shoe)}
const cap=new THREE.Mesh(new THREE.BoxGeometry(.3,.08,.28),orange);cap.position.set(0,1.74,.01);rider.add(cap);

const ui={score:document.querySelector('#score'),best:document.querySelector('#best'),timer:document.querySelector('#timer'),fill:document.querySelector('#timerFill'),combo:document.querySelector('#comboValue'),comboName:document.querySelector('#comboName'),comboCard:document.querySelector('#comboCard'),pop:document.querySelector('#trickPop'),trickName:document.querySelector('#trickName'),trickPoints:document.querySelector('#trickPoints'),loading:document.querySelector('#loading'),center:document.querySelector('#centerMessage'),final:document.querySelector('#finalScore')};
let best=Number(localStorage.getItem('bamBest')||0);ui.best.textContent=String(best).padStart(6,'0');
const state={x:0,z:1,vx:0,vz:0,y:0,vy:0,groundY:0,facing:0,air:false,grinding:false,manual:false,manualTime:0,charge:0,spaceDown:false,airTime:0,trickStyle:0,score:0,combo:0,mult:1,comboTime:0,time:120,ended:false,bail:0,keys:new Set(),trickSequence:0,popTimer:0,clock:0};
const trickList=[['KICKFLIP',180],['POP SHOVE-IT',220],['INDY GRAB',250],['360 FLIP',380]];
const format=n=>String(Math.floor(n)).padStart(6,'0');
function showTrick(name,points){ui.trickName.textContent=name;ui.trickPoints.textContent='+'+Math.floor(points);ui.pop.classList.add('show');state.popTimer=.8}
function addCombo(name,points){if(!state.combo){state.combo=0;state.mult=1}state.combo+=points*state.mult;state.mult=Math.min(8,state.mult+.25);state.comboTime=4.5;ui.comboCard.classList.add('active');ui.combo.textContent=Math.floor(state.combo).toLocaleString();ui.comboName.textContent=name.toUpperCase()+' ×'+state.mult.toFixed(2);showTrick(name,points*state.mult)}
function cashCombo(){if(state.combo>0){const earned=Math.floor(state.combo);state.score+=earned;ui.score.textContent=format(state.score);if(state.score>best){best=state.score;localStorage.setItem('bamBest',best);ui.best.textContent=format(best)}}state.combo=0;state.mult=1;state.comboTime=0;ui.combo.textContent='0';ui.comboName.textContent='READY TO ROLL';ui.comboCard.classList.remove('active')}
function rampHeight(x,z){if(Math.abs(x)>4.15)return 0;if(z < -8.05){const t=THREE.MathUtils.clamp((-z-8.05)/4.2,0,1);return 2.65*(1-Math.cos(t*Math.PI/2))}if(z>8.05){const t=THREE.MathUtils.clamp((z-8.05)/4.2,0,1);return 2.65*(1-Math.cos(t*Math.PI/2))}return 0}
function grindRail(){const candidates=[[-4.2,0,9,'Z'],[4.2,0,9,'Z'],[0,-3.3,6,'X'],[0,3.3,6,'X']];for(const [x,z,len,axis] of candidates){if(axis==='Z'&&Math.abs(state.x-x)<.48&&Math.abs(state.z-z)<len/2+.4)return true;if(axis==='X'&&Math.abs(state.z-z)<.48&&Math.abs(state.x-x)<len/2+.4)return true}return false}
function bail(){state.combo=0;state.mult=1;state.comboTime=0;ui.combo.textContent='0';ui.comboName.textContent='WIPEOUT';ui.comboCard.classList.remove('active');state.vx*=.25;state.vz*=.25;state.bail=.75;body.rotation.x=1.1;showTrick('BAIL!',0)}
function doOllie(){if(state.ended||state.air||state.bail>0)return;const power=.78+state.charge*.65;state.vy=5.5*power;state.air=true;state.airTime=0;state.trickStyle=0;state.groundY=rampHeight(state.x,state.z);state.charge=0;state.manual=false;body.rotation.x=-.22;}
function onKeyDown(e){let key=e.key.toLowerCase();if([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(key))e.preventDefault();if(key===' '){if(!state.spaceDown){state.spaceDown=true;state.charge=0}return}if(state.keys.has(key))return;state.keys.add(key);if(key==='escape'){document.querySelector('#controlsCard').classList.toggle('hidden')}if(key==='r')reset();if(['1','2','3','4'].includes(key)&&state.air&&!state.ended){const [name,pts]=trickList[Number(key)-1];addCombo(name,pts);state.trickSequence++;state.trickStyle=Number(key)}if(key==='shift'&&!state.air){state.manual=true;state.manualTime=0;}}
function onKeyUp(e){const key=e.key.toLowerCase();state.keys.delete(key);if(key===' '){state.spaceDown=false;doOllie()}if(key==='shift')state.manual=false}
addEventListener('keydown',onKeyDown);addEventListener('keyup',onKeyUp);addEventListener('blur',()=>{state.keys.clear();state.spaceDown=false;state.manual=false});
function reset(){state.x=0;state.z=1;state.vx=0;state.vz=0;state.y=0;state.vy=0;state.air=false;state.combo=0;state.mult=1;state.score=0;state.time=120;state.ended=false;state.bail=0;ui.score.textContent='000000';ui.timer.textContent='2:00';ui.fill.style.width='100%';ui.center.classList.remove('show');ui.comboCard.classList.remove('active');ui.combo.textContent='0';ui.comboName.textContent='READY TO ROLL';body.rotation.set(0,0,0);rider.position.set(0,0,1)}
document.querySelector('#closeHelp').onclick=()=>document.querySelector('#controlsCard').classList.add('hidden');document.querySelector('#helpBtn').onclick=()=>document.querySelector('#controlsCard').classList.toggle('hidden');document.querySelector('#playAgain').onclick=reset;
for(const button of document.querySelectorAll('.mobile-controls button')){const key=button.dataset.key;const down=e=>{e.preventDefault();if(key==='shift'){state.manual=true;return}if(key===' '){if(!state.spaceDown){state.spaceDown=true;state.charge=0}return}state.keys.add(key);if(['1','2','3','4'].includes(key)&&state.air){const [name,pts]=trickList[Number(key)-1];addCombo(name,pts);state.trickStyle=Number(key);state.trickSequence++}};const up=e=>{e.preventDefault();if(key==='shift'){state.manual=false;return}if(key===' '){state.spaceDown=false;doOllie();return}state.keys.delete(key)};button.addEventListener('pointerdown',down);button.addEventListener('pointerup',up);button.addEventListener('pointercancel',up);button.addEventListener('pointerleave',up)}

camera.position.set(0,10,14);camera.lookAt(0,0,0);
let last=performance.now();
function update(now){requestAnimationFrame(update);const dt=Math.min(.035,(now-last)/1000);last=now;state.clock+=dt;if(!state.ended){state.time=Math.max(0,state.time-dt);if(state.time===0){state.ended=true;cashCombo();ui.final.textContent=format(state.score);ui.center.classList.add('show')}}
  if(state.popTimer>0){state.popTimer-=dt;if(state.popTimer<=0)ui.pop.classList.remove('show')}
  if(state.charge<1&&state.spaceDown&&!state.air)state.charge=Math.min(1,state.charge+dt*1.1);
  const keys=state.keys;let ix=(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0);let iz=(keys.has('s')||keys.has('arrowdown')?1:0)-(keys.has('w')||keys.has('arrowup')?1:0);const moving=Math.hypot(ix,iz)>0;if(moving){const l=Math.hypot(ix,iz);ix/=l;iz/=l;state.vx+=ix*12*dt;state.vz+=iz*12*dt}const friction=moving?.988:.94;state.vx*=Math.pow(friction,dt*60);state.vz*=Math.pow(friction,dt*60);const speed=Math.hypot(state.vx,state.vz);if(speed>8.2){state.vx*=8.2/speed;state.vz*=8.2/speed}
  state.x+=state.vx*dt;state.z+=state.vz*dt;state.x=THREE.MathUtils.clamp(state.x,-12.1,12.1);state.z=THREE.MathUtils.clamp(state.z,-12.1,12.1);
  const ramp=rampHeight(state.x,state.z);if(state.air){state.airTime+=dt;state.vy-=13.5*dt;state.y+=state.vy*dt;if(state.y<=ramp){state.y=ramp;state.air=false;state.vy=0;body.rotation.x=0;if(state.combo>0)cashCombo();state.trickSequence=0;state.trickStyle=0}}else{state.y=ramp;if(state.manual){state.manualTime+=dt;if(state.manualTime>.35&&Math.random()<dt*4){addCombo('MANUAL',22)}if(state.manualTime>5){bail();state.manual=false}}}
  const nearRail=grindRail()&&speed>1.3;if(nearRail&&!state.air&&keys.has('shift')){state.grinding=true;state.manual=false;state.y=Math.max(state.y,.74);state.vy=0;if(Math.random()<dt*5)addCombo('50-50 GRIND',55)}else state.grinding=false;
  if(state.bail>0){state.bail-=dt;if(state.bail<=0)body.rotation.x=0}
  if(state.comboTime>0&&!state.air&&!state.manual&&!state.grinding){state.comboTime-=dt;if(state.comboTime<=0)cashCombo()}
  const targetFacing=Math.atan2(state.vx,-state.vz);if(speed>.25){let diff=THREE.MathUtils.euclideanModulo(targetFacing-state.facing+Math.PI,Math.PI*2)-Math.PI;state.facing+=diff*Math.min(1,dt*9)}
  rider.position.set(state.x,state.y,state.z);rider.rotation.y=state.facing+(state.air&&state.trickStyle===4?state.airTime*5:0);const at=state.airTime;board.rotation.x=state.air?(state.trickStyle===2?0:state.trickStyle===4?at*8:Math.sin(state.clock*11)*.08):0;board.rotation.y=state.air&&(state.trickStyle===2||state.trickStyle===4)?at*(state.trickStyle===2?10:7):0;board.rotation.z=state.air&&(state.trickStyle===1||state.trickStyle===4)?Math.sin(at*16)*.9:state.air?Math.sin(state.clock*14)*.09:0;body.position.y=.94+(state.air?Math.sin(state.clock*12)*.08:0);if(state.air)body.rotation.x=state.trickStyle===3?-.48:Math.sin(state.clock*10)*.2;
  // keep board and rider anchored to the ramp, lifting only on top of it
  rider.position.y=state.y;const camTarget=new THREE.Vector3(state.x*.56,1.15+state.y*.35,state.z*.56);camera.position.lerp(new THREE.Vector3(state.x*.62,10.5+state.y*.45,state.z+14.5),1-Math.exp(-dt*2.7));camera.lookAt(camTarget);
  ui.timer.textContent=`${Math.floor(state.time/60)}:${String(Math.floor(state.time%60)).padStart(2,'0')}`;ui.fill.style.width=`${state.time/120*100}%`;if(state.time<20)ui.fill.style.background='#ff704d';
  renderer.render(scene,camera);
}
requestAnimationFrame(update);
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.8))});
setTimeout(()=>ui.loading.classList.add('done'),650);
