import {test,expect} from '@playwright/test';
import stages from '../src/data/stages.json' with {type:'json'};
test('onboarding, real pours, undo, restart, hints, save restoration and first friend',async({page},info)=>{
 await page.goto('/');
 await expect(page.getByRole('heading',{name:'色をそろえて、心を満たす。'})).toBeVisible();
 await expect(page.locator('.room-dog').getByRole('img')).toHaveAttribute('aria-label',/ソラ（ダックスフント）/);
 await page.screenshot({path:`test-results/title-${info.project.name}.png`,fullPage:true});
 await page.getByRole('button',{name:'設定',exact:true}).click();
 await page.getByRole('checkbox',{name:/アニメーションを控えめに/}).check();
 await page.getByRole('button',{name:'閉じる',exact:true}).click();
 await page.getByRole('button',{name:/ソラとはじめる/}).click();
 await page.getByRole('button',{name:/チュートリアル 2色/}).click();
 const first=stages[0].solution[0];
 await page.locator(`[data-bottle="${first[0]}"]`).click();await page.locator(`[data-bottle="${first[1]}"]`).click();
 await expect(page.getByTestId('moves')).toHaveText('1');
 await page.getByRole('button',{name:'もどす',exact:true}).click();await expect(page.getByTestId('moves')).toHaveText('0');
 await page.getByRole('button',{name:'ヒント',exact:true}).click();await expect(page.locator('.hinted')).toHaveCount(2);
 await page.locator(`[data-bottle="${first[1]}"]`).click();await expect(page.getByTestId('moves')).toHaveText('1');
 await page.reload();await expect(page.getByTestId('moves')).toHaveText('1');
 await page.getByRole('button',{name:'やり直す',exact:true}).click();await page.getByRole('dialog').getByRole('button',{name:'やり直す',exact:true}).click();await expect(page.getByTestId('moves')).toHaveText('0');
 for(let id=1;id<=3;id++){
  for(const [from,to] of stages[id-1].solution){await page.locator(`[data-bottle="${from}"]`).click();await page.locator(`[data-bottle="${to}"]`).click();await expect(page.locator('.bottle-grid.pouring')).toHaveCount(0);}
  await expect(page.getByRole('dialog')).toBeVisible();await expect(page.locator('.result-title')).toHaveText(`ステージ ${id} クリア`);
  await page.getByRole('button',{name:id===3?'新しいなかまに会う':'つぎのステージ',exact:true}).click();
 }
 await expect(page.getByRole('heading',{name:'新しいなかまが、やってきた！'})).toBeVisible();
 await page.getByRole('button',{name:/アトリエに迎える/}).click();await expect(page.locator('.room-dog')).toHaveCount(2);
 await page.reload();await expect(page.locator('.room-dog')).toHaveCount(2);
 const data=await page.evaluate(()=>JSON.parse(localStorage.getItem('tintale.save.v2')!));expect(data.coins).toBe(180);expect(data.stars).toEqual({'1':3,'2':3,'3':3});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:`test-results/first-friend-${info.project.name}.png`,fullPage:true});
});
test('8 dogs, partner, furniture, outfit, missions and persisted customization',async({page},info)=>{
 await page.goto('/');await page.evaluate(()=>{const save={version:2,started:true,coins:1000,stars:Object.fromEntries(Array.from({length:40},(_,i)=>[String(i+1),3])),partner:'sora',bond:{sora:60},owned:[],outfits:{},slots:[null,null,null],wall:'natural',floor:'natural',claimed:[],daily:[],clears:40,pets:0,session:null,settings:{sound:false,music:false,reduced:true,symbols:true}};localStorage.setItem('tintale.save.v2',JSON.stringify(save));});await page.reload();
 await expect(page.locator('.room-dog')).toHaveCount(8);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.getByRole('button',{name:'ソラをなでる'}).click();
 await page.screenshot({path:`test-results/eight-dogs-${info.project.name}.png`,fullPage:true});
 await page.locator('.feature-link').first().click();
 await page.locator('.shop-item').filter({hasText:'ふかふかベッド'}).getByRole('button').click();
 await expect(page.locator('.placed-furniture')).toHaveCount(1);
 await page.getByRole('button',{name:'設定',exact:true}).click();await page.getByRole('button',{name:'閉じる',exact:true}).click();
 // Album detail exposes a real partner selector on both layouts.
 await page.locator(info.project.name==='mobile'?'.mobile-nav':'.sidebar').getByRole('button',{name:info.project.name==='mobile'?'なかま':'なかまたち',exact:true}).click();
 await page.locator('.dog-card').filter({hasText:'レオ'}).click();await expect(page.locator('.detail-content>p').first()).toHaveText('コーギー');
 await page.getByRole('button',{name:'パートナーにする'}).click();
 await page.locator('.dog-card').filter({hasText:'レオ'}).click();
 await page.getByRole('button',{name:'着せ替える',exact:false}).click();
 await page.locator('.shop-item').filter({hasText:'麦わら帽子'}).getByRole('button').click();
 await expect(page.locator('.dress-preview .outfit-hat')).toBeVisible();
 await page.locator(info.project.name==='mobile'?'.mobile-nav':'.sidebar').getByRole('button',{name:'ミッション',exact:true}).click();
 await page.locator('.mission-card').filter({hasText:'小さな一歩を、3回'}).getByRole('button').click();
 await expect(page.locator('.mission-card').filter({hasText:'小さな一歩を、3回'}).getByRole('button')).toBeDisabled();
 await page.reload();
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('tintale.save.v2')!));expect(saved.partner).toBe('leo');expect(saved.coins).toBe(860);expect(saved.claimed).toContain('three');expect(saved.slots[0]).toBe('bed');expect(saved.outfits.leo).toBe('hat');expect(saved.bond.sora).toBeGreaterThan(60);
 await expect(page.locator('.room-dog')).toHaveCount(8);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test('bottle flies over the target, tips with level liquid and pours a straight stream',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:/ソラとはじめる/}).click();await page.getByRole('button',{name:/チュートリアル 2色/}).click();
 const [from,to]=stages[0].solution[0],source=page.locator(`[data-bottle="${from}"]`),target=page.locator(`[data-bottle="${to}"]`);
 const targetBox=await target.locator('svg').boundingBox();
 await source.click();await target.click();
 await expect(source).toHaveClass(/pouring-source/);await expect(source.locator('svg')).toHaveCSS('visibility','hidden');await expect(page.locator('.pour-layer .pour-source')).toHaveAttribute('data-pour-direction',/^(left|right)$/);
 const stream=page.locator('.pour-layer .stream-body');await expect(stream).toHaveCount(1);
 const pour=await page.evaluate(()=>{const clone=document.querySelector('.pour-layer .pour-source') as HTMLElement,r=document.querySelector('.pour-layer .stream-body')!.getBoundingClientRect();return {angle:parseFloat(clone.style.transform.replace(/[^-\d.]/g,'')),level:clone.querySelector('g[transform^="rotate"]')?.getAttribute('transform')??'',x:r.x+r.width/2,width:r.width,height:r.height};});
 expect(Math.abs(pour.angle)).toBeGreaterThan(55);expect(Math.abs(pour.angle)).toBeLessThan(95);expect(pour.level).toMatch(/^rotate\(-?\d/);
 expect(pour.x).toBeGreaterThan(targetBox!.x);expect(pour.x).toBeLessThan(targetBox!.x+targetBox!.width);expect(pour.width).toBeLessThan(10);expect(pour.height).toBeGreaterThan(10);
 await expect(page.locator('.pouring')).toHaveCount(0);
});
test('rapid taps preserve four units of each color; pause blocks board',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:/ソラとはじめる/}).click();await page.getByRole('button',{name:/チュートリアル 2色/}).click();
 const [a,b]=stages[0].solution[0];
 await page.locator(`[data-bottle="${a}"]`).click();await page.locator(`[data-bottle="${b}"]`).click({clickCount:4,delay:10});
 await expect(page.locator('.pouring')).toHaveCount(0);
 const s=await page.evaluate(()=>JSON.parse(localStorage.getItem('tintale.save.v2')!));for(let c=0;c<2;c++)expect(s.session.board.flat().filter((x:number)=>x===c)).toHaveLength(4);
 await page.getByRole('button',{name:'一時停止'}).click();await expect(page.getByRole('dialog',{name:''})).toBeVisible();await page.getByRole('button',{name:'つづける',exact:true}).click();await expect(page.getByTestId('moves')).toHaveText('1');
});
