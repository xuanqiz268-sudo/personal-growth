import React,{useState,useEffect} from 'react';
import {createRoot} from 'react-dom/client';
import Journal from '../app/journal';
import '../app/globals.css';
import {portalFetch,sessionKey,pendingLogin,savePendingLogin,clearPendingLogin} from '../lib/browser';
function Portal(){
 const [ready,setReady]=useState(false),[message,setMessage]=useState('正在检查私人连接…');
 useEffect(()=>{(async()=>{try{
  const params=new URLSearchParams(location.hash.slice(1));
  const privateKey=params.get('private');
  if(privateKey){
   history.replaceState(null,'',location.pathname);
   const response=await portalFetch('/api/portal/exchange',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({privateKey}),signal:AbortSignal.timeout(20000)});
   const data:any=await response.json();if(!response.ok)throw new Error(data.error||'专属链接连接未完成');
   sessionStorage.setItem(sessionKey,data.token);
  }else if(params.has('code')){
   history.replaceState(null,'',location.pathname);const saved=pendingLogin(params.get('state')||'');if(!saved)throw new Error('授权信息不匹配，请重新连接');
   const response=await portalFetch('/api/portal/exchange',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code:params.get('code'),verifier:saved.verifier}),signal:AbortSignal.timeout(20000)});
   const data:any=await response.json();if(!response.ok)throw new Error(data.error||'连接未完成');sessionStorage.setItem(sessionKey,data.token);clearPendingLogin(params.get('state')||'');
  }
  const status=await portalFetch('/api/status',{signal:AbortSignal.timeout(20000)});
  if(status.ok)setReady(true);else{sessionStorage.removeItem(sessionKey);setMessage('请使用你保存的专属链接直接进入，或使用邮箱登录。');}
 }catch(e){setMessage((e as Error).name==='TimeoutError'?'连接超过20秒，请检查网络后重新打开专属链接。':(e as Error).message);}})();},[]);
 async function connect(){const verifier=[...crypto.getRandomValues(new Uint8Array(32))].map(x=>x.toString(16).padStart(2,'0')).join('');const bytes=new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(verifier)));const challenge=btoa(String.fromCharCode(...bytes)).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');const state=crypto.randomUUID().replaceAll('-','');savePendingLogin({state,verifier});const config=window.GROWTH_PORTAL!;location.assign(config.authOrigin+'/connect?'+new URLSearchParams({redirect_uri:config.redirect,challenge,state}));}
 if(!ready)return <main className="connect-page"><section className="panel"><p className="eyebrow">A LIFE IN PROGRESS</p><h1>此刻与长远</h1><p>{message}</p><p className="muted">专属链接相当于钥匙，请勿转发。普通网址无法读取私人资料。</p><button className="primary" onClick={connect}>使用邮箱登录（备用）</button></section></main>;
 return <><Journal/><button className="portal-signout" onClick={()=>{sessionStorage.removeItem(sessionKey);location.reload();}}>退出当前入口</button></>;
}
createRoot(document.getElementById('root')!).render(<Portal/>);
