"use strict";(self.webpackChunk_byted_editor=self.webpackChunk_byted_editor||[]).push([[918],{54690:function(e,t,n){n.d(t,{Z:function(){return i}});var r=n(22142),o={icon:{tag:"svg",attrs:{viewBox:"64 64 896 896",focusable:"false"},children:[{tag:"path",attrs:{d:"M928 160H96c-17.7 0-32 14.3-32 32v640c0 17.7 14.3 32 32 32h832c17.7 0 32-14.3 32-32V192c0-17.7-14.3-32-32-32zm-792 72h752v120H136V232zm752 560H136V440h752v352zm-237-64h165c4.4 0 8-3.6 8-8v-72c0-4.4-3.6-8-8-8H651c-4.4 0-8 3.6-8 8v72c0 4.4 3.6 8 8 8z"}}]},name:"credit-card",theme:"outlined"},a=n(35180),l=function(e,t){return r.createElement(a.Z,Object.assign({},e,{ref:t,icon:o}))};l.displayName="CreditCardOutlined";var i=r.forwardRef(l)},22033:function(e,t,n){n.d(t,{Z:function(){return fe}});var r=n(26370),o=n(37711),a=n(53793),l=n(12624),i=n.n(l),u=n(82845),c=n(73836),d=n(80413),s=n(82495),f=n(22142),p=n(74635),v=n(29895),h=n(1071),m=n(17258),g=n(11689),C=n(19637),b=n(37655),y=f.createContext(null),Z=f.createContext(null);function w(e){return!e||e.disabled||e.disableCheckbox||!1===e.checkable}function k(e){return null==e}var x={width:0,height:0,display:"flex",overflow:"hidden",opacity:0,border:0,padding:0,margin:0},E=function(e,t){var n=(0,p.lk)(),o=n.prefixCls,l=n.multiple,i=n.searchValue,c=n.toggleOpen,d=n.open,s=n.notFoundContent,v=f.useContext(Z),h=v.virtual,m=v.listHeight,k=v.listItemHeight,E=v.treeData,I=v.fieldNames,S=v.onSelect,N=v.dropdownMatchSelectWidth,L=v.treeExpandAction,P=f.useContext(y),D=P.checkable,M=P.checkedKeys,T=P.halfCheckedKeys,H=P.treeExpandedKeys,O=P.treeDefaultExpandAll,V=P.treeDefaultExpandedKeys,K=P.onTreeExpand,A=P.treeIcon,W=P.showTreeIcon,R=P.switcherIcon,_=P.treeLine,F=P.treeNodeFilterProp,j=P.loadData,z=P.treeLoadedKeys,U=P.treeMotion,B=P.onTreeLoad,X=P.keyEntities,Y=f.useRef(),q=(0,C.Z)((function(){return E}),[d,E],(function(e,t){return t[0]&&e[1]!==t[1]})),G=f.useMemo((function(){return D?{checked:M,halfChecked:T}:null}),[D,M,T]);f.useEffect((function(){var e;d&&!l&&M.length&&(null===(e=Y.current)||void 0===e||e.scrollTo({key:M[0]}))}),[d]);var J=String(i).toLowerCase(),Q=f.useState(V),$=(0,a.Z)(Q,2),ee=$[0],te=$[1],ne=f.useState(null),re=(0,a.Z)(ne,2),oe=re[0],ae=re[1],le=f.useMemo((function(){return H?(0,u.Z)(H):i?oe:ee}),[ee,oe,H,i]);f.useEffect((function(){i&&ae(function(e,t){var n=[];return function e(r){r.forEach((function(r){var o=r[t.children];o&&(n.push(r[t.value]),e(o))}))}(e),n}(E,I))}),[i]);var ie=function(e){e.preventDefault()},ue=function(e,t){var n=t.node;D&&w(n)||(S(n.key,{selected:!M.includes(n.key)}),l||c(!1))},ce=f.useState(null),de=(0,a.Z)(ce,2),se=de[0],fe=de[1],pe=X[se];if(f.useImperativeHandle(t,(function(){var e;return{scrollTo:null===(e=Y.current)||void 0===e?void 0:e.scrollTo,onKeyDown:function(e){var t;switch(e.which){case g.Z.UP:case g.Z.DOWN:case g.Z.LEFT:case g.Z.RIGHT:null===(t=Y.current)||void 0===t||t.onKeyDown(e);break;case g.Z.ENTER:if(pe){var n=(null==pe?void 0:pe.node)||{},r=n.selectable,o=n.value;!1!==r&&ue(0,{node:{key:se},selected:!M.includes(o)})}break;case g.Z.ESC:c(!1)}},onKeyUp:function(){}}})),0===q.length)return f.createElement("div",{role:"listbox",className:"".concat(o,"-empty"),onMouseDown:ie},s);var ve={fieldNames:I};return z&&(ve.loadedKeys=z),le&&(ve.expandedKeys=le),f.createElement("div",{onMouseDown:ie},pe&&d&&f.createElement("span",{style:x,"aria-live":"assertive"},pe.node.value),f.createElement(b.Z,(0,r.Z)({ref:Y,focusable:!1,prefixCls:"".concat(o,"-tree"),treeData:q,height:m,itemHeight:k,virtual:!1!==h&&!1!==N,multiple:l,icon:A,showIcon:W,switcherIcon:R,showLine:_,loadData:i?null:j,motion:U,activeKey:se,checkable:D,checkStrictly:!0,checkedKeys:G,selectedKeys:D?[]:M,defaultExpandAll:O},ve,{onActiveChange:fe,onSelect:ue,onCheck:ue,onExpand:function(e){te(e),ae(e),K&&K(e)},onLoad:B,filterTreeNode:function(e){return!!J&&String(e[F]).toLowerCase().includes(J)},expandAction:L})))},I=f.forwardRef(E);I.displayName="OptionList";var S=I,N=function(){return null},L="SHOW_ALL",P="SHOW_PARENT",D="SHOW_CHILD";function M(e,t,n,r){var o=new Set(e);return t===D?e.filter((function(e){var t=n[e];return!(t&&t.children&&t.children.some((function(e){var t=e.node;return o.has(t[r.value])}))&&t.children.every((function(e){var t=e.node;return w(t)||o.has(t[r.value])})))})):t===P?e.filter((function(e){var t=n[e],r=t?t.parent:null;return!(r&&!w(r.node)&&o.has(r.key))})):e}var T=n(33181),H=n(51873),O=["children","value"];function V(e){return(0,T.Z)(e).map((function(e){if(!f.isValidElement(e)||!e.type)return null;var t=e,n=t.key,r=t.props,o=r.children,a=r.value,l=(0,d.Z)(r,O),i=(0,c.Z)({key:n,value:a},l),u=V(o);return u.length&&(i.children=u),i})).filter((function(e){return e}))}function K(e){if(!e)return e;var t=(0,c.Z)({},e);return"props"in t||Object.defineProperty(t,"props",{get:function(){return(0,H.ZP)(!1,"New `rc-tree-select` not support return node instance as argument anymore. Please consider to remove `props` access."),t}}),t}function A(e,t,n){return f.useMemo((function(){return e?n?function(e,t){var n=t.id,r=t.pId,o=t.rootPId,a={},l=[];return e.map((function(e){var t=(0,c.Z)({},e),r=t[n];return a[r]=t,t.key=t.key||r,t})).forEach((function(e){var t=e[r],n=a[t];n&&(n.children=n.children||[],n.children.push(e)),(t===o||!n&&null===o)&&l.push(e)})),l}(e,(0,c.Z)({id:"id",pId:"pId",rootPId:null},!0!==n?n:{})):e:V(t)}),[t,n,e])}function W(e){var t=f.useRef();t.current=e;var n=f.useCallback((function(){return t.current.apply(t,arguments)}),[]);return n}var R=n(35966),_=["id","prefixCls","value","defaultValue","onChange","onSelect","onDeselect","searchValue","inputValue","onSearch","autoClearSearchValue","filterTreeNode","treeNodeFilterProp","showCheckedStrategy","treeNodeLabelProp","multiple","treeCheckable","treeCheckStrictly","labelInValue","fieldNames","treeDataSimpleMode","treeData","children","loadData","treeLoadedKeys","onTreeLoad","treeDefaultExpandAll","treeExpandedKeys","treeDefaultExpandedKeys","onTreeExpand","treeExpandAction","virtual","listHeight","listItemHeight","onDropdownVisibleChange","dropdownMatchSelectWidth","treeLine","treeIcon","showTreeIcon","switcherIcon","treeMotion"],F=f.forwardRef((function(e,t){var n,l,i=e.id,g=e.prefixCls,C=void 0===g?"rc-tree-select":g,b=e.value,w=e.defaultValue,x=e.onChange,E=e.onSelect,I=e.onDeselect,L=e.searchValue,P=e.inputValue,T=e.onSearch,O=e.autoClearSearchValue,V=void 0===O||O,F=e.filterTreeNode,j=e.treeNodeFilterProp,z=void 0===j?"value":j,U=e.showCheckedStrategy,B=void 0===U?D:U,X=e.treeNodeLabelProp,Y=e.multiple,q=e.treeCheckable,G=e.treeCheckStrictly,J=e.labelInValue,Q=e.fieldNames,$=e.treeDataSimpleMode,ee=e.treeData,te=e.children,ne=e.loadData,re=e.treeLoadedKeys,oe=e.onTreeLoad,ae=e.treeDefaultExpandAll,le=e.treeExpandedKeys,ie=e.treeDefaultExpandedKeys,ue=e.onTreeExpand,ce=e.treeExpandAction,de=e.virtual,se=e.listHeight,fe=void 0===se?200:se,pe=e.listItemHeight,ve=void 0===pe?20:pe,he=e.onDropdownVisibleChange,me=e.dropdownMatchSelectWidth,ge=void 0===me||me,Ce=e.treeLine,be=e.treeIcon,ye=e.showTreeIcon,Ze=e.switcherIcon,we=e.treeMotion,ke=(0,d.Z)(e,_),xe=(0,h.ZP)(i),Ee=q&&!G,Ie=q||G,Se=G||J,Ne=Ie||Y,Le=(0,m.Z)(w,{value:b}),Pe=(0,a.Z)(Le,2),De=Pe[0],Me=Pe[1],Te=f.useMemo((function(){return function(e){var t=e||{},n=t.label,r=t.value||"value";return{_title:n?[n]:["title","label"],value:r,key:r,children:t.children||"children"}}(Q)}),[JSON.stringify(Q)]),He=(0,m.Z)("",{value:void 0!==L?L:P,postState:function(e){return e||""}}),Oe=(0,a.Z)(He,2),Ve=Oe[0],Ke=Oe[1],Ae=A(ee,te,$),We=function(e,t){return f.useMemo((function(){return(0,R.I8)(e,{fieldNames:t,initWrapper:function(e){return(0,c.Z)((0,c.Z)({},e),{},{valueEntities:new Map})},processEntity:function(e,n){var r=e.node[t.value];n.valueEntities.set(r,e)}})}),[e,t])}(Ae,Te),Re=We.keyEntities,_e=We.valueEntities,Fe=f.useCallback((function(e){var t=[],n=[];return e.forEach((function(e){_e.has(e)?n.push(e):t.push(e)})),{missingRawValues:t,existRawValues:n}}),[_e]),je=function(e,t,n){var r=n.treeNodeFilterProp,a=n.filterTreeNode,l=n.fieldNames.children;return f.useMemo((function(){if(!t||!1===a)return e;var n;if("function"==typeof a)n=a;else{var i=t.toUpperCase();n=function(e,t){var n=t[r];return String(n).toUpperCase().includes(i)}}return function e(r){var a=arguments.length>1&&void 0!==arguments[1]&&arguments[1];return r.map((function(r){var i=r[l],u=a||n(t,K(r)),d=e(i||[],u);return u||d.length?(0,c.Z)((0,c.Z)({},r),{},(0,o.Z)({isLeaf:void 0},l,d)):null})).filter((function(e){return e}))}(e)}),[e,t,l,r,a])}(Ae,Ve,{fieldNames:Te,treeNodeFilterProp:z,filterTreeNode:F}),ze=f.useCallback((function(e){if(e){if(X)return e[X];for(var t=Te._title,n=0;n<t.length;n+=1){var r=e[t[n]];if(void 0!==r)return r}}}),[Te,X]),Ue=f.useCallback((function(e){var t=function(e){return Array.isArray(e)?e:void 0!==e?[e]:[]}(e);return t.map((function(e){return function(e){return!e||"object"!==(0,s.Z)(e)}(e)?{value:e}:e}))}),[]),Be=f.useCallback((function(e){return Ue(e).map((function(e){var t,n,r=e.label,o=e.value,a=e.halfChecked,l=_e.get(o);return l?(r=null!==(n=r)&&void 0!==n?n:ze(l.node),t=l.node.disabled):void 0===r&&(r=Ue(De).find((function(e){return e.value===o})).label),{label:r,value:o,halfChecked:a,disabled:t}}))}),[_e,ze,Ue,De]),Xe=f.useMemo((function(){return Ue(De)}),[Ue,De]),Ye=f.useMemo((function(){var e=[],t=[];return Xe.forEach((function(n){n.halfChecked?t.push(n):e.push(n)})),[e,t]}),[Xe]),qe=(0,a.Z)(Ye,2),Ge=qe[0],Je=qe[1],Qe=f.useMemo((function(){return Ge.map((function(e){return e.value}))}),[Ge]),$e=function(e,t,n,r){return f.useMemo((function(){var o=e.map((function(e){return e.value})),a=t.map((function(e){return e.value})),l=o.filter((function(e){return!r[e]}));if(n){var i=(0,v.S)(o,!0,r);o=i.checkedKeys,a=i.halfCheckedKeys}return[Array.from(new Set([].concat((0,u.Z)(l),(0,u.Z)(o)))),a]}),[e,t,n,r])}(Ge,Je,Ee,Re),et=(0,a.Z)($e,2),tt=et[0],nt=et[1],rt=f.useMemo((function(){var e=M(tt,B,Re,Te).map((function(e){var t,n,r;return null!==(t=null===(n=Re[e])||void 0===n||null===(r=n.node)||void 0===r?void 0:r[Te.value])&&void 0!==t?t:e})).map((function(e){var t=Ge.find((function(t){return t.value===e}));return{value:e,label:null==t?void 0:t.label}})),t=Be(e),n=t[0];return!Ne&&n&&k(n.value)&&k(n.label)?[]:t.map((function(e){var t;return(0,c.Z)((0,c.Z)({},e),{},{label:null!==(t=e.label)&&void 0!==t?t:e.value})}))}),[Te,Ne,tt,Ge,Be,B,Re]),ot=(n=rt,l=f.useRef({valueLabels:new Map}),f.useMemo((function(){var e=l.current.valueLabels,t=new Map,r=n.map((function(n){var r,o=n.value,a=null!==(r=n.label)&&void 0!==r?r:e.get(o);return t.set(o,a),(0,c.Z)((0,c.Z)({},n),{},{label:a})}));return l.current.valueLabels=t,[r]}),[n])),at=(0,a.Z)(ot,1)[0],lt=W((function(e,t,n){var r=Be(e);if(Me(r),V&&Ke(""),x){var o=e;if(Ee){var a=M(e,B,Re,Te);o=a.map((function(e){var t=_e.get(e);return t?t.node[Te.value]:e}))}var l=t||{triggerValue:void 0,selected:void 0},i=l.triggerValue,c=l.selected,d=o;if(G){var s=Je.filter((function(e){return!o.includes(e.value)}));d=[].concat((0,u.Z)(d),(0,u.Z)(s))}var p=Be(d),v={preValue:Ge,triggerValue:i},h=!0;(G||"selection"===n&&!c)&&(h=!1),function(e,t,n,r,o,a){var l=null,i=null;function u(){i||(i=[],function e(r){var o=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"0",u=arguments.length>2&&void 0!==arguments[2]&&arguments[2];return r.map((function(r,c){var d="".concat(o,"-").concat(c),s=r[a.value],p=n.includes(s),v=e(r[a.children]||[],d,p),h=f.createElement(N,r,v.map((function(e){return e.node})));if(t===s&&(l=h),p){var m={pos:d,node:h,children:v};return u||i.push(m),m}return null})).filter((function(e){return e}))}(r),i.sort((function(e,t){var r=e.node.props.value,o=t.node.props.value;return n.indexOf(r)-n.indexOf(o)})))}Object.defineProperty(e,"triggerNode",{get:function(){return(0,H.ZP)(!1,"`triggerNode` is deprecated. Please consider decoupling data with node."),u(),l}}),Object.defineProperty(e,"allCheckedNodes",{get:function(){return(0,H.ZP)(!1,"`allCheckedNodes` is deprecated. Please consider decoupling data with node."),u(),o?i:i.map((function(e){return e.node}))}})}(v,i,e,Ae,h,Te),Ie?v.checked=c:v.selected=c;var m=Se?p:p.map((function(e){return e.value}));x(Ne?m:m[0],Se?null:p.map((function(e){return e.label})),v)}})),it=f.useCallback((function(e,t){var n,r=t.selected,o=t.source,a=Re[e],l=null==a?void 0:a.node,i=null!==(n=null==l?void 0:l[Te.value])&&void 0!==n?n:e;if(Ne){var c=r?[].concat((0,u.Z)(Qe),[i]):tt.filter((function(e){return e!==i}));if(Ee){var d,s=Fe(c),f=s.missingRawValues,p=s.existRawValues.map((function(e){return _e.get(e).key}));d=r?(0,v.S)(p,!0,Re).checkedKeys:(0,v.S)(p,{checked:!1,halfCheckedKeys:nt},Re).checkedKeys,c=[].concat((0,u.Z)(f),(0,u.Z)(d.map((function(e){return Re[e].node[Te.value]}))))}lt(c,{selected:r,triggerValue:i},o||"option")}else lt([i],{selected:!0,triggerValue:i},"option");r||!Ne?null==E||E(i,K(l)):null==I||I(i,K(l))}),[Fe,_e,Re,Te,Ne,Qe,lt,Ee,E,I,tt,nt]),ut=f.useCallback((function(e){if(he){var t={};Object.defineProperty(t,"documentClickClose",{get:function(){return(0,H.ZP)(!1,"Second param of `onDropdownVisibleChange` has been removed."),!1}}),he(e,t)}}),[he]),ct=W((function(e,t){var n=e.map((function(e){return e.value}));"clear"!==t.type?t.values.length&&it(t.values[0].value,{selected:!1,source:"selection"}):lt(n,{},"selection")})),dt=f.useMemo((function(){return{virtual:de,dropdownMatchSelectWidth:ge,listHeight:fe,listItemHeight:ve,treeData:je,fieldNames:Te,onSelect:it,treeExpandAction:ce}}),[de,ge,fe,ve,je,Te,it,ce]),st=f.useMemo((function(){return{checkable:Ie,loadData:ne,treeLoadedKeys:re,onTreeLoad:oe,checkedKeys:tt,halfCheckedKeys:nt,treeDefaultExpandAll:ae,treeExpandedKeys:le,treeDefaultExpandedKeys:ie,onTreeExpand:ue,treeIcon:be,treeMotion:we,showTreeIcon:ye,switcherIcon:Ze,treeLine:Ce,treeNodeFilterProp:z,keyEntities:Re}}),[Ie,ne,re,oe,tt,nt,ae,le,ie,ue,be,we,ye,Ze,Ce,z,Re]);return f.createElement(Z.Provider,{value:dt},f.createElement(y.Provider,{value:st},f.createElement(p.Ac,(0,r.Z)({ref:t},ke,{id:xe,prefixCls:C,mode:Ne?"multiple":void 0,displayValues:at,onDisplayValuesChange:ct,searchValue:Ve,onSearch:function(e){Ke(e),null==T||T(e)},OptionList:S,emptyOptions:!Ae.length,onDropdownVisibleChange:ut,dropdownMatchSelectWidth:ge}))))})),j=F;j.TreeNode=N,j.SHOW_ALL=L,j.SHOW_PARENT=P,j.SHOW_CHILD=D;var z=j,U=n(44273),B=n(75270),X=n(89677),Y=n(39461),q=n(69516),G=n(8913),J=n(19522),Q=n(30453),$=n(37356),ee=n(2038),te=n(70770),ne=n(79806),re=n(75174),oe=n(59684),ae=n(98533),le=n(29128),ie=n(83887),ue=function(e){var t=e.componentCls,n=e.treePrefixCls,r=e.colorBgElevated,a="."+n;return[(0,o.Z)({},t+"-dropdown",[{padding:e.paddingXS+"px "+e.paddingXS/2+"px"},(0,ie.Yk)(n,(0,ae.TS)(e,{colorBgContainer:r})),(0,o.Z)({},a,{borderRadius:0,"&-list-holder-inner":(0,o.Z)({alignItems:"stretch"},a+"-treenode",(0,o.Z)({},a+"-node-content-wrapper",{flex:"auto"}))}),(0,oe.C2)(n+"-checkbox",e),{"&-rtl":(0,o.Z)({direction:"rtl"},a+"-switcher"+a+"-switcher_close",(0,o.Z)({},a+"-switcher-icon svg",{transform:"rotate(90deg)"}))}])]},ce=function(e,t){var n,l,u=e.prefixCls,c=e.size,d=e.disabled,s=e.bordered,p=void 0===s||s,v=e.className,h=e.treeCheckable,m=e.multiple,g=e.listHeight,C=void 0===g?256:g,b=e.listItemHeight,y=void 0===b?26:b,Z=e.placement,w=e.notFoundContent,k=e.switcherIcon,x=e.treeLine,E=e.getPopupContainer,I=e.popupClassName,S=e.dropdownClassName,N=e.treeIcon,L=void 0!==N&&N,P=e.transitionName,D=e.choiceTransitionName,M=void 0===D?"":D,T=e.status,H=e.showArrow,O=e.treeExpandAction,V=function(e,t){var n={};for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&t.indexOf(r)<0&&(n[r]=e[r]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var o=0;for(r=Object.getOwnPropertySymbols(e);o<r.length;o++)t.indexOf(r[o])<0&&Object.prototype.propertyIsEnumerable.call(e,r[o])&&(n[r[o]]=e[r[o]])}return n}(e,["prefixCls","size","disabled","bordered","className","treeCheckable","multiple","listHeight","listItemHeight","placement","notFoundContent","switcherIcon","treeLine","getPopupContainer","popupClassName","dropdownClassName","treeIcon","transitionName","choiceTransitionName","status","showArrow","treeExpandAction"]),K=f.useContext(B.E_),A=K.getPopupContainer,W=K.getPrefixCls,R=K.renderEmpty,_=K.direction,F=K.virtual,j=K.dropdownMatchSelectWidth,J=f.useContext(q.Z),oe=W(),ie=W("select",u),ce=W("select-tree",u),de=W("tree-select",u),se=(0,re.ri)(ie,_),fe=se.compactSize,pe=se.compactItemClassnames,ve=(0,Q.Z)(ie),he=(0,a.Z)(ve,2),me=he[0],ge=he[1],Ce=function(e,t){return(0,le.Z)("TreeSelect",(function(e){var n=(0,ae.TS)(e,{treePrefixCls:t});return[ue(n)]}))(e)}(de,ce),be=(0,a.Z)(Ce,1)[0],ye=i()(I||S,de+"-dropdown",(0,o.Z)({},de+"-dropdown-rtl","rtl"===_),ge),Ze=!(!h&&!m),we=void 0!==H?H:V.loading||!Ze,ke=f.useContext(G.aM),xe=ke.status,Ee=ke.hasFeedback,Ie=ke.isFormItemInput,Se=ke.feedbackIcon,Ne=(0,ne.F)(xe,T),Le=(0,$.Z)((0,r.Z)((0,r.Z)({},V),{multiple:Ze,showArrow:we,hasFeedback:Ee,feedbackIcon:Se,prefixCls:ie})),Pe=Le.suffixIcon,De=Le.removeIcon,Me=Le.clearIcon;l=void 0!==w?w:(R||X.Z)("Select");var Te=(0,U.Z)(V,["suffixIcon","itemIcon","removeIcon","clearIcon","switcherIcon"]),He=fe||c||J,Oe=f.useContext(Y.Z),Ve=null!=d?d:Oe,Ke=i()(!u&&de,(n={},(0,o.Z)(n,ie+"-lg","large"===He),(0,o.Z)(n,ie+"-sm","small"===He),(0,o.Z)(n,ie+"-rtl","rtl"===_),(0,o.Z)(n,ie+"-borderless",!p),(0,o.Z)(n,ie+"-in-form-item",Ie),n),(0,ne.Z)(ie,Ne,Ee),pe,v,ge);return me(be(f.createElement(z,(0,r.Z)({virtual:F,dropdownMatchSelectWidth:j,disabled:Ve},Te,{ref:t,prefixCls:ie,className:Ke,listHeight:C,listItemHeight:y,treeCheckable:h?f.createElement("span",{className:ie+"-tree-checkbox-inner"}):h,treeLine:!!x,inputIcon:Pe,multiple:m,placement:void 0!==Z?Z:"rtl"===_?"bottomRight":"bottomLeft",removeIcon:De,clearIcon:Me,switcherIcon:function(e){return(0,ee.Z)(ce,k,x,e)},showTreeIcon:L,notFoundContent:l,getPopupContainer:E||A,treeMotion:null,dropdownClassName:ye,choiceTransitionName:(0,te.mL)(oe,"",M),transitionName:(0,te.mL)(oe,(0,te.q0)(Z),P),showArrow:Ee||H,treeExpandAction:O}))))},de=f.forwardRef(ce),se=(0,J.Z)(de);de.TreeNode=N,de.SHOW_ALL=L,de.SHOW_PARENT=P,de.SHOW_CHILD=D,de._InternalPanelDoNotUseOrYouWillBeFired=se;var fe=de}}]);