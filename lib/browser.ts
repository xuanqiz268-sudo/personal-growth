declare global {interface Window {GROWTH_PORTAL?:{apiOrigin:string;authOrigin:string;redirect:string}}}
export const sessionKey='growth-browser-session';
export function portalFetch(path:string,options:RequestInit={}){
 const config=typeof window==='undefined'?null:window.GROWTH_PORTAL;const headers=new Headers(options.headers);
 if(config){const token=sessionStorage.getItem(sessionKey);if(token)headers.set('Authorization','Bearer '+token);}
 return fetch((config?.apiOrigin||'')+path,{...options,headers});
}
