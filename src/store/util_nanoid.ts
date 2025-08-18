export function nanoid(size=12){const abc='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz-';let id='';for(let i=0;i<size;i++){id+=abc[Math.floor(Math.random()*abc.length)]}return id}
