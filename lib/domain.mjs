export const kinds = ['essay','schedule','expense','fitness','learning','goal','progress','experience','music','spiritual','review'];
export function dateCN(now = new Date()) { return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(now); }
export function cents(value) {
  if (!/^\d{1,9}(\.\d{1,2})?$/.test(String(value))) throw new Error('金额必须为正数，最多两位小数');
  const [whole,fraction=''] = String(value).split('.'); return Number(whole)*100+Number(fraction.padEnd(2,'0'));
}
export function terms(text) { return [...new Intl.Segmenter('zh',{granularity:'word'}).segment(String(text).normalize('NFKC').toLowerCase())].filter(x=>x.isWordLike).map(x=>x.segment).join(' '); }
export function chunks(text, size=1200, overlap=150) { const result=[]; for(let i=0;i<text.length;i+=size-overlap) { result.push({start:i,end:Math.min(i+size,text.length),text:text.slice(i,i+size)}); if(i+size>=text.length)break; } return result; }
export function validateRecord(input) {
  if (!input || typeof input!=='object' || !kinds.includes(input.kind)) throw new Error('记录类型无效');
  const title=String(input.title||'').trim(), content=String(input.content||'');
  if(!title || title.length>200 || content.length>100000) throw new Error('请填写标题（200字内），正文最多10万字');
  const occurredAt=String(input.occurredAt||dateCN());
  if(!/^\d{4}-\d{2}-\d{2}$/.test(occurredAt)||Number.isNaN(Date.parse(occurredAt+'T00:00:00Z')) || new Date(occurredAt+'T00:00:00Z').toISOString().slice(0,10)!==occurredAt) throw new Error('日期无效');
  const data=input.data && typeof input.data==='object' && !Array.isArray(input.data)?input.data:{};
  if(JSON.stringify(data).length>30000)throw new Error('附加信息过长');
  if(input.kind==='expense' && (!Number.isSafeInteger(data.amountCents)||data.amountCents<=0||!['income','expense'].includes(data.direction))) throw new Error('金额或收支方向无效');
  if(input.kind==='fitness') for(const field of ['sets','reps','weight','minutes']) if(data[field]!==undefined&&data[field]!==''&&(!Number.isFinite(Number(data[field]))||Number(data[field])<0))throw new Error('训练数据不能为负数');
  const tags=Array.isArray(input.tags)?input.tags.slice(0,20).map(x=>String(x).slice(0,40)):[];
  return {kind:input.kind,title,content,occurredAt,data,tags};
}
export function safeFilename(name) {return String(name).replace(/[<>:"/\\|?*\x00-\x1f]/g,'_').slice(0,120)||'附件';}
export function hasSecret(text) { return /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|\b(?:ghp_|github_pat_|sk-)[A-Za-z0-9_\-]{20,}|(?:api[_-]?key|password|密码|token)\s*[:=：]\s*["']?[A-Za-z0-9_\-]{12,}/i.test(text); }
export function csvCell(v) { const s=String(v??''); return '"'+(/^[=+@\-\t\r]/.test(s)?"'":'')+s.replaceAll('"','""')+'"'; }
