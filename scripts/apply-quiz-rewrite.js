const fs=require('fs');
const rwFile=process.argv[2];
const rw=JSON.parse(fs.readFileSync(rwFile,'utf8'));
let applied=0,warn=0;
for(const slug of Object.keys(rw)){
  const fp='generated/cams/lessons/'+slug+'.json';
  if(!fs.existsSync(fp)) fp2='generated/ccas/lessons/'+slug+'.json';
  const path = fs.existsSync(fp)? fp : 'generated/ccas/lessons/'+slug+'.json';
  const j=JSON.parse(fs.readFileSync(path,'utf8'));
  const q=j.scenes.find(x=>x.sceneType==='quiz');
  const qs=q.sceneData.questions;
  if(rw[slug].length!==qs.length){console.log('LEN MISMATCH',slug);warn++;continue;}
  rw[slug].forEach((r,i)=>{
    const qq=qs[i];
    if(r.correctId!==qq.correctOptionId){console.log('correctId changed',slug,i);warn++;}
    const ids=qq.options.map(o=>o.id);
    if(!ids.every(id=>id in r.options)){console.log('missing id',slug,i);warn++;return;}
    qq.options.forEach(o=>{o.text=r.options[o.id];});
    qq.correctOptionId=r.correctId; qq.explanation=r.explanation; applied++;
  });
  fs.writeFileSync(path,JSON.stringify(j,null,2)+'\n');
}
console.log('applied',applied,'| warnings',warn);
