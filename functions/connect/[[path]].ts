type Env={SITES_ORIGIN:string;SITES_SERVICE_KEY:string};
export const onRequest=async({request,env}:{request:Request;env:Env})=>{
 const url=new URL(request.url),headers=new Headers();
 if(!['GET','POST'].includes(request.method))return new Response('请求方式无效',{status:405});
 if(request.method==='POST'&&request.headers.get('Origin')!==url.origin)return new Response('请从登录页面提交',{status:403});
 for(const name of ['Content-Type','Origin','Cookie']){const value=request.headers.get(name);if(value)headers.set(name,value);}
 headers.set('x-growth-sync-key',env.SITES_SERVICE_KEY);
 try{
  const body=request.method==='POST'?await request.text():undefined;
  if(body&&body.length>16000)return new Response('登录请求过大',{status:413});
  const response=await fetch(env.SITES_ORIGIN+url.pathname+url.search,{method:request.method,headers,body,redirect:'manual'});
  const resultHeaders=new Headers(response.headers);resultHeaders.set('Cache-Control','no-store');
  return new Response(response.body,{status:response.status,headers:resultHeaders});
 }catch{return new Response('私人登录暂时无法连接，请稍后重试',{status:502});}
};
