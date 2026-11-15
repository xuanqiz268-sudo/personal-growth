import {Zip,ZipDeflate,strToU8} from 'fflate';
import {csvCell,dateCN} from './domain.mjs';
declare global {interface Window {GROWTH_PORTAL?:{apiOrigin:string;authOrigin:string;redirect:string}}}
export const sessionKey='growth-browser-session';
export function portalFetch(path:string,options:RequestInit={}){
 const config=typeof window==='undefined'?null:window.GROWTH_PORTAL;const headers=new Headers(options.headers);
 if(config){const token=sessionStorage.getItem(sessionKey);if(token)headers.set('Authorization','Bearer '+token);}
 return fetch((config?.apiOrigin||'')+path,{...options,headers});
}
export const backupTables=['records','revisions','documents','sources','passages','attachments','memories','runs'];
export async function readBackup(fetcher:typeof portalFetch=portalFetch,tables=backupTables){
 const data:any={format:'growth-journal',version:1,exportedAt:new Date().toISOString()};
 for(const table of tables){data[table]=[];let after='';do{
  const response=await fetcher('/api/backup?'+new URLSearchParams({table,after}));
  const page:any=await response.json();if(!response.ok)throw new Error(page.error||'备份读取未完成');
  if(!Array.isArray(page.rows)||page.next&&page.next<=after)throw new Error('备份分页无效');
  data[table].push(...page.rows);after=page.next||'';
 }while(after);}
 return data;
}
export async function createBackup(progress:(text:string)=>void,fetcher:typeof portalFetch=portalFetch){
 progress('正在读取结构数据…');const data=await readBackup(fetcher),parts:BlobPart[]=[];
 let failure:Error|null=null;
 const zip=new Zip((error,bytes)=>{if(error)failure=error;else parts.push(bytes.slice().buffer);});
 const add=(name:string,bytes:Uint8Array)=>{if(failure)throw failure;const entry=new ZipDeflate(name,{level:3});zip.add(entry);entry.push(bytes,true);};
 add('data.json',strToU8(JSON.stringify(data)));
 for(const row of data.records)add('records/'+row.id+'.md',strToU8(`# ${row.title}\n\n日期：${row.occurred_at}\n\n${row.content}\n`));
 for(const row of data.documents)add('documents/'+row.id+'.md',strToU8(`# ${row.title}\n\n作者：${row.author||'未注明'}\n资料性质：${row.kind}\n导入时间：${row.imported_at}\n来源元数据：${row.metadata}\n\n${row.content}\n`));
 const accounts=[['日期','方向','金额（元）','分类','标题','备注'],...data.records.filter((r:any)=>r.kind==='expense'&&!r.deleted_at).map((r:any)=>{const d=JSON.parse(r.data);return [r.occurred_at,d.direction==='income'?'收入':'支出',(d.amountCents/100).toFixed(2),d.category,r.title,r.content];})];
 add('账目.csv',strToU8('\ufeff'+accounts.map(row=>row.map(csvCell).join(',')).join('\r\n')));
 for(const [i,item] of data.attachments.entries()){
  progress(`正在备份附件 ${i+1}/${data.attachments.length}…`);
  const response=await fetcher('/api/attachments/'+encodeURIComponent(item.id));if(!response.ok)throw new Error('附件下载未完成：'+item.name);
  const bytes=new Uint8Array(await response.arrayBuffer());if(bytes.length!==item.size)throw new Error('附件大小不一致：'+item.name);
  add('attachments/'+item.id,bytes);await new Promise(resolve=>setTimeout(resolve,0));
 }
 zip.end();if(failure)throw failure;
 return {blob:new Blob(parts,{type:'application/zip'}),name:'此刻与长远-'+dateCN()+'.zip'};
}
