import React,{useState,useEffect} from 'react';
import {createRoot} from 'react-dom/client';
import Journal from '../app/journal';
import '../app/globals.css';
import {portalFetch,sessionKey} from '../lib/browser';
function Portal(){
 const [ready,setReady]=useState(false),[message,setMessage]=useState('正在检查私人连接…');
 useEffect(()=>{(async()=>{try{const params=new URLSearchParams(location.hash.slice(1));if(params.has('code')){history.replaceState(null,'',location.pathname);const saved=JSON.parse(sessionStorage.getItem('growth-pkce')||'{}');if(saved.state!==params.get('state')||!saved.verifier)throw new Error('授权信息不匹配，请重新连接');const response=await portalFetch('/api/portal/exchange',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code:params.get('code'),verifier:saved.verifier})});const data:any=await response.json();if(!response.ok)throw new Error(data.error||'连接未完成');sessionStorage.setItem(sessionKey,data.token);sessionStorage.removeItem('growth-pkce');}const status=await portalFetch('/api/status');if(status.ok)setReady(true);else{sessionStorage.removeItem(sessionKey);setMessage('登录后，两个入口会读取同一份私人记录。');}}catch(e){setMessage((e as Error).message);}})();},[]);
 async function connect(){const verifier=[...crypto.getRandomValues(new Uint8Array(32))].map(x=>x.toString(16).padStart(2,'0')).join('');const bytes=new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(verifier)));const challenge=btoa(String.fromCharCode(...bytes)).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');const state=crypto.randomUUID().replaceAll('-','');sessionStorage.setItem('growth-pkce',JSON.stringify({state,verifier}));const config=window.GROWTH_PORTAL!;location.assign(config.authOrigin+'/connect?'+new URLSearchParams({redirect_uri:config.redirect,challenge,state}));}
 if(!ready)return <main className="connect-page"><section className="panel"><p className="eyebrow">A LIFE IN PROGRESS</p><h1>此刻与长远</h1><p>{message}</p><p className="muted">页面外壳公开。记录、附件与分析只在登录授权后读取。</p><button className="primary" onClick={connect}>连接我的私人空间</button></section></main>;
 return <><Journal/><button className="portal-signout" onClick={()=>{sessionStorage.removeItem(sessionKey);location.reload();}}>退出当前入口</button></>;
}
createRoot(document.getElementById('root')!).render(<Portal/>);
