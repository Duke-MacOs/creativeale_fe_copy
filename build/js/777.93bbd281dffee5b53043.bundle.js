"use strict";(self.webpackChunk_byted_editor=self.webpackChunk_byted_editor||[]).push([[777],{72777:function(e,t,n){n.d(t,{vG:function(){return j},C0:function(){return S},ZP:function(){return J}});var r=n(56808),a=Object.getOwnPropertySymbols,l=Object.prototype.hasOwnProperty,o=Object.prototype.propertyIsEnumerable,i=(e,t,n)=>new Promise(((r,a)=>{var l=e=>{try{i(n.next(e))}catch(e){a(e)}},o=e=>{try{i(n.throw(e))}catch(e){a(e)}},i=e=>e.done?r(e.value):Promise.resolve(e.value).then(l,o);i((n=n.apply(e,t)).next())}));const d=new class{fetchTeamMember(e){return i(this,null,(function*(){const{data:t}=yield r.dJ.get("team/listMember",{params:e}),{data:n}=t,i=n,{list:d}=i;return{list:d,pagination:((e,t)=>{var n={};for(var r in e)l.call(e,r)&&t.indexOf(r)<0&&(n[r]=e[r]);if(null!=e&&a)for(var r of a(e))t.indexOf(r)<0&&o.call(e,r)&&(n[r]=e[r]);return n})(i,["list"])}}))}addTeamMember(e){return i(this,arguments,(function*({userId:e,roles:t}){const{data:n}=yield r.dJ.post("team/addMember",{userId:e,roles:t});return n.data}))}joinTeam(e){return i(this,null,(function*(){const{data:t}=yield r.dJ.get("team/accept",{params:{key:e}});return t.data}))}};var s=n(80481),c=n(97029),u=n(60203),m=n(32643),p=n(70528),E=n(14908),_=n(80926),y=n(61754),I=n(70072),v=n(54520),h=n(89320),f=n(22142),x=n(32078),C=n(7910),P=n(98466),R=n(65355),g=n(51514),Y=n(89050),M=n(22142);const T=(0,R.jI)("新增团队成员");var b=({onCancel:e})=>{const{userInfo:{teams:t,teamId:n}}=(0,g.Pc)();return M.createElement(x.Z,{open:!0,centered:!0,destroyOnClose:!0,okText:"复制链接",title:"新增团队成员",onOk:()=>{return void 0,null,r=function*(){var r;try{const{data:{data:a}}=yield P.dJ.post("/team/inviteMember",{maxAge:600,maxCount:10});(0,C.zp)(`请打开链接加入“${null==(r=t.find((({id:e})=>e===n)))?void 0:r.name}”团队，链接10分钟内有效：${location.origin}/pub/template?${Y.C}=${a}`),y.ZP.success("加入链接已复制"),T("okay"),e()}catch(t){y.ZP.error(t.message),T("error"),e()}},new Promise(((e,t)=>{var n=e=>{try{l(r.next(e))}catch(e){t(e)}},a=e=>{try{l(r.throw(e))}catch(e){t(e)}},l=t=>t.done?e(t.value):Promise.resolve(t.value).then(n,a);l((r=r.apply(undefined,null)).next())}));var r},onCancel:()=>{T("cancel"),e()}},M.createElement(_.Z,null,"请管理员复制“加入链接”分享给其他成员，其他成员打开链接即可加入团队，链接10分钟内有效。"))},U=n(68961),O=n(2961),k=n(22142);const{Option:N}=U.Z,A=(0,R.jI)("修改成员角色");var S,Z,w=({onCancel:e,onFinish:t,roles:n})=>{const[r,a]=(0,f.useState)(!1),[l]=O.Z.useForm();return k.createElement(x.Z,{destroyOnClose:!0,centered:!0,open:!0,okButtonProps:{loading:r,disabled:r},title:"修改成员角色",onOk:()=>{return void 0,null,n=function*(){try{a(!0),yield t(yield l.validateFields()),y.ZP.success("修改成功"),A("okay"),e()}catch(e){A("error"),y.ZP.error(e.message)}finally{a(!1)}},new Promise(((e,t)=>{var r=e=>{try{l(n.next(e))}catch(e){t(e)}},a=e=>{try{l(n.throw(e))}catch(e){t(e)}},l=t=>t.done?e(t.value):Promise.resolve(t.value).then(r,a);l((n=n.apply(undefined,null)).next())}));var n},onCancel:()=>{A("cancel"),e()}},k.createElement(O.Z,{labelCol:{span:6},wrapperCol:{span:18},form:l,name:"addMember"},k.createElement(O.Z.Item,{label:"用户角色",name:"roles",initialValue:n,rules:[{required:!0,message:"请选择成员角色"}]},k.createElement(U.Z,{placeholder:"请选择成员角色"},[{role:1,roleName:"普通成员"},{role:3,roleName:"管理员"}].map((e=>k.createElement(N,{key:e.role,value:e.role},e.roleName)))))))},K=n(77397),L=n(62732),Q={container:(0,L.iv)({flex:"auto",display:"flex",flexDirection:"column",minWidth:"1208px",minHeight:"100%",borderRadius:"4px",margin:"16px"}),operator:(0,L.iv)({display:"flex",alignItems:"center",padding:"24px 16px",borderBottom:"1px solid #dadfe3"}),cover:(0,L.iv)({width:"64px",height:"100px",borderRadius:"2px",objectFit:"contain"}),btn:(0,L.iv)({"& .ant-btn":(0,L.iv)({padding:"0 6px"})}),table:(0,L.iv)({"& .ant-table-pagination.ant-pagination":(0,L.iv)({padding:"0 16px"})}),tag:(0,L.iv)({padding:"0 4px",lineHeight:"18px",borderRadius:"2px"})},D=(e,t,n)=>new Promise(((r,a)=>{var l=e=>{try{i(n.next(e))}catch(e){a(e)}},o=e=>{try{i(n.throw(e))}catch(e){a(e)}},i=e=>e.done?r(e.value):Promise.resolve(e.value).then(l,o);i((n=n.apply(e,t)).next())}));(Z=S||(S={}))[Z["普通成员"]=1]="普通成员",Z[Z["管理员"]=3]="管理员";var J=(0,u.VT)((function({loading:e}){const[t,n]=(0,f.useState)(null),{params:r,onParamsChange:a}=(0,c.N6)(),{userInfo:l,updateUserInfo:o}=(0,g.Pc)(),{list:i,total:u,refetch:h}=(0,s.F)([m.lP.ADMIN_USER,r],d.fetchTeamMember,r),x=[...B,{title:"成员ID",dataIndex:"userId",key:"userId",width:"15%",ellipsis:!0,render:e=>f.createElement("div",{style:{padding:"6px",background:"none",userSelect:"text"}},e)},(2&l.teamRoles)>0&&{title:"操作",dataIndex:"actions",key:"operator",width:"15%",render:(e,{teamId:t,userId:r,roles:a,deleted:i})=>f.createElement(E.Z,null,i?f.createElement(_.Z.Link,{onClick:()=>D(this,null,(function*(){const e=(0,R.jI)("还原成员");try{yield P.dJ.post("team/updateMember",{teamId:t,userId:r,deleted:0}),y.ZP.success("还原成员成功"),e("okay"),h()}catch(t){y.ZP.error(t.message),e("error")}}))},"还原成员"):f.createElement(_.Z.Link,{onClick:()=>D(this,null,(function*(){n(f.createElement(w,{roles:a,onCancel:()=>{n(null)},onFinish:e=>D(this,[e],(function*({roles:e}){yield P.dJ.post("team/updateMember",{teamId:t,userId:r,roles:e}),h()}))}))}))},"修改角色"),f.createElement(_.Z.Link,{disabled:r===l.userId,onClick:()=>D(this,null,(function*(){const e=(0,R.jI)("删除成员");try{yield P.dJ.post("team/updateMember",{teamId:t,userId:r,deleted:i+1}),y.ZP.success("删除成功"),e("okay"),String(r)===l.userId?o(l.teams.find((({type:e})=>0===e)).id):h()}catch(t){y.ZP.error(t.message),e("error")}}))},"删除成员"))},{title:"创建时间",dataIndex:"createdAt",key:"createdAt",width:"15%",ellipsis:!0,render:e=>f.createElement("div",{style:{padding:"6px",background:"none",userSelect:"text"}},e)}];return f.createElement(K.TZ,{value:r.deleted,onChange:e=>a({deleted:e}),options:[{name:"现有的",value:"0"},{name:"已删除",value:"1"}],extra:(2&l.teamRoles)>0&&f.createElement(I.Z,{type:"primary",onClick:()=>{n(f.createElement(b,{onCancel:()=>{n(null)}}))}},"新增成员")},f.createElement(v.Z,{rowKey:"userId",columns:x.filter(Boolean),dataSource:i,className:Q.table,pagination:(0,p.h)(u),loading:e}),t)}));const j=(0,u.VT)((({value:e,loading:t,excludedValue:n,onChange:r})=>{const{params:a}=(0,c.N6)(),{list:l,total:o}=(0,s.F)([m.lP.ADMIN_USER,a],d.fetchTeamMember,a);return f.createElement(v.Z,{size:"small",rowKey:"userId",dataSource:l.filter((e=>e.userId!==n)),showHeader:!1,columns:B,rowSelection:{type:"radio",selectedRowKeys:[e],onChange([e]){r(e)}},onRow:({userId:e})=>({onClick:()=>r(e)}),pagination:(0,p.h)(o-1),loading:t})})),B=[{title:"头像",dataIndex:"userInfo",key:"avatarUrl",ellipsis:!0,render:(e,{userInfo:t})=>f.createElement(h.C,{size:"large",src:null==t?void 0:t.avatarUrl})},{title:"姓名",dataIndex:"userInfo",key:"name",ellipsis:!0,render:(e,{userInfo:t})=>f.createElement("div",{style:{padding:"6px",background:"none",userSelect:"text",cursor:"pointer"}},null==t?void 0:t.name)},{title:"角色",dataIndex:"roles",key:"roles",ellipsis:!0,render:e=>f.createElement("div",{style:{display:"flex",flexDirection:"column",padding:"6px",background:"none",userSelect:"text"}},S[e])}]},32643:function(e,t,n){var r,a;n.d(t,{lP:function(){return r}}),(a=r||(r={})).MY_PROJECT="QUERY_KEY_MY_PROJECT",a.CATEGORY_TAG="QUERY_KEY_CATEGORY_TAG",a.PUBLIC_PROJECT="QUERY_KEY_PUBLIC_PROJECT",a.TUTORIAL="QUERY_KEY_TUTORIAL",a.ADMIN_PROJECT="QUERY_KEY_ADMIN_PROJECT",a.SUB_VERSION="QUERY_KEY_SUB_VERSION",a.USER_COLL="QUERY_KEY_USER_COLL",a.PUBLIC_MANGE="QUERY_KEY_PUBLIC_MANGE",a.TEMPLATE_MANGE="QUERY_KEY_TEMPLATE_MANGE",a.MY_TEMPLATE="QUERY_KEY_MY_TEMPLATE",a.MY_COMPONENT="QUERY_KEY_MY_COMPONENT",a.MY_SCRIPT="QUERY_KEY_MY_SCRIPT",a.ADMIN_CUSTOMER="QUERY_KEY_ADMIN_CUSTOMER",a.ADMIN_USER="QUERY_KEY_ADMIN_USER",a.ADMIN_NOTICE="QUERY_KEY_ADMIN_NOTICE",a.MY_PUT="QUERY_KEY_MY_PUT"}}]);