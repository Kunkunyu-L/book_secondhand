function v(c,n,r){const a=n.map(o=>o.title).join(","),l=c.map(o=>n.map(p=>{let e=o[p.key];return e==null&&(e=""),e=String(e).replace(/"/g,'""'),`"${e}"`}).join(",")),i=[a,...l].join(`
`),s=new Blob(["\uFEFF"+i],{type:"text/csv;charset=utf-8;"}),t=document.createElement("a");t.href=URL.createObjectURL(s),t.download=`${r}.csv`,t.click(),URL.revokeObjectURL(t.href)}export{v as e};
