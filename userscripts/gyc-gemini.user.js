// ==UserScript==
// @name         GYC - Gemini
// @namespace    https://github.com/ReaperTw/AZA-Agent-Chat-Archive
// @version      1.4.2
// @description  Grab Your Chat - Gemini 端對話匯出器；最後更新於 20261029
// @updateURL    https://raw.githubusercontent.com/ReaperTw/AZA-Agent-Chat-Archive/main/userscripts/gyc-gemini.user.js
// @downloadURL  https://raw.githubusercontent.com/ReaperTw/AZA-Agent-Chat-Archive/main/userscripts/gyc-gemini.user.js
// @match        https://gemini.google.com/*
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

        const text = String(message.comparisonBody ?? message.text ?? '');
        let prefix = 'GYC_CODE_';
        while (text.includes(prefix)) prefix += '_';

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
            .replace(new RegExp(`${prefix}BODY_(\\d+)_END`, 'g'), (_, index) => codeBodies[Number(index)]);
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

// --- Pure parsers and fetch helpers (Node + browser, for tests via injected fetchImpl) ---
// MIT reference style: original concise stdlib impl based on public Gemini batchexecute protocol (hNvQHb, SNlM0e, FdrFJe, cfb2h, [cid,limit,null,1,[1],[4],null,1] selector). Source: protocol facts from live probe evidence. No AGPL copy.

function sanitizeFileName(str) {
    if (!str) return "";
    let clean = str.replace(/[\r\n]+/g, ' ')
                   .replace(/[\\/:"*?<>|]+/g, '')
                   .replace(/\s+/g, '-')      // 空格轉減號
                   .replace(/-+/g, '-')       // 壓縮連續減號
                   .replace(/^-+|-+$/g, '');  // 移除頭尾減號
    return clean.substring(0, 60);
}

function getTimestamp() {
    const d = new Date();
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}` +
           `_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

function cleanContent(text) {
    return String(text || '').replace(/\r\n?/g, '\n').trim();
}

// Protocol fields verified against the user's hNvQHb response, not UI text.
function parseGeminiApiData(rawTurns) {
    if (!Array.isArray(rawTurns)) throw new Error('Gemini 回合格式已改變');
    const turns = [];
    const warnings = new Set();
    const seen = new Set();
    for (const turn of rawTurns.slice().reverse()) {
        if (!Array.isArray(turn)) { warnings.add('部分回合格式無法解析'); continue; }
        const id = turn[0]?.[1];
        if (id && seen.has(id)) continue;
        if (id) seen.add(id);
        const stamp = turn[4];
        const ms = Array.isArray(stamp) && Number.isFinite(stamp[0]) ? stamp[0] * 1000 + (stamp[1] || 0) / 1e6 : NaN;
        const timestamp = Number.isFinite(ms) ? new Date(ms) : null;
        const dateStr = timestamp && !Number.isNaN(timestamp.getTime()) ? timestamp.toLocaleString('zh-TW') : '';
        const user = turn[2]?.[0]?.[0];
        if (typeof user === 'string' && user.trim()) {
            turns.push({ type: 'user', text: cleanContent(user), timestamp, dateStr });
        } else {
            warnings.add('部分使用者訊息沒有文字，可能含未嵌入的附件');
            turns.push({ type: 'user', text: '> [非文字或空白使用者訊息；附件本體未嵌入]', timestamp, dateStr });
        }
        const candidates = Array.isArray(turn[3]?.[0]) ? turn[3][0] : [];
        const selectedId = turn[3]?.[3];
        const hasSelection = typeof selectedId === 'string' && selectedId.length > 0;
        const matched = hasSelection ? candidates.filter(candidate => candidate?.[0] === selectedId) : [];
        let selected;
        let isAlt = false;
        if (matched.length === 1) selected = matched;
        else if (!hasSelection && candidates.length === 1) selected = candidates;
        else {
            selected = candidates;
            isAlt = candidates.length > 1;
            warnings.add(candidates.length ? '無法確認目前回答，已保留可取得的候選回答' : '部分回合沒有回答正文，可能仍在生成');
        }
        const answers = selected.map((candidate, index) => {
            let text = candidate?.[1]?.[0];
            if (typeof text !== 'string' || !text.trim()) {
                text = '> [非文字或空白回答；本體未嵌入]';
                warnings.add('部分回答沒有文字正文');
            }
            return (isAlt ? `**候選回答 ${index + 1}（目前選取未確認）**\n\n` : '') + cleanContent(text);
        });
        if (answers.length) turns.push({ type: 'ai', text: answers.join('\n\n---\n\n'), timestamp, dateStr, isAlt });
    }
    return { turns, parseWarnings: [...warnings] };
}

function renderGeminiApiMarkdown(turns, warnings = []) {
    let out = '';
    let uIdx = 1;
    let mIdx = 1;
    for (const turn of turns) {
        // Gemini timestamps are per exchange: emit them on the user message only.
        if (turn.type === 'user' && turn.dateStr) out += `\n> **對話時間**：${turn.dateStr}\n`;
        if (turn.type === 'user') out += `\n--- [User ${uIdx++}] ---\n${turn.text}\n`;
        else out += `\n--- [Model ${mIdx++}] ---\n${turn.text}\n`;
    }
    if (warnings.length) out += `\n> **匯出注意事項**\n>\n${warnings.map(text => `> ${text}`).join('\n')}\n`;
    return out;
}

function parseGeminiRpc(text) {
    for (const line of text.replace(/^\)\]\}'\s*/, '').split('\n')) {
        if (!line.trim().startsWith('[')) continue;
        let frames;
        try { frames = JSON.parse(line); } catch { continue; }
        if (!Array.isArray(frames)) continue;
        for (const frame of frames) {
            if (frame?.[0] !== 'wrb.fr' || frame[1] !== 'hNvQHb') continue;
            if (typeof frame[2] !== 'string') throw new Error('Gemini 拒絕歷史讀取或對話不存在');
            const data = JSON.parse(frame[2]);
            if (!Array.isArray(data?.[0])) throw new Error('Gemini 歷史回應格式已改變');
            return data;
        }
    }
    throw new Error('Gemini RPC 回應無法解析');
}

