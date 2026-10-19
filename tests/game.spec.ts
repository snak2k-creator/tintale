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
 await page.getByRole('button',{name:/チュートリアル 3色/}).click();
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
 await page.getByRole('button',{name:/アトリエに迎える/}).click();await expect(page.locator('.home-dog-picker button')).toHaveCount(2);
 await page.reload();await expect(page.locator('.home-dog-picker button')).toHaveCount(2);
 // Home shows the one chosen companion; picking another switches the partner.
 await expect(page.locator('.room-dog')).toHaveCount(1);await page.locator('.home-dog-picker button').filter({hasText:'チャイ'}).click();await expect(page.locator('.room-dog').getByRole('img')).toHaveAttribute('aria-label',/チャイ/);
 const data=await page.evaluate(()=>JSON.parse(localStorage.getItem('tintale.save.v2')!));expect(data.coins).toBe(180);expect(data.stars).toEqual({'1':3,'2':3,'3':3});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:`test-results/first-friend-${info.project.name}.png`,fullPage:true});
});
test('8 dogs, partner, furniture, outfit, missions and persisted customization',async({page},info)=>{
 await page.goto('/');await page.evaluate(()=>{const save={version:2,started:true,coins:1000,stars:Object.fromEntries(Array.from({length:40},(_,i)=>[String(i+1),3])),partner:'sora',bond:{sora:60},owned:[],outfits:{},slots:[null,null,null],wall:'natural',floor:'natural',claimed:[],daily:[],clears:40,pets:0,session:null,settings:{sound:false,music:false,reduced:true,symbols:true}};localStorage.setItem('tintale.save.v2',JSON.stringify(save));});await page.reload();
 await expect(page.locator('.home-dog-picker button')).toHaveCount(8);await expect(page.locator('.room-dog')).toHaveCount(1);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.getByRole('button',{name:'ソラをなでる'}).click();
 await page.screenshot({path:`test-results/eight-dogs-${info.project.name}.png`,fullPage:true});
 // The room has a single entry point: the navigation.
 await page.locator(info.project.name==='mobile'?'.mobile-nav':'.sidebar').getByRole('button',{name:info.project.name==='mobile'?'お部屋':'お部屋づくり',exact:true}).click();
 // Buying shows a preview with the piece placed, and only spends coins after confirming.
 await page.locator('.shop-item').filter({hasText:'ふかふかベッド'}).getByRole('button').click();
 await expect(page.getByRole('dialog').locator('.placed-furniture.furniture-bed')).toHaveCount(1);
 await page.getByRole('button',{name:'やめておく'}).click();await expect(page.locator('.placed-furniture')).toHaveCount(0);
 await page.locator('.shop-item').filter({hasText:'ふかふかベッド'}).getByRole('button').click();
 await page.getByRole('button',{name:'90コインでお迎えする'}).click();
 await expect(page.locator('.placed-furniture')).toHaveCount(1);
 // At most three dogs are out in the atelier.
 await expect(page.locator('.customize-preview .room-dog')).toHaveCount(3);
 await expect(page.locator('.shop-item').filter({hasText:'カーペット'})).toHaveCount(0);await expect(page.locator('.shop-item').filter({hasText:'わんこのテント'})).toHaveCount(1);
 // Each wallpaper has its own swatch.
 await page.locator('.shop-tabs button').filter({hasText:'壁紙'}).click();
 const swatches=await page.locator('.shop-item .wall-swatch').evaluateAll(els=>els.map(e=>getComputedStyle(e).backgroundImage));
 expect(new Set(swatches).size).toBe(swatches.length);
 await page.getByRole('button',{name:'設定',exact:true}).click();await page.getByRole('button',{name:'閉じる',exact:true}).click();
 // Album detail exposes a real partner selector.
 await page.locator(info.project.name==='mobile'?'.mobile-nav':'.sidebar').getByRole('button',{name:info.project.name==='mobile'?'なかま':'なかまたち',exact:true}).click();
 await expect(page.locator('.sidebar, .mobile-nav').getByRole('button',{name:'コレクション'})).toHaveCount(0);
 await page.getByRole('tab',{name:'家具'}).click();await expect(page.locator('.collection-item').filter({hasText:'ふかふかベッド'})).not.toHaveClass(/unowned/);
 await page.getByRole('tab',{name:'なかま'}).click();
 await page.locator('.dog-card').filter({hasText:'レオ'}).click();await expect(page.locator('.detail-content>p').first()).toHaveText('コーギー');
 await page.getByRole('button',{name:'パートナーにする'}).click();
 await page.locator('.dog-card').filter({hasText:'レオ'}).click();
 await page.getByRole('button',{name:'着せ替える',exact:false}).click();
 await page.locator('.shop-item').filter({hasText:'麦わら帽子'}).getByRole('button').click();
 await expect(page.getByRole('dialog').locator('.dog-sprite.wear-hat')).toBeVisible();
 await page.getByRole('button',{name:'90コインでお迎えする'}).click();
 await expect(page.locator('.dress-preview .dog-sprite.wear-hat')).toBeVisible();
 await page.locator(info.project.name==='mobile'?'.mobile-nav':'.sidebar').getByRole('button',{name:'ミッション',exact:true}).click();
 await page.locator('.mission-card').filter({hasText:'小さな一歩を、3回'}).getByRole('button').click();
 await expect(page.locator('.mission-card').filter({hasText:'小さな一歩を、3回'}).getByRole('button')).toBeDisabled();
 await page.reload();
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('tintale.save.v2')!));expect(saved.partner).toBe('leo');expect(saved.coins).toBe(860);expect(saved.claimed).toContain('three');expect(saved.slots[0]).toBe('bed');expect(saved.outfits.leo).toBe('hat');expect(saved.bond.sora).toBeGreaterThan(60);
 await expect(page.locator('.home-dog-picker button')).toHaveCount(8);await expect(page.locator('.room-dog')).toHaveCount(1);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test('bottle flies over the target, tips with level liquid and pours a straight stream',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:/ソラとはじめる/}).click();await page.getByRole('button',{name:/チュートリアル 3色/}).click();
 const [from,to]=stages[0].solution[0],source=page.locator(`[data-bottle="${from}"]`),target=page.locator(`[data-bottle="${to}"]`);
 const targetBox=await target.locator('svg').boundingBox();
 await source.click();await target.click();
 await expect(source).toHaveClass(/pouring-source/);await expect(source.locator('svg')).toHaveCSS('visibility','hidden');await expect(page.locator('.pour-layer .pour-source')).toHaveAttribute('data-pour-direction',/^(left|right)$/);
 // Sample once the stream has reached the target, not on the frame it starts growing.
 await page.waitForFunction(()=>(document.querySelector('.pour-layer .stream-body')?.getBoundingClientRect().height??0)>10);
 const pour=await page.evaluate(()=>{const clone=document.querySelector('.pour-layer .pour-source') as HTMLElement,r=document.querySelector('.pour-layer .stream-body')!.getBoundingClientRect();return {angle:parseFloat(clone.style.transform.replace(/[^-\d.]/g,'')),level:clone.querySelector('g[transform^="rotate"]')?.getAttribute('transform')??'',x:r.x+r.width/2,width:r.width,height:r.height};});
 expect(Math.abs(pour.angle)).toBeGreaterThan(55);expect(Math.abs(pour.angle)).toBeLessThan(95);expect(pour.level).toMatch(/^rotate\(-?\d/);
 expect(pour.x).toBeGreaterThan(targetBox!.x);expect(pour.x).toBeLessThan(targetBox!.x+targetBox!.width);expect(pour.width).toBeLessThan(10);
 await expect(page.locator('.pouring')).toHaveCount(0);
});
test('rapid taps preserve four units of each color; pause blocks board',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:/ソラとはじめる/}).click();await page.getByRole('button',{name:/チュートリアル 3色/}).click();
 const [a,b]=stages[0].solution[0];
 await page.locator(`[data-bottle="${a}"]`).click();await page.locator(`[data-bottle="${b}"]`).click({clickCount:4,delay:10});
 await expect(page.locator('.pouring')).toHaveCount(0);
 const s=await page.evaluate(()=>JSON.parse(localStorage.getItem('tintale.save.v2')!));for(let c=0;c<2;c++)expect(s.session.board.flat().filter((x:number)=>x===c)).toHaveLength(4);
 await page.getByRole('button',{name:'一時停止'}).click();await expect(page.getByRole('dialog',{name:''})).toBeVisible();await page.getByRole('button',{name:'つづける',exact:true}).click();await expect(page.getByTestId('moves')).toHaveText('1');
});
test('any difficulty can be chosen at any time, and dress-up sits under the play button',async({page},info)=>{
 await page.goto('/');await page.evaluate(()=>{localStorage.setItem('tintale.save.v2',JSON.stringify({version:2,started:true,coins:0,stars:{'1':3},partner:'sora',bond:{sora:0},owned:[],outfits:{},slots:[null,null,null],wall:'natural',floor:'natural',claimed:[],daily:[],clears:1,pets:0,session:null,settings:{sound:false,music:false,reduced:true,symbols:false}}));});await page.reload();
 const play=await page.getByRole('button',{name:/パズルで遊ぶ/}).boundingBox(),dress=await page.locator('.scene-actions').getByRole('button',{name:'着せ替え'}).boundingBox();
 expect(dress!.y).toBeGreaterThan(play!.y+play!.height-1);expect(Math.abs(dress!.x-play!.x)).toBeLessThan(2);
 await page.getByRole('button',{name:/難易度をえらぶ/}).first().click();
 await page.getByRole('button',{name:/^エキスパート/}).click();
 await expect(page.getByRole('heading',{name:'ステージ 36'})).toBeVisible();
 // While playing, the title and coin bar are out of the way.
 await expect(page.locator('.topbar')).toBeHidden();
 // The partner is fully on screen while playing.
 const dog=await page.locator('.puzzle-companion .dog-wrap').boundingBox(),vp=page.viewportSize()!;
 expect(dog!.y).toBeGreaterThanOrEqual(0);expect(dog!.y+dog!.height).toBeLessThanOrEqual(vp.height-(info.project.name==='mobile'?70:0));
});
test('mystery hides a scattered pick of colors, and legend limits hints and undos',async({page},info)=>{
 await page.goto('/');await page.evaluate(()=>{localStorage.setItem('tintale.save.v2',JSON.stringify({version:2,started:true,coins:0,stars:{'1':3},partner:'sora',bond:{sora:0},owned:[],outfits:{},slots:[null,null,null],wall:'natural',floor:'natural',claimed:[],daily:[],clears:1,pets:0,session:null,settings:{sound:false,music:false,reduced:true,symbols:false}}));});await page.reload();
 await page.getByRole('button',{name:/難易度をえらぶ/}).first().click();
 await page.getByRole('button',{name:/^ミステリー/}).click();
 await expect(page.getByRole('heading',{name:'ステージ 61'})).toBeVisible();
 // Some units under the tops stay visible instead of the whole column being "?".
 const labels=await page.locator('.bottle-grid .bottle').evaluateAll(els=>els.map(e=>e.getAttribute('aria-label')!.replace(/^瓶\d+：/,'').split('、')));
 const under=labels.flatMap(l=>l.length>1?l.slice(0,-1):[]);expect(under.filter(x=>x==='ひみつ').length).toBeGreaterThan(0);expect(under.filter(x=>x!=='ひみつ').length).toBeGreaterThan(0);
 await expect(page.getByTestId('hints-left')).toHaveCount(0);
 await page.screenshot({path:info.outputPath('mystery.png')});
 await page.evaluate(()=>{localStorage.setItem('tintale.save.v2',JSON.stringify({version:2,started:true,coins:0,stars:{'1':3},partner:'sora',bond:{sora:0},owned:[],outfits:{},slots:[null,null,null],wall:'natural',floor:'natural',claimed:[],daily:[],clears:1,pets:0,session:null,settings:{sound:false,music:false,reduced:true,symbols:false}}));});await page.reload();await page.getByRole('button',{name:/難易度をえらぶ/}).first().click();
 await page.getByRole('button',{name:/^レジェンド/}).click();
 await expect(page.getByRole('heading',{name:'ステージ 81'})).toBeVisible();
 await expect(page.getByTestId('hints-left')).toHaveText(/あと1/);await expect(page.getByTestId('undos-left')).toHaveText(/あと3/);
 await page.screenshot({path:info.outputPath('legend.png')});
 await page.getByRole('button',{name:/ヒント/}).click();
 await expect(page.getByRole('button',{name:/ヒント/})).toBeDisabled();await expect(page.getByTestId('hints-left')).toHaveText(/あと0/);
});
