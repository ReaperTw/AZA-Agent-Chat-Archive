// ==UserScript==
// @name         GYC - ChatGPT
// @namespace    https://github.com/ReaperTw/AZA-Agent-Chat-Archive
// @version      1.2.2
// @description  Grab Your Chat - ChatGPT 端對話匯出器；最後更新於 20261028
// @updateURL    https://raw.githubusercontent.com/ReaperTw/AZA-Agent-Chat-Archive/main/userscripts/gyc-chatgpt.user.js
// @downloadURL  https://raw.githubusercontent.com/ReaperTw/AZA-Agent-Chat-Archive/main/userscripts/gyc-chatgpt.user.js
// @match        https://chatgpt.com/*
// @match        https://chat.openai.com/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {
    'use strict';
    // Vendored marked 12.0.2; MIT license:
    // # License information
    // 
    // ## Contribution License Agreement
    // 
    // If you contribute code to this project, you are implicitly allowing your code
    // to be distributed under the MIT license. You are also implicitly verifying that
    // all code is your original work. `</legalese>`
    // 
    // ## Marked
    // 
    // Copyright (c) 2018+, MarkedJS (https://github.com/markedjs/)
    // Copyright (c) 2011-2018, Christopher Jeffrey (https://github.com/chjj/)
    // 
    // Permission is hereby granted, free of charge, to any person obtaining a copy
    // of this software and associated documentation files (the "Software"), to deal
    // in the Software without restriction, including without limitation the rights
    // to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    // copies of the Software, and to permit persons to whom the Software is
    // furnished to do so, subject to the following conditions:
    // 
    // The above copyright notice and this permission notice shall be included in
    // all copies or substantial portions of the Software.
    // 
    // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    // IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    // FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    // AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    // LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    // OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    // THE SOFTWARE.
    // 
    // ## Markdown
    // 
    // Copyright © 2004, John Gruber
    // http://daringfireball.net/
    // All rights reserved.
    // 
    // Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
    // 
    // * Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
    // * Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
    // * Neither the name “Markdown” nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.
    // 
    // This software is provided by the copyright holders and contributors “as is” and any express or implied warranties, including, but not limited to, the implied warranties of merchantability and fitness for a particular purpose are disclaimed. In no event shall the copyright owner or contributors be liable for any direct, indirect, incidental, special, exemplary, or consequential damages (including, but not limited to, procurement of substitute goods or services; loss of use, data, or profits; or business interruption) however caused and on any theory of liability, whether in contract, strict liability, or tort (including negligence or otherwise) arising in any way out of the use of this software, even if advised of the possibility of such damage.
    const markdown = (() => {
        const exports = {}; const module = { exports };
        /**
         * marked v12.0.2 - a markdown parser
         * Copyright (c) 2011-2024, Christopher Jeffrey. (MIT Licensed)
         * https://github.com/markedjs/marked
         */
        !function(e,t){"object"==typeof exports&&"undefined"!=typeof module?t(exports):"function"==typeof define&&define.amd?define(["exports"],t):t((e="undefined"!=typeof globalThis?globalThis:e||self).marked={})}(this,(function(e){"use strict";function t(){return{async:!1,breaks:!1,extensions:null,gfm:!0,hooks:null,pedantic:!1,renderer:null,silent:!1,tokenizer:null,walkTokens:null}}function n(t){e.defaults=t}e.defaults={async:!1,breaks:!1,extensions:null,gfm:!0,hooks:null,pedantic:!1,renderer:null,silent:!1,tokenizer:null,walkTokens:null};const s=/[&<>"']/,r=new RegExp(s.source,"g"),i=/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/,l=new RegExp(i.source,"g"),o={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"},a=e=>o[e];function c(e,t){if(t){if(s.test(e))return e.replace(r,a)}else if(i.test(e))return e.replace(l,a);return e}const h=/&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/gi;function p(e){return e.replace(h,((e,t)=>"colon"===(t=t.toLowerCase())?":":"#"===t.charAt(0)?"x"===t.charAt(1)?String.fromCharCode(parseInt(t.substring(2),16)):String.fromCharCode(+t.substring(1)):""))}const u=/(^|[^\[])\^/g;function k(e,t){let n="string"==typeof e?e:e.source;t=t||"";const s={replace:(e,t)=>{let r="string"==typeof t?t:t.source;return r=r.replace(u,"$1"),n=n.replace(e,r),s},getRegex:()=>new RegExp(n,t)};return s}function g(e){try{e=encodeURI(e).replace(/%25/g,"%")}catch(e){return null}return e}const f={exec:()=>null};function d(e,t){const n=e.replace(/\|/g,((e,t,n)=>{let s=!1,r=t;for(;--r>=0&&"\\"===n[r];)s=!s;return s?"|":" |"})).split(/ \|/);let s=0;if(n[0].trim()||n.shift(),n.length>0&&!n[n.length-1].trim()&&n.pop(),t)if(n.length>t)n.splice(t);else for(;n.length<t;)n.push("");for(;s<n.length;s++)n[s]=n[s].trim().replace(/\\\|/g,"|");return n}function x(e,t,n){const s=e.length;if(0===s)return"";let r=0;for(;r<s;){const i=e.charAt(s-r-1);if(i!==t||n){if(i===t||!n)break;r++}else r++}return e.slice(0,s-r)}function b(e,t,n,s){const r=t.href,i=t.title?c(t.title):null,l=e[1].replace(/\\([\[\]])/g,"$1");if("!"!==e[0].charAt(0)){s.state.inLink=!0;const e={type:"link",raw:n,href:r,title:i,text:l,tokens:s.inlineTokens(l)};return s.state.inLink=!1,e}return{type:"image",raw:n,href:r,title:i,text:c(l)}}class w{options;rules;lexer;constructor(t){this.options=t||e.defaults}space(e){const t=this.rules.block.newline.exec(e);if(t&&t[0].length>0)return{type:"space",raw:t[0]}}code(e){const t=this.rules.block.code.exec(e);if(t){const e=t[0].replace(/^ {1,4}/gm,"");return{type:"code",raw:t[0],codeBlockStyle:"indented",text:this.options.pedantic?e:x(e,"\n")}}}fences(e){const t=this.rules.block.fences.exec(e);if(t){const e=t[0],n=function(e,t){const n=e.match(/^(\s+)(?:```)/);if(null===n)return t;const s=n[1];return t.split("\n").map((e=>{const t=e.match(/^\s+/);if(null===t)return e;const[n]=t;return n.length>=s.length?e.slice(s.length):e})).join("\n")}(e,t[3]||"");return{type:"code",raw:e,lang:t[2]?t[2].trim().replace(this.rules.inline.anyPunctuation,"$1"):t[2],text:n}}}heading(e){const t=this.rules.block.heading.exec(e);if(t){let e=t[2].trim();if(/#$/.test(e)){const t=x(e,"#");this.options.pedantic?e=t.trim():t&&!/ $/.test(t)||(e=t.trim())}return{type:"heading",raw:t[0],depth:t[1].length,text:e,tokens:this.lexer.inline(e)}}}hr(e){const t=this.rules.block.hr.exec(e);if(t)return{type:"hr",raw:t[0]}}blockquote(e){const t=this.rules.block.blockquote.exec(e);if(t){let e=t[0].replace(/\n {0,3}((?:=+|-+) *)(?=\n|$)/g,"\n    $1");e=x(e.replace(/^ *>[ \t]?/gm,""),"\n");const n=this.lexer.state.top;this.lexer.state.top=!0;const s=this.lexer.blockTokens(e);return this.lexer.state.top=n,{type:"blockquote",raw:t[0],tokens:s,text:e}}}list(e){let t=this.rules.block.list.exec(e);if(t){let n=t[1].trim();const s=n.length>1,r={type:"list",raw:"",ordered:s,start:s?+n.slice(0,-1):"",loose:!1,items:[]};n=s?`\\d{1,9}\\${n.slice(-1)}`:`\\${n}`,this.options.pedantic&&(n=s?n:"[*+-]");const i=new RegExp(`^( {0,3}${n})((?:[\t ][^\\n]*)?(?:\\n|$))`);let l="",o="",a=!1;for(;e;){let n=!1;if(!(t=i.exec(e)))break;if(this.rules.block.hr.test(e))break;l=t[0],e=e.substring(l.length);let s=t[2].split("\n",1)[0].replace(/^\t+/,(e=>" ".repeat(3*e.length))),c=e.split("\n",1)[0],h=0;this.options.pedantic?(h=2,o=s.trimStart()):(h=t[2].search(/[^ ]/),h=h>4?1:h,o=s.slice(h),h+=t[1].length);let p=!1;if(!s&&/^ *$/.test(c)&&(l+=c+"\n",e=e.substring(c.length+1),n=!0),!n){const t=new RegExp(`^ {0,${Math.min(3,h-1)}}(?:[*+-]|\\d{1,9}[.)])((?:[ \t][^\\n]*)?(?:\\n|$))`),n=new RegExp(`^ {0,${Math.min(3,h-1)}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`),r=new RegExp(`^ {0,${Math.min(3,h-1)}}(?:\`\`\`|~~~)`),i=new RegExp(`^ {0,${Math.min(3,h-1)}}#`);for(;e;){const a=e.split("\n",1)[0];if(c=a,this.options.pedantic&&(c=c.replace(/^ {1,4}(?=( {4})*[^ ])/g,"  ")),r.test(c))break;if(i.test(c))break;if(t.test(c))break;if(n.test(e))break;if(c.search(/[^ ]/)>=h||!c.trim())o+="\n"+c.slice(h);else{if(p)break;if(s.search(/[^ ]/)>=4)break;if(r.test(s))break;if(i.test(s))break;if(n.test(s))break;o+="\n"+c}p||c.trim()||(p=!0),l+=a+"\n",e=e.substring(a.length+1),s=c.slice(h)}}r.loose||(a?r.loose=!0:/\n *\n *$/.test(l)&&(a=!0));let u,k=null;this.options.gfm&&(k=/^\[[ xX]\] /.exec(o),k&&(u="[ ] "!==k[0],o=o.replace(/^\[[ xX]\] +/,""))),r.items.push({type:"list_item",raw:l,task:!!k,checked:u,loose:!1,text:o,tokens:[]}),r.raw+=l}r.items[r.items.length-1].raw=l.trimEnd(),r.items[r.items.length-1].text=o.trimEnd(),r.raw=r.raw.trimEnd();for(let e=0;e<r.items.length;e++)if(this.lexer.state.top=!1,r.items[e].tokens=this.lexer.blockTokens(r.items[e].text,[]),!r.loose){const t=r.items[e].tokens.filter((e=>"space"===e.type)),n=t.length>0&&t.some((e=>/\n.*\n/.test(e.raw)));r.loose=n}if(r.loose)for(let e=0;e<r.items.length;e++)r.items[e].loose=!0;return r}}html(e){const t=this.rules.block.html.exec(e);if(t){return{type:"html",block:!0,raw:t[0],pre:"pre"===t[1]||"script"===t[1]||"style"===t[1],text:t[0]}}}def(e){const t=this.rules.block.def.exec(e);if(t){const e=t[1].toLowerCase().replace(/\s+/g," "),n=t[2]?t[2].replace(/^<(.*)>$/,"$1").replace(this.rules.inline.anyPunctuation,"$1"):"",s=t[3]?t[3].substring(1,t[3].length-1).replace(this.rules.inline.anyPunctuation,"$1"):t[3];return{type:"def",tag:e,raw:t[0],href:n,title:s}}}table(e){const t=this.rules.block.table.exec(e);if(!t)return;if(!/[:|]/.test(t[2]))return;const n=d(t[1]),s=t[2].replace(/^\||\| *$/g,"").split("|"),r=t[3]&&t[3].trim()?t[3].replace(/\n[ \t]*$/,"").split("\n"):[],i={type:"table",raw:t[0],header:[],align:[],rows:[]};if(n.length===s.length){for(const e of s)/^ *-+: *$/.test(e)?i.align.push("right"):/^ *:-+: *$/.test(e)?i.align.push("center"):/^ *:-+ *$/.test(e)?i.align.push("left"):i.align.push(null);for(const e of n)i.header.push({text:e,tokens:this.lexer.inline(e)});for(const e of r)i.rows.push(d(e,i.header.length).map((e=>({text:e,tokens:this.lexer.inline(e)}))));return i}}lheading(e){const t=this.rules.block.lheading.exec(e);if(t)return{type:"heading",raw:t[0],depth:"="===t[2].charAt(0)?1:2,text:t[1],tokens:this.lexer.inline(t[1])}}paragraph(e){const t=this.rules.block.paragraph.exec(e);if(t){const e="\n"===t[1].charAt(t[1].length-1)?t[1].slice(0,-1):t[1];return{type:"paragraph",raw:t[0],text:e,tokens:this.lexer.inline(e)}}}text(e){const t=this.rules.block.text.exec(e);if(t)return{type:"text",raw:t[0],text:t[0],tokens:this.lexer.inline(t[0])}}escape(e){const t=this.rules.inline.escape.exec(e);if(t)return{type:"escape",raw:t[0],text:c(t[1])}}tag(e){const t=this.rules.inline.tag.exec(e);if(t)return!this.lexer.state.inLink&&/^<a /i.test(t[0])?this.lexer.state.inLink=!0:this.lexer.state.inLink&&/^<\/a>/i.test(t[0])&&(this.lexer.state.inLink=!1),!this.lexer.state.inRawBlock&&/^<(pre|code|kbd|script)(\s|>)/i.test(t[0])?this.lexer.state.inRawBlock=!0:this.lexer.state.inRawBlock&&/^<\/(pre|code|kbd|script)(\s|>)/i.test(t[0])&&(this.lexer.state.inRawBlock=!1),{type:"html",raw:t[0],inLink:this.lexer.state.inLink,inRawBlock:this.lexer.state.inRawBlock,block:!1,text:t[0]}}link(e){const t=this.rules.inline.link.exec(e);if(t){const e=t[2].trim();if(!this.options.pedantic&&/^</.test(e)){if(!/>$/.test(e))return;const t=x(e.slice(0,-1),"\\");if((e.length-t.length)%2==0)return}else{const e=function(e,t){if(-1===e.indexOf(t[1]))return-1;let n=0;for(let s=0;s<e.length;s++)if("\\"===e[s])s++;else if(e[s]===t[0])n++;else if(e[s]===t[1]&&(n--,n<0))return s;return-1}(t[2],"()");if(e>-1){const n=(0===t[0].indexOf("!")?5:4)+t[1].length+e;t[2]=t[2].substring(0,e),t[0]=t[0].substring(0,n).trim(),t[3]=""}}let n=t[2],s="";if(this.options.pedantic){const e=/^([^'"]*[^\s])\s+(['"])(.*)\2/.exec(n);e&&(n=e[1],s=e[3])}else s=t[3]?t[3].slice(1,-1):"";return n=n.trim(),/^</.test(n)&&(n=this.options.pedantic&&!/>$/.test(e)?n.slice(1):n.slice(1,-1)),b(t,{href:n?n.replace(this.rules.inline.anyPunctuation,"$1"):n,title:s?s.replace(this.rules.inline.anyPunctuation,"$1"):s},t[0],this.lexer)}}reflink(e,t){let n;if((n=this.rules.inline.reflink.exec(e))||(n=this.rules.inline.nolink.exec(e))){const e=t[(n[2]||n[1]).replace(/\s+/g," ").toLowerCase()];if(!e){const e=n[0].charAt(0);return{type:"text",raw:e,text:e}}return b(n,e,n[0],this.lexer)}}emStrong(e,t,n=""){let s=this.rules.inline.emStrongLDelim.exec(e);if(!s)return;if(s[3]&&n.match(/[\p{L}\p{N}]/u))return;if(!(s[1]||s[2]||"")||!n||this.rules.inline.punctuation.exec(n)){const n=[...s[0]].length-1;let r,i,l=n,o=0;const a="*"===s[0][0]?this.rules.inline.emStrongRDelimAst:this.rules.inline.emStrongRDelimUnd;for(a.lastIndex=0,t=t.slice(-1*e.length+n);null!=(s=a.exec(t));){if(r=s[1]||s[2]||s[3]||s[4]||s[5]||s[6],!r)continue;if(i=[...r].length,s[3]||s[4]){l+=i;continue}if((s[5]||s[6])&&n%3&&!((n+i)%3)){o+=i;continue}if(l-=i,l>0)continue;i=Math.min(i,i+l+o);const t=[...s[0]][0].length,a=e.slice(0,n+s.index+t+i);if(Math.min(n,i)%2){const e=a.slice(1,-1);return{type:"em",raw:a,text:e,tokens:this.lexer.inlineTokens(e)}}const c=a.slice(2,-2);return{type:"strong",raw:a,text:c,tokens:this.lexer.inlineTokens(c)}}}}codespan(e){const t=this.rules.inline.code.exec(e);if(t){let e=t[2].replace(/\n/g," ");const n=/[^ ]/.test(e),s=/^ /.test(e)&&/ $/.test(e);return n&&s&&(e=e.substring(1,e.length-1)),e=c(e,!0),{type:"codespan",raw:t[0],text:e}}}br(e){const t=this.rules.inline.br.exec(e);if(t)return{type:"br",raw:t[0]}}del(e){const t=this.rules.inline.del.exec(e);if(t)return{type:"del",raw:t[0],text:t[2],tokens:this.lexer.inlineTokens(t[2])}}autolink(e){const t=this.rules.inline.autolink.exec(e);if(t){let e,n;return"@"===t[2]?(e=c(t[1]),n="mailto:"+e):(e=c(t[1]),n=e),{type:"link",raw:t[0],text:e,href:n,tokens:[{type:"text",raw:e,text:e}]}}}url(e){let t;if(t=this.rules.inline.url.exec(e)){let e,n;if("@"===t[2])e=c(t[0]),n="mailto:"+e;else{let s;do{s=t[0],t[0]=this.rules.inline._backpedal.exec(t[0])?.[0]??""}while(s!==t[0]);e=c(t[0]),n="www."===t[1]?"http://"+t[0]:t[0]}return{type:"link",raw:t[0],text:e,href:n,tokens:[{type:"text",raw:e,text:e}]}}}inlineText(e){const t=this.rules.inline.text.exec(e);if(t){let e;return e=this.lexer.state.inRawBlock?t[0]:c(t[0]),{type:"text",raw:t[0],text:e}}}}const m=/^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/,y=/(?:[*+-]|\d{1,9}[.)])/,$=k(/^(?!bull |blockCode|fences|blockquote|heading|html)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html))+?)\n {0,3}(=+|-+) *(?:\n+|$)/).replace(/bull/g,y).replace(/blockCode/g,/ {4}/).replace(/fences/g,/ {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g,/ {0,3}>/).replace(/heading/g,/ {0,3}#{1,6}/).replace(/html/g,/ {0,3}<[^\n>]+>\n/).getRegex(),z=/^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/,T=/(?!\s*\])(?:\\.|[^\[\]\\])+/,R=k(/^ {0,3}\[(label)\]: *(?:\n *)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n *)?| *\n *)(title))? *(?:\n+|$)/).replace("label",T).replace("title",/(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex(),_=k(/^( {0,3}bull)([ \t][^\n]+?)?(?:\n|$)/).replace(/bull/g,y).getRegex(),A="address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul",S=/<!--(?:-?>|[\s\S]*?(?:-->|$))/,I=k("^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n *)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n *)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n *)+\\n|$))","i").replace("comment",S).replace("tag",A).replace("attribute",/ +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex(),E=k(z).replace("hr",m).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("|lheading","").replace("|table","").replace("blockquote"," {0,3}>").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",A).getRegex(),q={blockquote:k(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace("paragraph",E).getRegex(),code:/^( {4}[^\n]+(?:\n(?: *(?:\n|$))*)?)+/,def:R,fences:/^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/,heading:/^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/,hr:m,html:I,lheading:$,list:_,newline:/^(?: *(?:\n|$))+/,paragraph:E,table:f,text:/^[^\n]+/},Z=k("^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)").replace("hr",m).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("blockquote"," {0,3}>").replace("code"," {4}[^\\n]").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",A).getRegex(),L={...q,table:Z,paragraph:k(z).replace("hr",m).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("|lheading","").replace("table",Z).replace("blockquote"," {0,3}>").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",A).getRegex()},P={...q,html:k("^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:\"[^\"]*\"|'[^']*'|\\s[^'\"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))").replace("comment",S).replace(/tag/g,"(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),def:/^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,heading:/^(#{1,6})(.*)(?:\n+|$)/,fences:f,lheading:/^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,paragraph:k(z).replace("hr",m).replace("heading"," *#{1,6} *[^\n]").replace("lheading",$).replace("|table","").replace("blockquote"," {0,3}>").replace("|fences","").replace("|list","").replace("|html","").replace("|tag","").getRegex()},Q=/^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,v=/^( {2,}|\\)\n(?!\s*$)/,B="\\p{P}\\p{S}",C=k(/^((?![*_])[\spunctuation])/,"u").replace(/punctuation/g,B).getRegex(),M=k(/^(?:\*+(?:((?!\*)[punct])|[^\s*]))|^_+(?:((?!_)[punct])|([^\s_]))/,"u").replace(/punct/g,B).getRegex(),O=k("^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)[punct](\\*+)(?=[\\s]|$)|[^punct\\s](\\*+)(?!\\*)(?=[punct\\s]|$)|(?!\\*)[punct\\s](\\*+)(?=[^punct\\s])|[\\s](\\*+)(?!\\*)(?=[punct])|(?!\\*)[punct](\\*+)(?!\\*)(?=[punct])|[^punct\\s](\\*+)(?=[^punct\\s])","gu").replace(/punct/g,B).getRegex(),D=k("^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)[punct](_+)(?=[\\s]|$)|[^punct\\s](_+)(?!_)(?=[punct\\s]|$)|(?!_)[punct\\s](_+)(?=[^punct\\s])|[\\s](_+)(?!_)(?=[punct])|(?!_)[punct](_+)(?!_)(?=[punct])","gu").replace(/punct/g,B).getRegex(),j=k(/\\([punct])/,"gu").replace(/punct/g,B).getRegex(),H=k(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme",/[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email",/[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex(),U=k(S).replace("(?:--\x3e|$)","--\x3e").getRegex(),X=k("^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>").replace("comment",U).replace("attribute",/\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex(),F=/(?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?/,N=k(/^!?\[(label)\]\(\s*(href)(?:\s+(title))?\s*\)/).replace("label",F).replace("href",/<(?:\\.|[^\n<>\\])+>|[^\s\x00-\x1f]*/).replace("title",/"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex(),G=k(/^!?\[(label)\]\[(ref)\]/).replace("label",F).replace("ref",T).getRegex(),J=k(/^!?\[(ref)\](?:\[\])?/).replace("ref",T).getRegex(),K={_backpedal:f,anyPunctuation:j,autolink:H,blockSkip:/\[[^[\]]*?\]\([^\(\)]*?\)|`[^`]*?`|<[^<>]*?>/g,br:v,code:/^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,del:f,emStrongLDelim:M,emStrongRDelimAst:O,emStrongRDelimUnd:D,escape:Q,link:N,nolink:J,punctuation:C,reflink:G,reflinkSearch:k("reflink|nolink(?!\\()","g").replace("reflink",G).replace("nolink",J).getRegex(),tag:X,text:/^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/,url:f},V={...K,link:k(/^!?\[(label)\]\((.*?)\)/).replace("label",F).getRegex(),reflink:k(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label",F).getRegex()},W={...K,escape:k(Q).replace("])","~|])").getRegex(),url:k(/^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/,"i").replace("email",/[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/).getRegex(),_backpedal:/(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,del:/^(~~?)(?=[^\s~])([\s\S]*?[^\s~])\1(?=[^~]|$)/,text:/^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/},Y={...W,br:k(v).replace("{2,}","*").getRegex(),text:k(W.text).replace("\\b_","\\b_| {2,}\\n").replace(/\{2,\}/g,"*").getRegex()},ee={normal:q,gfm:L,pedantic:P},te={normal:K,gfm:W,breaks:Y,pedantic:V};class ne{tokens;options;state;tokenizer;inlineQueue;constructor(t){this.tokens=[],this.tokens.links=Object.create(null),this.options=t||e.defaults,this.options.tokenizer=this.options.tokenizer||new w,this.tokenizer=this.options.tokenizer,this.tokenizer.options=this.options,this.tokenizer.lexer=this,this.inlineQueue=[],this.state={inLink:!1,inRawBlock:!1,top:!0};const n={block:ee.normal,inline:te.normal};this.options.pedantic?(n.block=ee.pedantic,n.inline=te.pedantic):this.options.gfm&&(n.block=ee.gfm,this.options.breaks?n.inline=te.breaks:n.inline=te.gfm),this.tokenizer.rules=n}static get rules(){return{block:ee,inline:te}}static lex(e,t){return new ne(t).lex(e)}static lexInline(e,t){return new ne(t).inlineTokens(e)}lex(e){e=e.replace(/\r\n|\r/g,"\n"),this.blockTokens(e,this.tokens);for(let e=0;e<this.inlineQueue.length;e++){const t=this.inlineQueue[e];this.inlineTokens(t.src,t.tokens)}return this.inlineQueue=[],this.tokens}blockTokens(e,t=[]){let n,s,r,i;for(e=this.options.pedantic?e.replace(/\t/g,"    ").replace(/^ +$/gm,""):e.replace(/^( *)(\t+)/gm,((e,t,n)=>t+"    ".repeat(n.length)));e;)if(!(this.options.extensions&&this.options.extensions.block&&this.options.extensions.block.some((s=>!!(n=s.call({lexer:this},e,t))&&(e=e.substring(n.raw.length),t.push(n),!0)))))if(n=this.tokenizer.space(e))e=e.substring(n.raw.length),1===n.raw.length&&t.length>0?t[t.length-1].raw+="\n":t.push(n);else if(n=this.tokenizer.code(e))e=e.substring(n.raw.length),s=t[t.length-1],!s||"paragraph"!==s.type&&"text"!==s.type?t.push(n):(s.raw+="\n"+n.raw,s.text+="\n"+n.text,this.inlineQueue[this.inlineQueue.length-1].src=s.text);else if(n=this.tokenizer.fences(e))e=e.substring(n.raw.length),t.push(n);else if(n=this.tokenizer.heading(e))e=e.substring(n.raw.length),t.push(n);else if(n=this.tokenizer.hr(e))e=e.substring(n.raw.length),t.push(n);else if(n=this.tokenizer.blockquote(e))e=e.substring(n.raw.length),t.push(n);else if(n=this.tokenizer.list(e))e=e.substring(n.raw.length),t.push(n);else if(n=this.tokenizer.html(e))e=e.substring(n.raw.length),t.push(n);else if(n=this.tokenizer.def(e))e=e.substring(n.raw.length),s=t[t.length-1],!s||"paragraph"!==s.type&&"text"!==s.type?this.tokens.links[n.tag]||(this.tokens.links[n.tag]={href:n.href,title:n.title}):(s.raw+="\n"+n.raw,s.text+="\n"+n.raw,this.inlineQueue[this.inlineQueue.length-1].src=s.text);else if(n=this.tokenizer.table(e))e=e.substring(n.raw.length),t.push(n);else if(n=this.tokenizer.lheading(e))e=e.substring(n.raw.length),t.push(n);else{if(r=e,this.options.extensions&&this.options.extensions.startBlock){let t=1/0;const n=e.slice(1);let s;this.options.extensions.startBlock.forEach((e=>{s=e.call({lexer:this},n),"number"==typeof s&&s>=0&&(t=Math.min(t,s))})),t<1/0&&t>=0&&(r=e.substring(0,t+1))}if(this.state.top&&(n=this.tokenizer.paragraph(r)))s=t[t.length-1],i&&"paragraph"===s.type?(s.raw+="\n"+n.raw,s.text+="\n"+n.text,this.inlineQueue.pop(),this.inlineQueue[this.inlineQueue.length-1].src=s.text):t.push(n),i=r.length!==e.length,e=e.substring(n.raw.length);else if(n=this.tokenizer.text(e))e=e.substring(n.raw.length),s=t[t.length-1],s&&"text"===s.type?(s.raw+="\n"+n.raw,s.text+="\n"+n.text,this.inlineQueue.pop(),this.inlineQueue[this.inlineQueue.length-1].src=s.text):t.push(n);else if(e){const t="Infinite loop on byte: "+e.charCodeAt(0);if(this.options.silent){console.error(t);break}throw new Error(t)}}return this.state.top=!0,t}inline(e,t=[]){return this.inlineQueue.push({src:e,tokens:t}),t}inlineTokens(e,t=[]){let n,s,r,i,l,o,a=e;if(this.tokens.links){const e=Object.keys(this.tokens.links);if(e.length>0)for(;null!=(i=this.tokenizer.rules.inline.reflinkSearch.exec(a));)e.includes(i[0].slice(i[0].lastIndexOf("[")+1,-1))&&(a=a.slice(0,i.index)+"["+"a".repeat(i[0].length-2)+"]"+a.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex))}for(;null!=(i=this.tokenizer.rules.inline.blockSkip.exec(a));)a=a.slice(0,i.index)+"["+"a".repeat(i[0].length-2)+"]"+a.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);for(;null!=(i=this.tokenizer.rules.inline.anyPunctuation.exec(a));)a=a.slice(0,i.index)+"++"+a.slice(this.tokenizer.rules.inline.anyPunctuation.lastIndex);for(;e;)if(l||(o=""),l=!1,!(this.options.extensions&&this.options.extensions.inline&&this.options.extensions.inline.some((s=>!!(n=s.call({lexer:this},e,t))&&(e=e.substring(n.raw.length),t.push(n),!0)))))if(n=this.tokenizer.escape(e))e=e.substring(n.raw.length),t.push(n);else if(n=this.tokenizer.tag(e))e=e.substring(n.raw.length),s=t[t.length-1],s&&"text"===n.type&&"text"===s.type?(s.raw+=n.raw,s.text+=n.text):t.push(n);else if(n=this.tokenizer.link(e))e=e.substring(n.raw.length),t.push(n);else if(n=this.tokenizer.reflink(e,this.tokens.links))e=e.substring(n.raw.length),s=t[t.length-1],s&&"text"===n.type&&"text"===s.type?(s.raw+=n.raw,s.text+=n.text):t.push(n);else if(n=this.tokenizer.emStrong(e,a,o))e=e.substring(n.raw.length),t.push(n);else if(n=this.tokenizer.codespan(e))e=e.substring(n.raw.length),t.push(n);else if(n=this.tokenizer.br(e))e=e.substring(n.raw.length),t.push(n);else if(n=this.tokenizer.del(e))e=e.substring(n.raw.length),t.push(n);else if(n=this.tokenizer.autolink(e))e=e.substring(n.raw.length),t.push(n);else if(this.state.inLink||!(n=this.tokenizer.url(e))){if(r=e,this.options.extensions&&this.options.extensions.startInline){let t=1/0;const n=e.slice(1);let s;this.options.extensions.startInline.forEach((e=>{s=e.call({lexer:this},n),"number"==typeof s&&s>=0&&(t=Math.min(t,s))})),t<1/0&&t>=0&&(r=e.substring(0,t+1))}if(n=this.tokenizer.inlineText(r))e=e.substring(n.raw.length),"_"!==n.raw.slice(-1)&&(o=n.raw.slice(-1)),l=!0,s=t[t.length-1],s&&"text"===s.type?(s.raw+=n.raw,s.text+=n.text):t.push(n);else if(e){const t="Infinite loop on byte: "+e.charCodeAt(0);if(this.options.silent){console.error(t);break}throw new Error(t)}}else e=e.substring(n.raw.length),t.push(n);return t}}class se{options;constructor(t){this.options=t||e.defaults}code(e,t,n){const s=(t||"").match(/^\S*/)?.[0];return e=e.replace(/\n$/,"")+"\n",s?'<pre><code class="language-'+c(s)+'">'+(n?e:c(e,!0))+"</code></pre>\n":"<pre><code>"+(n?e:c(e,!0))+"</code></pre>\n"}blockquote(e){return`<blockquote>\n${e}</blockquote>\n`}html(e,t){return e}heading(e,t,n){return`<h${t}>${e}</h${t}>\n`}hr(){return"<hr>\n"}list(e,t,n){const s=t?"ol":"ul";return"<"+s+(t&&1!==n?' start="'+n+'"':"")+">\n"+e+"</"+s+">\n"}listitem(e,t,n){return`<li>${e}</li>\n`}checkbox(e){return"<input "+(e?'checked="" ':"")+'disabled="" type="checkbox">'}paragraph(e){return`<p>${e}</p>\n`}table(e,t){return t&&(t=`<tbody>${t}</tbody>`),"<table>\n<thead>\n"+e+"</thead>\n"+t+"</table>\n"}tablerow(e){return`<tr>\n${e}</tr>\n`}tablecell(e,t){const n=t.header?"th":"td";return(t.align?`<${n} align="${t.align}">`:`<${n}>`)+e+`</${n}>\n`}strong(e){return`<strong>${e}</strong>`}em(e){return`<em>${e}</em>`}codespan(e){return`<code>${e}</code>`}br(){return"<br>"}del(e){return`<del>${e}</del>`}link(e,t,n){const s=g(e);if(null===s)return n;let r='<a href="'+(e=s)+'"';return t&&(r+=' title="'+t+'"'),r+=">"+n+"</a>",r}image(e,t,n){const s=g(e);if(null===s)return n;let r=`<img src="${e=s}" alt="${n}"`;return t&&(r+=` title="${t}"`),r+=">",r}text(e){return e}}class re{strong(e){return e}em(e){return e}codespan(e){return e}del(e){return e}html(e){return e}text(e){return e}link(e,t,n){return""+n}image(e,t,n){return""+n}br(){return""}}class ie{options;renderer;textRenderer;constructor(t){this.options=t||e.defaults,this.options.renderer=this.options.renderer||new se,this.renderer=this.options.renderer,this.renderer.options=this.options,this.textRenderer=new re}static parse(e,t){return new ie(t).parse(e)}static parseInline(e,t){return new ie(t).parseInline(e)}parse(e,t=!0){let n="";for(let s=0;s<e.length;s++){const r=e[s];if(this.options.extensions&&this.options.extensions.renderers&&this.options.extensions.renderers[r.type]){const e=r,t=this.options.extensions.renderers[e.type].call({parser:this},e);if(!1!==t||!["space","hr","heading","code","table","blockquote","list","html","paragraph","text"].includes(e.type)){n+=t||"";continue}}switch(r.type){case"space":continue;case"hr":n+=this.renderer.hr();continue;case"heading":{const e=r;n+=this.renderer.heading(this.parseInline(e.tokens),e.depth,p(this.parseInline(e.tokens,this.textRenderer)));continue}case"code":{const e=r;n+=this.renderer.code(e.text,e.lang,!!e.escaped);continue}case"table":{const e=r;let t="",s="";for(let t=0;t<e.header.length;t++)s+=this.renderer.tablecell(this.parseInline(e.header[t].tokens),{header:!0,align:e.align[t]});t+=this.renderer.tablerow(s);let i="";for(let t=0;t<e.rows.length;t++){const n=e.rows[t];s="";for(let t=0;t<n.length;t++)s+=this.renderer.tablecell(this.parseInline(n[t].tokens),{header:!1,align:e.align[t]});i+=this.renderer.tablerow(s)}n+=this.renderer.table(t,i);continue}case"blockquote":{const e=r,t=this.parse(e.tokens);n+=this.renderer.blockquote(t);continue}case"list":{const e=r,t=e.ordered,s=e.start,i=e.loose;let l="";for(let t=0;t<e.items.length;t++){const n=e.items[t],s=n.checked,r=n.task;let o="";if(n.task){const e=this.renderer.checkbox(!!s);i?n.tokens.length>0&&"paragraph"===n.tokens[0].type?(n.tokens[0].text=e+" "+n.tokens[0].text,n.tokens[0].tokens&&n.tokens[0].tokens.length>0&&"text"===n.tokens[0].tokens[0].type&&(n.tokens[0].tokens[0].text=e+" "+n.tokens[0].tokens[0].text)):n.tokens.unshift({type:"text",text:e+" "}):o+=e+" "}o+=this.parse(n.tokens,i),l+=this.renderer.listitem(o,r,!!s)}n+=this.renderer.list(l,t,s);continue}case"html":{const e=r;n+=this.renderer.html(e.text,e.block);continue}case"paragraph":{const e=r;n+=this.renderer.paragraph(this.parseInline(e.tokens));continue}case"text":{let i=r,l=i.tokens?this.parseInline(i.tokens):i.text;for(;s+1<e.length&&"text"===e[s+1].type;)i=e[++s],l+="\n"+(i.tokens?this.parseInline(i.tokens):i.text);n+=t?this.renderer.paragraph(l):l;continue}default:{const e='Token with "'+r.type+'" type was not found.';if(this.options.silent)return console.error(e),"";throw new Error(e)}}}return n}parseInline(e,t){t=t||this.renderer;let n="";for(let s=0;s<e.length;s++){const r=e[s];if(this.options.extensions&&this.options.extensions.renderers&&this.options.extensions.renderers[r.type]){const e=this.options.extensions.renderers[r.type].call({parser:this},r);if(!1!==e||!["escape","html","link","image","strong","em","codespan","br","del","text"].includes(r.type)){n+=e||"";continue}}switch(r.type){case"escape":{const e=r;n+=t.text(e.text);break}case"html":{const e=r;n+=t.html(e.text);break}case"link":{const e=r;n+=t.link(e.href,e.title,this.parseInline(e.tokens,t));break}case"image":{const e=r;n+=t.image(e.href,e.title,e.text);break}case"strong":{const e=r;n+=t.strong(this.parseInline(e.tokens,t));break}case"em":{const e=r;n+=t.em(this.parseInline(e.tokens,t));break}case"codespan":{const e=r;n+=t.codespan(e.text);break}case"br":n+=t.br();break;case"del":{const e=r;n+=t.del(this.parseInline(e.tokens,t));break}case"text":{const e=r;n+=t.text(e.text);break}default:{const e='Token with "'+r.type+'" type was not found.';if(this.options.silent)return console.error(e),"";throw new Error(e)}}}return n}}class le{options;constructor(t){this.options=t||e.defaults}static passThroughHooks=new Set(["preprocess","postprocess","processAllTokens"]);preprocess(e){return e}postprocess(e){return e}processAllTokens(e){return e}}class oe{defaults={async:!1,breaks:!1,extensions:null,gfm:!0,hooks:null,pedantic:!1,renderer:null,silent:!1,tokenizer:null,walkTokens:null};options=this.setOptions;parse=this.#e(ne.lex,ie.parse);parseInline=this.#e(ne.lexInline,ie.parseInline);Parser=ie;Renderer=se;TextRenderer=re;Lexer=ne;Tokenizer=w;Hooks=le;constructor(...e){this.use(...e)}walkTokens(e,t){let n=[];for(const s of e)switch(n=n.concat(t.call(this,s)),s.type){case"table":{const e=s;for(const s of e.header)n=n.concat(this.walkTokens(s.tokens,t));for(const s of e.rows)for(const e of s)n=n.concat(this.walkTokens(e.tokens,t));break}case"list":{const e=s;n=n.concat(this.walkTokens(e.items,t));break}default:{const e=s;this.defaults.extensions?.childTokens?.[e.type]?this.defaults.extensions.childTokens[e.type].forEach((s=>{const r=e[s].flat(1/0);n=n.concat(this.walkTokens(r,t))})):e.tokens&&(n=n.concat(this.walkTokens(e.tokens,t)))}}return n}use(...e){const t=this.defaults.extensions||{renderers:{},childTokens:{}};return e.forEach((e=>{const n={...e};if(n.async=this.defaults.async||n.async||!1,e.extensions&&(e.extensions.forEach((e=>{if(!e.name)throw new Error("extension name required");if("renderer"in e){const n=t.renderers[e.name];t.renderers[e.name]=n?function(...t){let s=e.renderer.apply(this,t);return!1===s&&(s=n.apply(this,t)),s}:e.renderer}if("tokenizer"in e){if(!e.level||"block"!==e.level&&"inline"!==e.level)throw new Error("extension level must be 'block' or 'inline'");const n=t[e.level];n?n.unshift(e.tokenizer):t[e.level]=[e.tokenizer],e.start&&("block"===e.level?t.startBlock?t.startBlock.push(e.start):t.startBlock=[e.start]:"inline"===e.level&&(t.startInline?t.startInline.push(e.start):t.startInline=[e.start]))}"childTokens"in e&&e.childTokens&&(t.childTokens[e.name]=e.childTokens)})),n.extensions=t),e.renderer){const t=this.defaults.renderer||new se(this.defaults);for(const n in e.renderer){if(!(n in t))throw new Error(`renderer '${n}' does not exist`);if("options"===n)continue;const s=n,r=e.renderer[s],i=t[s];t[s]=(...e)=>{let n=r.apply(t,e);return!1===n&&(n=i.apply(t,e)),n||""}}n.renderer=t}if(e.tokenizer){const t=this.defaults.tokenizer||new w(this.defaults);for(const n in e.tokenizer){if(!(n in t))throw new Error(`tokenizer '${n}' does not exist`);if(["options","rules","lexer"].includes(n))continue;const s=n,r=e.tokenizer[s],i=t[s];t[s]=(...e)=>{let n=r.apply(t,e);return!1===n&&(n=i.apply(t,e)),n}}n.tokenizer=t}if(e.hooks){const t=this.defaults.hooks||new le;for(const n in e.hooks){if(!(n in t))throw new Error(`hook '${n}' does not exist`);if("options"===n)continue;const s=n,r=e.hooks[s],i=t[s];le.passThroughHooks.has(n)?t[s]=e=>{if(this.defaults.async)return Promise.resolve(r.call(t,e)).then((e=>i.call(t,e)));const n=r.call(t,e);return i.call(t,n)}:t[s]=(...e)=>{let n=r.apply(t,e);return!1===n&&(n=i.apply(t,e)),n}}n.hooks=t}if(e.walkTokens){const t=this.defaults.walkTokens,s=e.walkTokens;n.walkTokens=function(e){let n=[];return n.push(s.call(this,e)),t&&(n=n.concat(t.call(this,e))),n}}this.defaults={...this.defaults,...n}})),this}setOptions(e){return this.defaults={...this.defaults,...e},this}lexer(e,t){return ne.lex(e,t??this.defaults)}parser(e,t){return ie.parse(e,t??this.defaults)}#e(e,t){return(n,s)=>{const r={...s},i={...this.defaults,...r};!0===this.defaults.async&&!1===r.async&&(i.silent||console.warn("marked(): The async option was set to true by an extension. The async: false option sent to parse will be ignored."),i.async=!0);const l=this.#t(!!i.silent,!!i.async);if(null==n)return l(new Error("marked(): input parameter is undefined or null"));if("string"!=typeof n)return l(new Error("marked(): input parameter is of type "+Object.prototype.toString.call(n)+", string expected"));if(i.hooks&&(i.hooks.options=i),i.async)return Promise.resolve(i.hooks?i.hooks.preprocess(n):n).then((t=>e(t,i))).then((e=>i.hooks?i.hooks.processAllTokens(e):e)).then((e=>i.walkTokens?Promise.all(this.walkTokens(e,i.walkTokens)).then((()=>e)):e)).then((e=>t(e,i))).then((e=>i.hooks?i.hooks.postprocess(e):e)).catch(l);try{i.hooks&&(n=i.hooks.preprocess(n));let s=e(n,i);i.hooks&&(s=i.hooks.processAllTokens(s)),i.walkTokens&&this.walkTokens(s,i.walkTokens);let r=t(s,i);return i.hooks&&(r=i.hooks.postprocess(r)),r}catch(e){return l(e)}}}#t(e,t){return n=>{if(n.message+="\nPlease report this to https://github.com/markedjs/marked.",e){const e="<p>An error occurred:</p><pre>"+c(n.message+"",!0)+"</pre>";return t?Promise.resolve(e):e}if(t)return Promise.reject(n);throw n}}}const ae=new oe;function ce(e,t){return ae.parse(e,t)}ce.options=ce.setOptions=function(e){return ae.setOptions(e),ce.defaults=ae.defaults,n(ce.defaults),ce},ce.getDefaults=t,ce.defaults=e.defaults,ce.use=function(...e){return ae.use(...e),ce.defaults=ae.defaults,n(ce.defaults),ce},ce.walkTokens=function(e,t){return ae.walkTokens(e,t)},ce.parseInline=ae.parseInline,ce.Parser=ie,ce.parser=ie.parse,ce.Renderer=se,ce.TextRenderer=re,ce.Lexer=ne,ce.lexer=ne.lex,ce.Tokenizer=w,ce.Hooks=le,ce.parse=ce;const he=ce.options,pe=ce.setOptions,ue=ce.use,ke=ce.walkTokens,ge=ce.parseInline,fe=ce,de=ie.parse,xe=ne.lex;e.Hooks=le,e.Lexer=ne,e.Marked=oe,e.Parser=ie,e.Renderer=se,e.TextRenderer=re,e.Tokenizer=w,e.getDefaults=t,e.lexer=xe,e.marked=ce,e.options=he,e.parse=fe,e.parseInline=ge,e.parser=de,e.setOptions=pe,e.use=ue,e.walkTokens=ke}));
        
        return module.exports;
    })();


    const MAX_UPWARD_LOOPS = 40;
    const RETRY_EMPTY_MAX = 3;
    const RETRY_EMPTY_WAIT = 350;
    const FAST_UPWARD_WAIT = 500;
    const FAST_SCROLL_STEP = 2000;
    const FAST_BASE_WAIT = 250;

    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

    function sanitizeFileName(str) {
        if (!str) return '';
        return str.replace(/[\r\n]+/g, ' ')
            .replace(/[\\/:"*?<>|]+/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-+|-+$/g, '')
            .substring(0, 60);
    }

    function getTimestamp() {
        const d = new Date();
        const pad = n => String(n).padStart(2, '0');
        return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}` +
            `_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
    }

    function cleanContent(text) {
        if (!text) return '';
        return text
            .replace(/^顯示思路[\r\n]*/gm, '')
            .replace(/[\r\n]{3,}/g, '\n\n')
            .trim();
    }


    // Pure API helpers (Node + browser). Source protocol facts: current_node + mapping parent/create_time chain.
    // https://github.com/mvanhorn/agent-tincan/blob/main/extension/ops.js MIT © 2026 Matthew Charles Van Horn (reference only; original impl)
    function getConversationIdFromUrl(pathname) {
        const path = pathname ?? (typeof location !== 'undefined' ? location.pathname : '');
        const match = path.match(/^\/(?:g\/[^/]+\/)?c\/([0-9a-f-]{10,})\/?$/i);
        return match ? match[1] : null;
    }

    function isPersonalChatRoute(pathname) {
        return Boolean(getConversationIdFromUrl(pathname));
    }

    async function fetchAccessToken() {
        const response = await fetch('/api/auth/session', { credentials: 'include', signal: AbortSignal.timeout(30000) });
        if (!response.ok) throw new Error(`登入資訊 HTTP ${response.status}`);
        const session = await response.json();
        if (!session.accessToken) throw new Error('登入資訊缺少 accessToken');
        return session.accessToken;
    }

    async function fetchConversationApi(id, token) {
        const response = await fetch(`/backend-api/conversation/${encodeURIComponent(id)}`, {
            credentials: 'include', headers: { Authorization: `Bearer ${token}` },
            signal: AbortSignal.timeout(30000)
        });
        if (!response.ok) throw new Error(`對話 API HTTP ${response.status}`);
        return response.json();
    }

    function formatApiDate(timestamp) {
        if (typeof timestamp !== 'number' || !Number.isFinite(timestamp)) return '';
        const date = new Date(timestamp * 1000);
        return Number.isNaN(date.getTime()) ? '' : date.toLocaleString('zh-TW');
    }

    function parseApiConversation(payload) {
        const messages = [];
        const warnings = new Set();
        const notices = new Set();
        const mapping = payload?.mapping;
        if (!mapping || typeof mapping !== 'object' || Array.isArray(mapping)) throw new Error('對話 API 缺少訊息樹');
        if (!payload.current_node) warnings.add('缺少目前分支的終點');
        if (payload.has_more || payload.next_cursor) warnings.add('API 仍有後續資料，這次沒有取得全文');
        const seen = new Set();
        let id = payload.current_node;
        while (id) {
            if (seen.has(id)) { warnings.add('訊息鏈含循環'); break; }
            seen.add(id);
            if (!Object.hasOwn(mapping, id) || !mapping[id]) { warnings.add('部分父訊息不在回應中'); break; }
            const node = mapping[id];
            const message = node.message;
            const role = message?.author?.role;
            const content = message?.content;
            const contentType = content?.content_type;
            if (role === 'assistant' && ['thoughts', 'reasoning_recap'].includes(contentType)) {
                id = node.parent;
                continue;
            }
            const internal = message?.metadata?.is_visually_hidden_from_conversation ||
                message?.channel === 'analysis' ||
                (message?.recipient && message.recipient !== 'all');
            if (message && !['user', 'assistant', 'tool', 'system'].includes(role)) {
                warnings.add('文字解析未完成：已略過無法識別角色的訊息');
            }
            const hidden = internal;
            if ((role === 'user' || role === 'assistant') && !hidden) {
                const parts = Array.isArray(content?.parts) ? content.parts : [];
                let omitted = false;
                let unknown = false;
                const text = parts.map(part => {
                    if (typeof part === 'string') return part;
                    omitted = true;
                    if (part && typeof part === 'object' && part.content_type === 'image_asset_pointer') {
                        notices.add('部分圖片內容未嵌入匯出檔');
                        return '> [圖片內容未嵌入匯出檔]';
                    }
                    unknown = true;
                    return '> [非文字內容；本體未嵌入匯出檔]';
                }).join('\n\n').trim();
                const unknownContent = contentType !== 'text' && contentType !== 'multimodal_text';
                if (unknown || unknownContent) warnings.add('部分非文字內容未嵌入匯出檔');
                if (text || omitted || unknownContent) {
                    messages.push({
                        role, text: text || '> [此訊息內容格式無法解析]', channel: message.channel ?? null,
                        ...(omitted ? {
                            comparisonBody: parts.filter(part => typeof part === 'string').join('\n\n').trim(),
                            attachments: parts.filter(part => typeof part !== 'string')
                                .map(part => ({ type: part?.content_type || 'unknown' }))
                        } : {}),
                        create_time: message.create_time, date: formatApiDate(message.create_time)
                    });
                }
            }
            id = node.parent;
        }
        messages.reverse();
        return {
            title: typeof payload.title === 'string' ? payload.title : 'ChatGPT-Chat',
            messages, incomplete: warnings.size > 0,
            warning: [...warnings].join('；') || null,
            notice: [...notices].join('；') || null
        };
    }

    function buildMarkdown(parsed, sourceTitle, { source = 'API', chatTime = '', timeMarkers = [] } = {}) {
        const title = sanitizeFileName(sourceTitle || parsed.title);
        let content = `> **匯出來源**：${source}\n\n`;
        let user = 1;
        let model = 1;
        const emittedTimeMarkers = new Set();
        const appendTime = (timestamp, unlocated = false) => {
            content += `> **對話時間${unlocated ? '（未定位）' : ''}**：${timestamp}\n\n`;
        };
        if (chatTime && !timeMarkers.some(marker => marker.timestamp === chatTime)) appendTime(chatTime);
        for (const message of parsed.messages) {
            for (const marker of timeMarkers) {
                if (marker.beforeTurnIndex === message.turnIndex && !emittedTimeMarkers.has(marker.key)) {
                    appendTime(marker.timestamp);
                    emittedTimeMarkers.add(marker.key);
                }
            }
            if (message.date) appendTime(message.date);
            const heading = message.role === 'user' ? `User ${user++}` : `Model ${model++}`;
            content += `--- [${heading}] ---\n${message.text}\n\n`;
        }
        for (const marker of timeMarkers) {
            if (!emittedTimeMarkers.has(marker.key)) appendTime(marker.timestamp, true);
        }
        if (parsed.incomplete) content += `> **匯出不完整**：${parsed.warning.replace(/\r?\n/g, '\n> ')}\n`;
        if (parsed.notice) content += `> **內容提示**：${parsed.notice.replace(/\r?\n/g, '\n> ')}\n`;
        return { filename: title, content: content.trimEnd() + '\n' };
    }

    function prepareComparisonMessage(message, source) {
        const citations = source === 'dom' ? (message.citations ?? null) : [];
        const attachments = source === 'dom' ? (message.attachments ?? null) : (message.attachments ?? []).slice();
        const normalizeLiteral = text => String(text ?? '').replace(/\r\n?/g, '\n').replace(/\u00a0/g, ' ').trim();
        const normalize = text => normalizeLiteral(text).replace(/[ \t]+\n/g, '\n').replace(/\n(?:[ \t]*\n)+/g, '\n');
        if (message.role === 'user') {
            return { body: normalizeLiteral(message.comparisonBody ?? message.text), citations, attachments };
        }
        if (source === 'dom') {
            let body = normalize(message.comparisonBody ?? message.text);
            for (const [index, value] of (message.comparisonCode?.values ?? []).entries()) {
                body = body.replaceAll(`${message.comparisonCode.prefix}${index}_END`, value);
            }
            return { body, citations, attachments };
        }

        // Protect code before handling ChatGPT's non-HTML JSX widgets.
        const protectedCode = [];
        const widgetLabels = [];
        const original = String(message.comparisonBody ?? message.text ?? '');
        let prefix = 'GYC_CODE_';
        while (original.includes(prefix)) prefix += '_';
        const unwrapLayout = value => value.replace(/<(row|box|text)\b[^>]*>([\s\S]*?)<\/\1\s*>/g, (_, tag, content) => {
            const lines = content.replace(/^\s*\n/, '').replace(/\n[ \t]*$/, '').split('\n');
            const indents = lines.filter(line => line.trim()).map(line => line.match(/^[ \t]*/)[0].length);
            const indent = indents.length ? Math.min(...indents) : 0;
            const body = unwrapLayout(lines.map(line => line.slice(Math.min(indent, line.match(/^[ \t]*/)[0].length))).join('\n')).trim();
            return tag === 'text' ? body : `\n${body}\n`;
        });
        const text = unwrapLayout(original.replace(
            /^ {0,3}(`{3,}|~{3,})[^\n]*\n[\s\S]*?^ {0,3}\1[ \t]*(?:\n|$)|(`+)(?!`)[\s\S]*?\2(?!`)/gm,
            match => {
                const key = `${prefix}${protectedCode.length}_END`;
                protectedCode.push(match);
                return key;
            }
        ).replace(/<Cite\b(?:[^>"']|"[^"]*"|'[^']*')*\/>/g, widget => {
            citations.push(widget);
            return '';
        }).replace(/<Link\b(?:[^>"']|"[^"]*"|'[^']*')*\/>/g, widget => {
            const title = widget.match(/\btitle=(["'])(.*?)\1/);
            const url = widget.match(/\burl=(["'])(.*?)\1/);
            const label = title?.[2] ?? url?.[2];
            if (label === undefined) return widget;
            const key = `${prefix}LABEL_${widgetLabels.length}_END`;
            widgetLabels.push(label);
            return key;
        }).replace(/<icon\b[^>]*>[\s\S]*?<\/icon\s*>|<icon\b[^>]*\/>/g, '')
            )
            .replace(new RegExp(`${prefix}(\\d+)_END`, 'g'), (_, index) => protectedCode[Number(index)]);

        const decode = text => String(text ?? '').replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos|nbsp|#39);/gi, (entity, name) => {
            if (name[0] === '#') {
                const number = name[1].toLowerCase() === 'x' ? parseInt(name.slice(2), 16) : parseInt(name.slice(1), 10);
                return Number.isFinite(number) && number <= 0x10ffff ? String.fromCodePoint(number) : entity;
            }
            return { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' }[name.toLowerCase()] ?? entity;
        });
        const codeBodies = [];
        const keepCode = value => {
            const key = `${prefix}BODY_${codeBodies.length}_END`;
            codeBodies.push(value);
            return key;
        };
        const inline = tokens => (tokens ?? []).map(token => {
            if (token.tokens) return inline(token.tokens);
            if (token.type === 'br') return '\n';
            if (token.type === 'codespan') return keepCode(decode(token.text));
            if (token.type === 'image') {
                attachments.push({ type: 'image', alt: decode(token.text), url: token.href });
                return '';
            }
            return decode(token.text ?? token.raw ?? '');
        }).join('');
        const blocks = tokens => (tokens ?? []).map(token => {
            switch (token.type) {
                case 'space': case 'def': case 'hr': return '';
                case 'list': return token.items.map(item => blocks(item.tokens)).join('\n');
                case 'blockquote': return blocks(token.tokens);
                case 'table': return [token.header, ...token.rows].map(row => row.map(cell => inline(cell.tokens)).join('\t')).join('\n');
                case 'code': return keepCode(token.text);
                case 'html': return token.text;
                default: return token.tokens ? inline(token.tokens) : decode(token.text ?? token.raw ?? '');
            }
        }).filter(Boolean).join('\n');
        const body = normalize(blocks(markdown.lexer(text)))
            .replace(new RegExp(`${prefix}BODY_(\\d+)_END`, 'g'), (_, index) => codeBodies[Number(index)])
            .replace(new RegExp(`${prefix}LABEL_(\\d+)_END`, 'g'), (_, index) => decode(widgetLabels[Number(index)]));
        return { body, citations, attachments };
    }

    function compareTranscripts(apiMessages, domMessages) {
        const api = apiMessages.map(message => ({ role: message.role, text: prepareComparisonMessage(message, 'api').body }));
        const dom = domMessages.map(message => ({ role: message.role, text: prepareComparisonMessage(message, 'dom').body }));
        const equal = (a, b) => a.role === b.role && a.text === b.text;
        const differences = [];
        const progress = [];
        let i = 0;
        let j = 0;
        const add = (kind, ai, di) => differences.push({
            apiIndex: ai === null ? null : ai + 1,
            domIndex: di === null ? null : di + 1,
            kind,
            api: ai === null ? null : apiMessages[ai],
            dom: di === null ? null : domMessages[di]
        });
        while (i < api.length || j < dom.length) {
            if (i === api.length) { add('dom-only', null, j++); continue; }
            if (j === dom.length) { add('api-only', i++, null); continue; }
            if (equal(api[i], dom[j])) { i++; j++; continue; }
            if (apiMessages[i].role === 'assistant' && apiMessages[i].channel === 'commentary') {
                let next = i + 1;
                while (next < api.length && apiMessages[next].role === 'assistant' && apiMessages[next].channel === 'commentary') next++;
                if (next < api.length && apiMessages[next].role === 'assistant' && apiMessages[next].channel === 'final' && equal(api[next], dom[j])) {
                    while (i < next) { progress.push({ apiIndex: i + 1, api: apiMessages[i] }); i++; }
                    continue;
                }
            }
            // Preserve every unmatched message while right-aligning unequal runs of the
            // same role; an API progress message can precede an unequal final answer.
            const apiRun = api.slice(i).findIndex(message => message.role !== api[i].role);
            const domRun = dom.slice(j).findIndex(message => message.role !== dom[j].role);
            const apiCount = apiRun < 0 ? api.length - i : apiRun;
            const domCount = domRun < 0 ? dom.length - j : domRun;
            if (api[i].role === dom[j].role && apiCount > domCount) { add('api-only', i++, null); continue; }
            if (api[i].role === dom[j].role && domCount > apiCount) { add('dom-only', null, j++); continue; }
            // ponytail: bounded lookahead limits alignment to 50 rows; use linear-space LCS for larger gaps.
            let best = null;
            for (let a = i; a < Math.min(api.length, i + 51); a++) {
                for (let d = j; d < Math.min(dom.length, j + 51); d++) {
                    if (a === i && d === j) continue;
                    if (equal(api[a], dom[d]) && (!best || a - i + d - j < best.cost)) {
                        best = { a, d, cost: a - i + d - j };
                    }
                }
            }
            if (best && (best.a === i || best.d === j)) {
                while (i < best.a) add('api-only', i++, null);
                while (j < best.d) add('dom-only', null, j++);
            } else {
                add(api[i].role === dom[j].role ? 'text' : 'role', i++, j++);
            }
        }
        return { match: differences.length === 0, differences, ...(progress.length ? { progress } : {}) };
    }

    if (typeof module !== 'undefined' && module.exports && typeof document === 'undefined') {
        module.exports = { parseApiConversation, buildMarkdown, formatApiDate, isPersonalChatRoute, getConversationIdFromUrl, compareTranscripts, prepareComparisonMessage };
        return;
    }

    function determineTitle() {
        try {
            const title = document.title.replace(/\s*[-–—|]?\s*ChatGPT\s*$/i, '').trim();
            if (title) return sanitizeFileName(title);
        } catch (error) {
            console.error('[ChatGPT Exporter] 擷取標題失敗', error);
        }
        return 'ChatGPT-Chat';
    }

    function parseChatTimestamp(value) {
        const localizedPatterns = [
            /(\d{4}\s*年\s*\d{1,2}\s*月\s*\d{1,2}\s*日(?:\s*週[一二三四五六日天])?\s*(?:於\s*)?(?:上午|下午)\s*\d{1,2}\s*:\s*\d{2}(?::\s*\d{2})?)/,
            /(\d{1,2}\s*月\s*\d{1,2}\s*日(?:\s*週[一二三四五六日天])?\s*(?:於\s*)?(?:上午|下午)\s*\d{1,2}\s*:\s*\d{2}(?::\s*\d{2})?)/,
            /((?:今天|昨天|前天)\s*(?:於\s*)?(?:上午|下午)\s*\d{1,2}\s*:\s*\d{2}(?::\s*\d{2})?)/,
            /((?:週|星期)[一二三四五六日天]\s*(?:於\s*)?(?:上午|下午)\s*\d{1,2}\s*:\s*\d{2}(?::\s*\d{2})?)/
        ];
        const normalizedValue = String(value || '').replace(/\s+/g, ' ').trim();
        const match = localizedPatterns
            .map(pattern => normalizedValue.match(pattern))
            .find(Boolean);
        if (!match) return '';
        return match[1]
            .replace(/\s*年\s*/, '年')
            .replace(/\s*月\s*/, '月')
            .replace(/\s*日\s*/, '日 ')
            .replace(/日\s+週/, '日週')
            .replace(/日\s*(上午|下午)/, '日 於 $1')
            .replace(/(週[一二三四五六日天])\s*(上午|下午)/, '$1 於 $2')
            .replace(/((?:今天|昨天|前天)|(?:週|星期)[一二三四五六日天])\s*(上午|下午)/, '$1 於 $2')
            .replace(/於\s+/, '於 ')
            .replace(/(上午|下午)\s+/, '$1')
            .replace(/\s*:\s*/g, ':');
    }

    function findChatTimestamp(scroller) {
        const searchRoot = document.body || scroller;
        for (const element of searchRoot.querySelectorAll('[aria-label], time[datetime], [datetime]')) {
            const fromLabel = parseChatTimestamp(element.getAttribute('aria-label'));
            if (fromLabel) return fromLabel;
            const fromText = parseChatTimestamp(element.innerText || element.textContent);
            if (fromText) return fromText;
        }

        for (const value of [
            scroller.innerText,
            searchRoot.innerText,
            searchRoot.textContent
        ]) {
            const found = parseChatTimestamp(value);
            if (found) return found;
        }

        const timeElement = searchRoot.querySelector('time[datetime], [datetime]');
        if (timeElement) {
            const date = new Date(timeElement.getAttribute('datetime'));
            if (!Number.isNaN(date.getTime())) {
                const parts = new Intl.DateTimeFormat('zh-TW', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                }).formatToParts(date);
                const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
                if (values.year && values.month && values.day && values.hour && values.minute) {
                    return `${values.year}年${values.month.replace('月', '')}月${values.day}日 於 ` +
                        `${values.dayPeriod || ''}${values.hour}:${values.minute}`;
                }
            }
        }
        return '';
    }

    function hashCode(str) {
        let hash = 2166136261;
        for (let i = 0; i < str.length; i++) {
            hash ^= str.charCodeAt(i);
            hash = Math.imul(hash, 16777619);
        }
        return (hash >>> 0).toString(36);
    }

    function cssEscape(value) {
        if (window.CSS && typeof window.CSS.escape === 'function') return window.CSS.escape(value);
        return String(value).replace(/["\\]/g, '\\$&');
    }

    const MESSAGE_SELECTOR = '[data-message-author-role], [class~="group/user-message"], ' +
        '[data-chatgpt-selection-message-id]:has([data-markdown-text-style])';

    function getMessageRole(node) {
        return node.getAttribute('data-message-author-role') ||
            (node.classList.contains('group/user-message') ? 'user' :
                node.hasAttribute('data-chatgpt-selection-message-id') ? 'assistant' : '');
    }

    function getScrollBounds(scroller) {
        const distance = Math.max(0, scroller.scrollHeight - scroller.clientHeight);
        return getComputedStyle(scroller).flexDirection === 'column-reverse'
            ? { oldest: -distance, newest: 0 }
            : { oldest: 0, newest: distance };
    }

    function findScrollContainer() {
        const candidates = new Set();
        for (const node of document.querySelectorAll(MESSAGE_SELECTOR)) {
            let element = node.parentElement;
            while (element && element !== document.body) {
                const style = getComputedStyle(element);
                if ((style.overflowY === 'auto' || style.overflowY === 'scroll') &&
                    element.scrollHeight > element.clientHeight + 100) {
                    candidates.add(element);
                }
                element = element.parentElement;
            }
        }
        return Array.from(candidates).sort((a, b) => b.scrollHeight - a.scrollHeight)[0] ||
            document.scrollingElement ||
            document.documentElement;
    }

    function showNotification(message, isError = false, duration = 3500) {
        document.getElementById('chatgpt-export-toast')?.remove();
        const toast = document.createElement('div');
        toast.id = 'chatgpt-export-toast';
        Object.assign(toast.style, {
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: isError ? '#d93025' : '#3c4043',
            color: '#fff',
            padding: '12px 24px',
            borderRadius: '8px',
            zIndex: '2147483647',
            boxShadow: '0 4px 10px rgba(0,0,0,.3)',
            fontSize: '14px',
            fontWeight: 'bold',
            maxWidth: '80vw',
            whiteSpace: 'pre-line'
        });
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), duration);
    }

    function showSaveModal(defaultTitle, textContent, report, onSave) {
        document.getElementById('chatgpt-export-save-overlay')?.remove();

        const overlay = document.createElement('div');
        overlay.id = 'chatgpt-export-save-overlay';
        Object.assign(overlay.style, {
            position: 'fixed',
            inset: '0',
            background: 'rgba(0,0,0,.6)',
            zIndex: '2147483646',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        });

        const modal = document.createElement('div');
        Object.assign(modal.style, {
            background: 'linear-gradient(180deg, #151515 0%, #0d0d0d 100%)',
            padding: '24px',
            borderRadius: '12px',
            width: '430px',
            maxWidth: 'calc(100vw - 40px)',
            border: '1px solid rgba(255,255,255,.14)',
            boxShadow:
                '0 24px 70px rgba(0,0,0,.68), inset 0 1px 0 rgba(255,255,255,.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            color: '#f5f5f5',
            fontFamily: 'system-ui, sans-serif'
        });

        const heading = document.createElement('h3');
        heading.textContent = `掃描完成：${report.messageCount} 則訊息／${textContent.length} 字`;
        Object.assign(heading.style, {
            margin: '0',
            color: '#f5f5f5',
            fontSize: '18px'
        });

        const status = document.createElement('div');
        status.textContent = report.warning || report.status || '未發現未解析的訊息空殼';
        Object.assign(status.style, {
            padding: '9px 11px',
            borderRadius: '6px',
            fontSize: '13px',
            background: report.warning
                ? 'rgba(245,158,11,.13)'
                : 'rgba(255,255,255,.055)',
            color: report.warning ? '#fbbf24' : '#c8c8c8',
            border: report.warning
                ? '1px solid rgba(245,158,11,.3)'
                : '1px solid rgba(255,255,255,.09)',
            whiteSpace: 'pre-line'
        });

        const label = document.createElement('label');
        label.textContent = '請確認檔名（無需副檔名）：';
        Object.assign(label.style, {
            fontSize: '14px',
            color: '#c8c8c8'
        });

        const input = document.createElement('input');
        input.type = 'text';
        input.value = defaultTitle;
        Object.assign(input.style, {
            padding: '10px 11px',
            background: '#1a1a1a',
            color: '#f5f5f5',
            caretColor: '#fff',
            border: '1px solid rgba(255,255,255,.2)',
            borderRadius: '6px',
            fontSize: '14px',
            width: '100%',
            boxSizing: 'border-box',
            outline: 'none',
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,.45)'
        });
        input.addEventListener('focus', () => {
            input.style.borderColor = 'rgba(255,255,255,.48)';
            input.style.boxShadow =
                '0 0 0 3px rgba(255,255,255,.08), ' +
                'inset 0 1px 2px rgba(0,0,0,.45)';
        });
        input.addEventListener('blur', () => {
            input.style.borderColor = 'rgba(255,255,255,.2)';
            input.style.boxShadow = 'inset 0 1px 2px rgba(0,0,0,.45)';
        });

        const buttons = document.createElement('div');
        Object.assign(buttons.style, {
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px'
        });

        const cancel = document.createElement('button');
        cancel.textContent = '取消';
        const save = document.createElement('button');
        save.textContent = '下載 .md';
        for (const button of [cancel, save]) {
            Object.assign(button.style, {
                padding: '8px 16px',
                border: '1px solid transparent',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontFamily: 'system-ui, sans-serif'
            });
        }
        Object.assign(cancel.style, {
            background: '#242424',
            color: '#e8e8e8',
            borderColor: 'rgba(255,255,255,.12)'
        });
        Object.assign(save.style, {
            background: '#10a37f',
            color: '#fff',
            borderColor: 'rgba(255,255,255,.08)'
        });
        cancel.onclick = () => overlay.remove();
        save.onclick = () => {
            onSave(input.value.trim() || 'Untitled');
            overlay.remove();
        };
        input.addEventListener('keydown', event => {
            if (event.key === 'Enter') save.click();
            if (event.key === 'Escape') overlay.remove();
        });
        overlay.onclick = event => {
            if (event.target === overlay) overlay.remove();
        };

        buttons.append(cancel, save);
        modal.append(heading, status, label, input, buttons);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        input.focus();
        input.select();
    }

    function getTurnEnvelope(node, scroller) {
        let element = node;
        let turnCandidate = null;
        while (element && element !== scroller && element !== document.body) {
            if (/^conversation-turn-\d+$/i.test(element.getAttribute('data-testid') || '') ||
                element.hasAttribute('data-turn-key')) {
                return element;
            }
            if (element !== node &&
                (element.hasAttribute('data-turn-id') || element.hasAttribute('data-turn'))) {
                turnCandidate = element;
            }
            element = element.parentElement;
        }
        return turnCandidate || node;
    }

    function getStableId(node, envelope, role, text) {
        const attributes = ['data-message-id', 'data-chatgpt-selection-message-id',
            'data-turn-id', 'data-turn-key', 'data-turn', 'data-testid'];
        for (const source of [node, envelope]) {
            if (!source) continue;
            for (const attribute of attributes) {
                const value = source.getAttribute?.(attribute);
                if (value && (attribute !== 'data-testid' || /conversation-turn-|message/i.test(value))) {
                    return `${attribute}:${value}`;
                }
            }
        }
        return `content:${role}:${hashCode(text)}`;
    }

    function getTurnIndex(node, envelope) {
        const values = [
            node.getAttribute?.('data-testid'),
            envelope?.getAttribute?.('data-testid'),
            node.getAttribute?.('data-turn'),
            envelope?.getAttribute?.('data-turn')
        ].filter(Boolean);
        for (const value of values) {
            const match = String(value).match(/(?:conversation-turn-|^)(\d+)$/i);
            if (match) return Number(match[1]);
        }
        return null;
    }

    function collectTimeMarkers(scroller, state) {
        const turnNodes = Array.from(
            scroller.querySelectorAll('[data-testid^="conversation-turn-"]')
        );
        if (!turnNodes.length) return;

        for (const element of scroller.querySelectorAll('[aria-label]')) {
            // 對話正文內自己的 aria-label 不屬於日期分隔線。
            if (element.closest('[data-testid^="conversation-turn-"]')) continue;

            const timestamp = parseChatTimestamp(element.getAttribute('aria-label'));
            if (!timestamp) continue;

            const nextTurn = turnNodes.find(turn =>
                Boolean(element.compareDocumentPosition(turn) & Node.DOCUMENT_POSITION_FOLLOWING)
            );
            if (!nextTurn) continue;

            const beforeTurnIndex = getTurnIndex(nextTurn, nextTurn);
            if (!Number.isInteger(beforeTurnIndex)) continue;

            const key = `${beforeTurnIndex}:${timestamp}`;
            if (!state.timeMarkers.has(key)) {
                state.timeMarkers.set(key, {
                    key,
                    timestamp,
                    beforeTurnIndex,
                    sequence: state.nextTimeSequence++
                });
            }
        }
    }

    function extractText(node, role) {
        const readText = element => {
            if (!element) return '';
            const renderedText = (element.innerText || '').trim();
            return renderedText || (element.textContent || '').trim();
        };
        const selectors = role === 'assistant'
            ? ['[data-markdown-text-style]', '.markdown', '[class*="markdown"]',
                '.prose', '[data-message-content]']
            : ['[data-message-content]', '.whitespace-pre-wrap', '[class*="whitespace-pre-wrap"]',
                '[class~="bg-user-message"]'];
        for (const selector of selectors) {
            const parts = Array.from(node.querySelectorAll(selector))
                .filter(part => !part.parentElement?.closest(selector));
            const text = parts.map(readText).filter(Boolean).join('\n').trim();
            if (text) return text;
        }
        return readText(node);
    }

    // Only controls explicitly marked as citations are removable. Ordinary links,
    // domains and +N text remain part of the body without structural evidence.
    const CITATION_SELECTOR = '[data-testid*="citation"], [data-citation], [class*="citation"], [data-d-component="popover-trigger"][data-d-inline-text]:has([data-d-component="badge"] [data-d-component="favicon"])';

    function extractComparisonDom(node, role) {
        const controls = Array.from(node.querySelectorAll(CITATION_SELECTOR))
            .filter(control => !control.parentElement?.closest(CITATION_SELECTOR));
        const citations = controls.map(control => ({
            label: (control.innerText || control.textContent || '').trim(),
            links: Array.from(control.querySelectorAll('a[href]'), link => ({
                label: (link.innerText || link.textContent || '').trim(),
                url: link.href
            }))
        }));
        const hasCode = role === 'assistant' && node.querySelector('pre code, code:not(pre code)');
        if (!controls.length && !hasCode) return { body: cleanContent(extractText(node, role)), citations };
        const clone = node.cloneNode(true);
        clone.querySelectorAll(CITATION_SELECTOR).forEach(control => control.remove());
        let prefix = 'GYC_DOM_CODE_';
        while ((node.textContent || '').includes(prefix)) prefix += '_';
        const values = [];
        if (role === 'assistant') {
            const elements = Array.from(clone.querySelectorAll('pre, code'))
                .filter(element => element.tagName !== 'CODE' || !element.closest('pre'));
            for (const element of elements) {
                const code = element.tagName === 'PRE' ? element.querySelector('code') : element;
                if (!code) continue;
                const value = (code.textContent || '').replace(/\r\n?/g, '\n');
                values.push(element.tagName === 'PRE' ? value.replace(/\n$/, '') : value);
                element.textContent = `${prefix}${values.length - 1}_END`;
            }
        }
        Object.assign(clone.style, {
            position: 'fixed', left: '-10000px', top: '0',
            width: `${node.getBoundingClientRect().width}px`, opacity: '0', pointerEvents: 'none'
        });
        node.parentElement.appendChild(clone);
        try {
            return { body: cleanContent(extractText(clone, role)), citations, comparisonCode: { prefix, values } };
        } finally {
            clone.remove();
        }
    }

    function extractAttachmentSummary(node) {
        const summaries = [];
        const images = Array.from(node.querySelectorAll('img'))
            .filter(image => !image.closest(CITATION_SELECTOR) && (image.getAttribute('src') || image.getAttribute('alt')));
        if (images.length) {
            const descriptions = [...new Set(images
                .map(image => (image.getAttribute('alt') || image.getAttribute('aria-label') || '').trim())
                .filter(value => value && !/^(image|圖片)$/i.test(value)))]
                .slice(0, 3);
            summaries.push(`圖片附件 × ${images.length}` +
                (descriptions.length ? `（${descriptions.join('、')}）` : ''));
        }
        const videos = node.querySelectorAll('video').length;
        if (videos) summaries.push(`影片附件 × ${videos}`);
        const audios = node.querySelectorAll('audio').length;
        if (audios) summaries.push(`音訊附件 × ${audios}`);
        const canvases = node.querySelectorAll('canvas').length;
        if (canvases && !images.length) summaries.push(`畫布／圖片內容 × ${canvases}`);

        const fileNodes = Array.from(node.querySelectorAll(
            '[data-testid*="attachment"], [data-testid*="file"], a[download]'
        ));
        if (fileNodes.length) {
            const names = [...new Set(fileNodes
                .map(element => (
                    element.getAttribute('download') ||
                    element.getAttribute('aria-label') ||
                    element.getAttribute('title') ||
                    element.textContent ||
                    ''
                ).trim())
                .filter(Boolean))]
                .slice(0, 3);
            summaries.push(`檔案附件 × ${fileNodes.length}` +
                (names.length ? `（${names.join('、')}）` : ''));
        }
        return summaries.length
            ? `> [非文字內容：${summaries.join('；')}；附件本體未嵌入匯出檔]`
            : '';
    }

    function getViewportSignature(scroller) {
        const samples = Array.from(scroller.querySelectorAll(MESSAGE_SELECTOR))
            .map(node => {
                const role = getMessageRole(node);
                const text = (node.innerText || node.textContent || '').trim();
                return `${role}:${text.length}:${text.slice(0, 32)}`;
            });
        return hashCode(samples.join('|'));
    }

    function collectSnapshot(scroller, snapshotMap, state) {
        collectTimeMarkers(scroller, state);

        const all = Array.from(scroller.querySelectorAll(MESSAGE_SELECTOR));
        const candidates = all.filter(node => {
            const ancestor = node.parentElement?.closest(MESSAGE_SELECTOR);
            return !ancestor || !scroller.contains(ancestor);
        });
        if (getScrollBounds(scroller).oldest < 0) {
            candidates.sort((a, b) =>
                a.getBoundingClientRect().top - b.getBoundingClientRect().top
            );
        }

        let added = 0;
        let empty = 0;
        let emptyVisible = 0;
        const scrollerRect = scroller.getBoundingClientRect();

        for (const node of candidates) {
            const role = getMessageRole(node);
            if (role !== 'user' && role !== 'assistant') continue;

            const envelope = getTurnEnvelope(node, scroller);
            const plainText = cleanContent(extractText(node, role));
            const attachmentSummary = extractAttachmentSummary(node);
            const comparison = extractComparisonDom(node, role);
            const text = plainText && attachmentSummary
                ? `${plainText}\n\n${attachmentSummary}`
                : plainText || attachmentSummary;
            const key = getStableId(node, envelope, role, text);
            const turnIndex = getTurnIndex(node, envelope);
            state.seenKeys.add(key);

            if (!text) {
                empty++;
                const rect = envelope.getBoundingClientRect();
                const nearViewport =
                    rect.bottom >= scrollerRect.top - scroller.clientHeight * 0.25 &&
                    rect.top <= scrollerRect.bottom + scroller.clientHeight * 0.25;
                if (nearViewport) {
                    emptyVisible++;
                    if (!snapshotMap.has(key)) {
                        state.pendingEmpty.set(key, { key, role, turnIndex });
                    }
                }
                continue;
            }

            state.pendingEmpty.delete(key);
            const existing = snapshotMap.get(key);
            if (!existing) {
                snapshotMap.set(key, {
                    key,
                    role,
                    text,
                    comparisonBody: comparison.body,
                    comparisonCode: comparison.comparisonCode,
                    citations: comparison.citations,
                    attachments: attachmentSummary ? [attachmentSummary] : [],
                    turnIndex,
                    sequence: state.nextSequence++
                });
                added++;
            } else if (text.length > existing.text.length) {
                existing.text = text;
                existing.comparisonBody = comparison.body;
                existing.comparisonCode = comparison.comparisonCode;
                existing.citations = comparison.citations;
                existing.attachments = attachmentSummary ? [attachmentSummary] : [];
            }
        }

        state.emptyObservations += emptyVisible;
        return { added, empty, emptyVisible, visible: candidates.length };
    }

    async function collectWithRetries(scroller, snapshotMap, state) {
        let result = collectSnapshot(scroller, snapshotMap, state);
        for (let retry = 0; retry < RETRY_EMPTY_MAX && result.emptyVisible > 0; retry++) {
            await delay(RETRY_EMPTY_WAIT);
            result = collectSnapshot(scroller, snapshotMap, state);
            if (result.emptyVisible === 0) break;
        }
        return result;
    }

    function findPendingNode(scroller, item) {
        if (item.key.startsWith('data-message-id:')) {
            const id = item.key.slice('data-message-id:'.length);
            const node = scroller.querySelector(`[data-message-id="${cssEscape(id)}"]`);
            if (node) return node;
        }
        if (Number.isInteger(item.turnIndex)) {
            const turn = scroller.querySelector(
                `[data-testid="conversation-turn-${item.turnIndex}"]`
            );
            if (turn) return turn.querySelector('[data-message-author-role]') || turn;
        }
        return null;
    }

    async function doubleCheckPending(scroller, snapshotMap, state, button, waitMs) {
        const queue = Array.from(state.pendingEmpty.values())
            .filter(item => !snapshotMap.has(item.key))
            .sort((a, b) => {
                if (Number.isInteger(a.turnIndex) && Number.isInteger(b.turnIndex)) {
                    return a.turnIndex - b.turnIndex;
                }
                return 0;
            });

        let recovered = 0;
        for (let index = 0; index < queue.length; index++) {
            const item = queue[index];
            if (snapshotMap.has(item.key)) continue;
            button.textContent = `二次回訪空殼 ${index + 1}/${queue.length}` +
                (Number.isInteger(item.turnIndex) ? `｜turn ${item.turnIndex}` : '');

            let node = findPendingNode(scroller, item);
            if (!node) continue;
            getTurnEnvelope(node, scroller).scrollIntoView({
                behavior: 'auto',
                block: 'center',
                inline: 'nearest'
            });
            scroller.dispatchEvent(new Event('scroll', { bubbles: true }));

            for (let retry = 0; retry < RETRY_EMPTY_MAX + 2; retry++) {
                await delay(Math.max(waitMs, 650));
                collectSnapshot(scroller, snapshotMap, state);
                if (snapshotMap.has(item.key)) {
                    recovered++;
                    break;
                }
                const nudge = retry % 2 === 0 ? 80 : -80;
                const bounds = getScrollBounds(scroller);
                scroller.scrollTop = Math.max(bounds.oldest, Math.min(
                    bounds.newest, scroller.scrollTop + nudge
                ));
                scroller.dispatchEvent(new Event('scroll', { bubbles: true }));
                node = findPendingNode(scroller, item);
                if (node) {
                    getTurnEnvelope(node, scroller).scrollIntoView({
                        behavior: 'auto',
                        block: 'center',
                        inline: 'nearest'
                    });
                }
            }
        }
        state.doubleCheckAttempted = queue.length;
        state.doubleCheckRecovered = recovered;
    }

    async function moveToTop(scroller, waitMs, button) {
        let stable = 0;
        let previousSignature = '';
        for (let index = 0; index < MAX_UPWARD_LOOPS; index++) {
            scroller.scrollTop = getScrollBounds(scroller).oldest;
            scroller.dispatchEvent(new Event('scroll', { bubbles: true }));
            await delay(waitMs);
            const signature = getViewportSignature(scroller);
            const loadingOlder = /loading older messages|載入較早的訊息|載入舊訊息/i.test(
                scroller.querySelector('.flex.justify-center.py-4')?.textContent || ''
            );
            const atOldest = Math.abs(scroller.scrollTop - getScrollBounds(scroller).oldest) <= 3;
            if (!loadingOlder && atOldest && signature === previousSignature) stable++;
            else stable = 0;
            previousSignature = signature;
            button.textContent = `${loadingOlder ? '載入較早訊息' : '定位起點'}… ${index + 1}/${MAX_UPWARD_LOOPS}`;
            if (stable >= 2) return true;
        }
        return false;
    }

    async function scrollToTop(button) {
        if (!button || button.disabled) return;
        const originalText = button.textContent;
        button.disabled = true;
        try {
            const scroller = findScrollContainer();
            const reached = await moveToTop(scroller, FAST_UPWARD_WAIT, button);
            showNotification(
                reached ? '✅ 已到達目前對話頂端' : '⚠️ 無法確認已到最頂端',
                !reached
            );
        } catch (error) {
            console.error('[ChatGPT Exporter] 直達頂端失敗', error);
            showNotification(`❌ 直達頂端失敗：${error.message}`, true);
        } finally {
            button.disabled = false;
            button.textContent = originalText;
        }
    }

    async function processAndExport(config, button, collectOnly = false) {
        if (!button || (button.disabled && !collectOnly)) return;
        const originalText = button.textContent;
        button.disabled = true;

        try {
            const scroller = findScrollContainer();
            if (!scroller.querySelector(MESSAGE_SELECTOR)) {
                throw new Error('目前滾動容器內找不到對話訊息節點');
            }

            const reachedTop = await moveToTop(scroller, config.upWait, button);
            if (!reachedTop) throw new Error('較早訊息仍在載入，無法確認對話頂端');
            await delay(Math.max(config.upWait, 1000));
            config.checkScope?.();
            let chatTime = findChatTimestamp(scroller);

            const snapshotMap = new Map();
            const state = {
                nextSequence: 0,
                nextTimeSequence: 0,
                emptyObservations: 0,
                seenKeys: new Set(),
                pendingEmpty: new Map(),
                timeMarkers: new Map()
            };
            const scanWarnings = [];
            const sweepCount = Math.max(1, Number(config.sweeps) || 1);
            const viewport = Math.max(scroller.clientHeight, 400);
            const step = Math.max(200, Math.min(config.step, Math.floor(viewport * 0.6)));
            const estimatedPasses = Math.ceil(scroller.scrollHeight / step);
            const maxPasses = Math.min(5000, Math.max(100, estimatedPasses * 4 + 50));

            for (let sweep = 0; sweep < sweepCount; sweep++) {
                if (sweep > 0) {
                    const reachedTop = await moveToTop(
                        scroller,
                        config.upWait || FAST_UPWARD_WAIT,
                        button
                    );
                    if (!reachedTop) {
                        scanWarnings.push(`第 ${sweep + 1} 輪無法確認已回到頂端`);
                        continue;
                    }
                }

                const countAtStart = snapshotMap.size;
                let bottomStable = 0;
                let stallCount = 0;
                let previousSignature = '';
                await collectWithRetries(scroller, snapshotMap, state);

                for (let pass = 0; pass < maxPasses; pass++) {
                    config.checkScope?.();
                    const beforeTop = scroller.scrollTop;
                    const bounds = getScrollBounds(scroller);
                    scroller.scrollTop = Math.min(bounds.newest, beforeTop + step);
                    scroller.dispatchEvent(new Event('scroll', { bubbles: true }));
                    await delay(config.baseWait);

                    if (!chatTime && sweep === 0 && pass < 12) {
                        chatTime = findChatTimestamp(scroller);
                    }

                    const result = await collectWithRetries(scroller, snapshotMap, state);
                    const signature = getViewportSignature(scroller);
                    const currentBounds = getScrollBounds(scroller);
                    const bottomGap = currentBounds.newest - scroller.scrollTop;
                    const atBottom = bottomGap <= 5;

                    if (atBottom && signature === previousSignature && result.added === 0) {
                        bottomStable++;
                    } else {
                        bottomStable = 0;
                    }

                    const moved = Math.abs(scroller.scrollTop - beforeTop) >= 5;
                    if (!moved && !atBottom && result.added === 0) stallCount++;
                    else stallCount = 0;

                    const totalDistance = currentBounds.newest - currentBounds.oldest;
                    const percent = totalDistance > 0
                        ? Math.min(100, Math.round(
                            (scroller.scrollTop - currentBounds.oldest) / totalDistance * 100
                        ))
                        : 100;
                    button.textContent = sweepCount > 1
                        ? `救援第 ${sweep + 1}/${sweepCount} 輪 ${percent}%｜聯集 ${snapshotMap.size} 則`
                        : `動態掃描 ${percent}%｜已存 ${snapshotMap.size} 則`;

                    if (bottomStable >= 2) break;
                    if (stallCount >= 8) {
                        scanWarnings.push(
                            `第 ${sweep + 1} 輪在非底部停滯（scrollTop=${Math.round(scroller.scrollTop)}）`
                        );
                        break;
                    }
                    previousSignature = signature;
                    if (pass === maxPasses - 1) {
                        scanWarnings.push(`第 ${sweep + 1} 輪達到安全迴圈上限 ${maxPasses}`);
                    }
                }

                for (let index = 0; index < 3; index++) {
                    await delay(config.baseWait);
                    collectSnapshot(scroller, snapshotMap, state);
                }
                console.info(`[ChatGPT Exporter] 第 ${sweep + 1}/${sweepCount} 輪完成`, {
                    total: snapshotMap.size,
                    newlyRecovered: snapshotMap.size - countAtStart
                });
            }

            await doubleCheckPending(scroller, snapshotMap, state, button, config.baseWait);
            config.checkScope?.();

            const messages = Array.from(snapshotMap.values()).sort((a, b) => {
                if (Number.isInteger(a.turnIndex) && Number.isInteger(b.turnIndex)) {
                    return a.turnIndex - b.turnIndex || a.sequence - b.sequence;
                }
                return a.sequence - b.sequence;
            });
            if (!messages.length) throw new Error('掃描完成，但沒有取得任何非空白對話');

            const unresolved = Array.from(state.pendingEmpty.values())
                .filter(item => !snapshotMap.has(item.key));
            const warnings = [...scanWarnings];
            if (!chatTime && state.timeMarkers.size === 0) {
                warnings.push('已完成全文掃描，但未取得對話頂端時間戳');
            }
            if (unresolved.length) {
                const indexes = unresolved
                    .map(item => item.turnIndex)
                    .filter(Number.isInteger);
                warnings.push(
                    `${unresolved.length} 個具有唯一 ID 的訊息空殼經逐一回訪後仍未載入正文` +
                    (indexes.length ? `（turn ${indexes.join('、')}）` : '')
                );
            }
            const warning = warnings.length ? `⚠️ ${warnings.join('\n')}` : '';

            const timeMarkers = Array.from(state.timeMarkers.values())
                .sort((a, b) =>
                    a.beforeTurnIndex - b.beforeTurnIndex ||
                    a.sequence - b.sequence
                );
            if (collectOnly) return { messages, warning, incomplete: Boolean(warning), chatTime, timeMarkers };

            let title = determineTitle();
            if (warning) title += '_INCOMPLETE';
            const { content: finalOutput } = buildMarkdown({
                messages, incomplete: Boolean(warning), warning
            }, title, { source: 'DOM', chatTime, timeMarkers });
            showSaveModal(title, finalOutput, {
                messageCount: messages.length,
                warning
            }, finalTitle => {
                const blob = new Blob(['\uFEFF' + finalOutput], {
                    type: 'text/markdown;charset=utf-8'
                });
                const url = URL.createObjectURL(blob);
                const anchor = document.createElement('a');
                anchor.href = url;
                anchor.download =
                    `GPT_DOM_${sanitizeFileName(finalTitle)}_${getTimestamp()}.md`;
                document.body.appendChild(anchor);
                anchor.click();
                anchor.remove();
                setTimeout(() => URL.revokeObjectURL(url), 1000);
            });

            console.info('[ChatGPT Exporter] 掃描報告', {
                messages: messages.length,
                effectiveStep: step,
                uniqueIdsSeen: state.seenKeys.size,
                unresolvedEmpty: unresolved.length,
                doubleCheckAttempted: state.doubleCheckAttempted || 0,
                doubleCheckRecovered: state.doubleCheckRecovered || 0,
                sweeps: sweepCount,
                chatTime: chatTime || null,
                timeMarkers: timeMarkers.map(marker => ({
                    timestamp: marker.timestamp,
                    beforeTurnIndex: marker.beforeTurnIndex
                })),
                scanWarnings
            });
        } catch (error) {
            if (collectOnly) throw error;
            console.error('[ChatGPT Exporter] 匯出失敗', error);
            showNotification(`❌ 匯出失敗：${error.message}`, true, 6000);
        } finally {
            if (!collectOnly) {
                button.disabled = false;
                button.textContent = originalText;
            }
        }
    }

    async function processApiExport(button) {
        if (!button || button.disabled) return;
        const originalText = button.textContent;
        button.disabled = true;
        try {
            if (!isPersonalChatRoute()) {
                throw new Error('API匯出不支援目前網址或群聊，請用正常匯出');
            }
            const id = getConversationIdFromUrl();
            if (!id) throw new Error('URL 中找不到 conversation id');
            const token = await fetchAccessToken();
            const payload = await fetchConversationApi(id, token);
            const parsed = parseApiConversation(payload);
            if (!parsed.messages.length) throw new Error('API 沒有可匯出的可見訊息');
            const { filename, content } = buildMarkdown(parsed, payload && payload.title);
            const finalName = `GPT_API_${sanitizeFileName(filename)}_${getTimestamp()}${parsed.incomplete ? '_INCOMPLETE' : ''}`;
            showSaveModal(finalName, content, { messageCount: parsed.messages.length, warning: parsed.warning, status: parsed.notice || '未發現匯出警告' }, (name) => {
                const blob = new Blob(["\uFEFF" + content], { type: 'text/markdown;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${name}.md`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                setTimeout(() => URL.revokeObjectURL(url), 1500);
            });
        } catch (error) { showNotification('API匯出失敗，請用正常匯出', true);
        } finally {
            button.disabled = false;
            button.textContent = originalText;
        }
    }

    function downloadCombinedFile(name, content) {
        const url = URL.createObjectURL(new Blob(['\uFEFF' + content], { type: 'text/markdown;charset=utf-8' }));
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `${name}.md`;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1500);
    }

    function showCombinedResults(title, api, dom, errors) {
        const comparison = api && dom ? compareTranscripts(api.messages, dom.messages) : null;
        const warnings = [
            api?.warning && `API：${api.warning}`,
            api?.notice && `API：${api.notice}`,
            dom?.warning && `DOM：${dom.warning}`
        ].filter(Boolean);
        const formatDifference = difference => {
            const labels = { text: '文字不同', role: '角色不同', 'api-only': '僅 API 有此訊息', 'dom-only': '僅 DOM 有此訊息' };
            const source = (label, index, message) => message
                ? `${label} #${index} (${message.role})：\n${prepareComparisonMessage(message, label === 'API' ? 'api' : 'dom').body}`
                : `${label}：無`;
            return `${labels[difference.kind]}\n${source('API', difference.apiIndex, difference.api)}\n\n` +
                source('DOM', difference.domIndex, difference.dom);
        };
        const metadata = comparison ? [
            ...api.messages.map((message, index) => ({ source: 'API', index: index + 1, ...prepareComparisonMessage(message, 'api') })),
            ...dom.messages.map((message, index) => ({ source: 'DOM', index: index + 1, ...prepareComparisonMessage(message, 'dom') }))
        ].filter(item => item.citations === null || item.attachments === null ||
            item.citations.length || item.attachments.length) : [];
        const metadataNotice = '引用與附件為獨立診斷，未驗證兩來源是否相同；API 引用 ID 不可直接推定 DOM 標籤或網域。';
        const metadataCount = (source, field) => metadata.filter(item => item.source === source)
            .reduce((sum, item) => sum + (item[field]?.length ?? 0), 0);
        const summary = [
            `API：${api ? `${api.messages.length} 則` : `失敗：${errors.api}`}`,
            `DOM：${dom ? `${dom.messages.length} 則` : `失敗：${errors.dom}`}`,
            comparison ? (comparison.match ? '角色、順序與呈現正文相符' :
                `正文差異：${comparison.differences.length} 筆\n\n第一筆差異：\n${formatDifference(comparison.differences[0])}`) : '未進行比對',
            ...(comparison?.progress?.length ? [`API 額外前進度：${comparison.progress.length} 則（另列報告，原始匯出保留）`] : []),
            ...(comparison ? [
                `引用：API ${metadataCount('API', 'citations')} 項／DOM ${metadataCount('DOM', 'citations')} 項；附件：API ${metadataCount('API', 'attachments')} 項／DOM ${metadataCount('DOM', 'attachments')} 項（另列報告）`
            ] : []),
            ...warnings
        ].join('\n');
        const report = comparison
            ? `API ${api.messages.length} 則，DOM ${dom.messages.length} 則，正文差異 ${comparison.differences.length} 筆\n\n` +
                comparison.differences.map((difference, index) =>
                    `正文差異 ${index + 1}\n${formatDifference(difference)}`).join('\n\n--------------------\n\n') +
                (comparison.progress?.length ? '\n\nAPI 額外前進度\n' + comparison.progress.map(item =>
                    `API #${item.apiIndex}：\n${item.api.text}`).join('\n\n') : '') +
                `\n\n${metadataNotice}\n` + metadata.map(item =>
                    `${item.source} #${item.index}：引用 ${JSON.stringify(item.citations)}；附件 ${JSON.stringify(item.attachments)}`).join('\n') + '\n'
            : '';

        document.getElementById('chatgpt-export-save-overlay')?.remove();
        const overlay = document.createElement('div');
        overlay.id = 'chatgpt-export-save-overlay';
        Object.assign(overlay.style, {
            position: 'fixed', inset: '0', background: 'rgba(0,0,0,.6)', zIndex: '2147483646',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        });
        const modal = document.createElement('div');
        Object.assign(modal.style, {
            background: '#151515', color: '#f5f5f5', padding: '24px', borderRadius: '12px',
            width: '650px', maxWidth: 'calc(100vw - 40px)', maxHeight: '85vh',
            display: 'flex', flexDirection: 'column', gap: '12px', fontFamily: 'system-ui, sans-serif'
        });
        const heading = document.createElement('h3');
        heading.textContent = '綜合匯出結果';
        heading.style.margin = '0';
        const details = document.createElement('pre');
        details.textContent = summary;
        Object.assign(details.style, { whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', overflow: 'auto', margin: '0' });
        const buttons = document.createElement('div');
        Object.assign(buttons.style, { display: 'flex', flexWrap: 'wrap', gap: '8px' });
        const addButton = (label, action) => {
            const button = document.createElement('button');
            button.textContent = label;
            Object.assign(button.style, {
                padding: '8px 12px', border: '1px solid #555', borderRadius: '5px',
                background: '#10a37f', color: '#fff', cursor: 'pointer'
            });
            button.addEventListener('click', action);
            buttons.appendChild(button);
        };
        const base = `GPT_${sanitizeFileName(title) || 'ChatGPT-Chat'}_${getTimestamp()}`;
        if (comparison?.match) {
            const warning = [api.warning, dom.warning].filter(Boolean).join('\n');
            const combined = { ...api, incomplete: Boolean(warning), warning };
            const content = buildMarkdown(combined, title, { source: 'API + DOM（呈現正文比對相符；引用與附件未驗證）' }).content;
            addButton('下載綜合 Markdown', () => downloadCombinedFile(`${base}_COMBINED`, content));
        } else {
            if (api) {
                const content = buildMarkdown(api, title).content;
                addButton('下載 API Markdown', () => downloadCombinedFile(`${base}_API`, content));
            }
            if (dom) {
                const content = buildMarkdown(dom, title, {
                    source: 'DOM', chatTime: dom.chatTime, timeMarkers: dom.timeMarkers
                }).content;
                addButton('下載 DOM Markdown', () => downloadCombinedFile(`${base}_DOM`, content));
            }
        }
        if (report) addButton('下載正文差異與 metadata 報告', () => downloadCombinedFile(`${base}_DIFFERENCES`, report));
        addButton('關閉', () => overlay.remove());
        modal.append(heading, details, buttons);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
    }

    async function processCombinedExport(button) {
        if (!button || button.disabled) return;
        const originalText = button.textContent;
        const scope = location.href;
        const title = determineTitle();
        let changed = false;
        const monitor = setInterval(() => { if (location.href !== scope) changed = true; }, 100);
        const checkScope = () => {
            if (changed || location.href !== scope) {
                changed = true;
                throw new Error('收集期間對話網址已變更，無法比對不同對話');
            }
        };
        let api = null;
        let dom = null;
        const errors = {};
        button.disabled = true;
        try {
            try {
                const id = getConversationIdFromUrl(new URL(scope).pathname);
                if (!id) throw new Error('API 不支援目前網址或群聊');
                button.textContent = '取得 API 對話…';
                const token = await fetchAccessToken();
                const payload = await fetchConversationApi(id, token);
                api = parseApiConversation(payload);
                if (!api.messages.length) {
                    api = null;
                    throw new Error('API 沒有可匯出的可見訊息');
                }
            } catch (error) {
                errors.api = error.message || String(error);
            }
            try {
                checkScope();
                dom = await processAndExport({
                    upWait: FAST_UPWARD_WAIT, step: FAST_SCROLL_STEP, baseWait: FAST_BASE_WAIT, checkScope
                }, button, true);
                checkScope();
            } catch (error) {
                dom = null;
                errors.dom = error.message || String(error);
            }
            showCombinedResults(title, api, dom, errors);
        } catch (error) {
            showNotification(`綜合匯出失敗：${error.message || String(error)}`, true, 6000);
        } finally {
            clearInterval(monitor);
            button.disabled = false;
            button.textContent = originalText;
        }
    }


    function createButton() {
        if (document.getElementById('chatgpt-export-fab-container')) return;

        const container = document.createElement('div');
        container.id = 'chatgpt-export-fab-container';
        Object.assign(container.style, {
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            zIndex: '2147483645',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: '15px'
        });

        const menu = document.createElement('div');
        Object.assign(menu.style, {
            display: 'flex',
            flexDirection: 'column',
            gap: '7px',
            padding: '8px',
            background: 'rgba(8,8,8,.88)',
            border: '1px solid rgba(255,255,255,.1)',
            borderRadius: '18px',
            boxShadow:
                '0 16px 40px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.04)',
            backdropFilter: 'blur(14px)',
            opacity: '0',
            transform: 'translateY(20px) scale(.9)',
            pointerEvents: 'none',
            transition: 'all .25s ease',
            transformOrigin: 'bottom right'
        });

        const commonStyle = {
            padding: '11px 16px',
            color: '#f5f5f5',
            background: 'linear-gradient(180deg, #1d1d1d 0%, #151515 100%)',
            border: '1px solid rgba(255,255,255,.12)',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: '650',
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
            letterSpacing: '.01em',
            textAlign: 'left',
            boxShadow:
                '0 4px 12px rgba(0,0,0,.28), inset 0 1px 0 rgba(255,255,255,.04)',
            whiteSpace: 'nowrap',
            fontSize: '14px',
            transition:
                'background .16s ease, border-color .16s ease, ' +
                'transform .16s ease, box-shadow .16s ease'
        };
        const makeButton = (text, handler) => {
            const button = document.createElement('button');
            button.textContent = text;
            Object.assign(button.style, commonStyle);
            button.addEventListener('mouseenter', () => {
                button.style.background =
                    'linear-gradient(180deg, #292929 0%, #202020 100%)';
                button.style.borderColor = 'rgba(255,255,255,.24)';
                button.style.transform = 'translateY(-1px)';
                button.style.boxShadow =
                    '0 7px 18px rgba(0,0,0,.38), ' +
                    'inset 0 1px 0 rgba(255,255,255,.07)';
            });
            button.addEventListener('mouseleave', () => {
                button.style.background =
                    'linear-gradient(180deg, #1d1d1d 0%, #151515 100%)';
                button.style.borderColor = 'rgba(255,255,255,.12)';
                button.style.transform = 'translateY(0)';
                button.style.boxShadow =
                    '0 4px 12px rgba(0,0,0,.28), ' +
                    'inset 0 1px 0 rgba(255,255,255,.04)';
            });
            button.addEventListener('mousedown', () => {
                button.style.background = '#0b0b0b';
                button.style.transform = 'translateY(0)';
            });
            button.addEventListener('mouseup', () => {
                button.style.background =
                    'linear-gradient(180deg, #292929 0%, #202020 100%)';
                button.style.transform = 'translateY(-1px)';
            });
            button.addEventListener('click', handler);
            return button;
        };

        const topButton = makeButton(
            '↑  到頂端',
            event => scrollToTop(event.currentTarget)
        );
        const apiButton = makeButton('API匯出', event => processApiExport(event.currentTarget));
        const combinedButton = makeButton('綜合匯出', event => processCombinedExport(event.currentTarget));
        const normalButton = makeButton('正常匯出', event => processAndExport({
            upWait: FAST_UPWARD_WAIT,
            step: FAST_SCROLL_STEP, baseWait: FAST_BASE_WAIT
        }, event.currentTarget));
        topButton.title = '只回到對話最頂端，不進行匯出';
        apiButton.title = '讀取個人對話 API；群聊請用正常匯出';
        combinedButton.title = '分別取得 API 與正常掃描結果並比較';
        normalButton.title = '從頂端捲動掃描畫面，不使用 API';
        menu.append(topButton, combinedButton, apiButton, normalButton);

        const fab = document.createElement('button');
        fab.innerHTML = `
            <svg viewBox="0 0 24 24" width="31" height="31"
                aria-hidden="true" focusable="false"
                style="display:block;pointer-events:none">
                <path fill="currentColor"
                    d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654 2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"/>
            </svg>`;
        fab.title = 'GYC - ChatGPT 1.2.2';
        fab.setAttribute('aria-label', '開啟 Grab Your Chat - ChatGPT 工具');
        Object.assign(fab.style, {
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,.18)',
            background: 'linear-gradient(180deg, #111 0%, #030303 100%)',
            color: '#fff',
            cursor: 'pointer',
            padding: '0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow:
                '0 8px 22px rgba(0,0,0,.48), inset 0 1px 0 rgba(255,255,255,.08)',
            transition:
                'transform .25s ease, border-color .16s ease, ' +
                'box-shadow .16s ease'
        });
        fab.addEventListener('mouseenter', () => {
            fab.style.borderColor = 'rgba(255,255,255,.38)';
            fab.style.boxShadow =
                '0 10px 28px rgba(0,0,0,.58), ' +
                'inset 0 1px 0 rgba(255,255,255,.12)';
        });
        fab.addEventListener('mouseleave', () => {
            fab.style.borderColor = 'rgba(255,255,255,.18)';
            fab.style.boxShadow =
                '0 8px 22px rgba(0,0,0,.48), ' +
                'inset 0 1px 0 rgba(255,255,255,.08)';
        });

        let open = false;
        fab.addEventListener('click', () => {
            open = !open;
            fab.style.transform = open ? 'rotate(45deg)' : 'rotate(0deg)';
            menu.style.opacity = open ? '1' : '0';
            menu.style.transform =
                open ? 'translateY(0) scale(1)' : 'translateY(20px) scale(.9)';
            menu.style.pointerEvents = open ? 'auto' : 'none';
        });

        container.append(menu, fab);
        document.body.appendChild(container);
    }

    const observer = new MutationObserver(createButton);
    observer.observe(document.documentElement, { childList: true, subtree: true });
    createButton();
})();
