import {chromium} from '@playwright/test';
const browser=await chromium.launch({headless:true});
try{
 const context=await browser.newContext({viewport:{width:360,height:800}}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('requestfailed',r=>console.log('Failed:',r.url(),r.failure()?.errorText));
 page.on('console',m=>{if(m.type()==='error')console.log('Browser:',m.text());});
 page.setDefaultTimeout(15000);
 await page.goto('http://127.0.0.1:4173');console.log('Production page loaded');
 await page.evaluate(async()=>{await Promise.race([navigator.serviceWorker.ready,new Promise((_,reject)=>setTimeout(async()=>reject(new Error('Service Worker timeout: '+JSON.stringify((await navigator.serviceWorker.getRegistrations()).map(r=>({scope:r.scope,active:r.active?.state,installing:r.installing?.state}))))),15000))]);});console.log('Offline worker ready');
 await page.reload();
 if(!await page.evaluate(()=>!!navigator.serviceWorker.controller))throw Error('No active offline worker');
 await page.locator('.room-art').evaluate(image=>image.decode());
 await page.locator('.scene-card').screenshot({path:'docs/preview-atelier.png'});
 await context.setOffline(true);await page.reload();
 await page.screenshot({path:'test-results/offline-home-360.png',fullPage:true});
 await page.getByRole('button',{name:/ソラとはじめる/}).click();
 await page.getByRole('button',{name:'ヒント',exact:true}).click();
 if(await page.locator('.hinted').count()!==2)throw Error('Offline hint not available');
 if(!await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth))throw Error('360px overflow');
 await page.screenshot({path:'test-results/offline-puzzle-360.png',fullPage:true});
 await page.reload();if(await page.locator('[data-bottle]').count()!==4)throw Error('Offline restore failed');
 if(errors.length)throw Error(errors.join('\n'));
 console.log('PASS: production Service Worker, offline reload, 360px puzzle, hints, save restoration; zero page errors.');
 await browser.close();
}catch(error){await browser.close();throw error;}
