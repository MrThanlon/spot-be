(function(t){function e(e){for(var r,s,l=e[0],i=e[1],u=e[2],p=0,v=[];p<l.length;p++)s=l[p],a[s]&&v.push(a[s][0]),a[s]=0;for(r in i)Object.prototype.hasOwnProperty.call(i,r)&&(t[r]=i[r]);c&&c(e);while(v.length)v.shift()();return o.push.apply(o,u||[]),n()}function n(){for(var t,e=0;e<o.length;e++){for(var n=o[e],r=!0,l=1;l<n.length;l++){var i=n[l];0!==a[i]&&(r=!1)}r&&(o.splice(e--,1),t=s(s.s=n[0]))}return t}var r={},a={app:0},o=[];function s(e){if(r[e])return r[e].exports;var n=r[e]={i:e,l:!1,exports:{}};return t[e].call(n.exports,n,n.exports,s),n.l=!0,n.exports}s.m=t,s.c=r,s.d=function(t,e,n){s.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:n})},s.r=function(t){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},s.t=function(t,e){if(1&e&&(t=s(t)),8&e)return t;if(4&e&&"object"===typeof t&&t&&t.__esModule)return t;var n=Object.create(null);if(s.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var r in t)s.d(n,r,function(e){return t[e]}.bind(null,r));return n},s.n=function(t){var e=t&&t.__esModule?function(){return t["default"]}:function(){return t};return s.d(e,"a",e),e},s.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},s.p="";var l=window["webpackJsonp"]=window["webpackJsonp"]||[],i=l.push.bind(l);l.push=e,l=l.slice();for(var u=0;u<l.length;u++)e(l[u]);var c=i;o.push([0,"chunk-vendors"]),n()})({0:function(t,e,n){t.exports=n("56d7")},"034f":function(t,e,n){"use strict";var r=n("328f"),a=n.n(r);a.a},"328f":function(t,e,n){},"56d7":function(t,e,n){"use strict";n.r(e);n("cadf"),n("551c"),n("f751"),n("097d");var r=n("2b0e"),a=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{attrs:{id:"app"}},[n("div",{attrs:{id:"nav"}},[n("router-link",{attrs:{to:"/"}},[t._v("Display")]),t._v(" |\n    "),n("router-link",{attrs:{to:"/ctr"}},[t._v("Console")])],1),n("router-view")],1)},o=[],s=(n("034f"),n("2877")),l={},i=Object(s["a"])(l,a,o,!1,null,null,null),u=i.exports,c=(n("ab8b"),n("4989"),n("8c4f")),p=function(){var t=this,e=t.$createElement,r=t._self._c||e;return r("div",{staticClass:"home"},[r("img",{attrs:{alt:"Vue logo",src:n("cf05")}}),r("HelloWorld",{attrs:{msg:"Welcome to Your Vue.js App"}})],1)},v=[],d=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{staticClass:"hello"},[n("h1",[t._v(t._s(t.msg))]),t._m(0),n("h3",[t._v("Installed CLI Plugins")]),t._m(1),n("h3",[t._v("Essential Links")]),t._m(2),n("h3",[t._v("Ecosystem")]),t._m(3)])},f=[function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("p",[t._v("\n    For a guide and recipes on how to configure / customize this project,"),n("br"),t._v("\n    check out the\n    "),n("a",{attrs:{href:"https://cli.vuejs.org",target:"_blank",rel:"noopener"}},[t._v("vue-cli documentation")]),t._v(".\n  ")])},function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("ul",[n("li",[n("a",{attrs:{href:"https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-babel",target:"_blank",rel:"noopener"}},[t._v("babel")])])])},function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("ul",[n("li",[n("a",{attrs:{href:"https://vuejs.org",target:"_blank",rel:"noopener"}},[t._v("Core Docs")])]),n("li",[n("a",{attrs:{href:"https://forum.vuejs.org",target:"_blank",rel:"noopener"}},[t._v("Forum")])]),n("li",[n("a",{attrs:{href:"https://chat.vuejs.org",target:"_blank",rel:"noopener"}},[t._v("Community Chat")])]),n("li",[n("a",{attrs:{href:"https://twitter.com/vuejs",target:"_blank",rel:"noopener"}},[t._v("Twitter")])]),n("li",[n("a",{attrs:{href:"https://news.vuejs.org",target:"_blank",rel:"noopener"}},[t._v("News")])])])},function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("ul",[n("li",[n("a",{attrs:{href:"https://router.vuejs.org",target:"_blank",rel:"noopener"}},[t._v("vue-router")])]),n("li",[n("a",{attrs:{href:"https://vuex.vuejs.org",target:"_blank",rel:"noopener"}},[t._v("vuex")])]),n("li",[n("a",{attrs:{href:"https://github.com/vuejs/vue-devtools#vue-devtools",target:"_blank",rel:"noopener"}},[t._v("vue-devtools")])]),n("li",[n("a",{attrs:{href:"https://vue-loader.vuejs.org",target:"_blank",rel:"noopener"}},[t._v("vue-loader")])]),n("li",[n("a",{attrs:{href:"https://github.com/vuejs/awesome-vue",target:"_blank",rel:"noopener"}},[t._v("awesome-vue")])])])}],b={name:"HelloWorld",props:{msg:String}},_=b,m=(n("c6fc"),Object(s["a"])(_,d,f,!1,null,"5289da79",null)),h=m.exports,g={name:"home",components:{HelloWorld:h}},C=g,y=Object(s["a"])(C,p,v,!1,null,null,null),j=(y.exports,function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{staticClass:"container container-fluid"},[t._v("\n    这里是展示面板\n")])}),w=[],k={name:"viewer"},x=k,O=Object(s["a"])(x,j,w,!1,null,"6237672c",null),E=O.exports,$=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{staticClass:"container container-fluid"},[n("div",{staticClass:"row"},[n("div",{staticClass:"col-12 col-md-6 mb-3"},[n("div",{staticClass:"card"},[n("div",{staticClass:"card-body shadow"},[n("button",{staticClass:"btn btn-outline-primary mb-3 ml-3"},[t._v("\n                        开始 "),n("v-icon",{attrs:{name:"flag"}})],1),n("button",{staticClass:"btn btn-outline-danger mb-3 ml-3"},[t._v("\n                        暂停 "),n("v-icon",{attrs:{name:"pause"}})],1),n("button",{staticClass:"btn btn-outline-success mb-3 ml-3"},[t._v("\n                        继续 "),n("v-icon",{attrs:{name:"play"}})],1)])])]),t._m(0)])])},P=[function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{staticClass:"col-12 col-md-6 mb-3"},[n("div",{staticClass:"card"},[n("div",{staticClass:"card-body shadow"},[n("div",{staticClass:"input-group mb-3"},[n("div",{staticClass:"input-group-prepend"},[n("span",{staticClass:"input-group-text"},[t._v("倒计时")])]),n("input",{staticClass:"form-control",attrs:{type:"number","aria-label":"countdown","aria-describedby":"button-addon2"}}),n("div",{staticClass:"input-group-append"},[n("span",{staticClass:"input-group-text"},[t._v("ms")]),n("button",{staticClass:"btn btn-outline-secondary",attrs:{type:"button",id:"button-addon2"}},[t._v("设定")])])]),n("div",{staticClass:"input-group mb-3"},[n("div",{staticClass:"input-group-prepend"},[n("span",{staticClass:"input-group-text"},[t._v("抢答")])]),n("input",{staticClass:"form-control",attrs:{type:"number","aria-label":"countdown","aria-describedby":"button-addon2"}}),n("div",{staticClass:"input-group-append"},[n("span",{staticClass:"input-group-text"},[t._v("ms")]),n("button",{staticClass:"btn btn-outline-secondary",attrs:{type:"button",id:"button-addon3"}},[t._v("设定")])])])])])])}],S={name:"console"},M=S,T=Object(s["a"])(M,$,P,!1,null,"5edeb35a",null),W=T.exports;r["a"].use(c["a"]);var H=new c["a"]({routes:[{path:"/",name:"viewer",component:E},{path:"/ctr",name:"console",component:W}]}),D=(n("d06d"),n("0874"));r["a"].component("v-icon",D["a"]),r["a"].config.productionTip=!1,new r["a"]({router:H,render:function(t){return t(u)}}).$mount("#app")},c6fc:function(t,e,n){"use strict";var r=n("d33c"),a=n.n(r);a.a},cf05:function(t,e,n){t.exports=n.p+"img/logo.82b9c7a5.png"},d33c:function(t,e,n){}});
//# sourceMappingURL=app.f528faff.js.map