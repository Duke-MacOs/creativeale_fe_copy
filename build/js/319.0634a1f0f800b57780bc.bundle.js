"use strict";(self.webpackChunk_byted_editor=self.webpackChunk_byted_editor||[]).push([[319],{49319:function(e,t,r){r.r(t),r.d(t,{default:function(){return i}});var n=r(98797),a=r(72777),l=r(22142);function i(){return l.createElement(n.Z,{filter:{spark:"flex",columnGap:40,content:[{spark:"label",label:"成员姓名",width:88,content:{spark:"string",index:"keyword",allowClear:!0}},{spark:"label",label:"成员ID",width:88,content:{spark:"string",index:"userId",allowClear:!0}},{spark:"label",label:"成员角色",width:88,content:{spark:"select",index:"roles",options:[{label:"全部",value:""},{label:"普通成员",value:"1"},{label:"管理员",value:"3"}]}}]},children:l.createElement(a.ZP,null)})}},98797:function(e,t,r){var n=r(97029),a=r(62732),l=r(50424),i=r(66139),c=r(80926),s=r(14908),o=r(80863),u=r(70072),d=r(3207),p=r(73760),m=r(22142),b=Object.defineProperty,f=Object.defineProperties,y=Object.getOwnPropertyDescriptors,v=Object.getOwnPropertySymbols,h=Object.prototype.hasOwnProperty,E=Object.prototype.propertyIsEnumerable,k=(e,t,r)=>t in e?b(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r;function g(e){switch(e){case"tab":case"deleted":return"";case"type":return location.pathname.includes("/super/team")?"":"类型";case"status":return location.pathname.includes("/playable")?"":"状态";case"id":return"项目ID";case"userId":return"用户ID";case"teamId":return"团队ID";case"parentId":return"版本组ID";case"templateId":return"模板ID";case"industry":return"行业";default:return e}}t.Z=({children:e,filter:t})=>{const{defaultParams:r,params:b,onParamsChange:w}=(0,n.N6)(),I=(0,p.pick)(b,Object.entries(r).filter((([e,t])=>t!==b[e]&&g(e))).map((([e])=>e)));return m.createElement("div",{style:{flex:"auto",width:0,minWidth:1275}},m.createElement("div",{className:(0,a.iv)({marginBottom:8,borderRadius:4,padding:24})},m.createElement("div",{style:{marginBottom:20}},t&&(0,d.default)({spark:"context",provide(){return{useValue(e){const{indexValue:t,indexEntries:r}=(0,d.getIndexer)(e);return{value:[t(b)],onChange([e]){w(Object.fromEntries(r(e)))}}}}},content:t})),m.createElement("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginLeft:10}},m.createElement("div",{style:{display:"flex",columnGap:12,alignItems:"center"}},m.createElement(c.Z.Link,null,m.createElement(l.Z,{theme:"outline",style:{lineHeight:0,fontSize:14}})),m.createElement(s.Z,null,Object.entries(I).map((([e,t])=>t&&m.createElement(o.Z,{closable:!0,color:"processing",onClose:()=>{w({[e]:void 0})}},g(e),"：",t))))),m.createElement(s.Z,{size:30},m.createElement(u.Z,{type:"link",icon:m.createElement(i.Z,null),onClick:()=>{w(((e,t)=>{return r=((e,t)=>{for(var r in t||(t={}))h.call(t,r)&&k(e,r,t[r]);if(v)for(var r of v(t))E.call(t,r)&&k(e,r,t[r]);return e})({},t),n={tab:e.tab},f(r,y(n));var r,n}))}},"重置筛选")))),m.createElement("div",{style:{borderRadius:4}},e))}}}]);