"use strict";(self.webpackChunk_byted_editor=self.webpackChunk_byted_editor||[]).push([[232],{69232:function(e,t,a){a.r(t),a.d(t,{default:function(){return o}});var l=a(98797),r=a(96929),n=a(51514),i=a(22142);function o(){const e=(0,n.FJ)(),t=(0,n.FJ)("<direct_play>");return i.createElement(l.Z,{filter:{spark:"grid",columnGap:40,content:[{spark:"flex",columnGap:40,content:[{spark:"radioGroup",index:"typeOfPlay",label:"项目类型",width:88,options:[{label:"全部",value:""},{label:"普通互动",value:"0"},e&&{label:"轻互动",value:"2"},t&&{label:"直出互动",value:"3"},e&&{label:"互动视频",value:"4"}].filter(Boolean)},{spark:"label",label:"项目ID",width:88,content:{spark:"string",index:"id",allowClear:!0}},{spark:"label",label:"模板ID",width:88,content:{spark:"string",index:"templateId",allowClear:!0}}]},{spark:"flex",columnGap:40,content:[{spark:"radioGroup",index:"category",label:"互动形式",width:88,options:[{label:"全部",value:""},{label:"2D",value:"0"},{label:"3D",value:"1"},{label:"VR",value:"2"},{label:"AR",value:"3"}]},{spark:"label",label:"项目名称",width:88,content:{spark:"string",index:"keyword",allowClear:!0}},{spark:"dateRange",index:["startDate","endDate"],label:"更新时间",width:88}]}]}},i.createElement(r.Z,null))}},98797:function(e,t,a){var l=a(97029),r=a(62732),n=a(50424),i=a(66139),o=a(80926),s=a(14908),c=a(80863),u=a(70072),d=a(3207),p=a(73760),b=a(22142),m=Object.defineProperty,f=Object.defineProperties,y=Object.getOwnPropertyDescriptors,v=Object.getOwnPropertySymbols,k=Object.prototype.hasOwnProperty,g=Object.prototype.propertyIsEnumerable,h=(e,t,a)=>t in e?m(e,t,{enumerable:!0,configurable:!0,writable:!0,value:a}):e[t]=a;function w(e){switch(e){case"tab":case"deleted":return"";case"type":return location.pathname.includes("/super/team")?"":"类型";case"status":return location.pathname.includes("/playable")?"":"状态";case"id":return"项目ID";case"userId":return"用户ID";case"teamId":return"团队ID";case"parentId":return"版本组ID";case"templateId":return"模板ID";case"industry":return"行业";default:return e}}t.Z=({children:e,filter:t})=>{const{defaultParams:a,params:m,onParamsChange:E}=(0,l.N6)(),I=(0,p.pick)(m,Object.entries(a).filter((([e,t])=>t!==m[e]&&w(e))).map((([e])=>e)));return b.createElement("div",{style:{flex:"auto",width:0,minWidth:1275}},b.createElement("div",{className:(0,r.iv)({marginBottom:8,borderRadius:4,padding:24})},b.createElement("div",{style:{marginBottom:20}},t&&(0,d.default)({spark:"context",provide(){return{useValue(e){const{indexValue:t,indexEntries:a}=(0,d.getIndexer)(e);return{value:[t(m)],onChange([e]){E(Object.fromEntries(a(e)))}}}}},content:t})),b.createElement("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginLeft:10}},b.createElement("div",{style:{display:"flex",columnGap:12,alignItems:"center"}},b.createElement(o.Z.Link,null,b.createElement(n.Z,{theme:"outline",style:{lineHeight:0,fontSize:14}})),b.createElement(s.Z,null,Object.entries(I).map((([e,t])=>t&&b.createElement(c.Z,{closable:!0,color:"processing",onClose:()=>{E({[e]:void 0})}},w(e),"：",t))))),b.createElement(s.Z,{size:30},b.createElement(u.Z,{type:"link",icon:b.createElement(i.Z,null),onClick:()=>{E(((e,t)=>{return a=((e,t)=>{for(var a in t||(t={}))k.call(t,a)&&h(e,a,t[a]);if(v)for(var a of v(t))g.call(t,a)&&h(e,a,t[a]);return e})({},t),l={tab:e.tab},f(a,y(l));var a,l}))}},"重置筛选")))),b.createElement("div",{style:{borderRadius:4}},e))}}}]);