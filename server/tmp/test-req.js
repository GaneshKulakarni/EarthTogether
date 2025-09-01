const http = require('http');

function get(path){
  return new Promise((res, rej)=>{
    http.get({host:'127.0.0.1', port:5000, path, timeout:2000}, r=>{
      let d=''; r.on('data',c=>d+=c); r.on('end',()=>res({status: r.statusCode, body:d}));
    }).on('error', e=> rej(e));
  });
}

(async ()=>{
  try{
    console.log(await get('/api/health'));
  }catch(e){
    console.error('ERR', e.message, e.code||'');
    process.exit(1);
  }
})();
