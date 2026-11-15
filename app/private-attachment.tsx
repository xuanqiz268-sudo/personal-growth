'use client';
import {useEffect,useState} from 'react';
import {Download} from 'lucide-react';
import {portalFetch} from '@/lib/browser';
export default function PrivateAttachment({attachment:a}:{attachment:any}){
 const [url,setUrl]=useState(''),[error,setError]=useState('');
 useEffect(()=>{if(!/^image\/(png|jpeg|gif|webp)$/.test(a.mime))return;let alive=true,objectUrl='';portalFetch('/api/attachments/'+a.id).then(async response=>{if(!response.ok)throw new Error('图片读取失败');objectUrl=URL.createObjectURL(await response.blob());if(alive)setUrl(objectUrl);else URL.revokeObjectURL(objectUrl);}).catch(()=>setError('图片暂时无法读取'));return()=>{alive=false;if(objectUrl)URL.revokeObjectURL(objectUrl);};},[a.id,a.mime]);
 async function download(){try{const response=await portalFetch('/api/attachments/'+a.id);if(!response.ok)throw new Error('附件下载未完成');const objectUrl=URL.createObjectURL(await response.blob());const link=document.createElement('a');link.href=objectUrl;link.download=a.name;link.click();setTimeout(()=>URL.revokeObjectURL(objectUrl),1000);}catch{setError('附件下载未完成，请重新连接后再试');}}
 return <div className="attachment">{url&&<img src={url} alt={a.name}/>}<button className="text-button" onClick={download}>{a.name}<Download size={15}/></button>{error&&<p className="muted">{error}</p>}</div>;
}
