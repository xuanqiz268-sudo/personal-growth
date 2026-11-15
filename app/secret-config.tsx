'use client';
import {useState} from 'react';
import {KeyRound,Check,Loader2} from 'lucide-react';
import {portalFetch} from '@/lib/browser';
export default function SecretConfig({enabled,onConfigured}:{enabled:boolean;onConfigured:()=>void}){
 const [key,setKey]=useState(''),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
 async function save(){setBusy(true);setMessage('');try{const response=await portalFetch('/api/deepseek-config',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({key})});const data:any=await response.json();if(!response.ok)throw new Error(data.error||'配置未完成');setKey('');setMessage('已通过官方接口验证并加密保存。');onConfigured();}catch(e){setMessage((e as Error).message);}finally{setBusy(false);}}
 return <div className="secret-config"><label>DeepSeek API Key<input aria-label="DeepSeek API Key" type="password" autoComplete="off" spellCheck={false} value={key} onChange={e=>setKey(e.target.value)} placeholder="只在这里填写，不要写入笔记或聊天"/></label><p>提交到本私人网站后，由服务端向 DeepSeek 官方接口验证。凭证使用 AES-GCM 加密保存，根密钥位于 Sites 服务端 Secret；完整备份和共享档案均不包含凭证。</p><button className="secondary small" disabled={!enabled||busy||!key.trim()} onClick={save}>{busy?<Loader2 size={16} className="spin"/>:<KeyRound size={16}/>}验证并安全保存</button>{!enabled&&<p>服务端加密密钥尚未配置，请先完成部署。</p>}{message&&<p role="status">{message}</p>}</div>;
}