async function geminiFetchHistory(cid, limit, tokens, authuser, fetchImpl = fetch) {
    if (!tokens?.SNlM0e || !tokens?.cfb2h) throw new Error('缺少 Gemini 登入資訊');
    const query = new URLSearchParams({
        rpcids: 'hNvQHb', 'source-path': authuser ? `/u/${authuser}/app` : '/app',
        bl: tokens.cfb2h, hl: 'en', _reqid: String(100000 + limit), rt: 'c', authuser: String(authuser || 0)
    });
    if (tokens.FdrFJe) query.set('f.sid', tokens.FdrFJe);
    const body = new URLSearchParams({
        at: tokens.SNlM0e,
        'f.req': JSON.stringify([[['hNvQHb', buildRpcRequest(cid, limit), null, 'generic']]])
    });
    const response = await fetchImpl('/_/BardChatUi/data/batchexecute?' + query, {
        method: 'POST', credentials: 'include', signal: AbortSignal.timeout(30000),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
        body: body.toString()
    });
    if (!response.ok) throw new Error(`Gemini API HTTP ${response.status}`);
    return parseGeminiRpc(await response.text());
}

async function collectGeminiHistory(cid, tokens, authuser, fetchImpl = fetch) {
    const collected = new Map();
    const warnings = [];
    let exhausted = false;
    // No verified cursor request slot: grow the known history-limit field.
    for (let limit = 100; ; limit = Math.min(10000, limit * 2)) {
        let data;
        try { data = await geminiFetchHistory(cid, limit, tokens, authuser, fetchImpl); }
        catch (error) {
            if (!collected.size) throw error;
            warnings.push('擴大歷史讀取時失敗，僅保留已取得的回合');
            break;
        }
        const previous = collected.size;
        for (const turn of data[0]) {
            const id = turn?.[0]?.[1];
            if (typeof id !== 'string' || !id) {
                warnings.push('部分回合缺少 ID，無法安全合併');
                continue;
            }
            collected.set(id, turn);
        }
        if (!data[1] && data[0].length < limit) { exhausted = true; break; }
        if (limit === 10000) { warnings.push('達到 10000 回合安全上限，無法確認全文'); break; }
        if (collected.size === previous) { warnings.push('伺服器沒有回傳更早回合，仍無法確認全文'); break; }
    }
    return { rawTurns: [...collected.values()], warnings, exhausted };
}

