export const DOGS = [
 {id:'sora',name:'ソラ',breed:'ダックスフント',stage:0,index:0,personality:'好奇心いっぱいの、小さな冒険家。',story:'窓辺で見つけた虹色の瓶。ソラとあなたのものがたりは、ここから始まります。',action:'しっぽをふりふり',color:'#bf8254'},
 {id:'leo',name:'レオ',breed:'コーギー',stage:32,index:1,personality:'いつも全力、みんなを笑顔に。',story:'ソラを追いかけて駆け込んできたレオ。アトリエがぱっと明るくなりました。',action:'ソラと追いかけっこ',color:'#e0aa65'},
 {id:'chai',name:'チャイ',breed:'柴犬',stage:3,index:2,personality:'穏やかで優しい、頼れるお兄さん。',story:'花壇のそばでソラに寄り添ってくれたチャイ。今日からここが、きみのおうち。',action:'みんなに寄り添う',color:'#dcac70'},
 {id:'mil',name:'ミル',breed:'白いふわふわ犬',stage:7,index:3,personality:'おっとり癒やしの、のんびり屋さん。',story:'日だまりでお昼寝していたミル。ソラの足音に目を覚まし、一緒にアトリエへ。',action:'すやすやお昼寝',color:'#e4c4c3'},
 {id:'coco',name:'ココ',breed:'トイプードル',stage:12,index:4,personality:'ちょっと甘えん坊で、いたずら好き。',story:'転がる毛糸玉を追ってきたココ。ソラとおもちゃを半分こしました。',action:'おもちゃに夢中',color:'#b99177'},
 {id:'luna',name:'ルナ',breed:'ハスキー',stage:18,index:5,personality:'クールな顔の奥に、優しい心。',story:'夕暮れの散歩道で出会ったルナ。ソラの招待に、静かにしっぽを振りました。',action:'静かにお庭を眺める',color:'#969daa'},
 {id:'haru',name:'ハル',breed:'チワワ',stage:24,index:6,personality:'小さな体に、元気がいっぱい。',story:'大きな花を運んできたハル。ソラと一緒に窓辺を飾ることにしました。',action:'お部屋を探検中',color:'#e5bb89'},
 {id:'moka',name:'モカ',breed:'ポメラニアン',stage:40,index:7,personality:'ふわふわ、人懐っこい天使。',story:'ソラのバンダナにそっと鼻を寄せたモカ。8匹みんなの暮らしが始まります。',action:'ミルと仲良くお昼寝',color:'#deb99c'},
] as const;
export type DogId = typeof DOGS[number]['id'];
export const COLORS=['#f27b7f','#5f8fe3','#f7cf55','#68bd6c','#a387e3','#f59ccb','#67d0f2','#f8a65e','#b98d68','#9ea4b4'];
export const COLOR_NAMES=['赤','青','黄','緑','紫','ピンク','水色','オレンジ','茶','グレー'];
export const SYMBOLS=['●','◆','★','▲','✚','♥','⬟','■','✿','☾'];
export const ITEMS = [
 {id:'ribbon',name:'赤いリボン',kind:'outfit',price:50,icon:'🎀'},
 {id:'collar',name:'青い首輪',kind:'outfit',price:50,icon:'🔹'},
 {id:'hat',name:'麦わら帽子',kind:'outfit',price:90,icon:'👒'},
 {id:'flower',name:'花飾り',kind:'outfit',price:60,icon:'🌼'},
 {id:'hoodie',name:'パーカー',kind:'outfit',price:120,icon:'👕'},
 {id:'crown',name:'王冠',kind:'outfit',price:200,icon:'👑'},
 {id:'bowtie',name:'蝶ネクタイ',kind:'outfit',price:60,icon:'🎀'},
 {id:'glasses',name:'まるメガネ',kind:'outfit',price:70,icon:'👓'},
 {id:'scarf',name:'しましまマフラー',kind:'outfit',price:80,icon:'🧣'},
 {id:'beret',name:'ベレー帽',kind:'outfit',price:110,icon:'🎨'},
 {id:'cape',name:'ヒーローマント',kind:'outfit',price:0,icon:'🦸'},
 {id:'wizard',name:'魔法使いの帽子',kind:'outfit',price:0,icon:'🪄'},
 {id:'tiara',name:'星のティアラ',kind:'outfit',price:0,icon:'✨'},
 {id:'bed',name:'ふかふかベッド',kind:'furniture',price:90,icon:'🛏️'},
 {id:'tent',name:'わんこのテント',kind:'furniture',price:150,icon:'⛺'},
 {id:'cushion',name:'まあるいクッション',kind:'furniture',price:60,icon:'☁️'},
 {id:'table',name:'木のテーブル',kind:'furniture',price:110,icon:'🪑'},
 {id:'plant',name:'窓辺のグリーン',kind:'furniture',price:70,icon:'🪴'},
 {id:'plush',name:'くまのぬいぐるみ',kind:'furniture',price:80,icon:'🧸'},
 {id:'toybox',name:'おもちゃ箱',kind:'furniture',price:100,icon:'🧺'},
 {id:'wall-garden',name:'ガーデンの壁紙',kind:'wallpaper',price:120,icon:'🌿'},
 {id:'wall-girly',name:'花色の壁紙',kind:'wallpaper',price:120,icon:'🌷'},
 {id:'wall-cafe',name:'カフェの壁紙',kind:'wallpaper',price:120,icon:'☕'},
 {id:'wall-night',name:'星空の壁紙',kind:'wallpaper',price:150,icon:'🌙'},
 {id:'wall-sakura',name:'さくらの壁紙',kind:'wallpaper',price:150,icon:'🌸'},
 {id:'floor-oak',name:'オークの床',kind:'floor',price:100,icon:'🪵'},
 {id:'floor-herringbone',name:'ヘリンボーンの床',kind:'floor',price:120,icon:'🪵'},
 {id:'floor-checker',name:'市松もようの床',kind:'floor',price:120,icon:'▦'},
 {id:'floor-flower',name:'木の床に花柄のラグ',kind:'floor',price:140,icon:'🌼'},
 {id:'floor-plaid',name:'木の床にチェックのラグ',kind:'floor',price:130,icon:'🧶'},
 {id:'floor-mint',name:'ミントタイルの床',kind:'floor',price:130,icon:'🟩'},
] as const;
export const EXPRESSIONS=['通常','喜ぶ','笑う','驚く','困る','応援する','眠る','なでられる'] as const;

/** Outfits that can't be bought: they are handed out by tier-clear missions. */
export const REWARD_ONLY:readonly string[]=['cape','wizard','tiara'];

/** Items that were taken out or swapped: old saves move to the replacement, or get the coins back. */
export const RENAMED_ITEMS:Record<string,string>={sofa:'tent'};
export const REFUNDED_ITEMS:Record<string,number>={rug:100};