function getAuthParams() {
    if (typeof location === 'undefined') return { authuser: 0 };
    let authuser = 0;
    const url = location.href;
    let m = url.match(/\/u\/(\d+)\//);
    if (m) authuser = parseInt(m[1], 10);
    m = url.match(/[?&]authuser=(\d+)/);
    if (m) authuser = parseInt(m[1], 10);
    return { authuser };
}


function findCurrentConversationId() {
    const match = location.pathname.match(/^\/(?:u\/\d+\/)?app\/([0-9a-f]+)\/?$/i);
    return match ? `c_${match[1]}` : null;
}

function buildRpcRequest(cid, limit) {
    return JSON.stringify([cid, limit, null, 1, [1], [4], null, 1]);
}

    function integrateTranscripts(apiMessages, domMessages) {
        const comparison = compareTranscripts(apiMessages, domMessages);
        const entries = [];
        const progress = new Set((comparison.progress || []).map(item => item.apiIndex));
        let a = 0, d = 0, next = 0;
        while (a < apiMessages.length || d < domMessages.length) {
            if (progress.has(a + 1)) {
                entries.push({ kind: 'progress', apiIndex: ++a, domIndex: null, api: apiMessages[a - 1], dom: null });
                continue;
            }
            const difference = comparison.differences[next];
            if (difference && (difference.apiIndex === null || difference.apiIndex === a + 1) &&
                (difference.domIndex === null || difference.domIndex === d + 1)) {
                entries.push({ ...difference });
                if (difference.apiIndex !== null) a++;
                if (difference.domIndex !== null) d++;
                next++;
            } else {
                entries.push({ kind: 'match', apiIndex: ++a, domIndex: ++d,
                    api: apiMessages[a - 1], dom: domMessages[d - 1] });
            }
        }
        return { comparison, entries, counts: {
            matched: entries.filter(item => item.kind === 'match').length,
            conflicts: entries.filter(item => item.kind === 'text' || item.kind === 'role').length,
            apiOnly: entries.filter(item => item.kind === 'api-only').length,
            domOnly: entries.filter(item => item.kind === 'dom-only').length,
            progress: entries.filter(item => item.kind === 'progress').length
        } };
    }

    function buildIntegratedMarkdown(apiMessages, domMessages, { apiAvailable = true, domAvailable = true, notes = [] } = {}) {
        const result = integrateTranscripts(apiMessages, domMessages);
        let content = `> **匯出來源**：${[apiAvailable && 'API', domAvailable && 'DOM'].filter(Boolean).join(' + ')}（整合匯出）\n\n`;
        if (apiAvailable && domAvailable && result.comparison.differences.length) content += `> **正文差異**：${result.comparison.differences.length} 筆；單邊訊息及衝突版本均已保留，未自動覆蓋。\n\n`;
        if (!apiAvailable || !domAvailable) content += `> **來源取得失敗**：${apiAvailable ? 'DOM' : domAvailable ? 'API' : 'API、DOM'}。\n\n`;
        let users = 0, models = 0;
        const body = message => String(message?.text ?? '');
        const supplement = (message, source) => {
            if (!message) return '';
            const lines = [];
            const timestamp = message.createdAt || message.date || message.time;
            if (timestamp) lines.push(`> **${source} 時間**：${timestamp}`);
            if (message.note) lines.push(`**${source} 備註**\n\n${message.note}`);
            for (const [field, label] of [['citations', '引用'], ['attachments', '附件'], ['process', '處理狀態']]) {
                if (!Array.isArray(message[field]) || !message[field].length) continue;
                lines.push(`**${source} ${label}**\n\n\`\`\`json\n${JSON.stringify(message[field], null, 2)}\n\`\`\``);
            }
            return lines.length ? `\n\n${lines.join('\n\n')}` : '';
        };
        for (const entry of result.entries) {
            const primary = entry.api || entry.dom;
            const role = primary.role === 'user' ? `User ${++users}` : `Model ${++models}`;
            const sources = [entry.api && `API #${entry.apiIndex}`, entry.dom && `DOM #${entry.domIndex}`].filter(Boolean).join(' · ');
            content += `--- [${role}] ---\n> **訊息來源**：${sources}${entry.kind === 'progress' ? '（前進度）' : ''}\n\n`;
            if (entry.kind === 'text' || entry.kind === 'role') {
                content += `> **來源衝突：兩版均保留**${entry.kind === 'role' ? '（角色也不同）' : ''}\n\n`;
                content += `### API 版本（${entry.api.role}）\n\n${body(entry.api)}\n\n### DOM 版本（${entry.dom.role}）\n\n${body(entry.dom)}`;
            } else {
                content += body(primary);
                if (entry.api && entry.dom && body(entry.api) !== body(entry.dom)) {
                    content += `\n\n<details>\n<summary>DOM 原文（呈現正文相符）</summary>\n\n${body(entry.dom)}\n\n</details>`;
                }
            }
            content += supplement(entry.api, 'API') + supplement(entry.dom, 'DOM') + '\n\n';
        }
        if (notes.length) content += `## 來源紀錄\n\n${notes.map(note => `- ${note}`).join('\n')}\n`;
        return { ...result, compared: apiAvailable && domAvailable, content: content.trimEnd() + '\n' };
    }

    function showIntegratedDialog({ id, site, title, apiCount, domCount, integration, errors = {}, notes = [], report = '', onDownload, onApi, onDom, onReport }) {
        document.getElementById(id)?.remove();
        const overlay = document.createElement('div');
        overlay.id = id;
        overlay.dataset.gycIntegrated = '';
        const style = document.createElement('style');
        style.textContent = `
[data-gyc-integrated]{position:fixed!important;inset:0!important;z-index:2147483646!important;background:rgba(8,12,18,.62);backdrop-filter:blur(6px);display:grid;place-items:center;padding:20px;box-sizing:border-box;font:14px/1.55 system-ui,sans-serif;color-scheme:light dark;color:light-dark(#20262d,#e7edf3)}
[data-gyc-integrated] *{box-sizing:border-box}
[data-gyc-integrated] .gyc-panel{width:min(620px,100%);max-height:88vh;overflow:auto;border:1px solid light-dark(#dbe1e7,#34404c);border-radius:20px;background:light-dark(#fff,#171d25);box-shadow:0 24px 80px #0005;padding:28px}
[data-gyc-integrated] .gyc-heading{display:flex;justify-content:space-between;align-items:start;gap:20px}
[data-gyc-integrated] h2{font:600 23px/1.3 system-ui;margin:4px 0 8px;letter-spacing:-.4px;color:inherit}
[data-gyc-integrated] .gyc-eyebrow{font-size:11px;font-weight:700;letter-spacing:1.5px;color:light-dark(#667281,#98a6b7)}
[data-gyc-integrated] .gyc-title{margin:0 0 22px;color:light-dark(#667281,#a7b3c2);overflow-wrap:anywhere}
[data-gyc-integrated] button{font:600 13px/1.4 system-ui;border:1px solid light-dark(#d6dee7,#3b4757);border-radius:10px;background:transparent;color:inherit;padding:10px 14px;cursor:pointer;transition:background .15s}
[data-gyc-integrated] button:hover{background:light-dark(#edf2f7,#273240)}
[data-gyc-integrated] button:focus-visible,[data-gyc-integrated] summary:focus-visible{outline:3px solid #5b94ff;outline-offset:3px}
[data-gyc-integrated] .gyc-close{padding:4px 10px;font-size:20px;border:0}
[data-gyc-integrated] .gyc-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-bottom:18px}
[data-gyc-integrated] .gyc-stat{padding:14px 16px;border:1px solid light-dark(#e3e8ef,#303c4b);border-radius:12px;color:light-dark(#6b7785,#9eacbe)}
[data-gyc-integrated] .gyc-stat strong{display:block;color:light-dark(#20262d,#f0f4f8);font-size:26px;font-weight:600;line-height:1.4}
[data-gyc-integrated] .gyc-status{padding:14px 16px;border-radius:12px;background:light-dark(#eef8f1,#16372b);color:light-dark(#21663a,#a4e5bb);margin:0 0 18px}
[data-gyc-integrated] .gyc-warning{background:light-dark(#fff5e5,#423019);color:light-dark(#85500c,#f5cc8f)}
[data-gyc-integrated] .gyc-status strong{display:block;margin-bottom:3px}
[data-gyc-integrated] .gyc-actions{display:flex;flex-wrap:wrap;gap:8px;margin:20px 0 0}
[data-gyc-integrated] .gyc-primary{background:light-dark(#245bc4,#89b4ff);border-color:transparent;color:light-dark(#fff,#12233f)}
[data-gyc-integrated] .gyc-primary:hover{background:light-dark(#194cae,#a9c9ff)}
[data-gyc-integrated] details{border-top:1px solid light-dark(#e3e8ef,#303c4b);padding-top:14px;margin-top:16px}
[data-gyc-integrated] summary{cursor:pointer;font-weight:600}
[data-gyc-integrated] pre{font:12px/1.65 ui-monospace,monospace;white-space:pre-wrap;overflow-wrap:anywhere;margin:12px 0 0;max-height:240px;overflow:auto;color:inherit}
[data-gyc-integrated] .gyc-subtle{color:light-dark(#667281,#a7b3c2);font-size:12px;margin:12px 0 0}
@media(max-width:480px){[data-gyc-integrated]{padding:12px}[data-gyc-integrated] .gyc-panel{padding:20px}[data-gyc-integrated] .gyc-stat{padding:10px}[data-gyc-integrated] .gyc-stat strong{font-size:22px}[data-gyc-integrated] .gyc-actions>button{flex:1 1 auto}}
`;
        const el = (tag, className, text) => {
            const node = document.createElement(tag);
            if (className) node.className = className;
            if (text !== undefined) node.textContent = text;
            return node;
        };
        const panel = el('section', 'gyc-panel');
        panel.setAttribute('role', 'dialog');
        panel.setAttribute('aria-modal', 'true');
        panel.setAttribute('aria-label', '整合匯出結果');
        const previousFocus = document.activeElement;
        const close = () => { overlay.remove(); previousFocus?.focus?.(); };
        const top = el('div', 'gyc-heading');
        const heading = el('div');
        heading.append(el('div', 'gyc-eyebrow', `GRAB YOUR CHAT / ${site}`), el('h2', '', '對話已整合'));
        const closeButton = el('button', 'gyc-close', '×');
        closeButton.setAttribute('aria-label', '關閉整合匯出結果');
        closeButton.onclick = close;
        top.append(heading, closeButton);
        panel.append(top, el('p', 'gyc-title', title));
        const stats = el('div', 'gyc-stats');
        for (const [label, value] of [['API 訊息', apiCount ?? '—'], ['頁面訊息', domCount ?? '—'], ['整合訊息', integration.entries.length]]) {
            const stat = el('div', 'gyc-stat', label);
            stat.append(el('strong', '', String(value)));
            stats.append(stat);
        }
        panel.append(stats);
        const unavailable = apiCount === null || domCount === null;
        const differences = integration.compared ? integration.comparison.differences : [];
        const status = el('div', `gyc-status${differences.length || unavailable ? ' gyc-warning' : ''}`);
        if (differences.length || unavailable) status.setAttribute('role', 'alert');
        const statusTitle = unavailable ? '有來源取得失敗' : differences.length ? `發現 ${differences.length} 筆正文差異` : '兩個來源的正文相符';
        status.append(el('strong', '', statusTitle));
        status.append(el('span', '', unavailable ? '請查看下方各來源的實際錯誤。' : differences.length ? '單邊訊息已補入；衝突保留 API 與頁面兩版，不自動覆蓋。' : '相同訊息已合併，來源原文與補充資料一併保留。'));
        panel.append(status);
        if (!integration.entries.length) heading.lastChild.textContent = '未取得可匯出訊息';
        if (integration.counts.progress) panel.append(el('p', 'gyc-subtle', `另保留 ${integration.counts.progress} 則 API 前進度訊息。`));
        if (Object.keys(errors).length) panel.append(el('pre', '', Object.entries(errors).map(([key, value]) => `${key.toUpperCase()}：${value}`).join('\n')));
        const disclosure = (label, text, open = false) => {
            const details = el('details');
            details.open = open;
            details.append(el('summary', '', label), el('pre', '', text));
            panel.append(details);
            return details;
        };
        if (differences.length) {
            const text = differences.map((item, index) => {
                const side = (name, message, pos) => message ? `${name} #${pos} (${message.role})\n${prepareComparisonMessage(message, name === 'API' ? 'api' : 'dom').body}` : `${name}：沒有此訊息`;
                return `差異 ${index + 1}\n${side('API', item.api, item.apiIndex)}\n\n${side('DOM', item.dom, item.domIndex)}`;
            }).join('\n\n────────────────────\n\n');
            disclosure('查看正文差異', text, true);
        }
        if (notes.length || report) disclosure('來源紀錄與補充資料', [...notes, report].filter(Boolean).join('\n\n'));
        const actions = el('div', 'gyc-actions');
        const add = (label, action, primary = false, target = actions) => {
            if (!action) return;
            const button = el('button', primary ? 'gyc-primary' : '', label);
            button.onclick = action;
            target.append(button);
        };
        if (integration.entries.length) add('下載整合 Markdown', onDownload, true);
        add('下載比對報告', onReport);
        panel.append(actions);
        if (onApi || onDom) {
            const originals = disclosure('另存個別來源', '');
            originals.lastChild.remove();
            const row = el('div', 'gyc-actions');
            add('API 原始匯出', onApi, false, row);
            add('頁面原始匯出', onDom, false, row);
            originals.append(row);
        }
        overlay.append(style, panel);
        overlay.addEventListener('click', event => { if (event.target === overlay) close(); });
        overlay.addEventListener('keydown', event => {
            if (event.key === 'Escape') { event.preventDefault(); close(); }
            if (event.key !== 'Tab') return;
            const focusable = [...panel.querySelectorAll('button,summary')].filter(node => node.getClientRects().length);
            const first = focusable[0], last = focusable[focusable.length - 1];
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
            else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
        });
        document.body.append(overlay);
        (actions.querySelector('button') || closeButton).focus({ preventScroll: true });
    }

    function styleExportTools(container) {
        const fab = container.querySelector('button[aria-label*="Grab Your Chat"]');
        if (!fab) return;
        fab.textContent = '匯出';
        const style = document.createElement('style');
        style.textContent = `#${container.id} button{font-family:system-ui,sans-serif!important;font-size:13px!important;font-weight:600!important;border-radius:10px!important;border:1px solid #71809655!important;box-shadow:0 4px 16px #0002!important}#${container.id} button[aria-label*="Grab Your Chat"]{width:66px!important;height:42px!important;font-size:14px!important;background:#202b3c!important;color:#f5f8ff!important;transform:none!important}#${container.id} button:not([aria-label*="Grab Your Chat"]){background:#202b3c!important;color:#f5f8ff!important;padding:10px 15px!important}#${container.id} button:focus-visible{outline:3px solid #89b4ff!important;outline-offset:3px}#${container.id} button:disabled{opacity:.65!important;cursor:wait!important}`;
        container.append(style);
    }

// Browser-only code guarded
if (typeof document !== 'undefined') {
    (function() {
        'use strict';

        // --- 參數設定 ---
        const MAX_UPWARD_LOOPS = 80;   // 向上滾動最大次數


        // 【滿速保險模式參數】
        const FAST_UPWARD_WAIT = 800;
        const FAST_SCROLL_STEP = 3000;
        const FAST_BASE_WAIT = 500;

        // --- 工具函式 (reused) ---
        function findScrollContainer() {
            let target = document.querySelector('infinite-scroller.chat-history') ||
                         document.querySelector('infinite-scroller');
            return target || document.documentElement;
        }

        function determineTitle() {
             try {
                let selectedItem = document.querySelector('mat-sidenav [aria-current="page"] .mdc-list-item__primary-text') ||
                                   document.querySelector('mat-sidenav .gds-nav-item-selected') ||
                                   document.querySelector('.gds-sidenav-list [aria-current="page"]');
                if (!selectedItem) {
                    const activeMenuBtn = document.querySelector('button.gem-conversation-actions-menu-button');
                    if (activeMenuBtn && activeMenuBtn.closest('.mat-mdc-list-item')) {
                        selectedItem = activeMenuBtn.closest('.mat-mdc-list-item');
                    }
                }
                if (selectedItem) {
                    return sanitizeFileName(selectedItem.innerText.split('\n')[0].trim());
                }
            } catch (e) {
                console.error("Exporter: 擷取標題失敗", e);
            }
            return "Gemini-Chat";
        }

        // --- 自訂 UI 通知與輸入框 (取代 alert 與 prompt) ---
        function showNotification(message, isError = false) {
            document.getElementById('gemini-export-toast')?.remove();
            const toast = document.createElement('div');
            toast.id = 'gemini-export-toast';
            Object.assign(toast.style, {
                position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
                background: isError ? '#d93025' : '#3c4043', color: '#fff',
                padding: '12px 24px', borderRadius: '8px', zIndex: '2147483647',
                boxShadow: '0 4px 10px rgba(0,0,0,.3)', fontSize: '14px',
                fontWeight: 'bold', maxWidth: '80vw', whiteSpace: 'pre-line'
            });
            toast.textContent = message;
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
        }

        function showSaveModal(defaultTitle, textContent, report, onSave) {
            document.getElementById('gemini-export-modal')?.remove();
            const overlay = document.createElement('div');
            overlay.id = 'gemini-export-modal';
            Object.assign(overlay.style, {
                position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                background: 'rgba(0,0,0,0.6)', zIndex: '2147483646',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            });
            const modal = document.createElement('div');
            Object.assign(modal.style, {
                background: '#202124', color: '#e8eaed', padding: '24px', borderRadius: '12px',
                width: 'min(90vw, 520px)', boxShadow: '0 8px 30px rgba(0,0,0,.4)',
                fontFamily: 'system-ui, -apple-system, sans-serif'
            });
            const heading = document.createElement('div');
            heading.textContent = `${report.heading || '掃描完成'}：${report.messageCount} 則訊息／${textContent.length} 字`;
            Object.assign(heading.style, { fontSize: '18px', fontWeight: '600', marginBottom: '12px' });
            const status = document.createElement('div');
            status.textContent = [report.status, report.warning].filter(Boolean).join('\n') || '未發現匯出警告';
            Object.assign(status.style, {
                padding: '9px 11px', borderRadius: '6px', fontSize: '13px',
                background: report.warning ? 'rgba(245,158,11,.13)' : 'rgba(255,255,255,.055)',
                color: report.warning ? '#fbbf24' : '#c8c8c8',
                border: report.warning ? '1px solid rgba(245,158,11,.3)' : '1px solid rgba(255,255,255,.09)',
                whiteSpace: 'pre-line', marginBottom: '14px'
            });
            const inputLabel = document.createElement('label');
            inputLabel.textContent = '檔案名稱（不含副檔名）';
            inputLabel.htmlFor = 'gemini-export-filename';
            Object.assign(inputLabel.style, { fontSize: '13px', marginBottom: '6px', opacity: '0.8', display: 'block' });
            const input = document.createElement('input');
            input.id = 'gemini-export-filename';
            input.type = 'text';
            input.value = defaultTitle;
            Object.assign(input.style, {
                width: '100%', padding: '10px 12px', fontSize: '15px',
                border: '1px solid #5f6368', borderRadius: '8px', background: '#303134',
                color: '#e8eaed', marginBottom: '20px', boxSizing: 'border-box'
            });
            const btnContainer = document.createElement('div');
            Object.assign(btnContainer.style, { display: 'flex', justifyContent: 'flex-end', gap: '10px' });
            const cancelBtn = document.createElement('button');
            cancelBtn.textContent = '取消';
            Object.assign(cancelBtn.style, {
                padding: '8px 18px', background: '#3c4043', color: '#e8eaed',
                border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px'
            });
            const saveBtn = document.createElement('button');
            saveBtn.textContent = '儲存 .md';
            Object.assign(saveBtn.style, {
                padding: '8px 18px', background: '#8ab4f8', color: '#202124',
                border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px'
            });
            btnContainer.appendChild(cancelBtn);
            btnContainer.appendChild(saveBtn);
            modal.appendChild(heading);
            modal.appendChild(status);
            modal.appendChild(inputLabel);
            modal.appendChild(input);
            modal.appendChild(btnContainer);
            overlay.appendChild(modal);
            document.body.appendChild(overlay);
            input.focus();
            input.select();
            cancelBtn.onclick = () => overlay.remove();
            saveBtn.onclick = () => {
                onSave(input.value.trim() || 'Untitled');
                overlay.remove();
            };
            input.addEventListener('keydown', event => {
                if (event.key === 'Enter') saveBtn.click();
                if (event.key === 'Escape') overlay.remove();
            });
            overlay.onclick = event => {
                if (event.target === overlay) overlay.remove();
            };
        }

        function sameTurn(a, b, allowGrow) {
            if (a.type !== b.type) return false;
            if (a.text === b.text) return true;
            return allowGrow && (a.text.includes(b.text) || b.text.includes(a.text));
        }

        function mergeTimelines(master, fragment) {
            if (master.length === 0) return { merged: fragment, hasGap: false };
            if (fragment.length === 0) return { merged: master, hasGap: false };
            for (let overlapLength = Math.min(master.length, fragment.length); overlapLength > 0; overlapLength--) {
                let isMatch = true;
                for (let i = 0; i < overlapLength; i++) {
                    if (!sameTurn(master[master.length - overlapLength + i], fragment[i], i === overlapLength - 1)) {
                        isMatch = false;
                        break;
                    }
                }
                if (isMatch) {
                    for (let i = 0; i < overlapLength; i++) {
                        if (fragment[i].text.length > master[master.length - overlapLength + i].text.length) {
                            master[master.length - overlapLength + i].text = fragment[i].text;
                        }
                    }
                    return { merged: master.concat(fragment.slice(overlapLength)), hasGap: false };
                }
            }
            return { merged: master, hasGap: true };
        }

        function collectTurns(scroller) {
            const specific = Array.from(scroller.querySelectorAll('.user-query-bubble-with-background, .model-response, model-response'));
            const nodes = specific.length
                ? specific
                : Array.from(scroller.querySelectorAll('.response-container'));
            return nodes
                .filter(node => !nodes.some(other => other !== node && other.contains(node)))
                .map(node => {
                    const user = node.classList.contains('user-query-bubble-with-background');
                    const lines = user ? [...node.querySelectorAll('.query-text-line')] : [];
                    const body = user ? node : node.querySelector('message-content .markdown, .markdown') || node;
                    return { type: user ? 'user' : 'ai', text: cleanContent(lines.length ? lines.map(line => line.innerText).join('\n') : body.innerText || '') };
                })
                .filter(turn => turn.text);
        }

        async function scrollToTop(btn) {
            if (!btn) return;
            btn.disabled = true;
            const originalText = btn.innerText;
            try {
                btn.innerText = '⬆️ 狂奔至頂端中...';
                const scroller = findScrollContainer();
                let stagnantCount = 0;
                for (let i = 0; i < MAX_UPWARD_LOOPS; i++) {
                    const pre = scroller.scrollHeight;
                    scroller.scrollTop = 0;
                    await new Promise(r => setTimeout(r, FAST_UPWARD_WAIT));
                    if (scroller.scrollHeight <= pre) {
                        stagnantCount++;
                        if (stagnantCount >= 3) break;
                    } else {
                        stagnantCount = 0;
                    }
                }
                btn.innerText = '✅ 已達最頂端';
            } finally {
                setTimeout(() => {
                    btn.disabled = false;
                    btn.innerText = originalText;
                }, 2000);
            }
        }

        // Shared download helper (extracted for reuse in DOM + API paths)
        function performDownload(finalTitle, content, method, filenameKind = method) {
            const marked = filenameKind === 'COMBINED' ? content.replace(/^\uFEFF/, '')
                : `> **匯出來源**：${method}\n\n${content.replace(/^\uFEFF/, '')}`;
            const blob = new Blob(['\uFEFF' + marked], { type: 'text/markdown;charset=utf-8' });
            const anchor = document.createElement('a');
            const url = URL.createObjectURL(blob);
            anchor.href = url;
            anchor.download = filenameKind === method
                ? `GEM_${method}_${sanitizeFileName(finalTitle)}_${getTimestamp()}.md`
                : `GEM_${sanitizeFileName(finalTitle)}_${getTimestamp()}_${filenameKind}.md`;
            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        }

        async function processAndExport(config, btn, captureOnly = false) {
            if (!btn) return;
            btn.disabled = true;
            const originalText = btn.innerText;
            const warnings = [];
            try {
                const scroller = findScrollContainer();
                {
                    btn.innerText = '定位起點...';
                    let stagnantCount = 0;
                    for (let i = 0; i < MAX_UPWARD_LOOPS; i++) {
                        const pre = scroller.scrollHeight;
                        scroller.scrollTop = 0;
                        await new Promise(r => setTimeout(r, config.upWait));
                        config.checkScope?.();
                        if (scroller.scrollHeight <= pre) {
                            stagnantCount++;
                            if (stagnantCount >= 3) break;
                        } else {
                            stagnantCount = 0;
                        }
                    }
                    scroller.scrollTop = 0;
                }

                let timeline = collectTurns(scroller);
                const step = Math.max(1, Math.min(config.step || 800, Math.floor((scroller.clientHeight || window.innerHeight || 800) / 2)));
                const estimated = Math.ceil((scroller.scrollHeight || 1) / step);
                const maxPasses = Math.min(5000, Math.max(100, estimated * 4 + 50));
                let bottomStable = 0;
                let retryCount = 0;
                for (let pass = 0; pass < maxPasses; pass++) {
                    config.checkScope?.();
                    const before = scroller.scrollTop;
                    const maxTop = Math.max(0, scroller.scrollHeight - scroller.clientHeight);
                    scroller.scrollTop = Math.min(maxTop, before + step);
                    await new Promise(r => setTimeout(r, config.baseWait));
                    const fragment = collectTurns(scroller);
                    const merged = mergeTimelines(timeline, fragment);
                    if (merged.hasGap && fragment.length && timeline.length) {
                        retryCount++;
                        if (retryCount <= 3) {
                            scroller.scrollTop = Math.max(0, scroller.scrollTop - step * 0.5);
                            await new Promise(r => setTimeout(r, Math.max(1000, config.baseWait * 2)));
                            continue;
                        }
                        warnings.push('掃描斷層，前後訊息可能不連續');
                        timeline = timeline.concat(
                            [{ type: 'gap', text: '⚠️ 此處掃描斷層，前後訊息可能不連續' }],
                            fragment
                        );
                        retryCount = 0;
                    } else {
                        timeline = merged.merged;
                        retryCount = 0;
                    }
                    const atBottom = scroller.scrollHeight - scroller.clientHeight - scroller.scrollTop <= 5;
                    if (atBottom && Math.abs(scroller.scrollTop - before) < 5) bottomStable++;
                    else bottomStable = 0;
                    const percent = maxTop > 0 ? Math.min(100, Math.round(scroller.scrollTop / maxTop * 100)) : 100;
                    btn.innerText = `掃描 ${percent}%｜已存 ${timeline.filter(turn => turn.type !== 'gap').length} 則`;
                    if (bottomStable >= 2) break;
                    if (pass === maxPasses - 1) warnings.push(`達到安全迴圈上限 ${maxPasses}`);
                }

                config.checkScope?.();
                if (!timeline.some(turn => turn.type !== 'gap' && turn.text)) {
                    throw new Error('DOM 未找到任何對話內容');
                }

                const exportTurns = timeline.filter(turn => turn.type !== 'gap' && turn.text);
                const out = renderGeminiApiMarkdown(exportTurns, warnings);
                if (captureOnly) return { turns: exportTurns, warnings, out };
                let title = determineTitle();
                if (warnings.length) title += '_INCOMPLETE';
                showSaveModal(title, out, {
                    heading: '掃描完成',
                    messageCount: exportTurns.length,
                    warning: warnings.length ? `⚠️ ${warnings.join('\n')}` : '',
                    status: warnings.length ? '' : '未發現掃描斷層'
                }, finalTitle => performDownload(finalTitle, out, 'DOM'));
            } catch (error) {
                if (captureOnly) throw error;
                console.error('[Gemini Exporter] 匯出失敗', error);
                showNotification(`❌ 匯出失敗：${error.message}`, true);
            } finally {
                if (!captureOnly) {
                    btn.disabled = false;
                    btn.innerText = originalText;
                }
            }
        }

        // API export for API button: protocol-based, no raw log, warnings in body + _INCOMPLETE, no silent fallback
        async function exportViaApi(btn, captureOnly = false) {
            if (!btn) return;
            btn.disabled = true;
            const originalText = btn.innerText;
            btn.innerText = 'API 擷取中...';
            const warnings = [];
            try {
                const { authuser } = getAuthParams();
                const app = await fetch(authuser ? `/u/${authuser}/app` : '/app', { credentials: 'include', signal: AbortSignal.timeout(30000) });
                if (!app.ok) throw new Error(`Gemini 登入頁 HTTP ${app.status}`);
                const html = await app.text();
                const getToken = key => html.match(new RegExp('"' + key + '":"([^"\\\\]+)"'))?.[1] || '';
                const tokens = { SNlM0e: getToken('SNlM0e'), cfb2h: getToken('cfb2h'), FdrFJe: getToken('FdrFJe') };
                if (!tokens.SNlM0e) {
                    throw new Error('無法取得 SNlM0e token，請重新整理頁面後再試');
                }
                const cid = findCurrentConversationId();
                if (!cid) {
                    throw new Error('無法取得目前對話 cid，請用正常匯出');
                }
                const history = await collectGeminiHistory(cid, tokens, authuser);
                const allRawTurns = history.rawTurns;
                const exhausted = history.exhausted;
                warnings.push(...history.warnings);
                if (allRawTurns.length === 0) {
                    throw new Error('未取得任何對話資料');
                }
                const parseRes = parseGeminiApiData(allRawTurns);
                warnings.push(...parseRes.parseWarnings);
                const parsedTurns = parseRes.turns;
                if (captureOnly) return { turns: parsedTurns, warnings, out: renderGeminiApiMarkdown(parsedTurns, warnings), exhausted };
                let title = determineTitle();
                const hadIssue = warnings.length > 0 || !exhausted;
                if (hadIssue) {
                    if (warnings.length === 0) warnings.push('API 尚未確認歷史已讀取完畢');
                    title += '_INCOMPLETE';
                }
                const finalOutput = renderGeminiApiMarkdown(parsedTurns, warnings);
                showSaveModal(title, finalOutput, {
                    heading: 'API 讀取完成',
                    messageCount: parsedTurns.length,
                    warning: warnings.length ? `⚠️ ${warnings.join('\n')}` : '',
                    status: exhausted ? 'API 已回報無後續歷史；內容疑慮會另外列出。' : 'API 歷史可能尚未完整'
                }, finalTitle => performDownload(finalTitle, finalOutput, 'API'));
            } catch (error) {
                if (captureOnly) throw error;
                showNotification(`❌ API匯出失敗：${error.message}。可改用正常匯出。`, true);
            } finally {
                if (!captureOnly) {
                    btn.disabled = false;
                    btn.innerText = originalText;
                }
            }
        }

        function showCombinedResults(title, api, dom, errors) {
            const toMessages = result => result.turns.map(turn => ({ ...turn, role: turn.type === 'user' ? 'user' : 'assistant', text: turn.text, date: turn.dateStr || turn.date || turn.createdAt }));
            const apiMessages = api ? toMessages(api) : [];
            const domMessages = dom ? toMessages(dom) : [];
            const integration = buildIntegratedMarkdown(apiMessages, domMessages, {
                apiAvailable: Boolean(api), domAvailable: Boolean(dom),
                notes: [...(api?.warnings || []).map(note => `API：${note}`), ...(dom?.warnings || []).map(note => `DOM：${note}`)]
            });
            const comparison = integration.comparison;
            const formatDifference = difference => {
                const labels = { text: '文字不同', role: '角色不同', 'api-only': '僅 API 有此訊息', 'dom-only': '僅 DOM 有此訊息' };
                const side = (label, index, message) => message ? `${label} #${index} (${message.role})：\n${prepareComparisonMessage(message, label.toLowerCase()).body}` : `${label}：無`;
                return `${labels[difference.kind]}\n${side('API', difference.apiIndex, difference.api)}\n\n${side('DOM', difference.domIndex, difference.dom)}`;
            };
            const summary = [
                `API：${api ? apiMessages.length + ' 則' : '失敗：' + errors.api}`,
                `DOM：${dom ? domMessages.length + ' 則' : '失敗：' + errors.dom}`,
                integration.compared ? (comparison.match ? '角色、順序與呈現正文相符' : `正文差異：${comparison.differences.length} 筆\n\n第一筆差異：\n${formatDifference(comparison.differences[0])}`) : '未進行比對',
                '引用：API 未知 項／DOM 未知 項；附件：API 未知 項／DOM 未知 項（另列報告）',
                ...[...(api?.warnings || []).map(w => `API：${w}`), ...(dom?.warnings || []).map(w => `DOM：${w}`)]
            ].join('\n');
            const report = summary + (integration.compared && comparison.differences.length ? '\n\n' + comparison.differences.map(formatDifference).join('\n\n--------------------\n\n') : '') + '\n';
            showIntegratedDialog({
                id: 'gemini-export-modal', site: 'Gemini', title,
                apiCount: api ? apiMessages.length : null, domCount: dom ? domMessages.length : null,
                integration, errors, report,
                onDownload: () => performDownload(title, integration.content, '整合匯出', 'COMBINED'),
                onApi: api && (() => performDownload(title, api.out, 'API')),
                onDom: dom && (() => performDownload(title, dom.out, 'DOM')),
                onReport: () => performDownload(title, report, '比對報告', 'DIFFERENCES')
            });
        }

        async function exportCombined(btn) {
            if (!btn || btn.disabled) return;
            const originalText = btn.innerText;
            const scope = location.href;
            const title = determineTitle();
            let changed = false;
            const monitor = setInterval(() => { if (location.href !== scope) changed = true; }, 100);
            const checkScope = () => {
                if (changed || location.href !== scope) throw new Error('收集期間對話網址已變更，無法比對不同對話');
            };
            let api = null, dom = null;
            const errors = {};
            btn.disabled = true;
            try {
                try {
                    api = await exportViaApi(btn, true);
                    checkScope();
                } catch (error) { api = null; errors.api = error.message || String(error); }
                try {
                    checkScope();
                    dom = await processAndExport({ upWait: FAST_UPWARD_WAIT, step: FAST_SCROLL_STEP, baseWait: FAST_BASE_WAIT, checkScope }, btn, true);
                    checkScope();
                } catch (error) { dom = null; errors.dom = error.message || String(error); }
                showCombinedResults(title, api, dom, errors);
            } finally {
                clearInterval(monitor);
                btn.disabled = false;
                btn.innerText = originalText;
            }
        }

        function createButton() {
            if (document.getElementById('gemini-export-fab-container')) return;

            const oldContainer = document.getElementById('gemini-export-container');
            if (oldContainer) oldContainer.remove();

            const container = document.createElement('div');
            container.id = 'gemini-export-fab-container';
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
                button.addEventListener('click', () => handler(button));
                return button;
            };

            const btnTop = makeButton(
                '↑  到頂端',
                button => scrollToTop(button)
            );
            const apiButton = makeButton('API匯出', button => exportViaApi(button));
            const combinedButton = makeButton('綜合匯出', button => exportCombined(button));
            const normalButton = makeButton('正常匯出', button => processAndExport({
                upWait: FAST_UPWARD_WAIT,
                step: FAST_SCROLL_STEP, baseWait: FAST_BASE_WAIT
            }, button));
            btnTop.title = '只回到對話最頂端，不進行匯出';
            apiButton.title = '讀取 Gemini API 歷史；未確認全文時會警告';
            normalButton.title = '從頂端捲動掃描畫面，不使用 API';
            combinedButton.title = '獨立收集 API 與畫面並比對正文';
            combinedButton.style.background = 'linear-gradient(180deg, #316aca, #204994)';
            menu.append(combinedButton, apiButton, normalButton, btnTop);

            const fab = document.createElement('button');
            fab.textContent = '✦';
        fab.title = "GYC - Gemini - v1.4.2";
            fab.setAttribute('aria-label', '開啟 Grab Your Chat - Gemini 工具');
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
                fontSize: '30px',
                lineHeight: '1',
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
            styleExportTools(container);
        }

        const observer = new MutationObserver(() => createButton());
        observer.observe(document.body, { childList: true, subtree: true });
        createButton();
    })();
}

// Node module.exports for pure parsers/fetch helpers (consumer edge cases use injected RPC/fetch)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        compareTranscripts,
        prepareComparisonMessage,
        renderGeminiApiMarkdown,
        parseGeminiApiData,
        parseGeminiRpc,
        geminiFetchHistory,
        collectGeminiHistory,
        cleanContent,
        sanitizeFileName,
        integrateTranscripts,
        buildIntegratedMarkdown,
    };
}
})();
