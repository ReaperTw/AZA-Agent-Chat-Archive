// ==UserScript==
// @name         GYC - Claude
// @namespace    https://github.com/ReaperTw/AZA-Agent-Chat-Archive
// @version      1.4.4
// @description  Grab Your Chat - Claude 端對話匯出器；最後更新於 20261031
// @updateURL    https://raw.githubusercontent.com/ReaperTw/AZA-Agent-Chat-Archive/main/userscripts/gyc-claude.user.js
// @downloadURL  https://raw.githubusercontent.com/ReaperTw/AZA-Agent-Chat-Archive/main/userscripts/gyc-claude.user.js
// @match        https://claude.ai/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function (root) {
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
        const citations = (message.citations ?? []).slice();
        const attachments = (message.attachments ?? []).slice();
        const normalizeLiteral = text => String(text ?? '').replace(/\r\n?/g, '\n').replace(/\u00a0/g, ' ').trim();
        const normalize = text => normalizeLiteral(text).replace(/[ \t]+\n/g, '\n').replace(/\n(?:[ \t]*\n)+/g, '\n');
        if (message.role === 'user') {
            return { body: normalizeLiteral(message.comparisonBody ?? message.text), citations: message.citations ?? null, attachments: message.attachments ?? null };
        }
        if (source === 'dom') {
            let body = normalize(message.comparisonBody ?? message.text);
            for (const [index, value] of (message.comparisonCode?.values ?? []).entries()) {
                body = body.replaceAll(`${message.comparisonCode.prefix}${index}_END`, value);
            }
            return { body, citations: message.citations ?? null, attachments: message.attachments ?? null };
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
        return { body, citations: message.citations == null && !citations.length ? null : citations,
            attachments: message.attachments == null && !attachments.length ? null : attachments };
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
        if (notes.length) content += notes.map(note => `> **來源提醒**：${note}\n\n`).join('');
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
            content += `--- [${role}] ---\n`;
            if (entry.kind !== 'match') content += `> **訊息來源**：${sources}${entry.kind === 'progress' ? '（前進度）' : ''}\n`;
            content += '\n';
            if (entry.kind === 'text' || entry.kind === 'role') {
                content += `> **來源衝突：兩版均保留**${entry.kind === 'role' ? '（角色也不同）' : ''}\n\n`;
                content += `### API 版本（${entry.api.role}）\n\n${body(entry.api)}\n\n### DOM 版本（${entry.dom.role}）\n\n${body(entry.dom)}`;
            } else {
                content += body(primary);
            }
            content += supplement(entry.api, 'API') + supplement(entry.dom, 'DOM') + '\n\n';
        }
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
        status.append(el('span', '', unavailable ? '請查看下方各來源的實際錯誤。' : differences.length ? '單邊訊息已補入；衝突保留 API 與頁面兩版，不自動覆蓋。' : '相同訊息只保留一份正文；各來源原文可另存。'));
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
        const style = document.createElement('style');
        style.textContent = `#${container.id} button:not([aria-label*="Grab Your Chat"]){font-family:system-ui,sans-serif!important;font-size:13px!important;font-weight:600!important;border-radius:10px!important;border:1px solid #71809655!important;box-shadow:0 4px 16px #0002!important;background:#202b3c!important;color:#f5f8ff!important;padding:10px 15px!important}#${container.id} button:focus-visible{outline:3px solid #89b4ff!important;outline-offset:3px}#${container.id} button:disabled{opacity:.65!important;cursor:wait!important}`;
        container.append(style);
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

    function sanitizeFileName(str) {
        if (!str) return '';
        return String(str).replace(/[\r\n]+/g, ' ')
            .replace(/[\\/:"*?<>|]+/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-+|-+$/g, '')
            .substring(0, 60);
    }

    function getTimestamp(date = new Date()) {
        const pad = n => String(n).padStart(2, '0');
        return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}` +
            `_${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
    }

    function buildDownloadName(title, timestamp) {
        return `CLD_API_${sanitizeFileName(title) || 'Claude-Chat'}_${timestamp}.md`;
    }

    function readCookie(cookie, name) {
        const match = String(cookie || '').match(
            new RegExp('(?:^|;\\s*)' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '=([^;]*)')
        );
        if (!match) return '';
        try {
            return decodeURIComponent(match[1]);
        } catch (error) {
            return match[1];
        }
    }

    function conversationIdFromPath(pathname) {
        const parts = String(pathname || '').split('/').filter(Boolean);
        for (let i = parts.length - 1; i >= 0; i--) {
            let part = parts[i];
            try {
                part = decodeURIComponent(part);
            } catch (error) {
                // keep the raw segment
            }
            if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(part)) {
                return part;
            }
        }
        return '';
    }

    function cleanContent(text) {
        if (!text) return '';
        return String(text).replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
    }

    function formatChatTime(iso) {
        const date = new Date(iso);
        if (Number.isNaN(date.getTime())) return '';
        const parts = new Intl.DateTimeFormat('zh-TW', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        }).formatToParts(date);
        const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
        if (!values.year || !values.month || !values.day || !values.hour || !values.minute) return '';
        return `${values.year}年${String(values.month).replace('月', '')}月${values.day}日 於 ` +
            `${values.dayPeriod || ''}${values.hour}:${values.minute}`;
    }

    function dayKey(iso) {
        const date = new Date(iso);
        if (Number.isNaN(date.getTime())) return '';
        return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    }

    function orderCurrentBranch(data, warnings) {
        const all = Array.isArray(data?.chat_messages) ? data.chat_messages : [];
        const byUuid = new Map();
        for (const message of all) {
            if (message?.uuid) byUuid.set(message.uuid, message);
        }

        const leafId = data?.current_leaf_message_uuid;
        if (leafId && byUuid.has(leafId)) {
            const path = [];
            const seen = new Set();
            let current = byUuid.get(leafId);
            let broken = false;
            while (current) {
                if (seen.has(current.uuid)) {
                    broken = true;
                    break;
                }
                seen.add(current.uuid);
                path.push(current);
                const parentId = current.parent_message_uuid;
                // Claude uses a synthetic root UUID; it is not a missing message.
                if (!parentId || parentId === '00000000-0000-4000-8000-000000000000') break;
                const parent = byUuid.get(parentId);
                if (!parent) {
                    broken = true;
                    break;
                }
                current = parent;
            }
            if (broken) warnings.push('分支上游缺失或形成循環，匯出可能不完整');
            if (path.length) return path.reverse();
        }

        if (all.length) {
            warnings.push('無法確認目前分支，已改依 index 排序；若曾重新生成，可能不是畫面上的那一條');
        }
        return [...all].sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
    }

    function contentBlocks(message) {
        if (Array.isArray(message?.content)) return message.content;
        if (typeof message?.content === 'string') return [{ type: 'text', text: message.content }];
        return [];
    }

    function fenceFor(source) {
        const runs = String(source).match(/`+/g) || [];
        const longest = runs.reduce((max, run) => Math.max(max, run.length), 0);
        return '`'.repeat(Math.max(3, longest + 1));
    }

    function fenced(label, source, lang) {
        const fence = fenceFor(source);
        return `**${label}**\n\n${fence}${lang || ''}\n${source}\n${fence}`;
    }

    function collectArtifacts(messages, warnings) {
        const artifacts = new Map();
        for (const message of messages) {
            for (const block of contentBlocks(message)) {
                if (block?.type !== 'tool_use' || block.name !== 'artifacts') continue;
                const input = block.input && typeof block.input === 'object' ? block.input : {};
                const id = input.id || '__artifact__';
                let artifact = artifacts.get(id);
                if (!artifact) {
                    artifact = { content: '' };
                    artifacts.set(id, artifact);
                }
                if (input.command === 'update') {
                    if (typeof input.old_str === 'string' && typeof input.new_str === 'string') {
                        const at = artifact.content.indexOf(input.old_str);
                        if (at === -1) {
                            warnings.push(`Artifact「${artifact.title || id}」有一段更新對不上原文`);
                        } else {
                            if (artifact.content.indexOf(input.old_str, at + input.old_str.length) !== -1) {
                                warnings.push(`Artifact「${artifact.title || id}」更新片段不唯一，只替換第一處`);
                            }
                            // function replacer: "$&" / "$$" in new_str must stay literal
                            artifact.content = artifact.content.replace(input.old_str, () => input.new_str);
                        }
                    }
                } else if (typeof input.content === 'string') {
                    artifact.content = input.content;
                }
                if (input.title) artifact.title = input.title;
                if (input.type) artifact.type = input.type;
                if (input.language) artifact.language = input.language;
                artifact.lastBlock = block;
                artifact.lastVersionUuid = input.version_uuid || null;
            }
        }
        return artifacts;
    }

    function renderToolUse(block, artifacts, info) {
        const input = block.input && typeof block.input === 'object' ? block.input : {};
        const name = block.name || '';
        if (name === 'artifacts') {
            const artifact = artifacts.get(input.id || '__artifact__');
            if (!artifact || !artifact.content) return '';
            const isLast = artifact.lastVersionUuid
                ? input.version_uuid === artifact.lastVersionUuid
                : block === artifact.lastBlock;
            if (!isLast) return '';
            const kinds = {
                'application/vnd.ant.react': ['jsx', 'React'],
                'text/html': ['html', 'HTML'],
                'image/svg+xml': ['svg', 'SVG'],
                'application/vnd.ant.mermaid': ['mermaid', 'Mermaid'],
                'text/markdown': ['markdown', 'Markdown'],
                'application/vnd.ant.code': [artifact.language || '', artifact.language || 'Code']
            };
            const kind = kinds[artifact.type] || [artifact.language || '', artifact.language || ''];
            const label = `Artifact：${artifact.title || 'untitled'}` +
                (kind[1] ? `（${kind[1]}）` : '');
            return fenced(label, artifact.content, kind[0]);
        }
        if (name === 'create_file' && typeof input.file_text === 'string' && input.file_text) {
            const file = String(input.path || 'file').split('/').pop();
            const ext = file.includes('.') ? file.split('.').pop().toLowerCase() : '';
            const langs = {
                py: 'python', js: 'javascript', jsx: 'jsx', ts: 'typescript', tsx: 'tsx',
                md: 'markdown', html: 'html', css: 'css', json: 'json', sh: 'bash',
                yml: 'yaml', yaml: 'yaml', sql: 'sql'
            };
            return fenced(`檔案：${file}`, input.file_text, langs[ext] || '');
        }
        if (name === 'visualize:show_widget' && typeof input.widget_code === 'string' && input.widget_code) {
            return fenced(`Widget：${input.title || 'untitled'}`, input.widget_code, 'jsx');
        }
        if (name && !info.skippedTools.includes(name)) info.skippedTools.push(name);
        return '';
    }

    function describeAttachments(message) {
        const notes = [];
        const inlined = [];
        for (const file of message.files || []) {
            const name = file.file_name || '未命名檔案';
            if (file.file_kind === 'image') notes.push(`圖片 ${name}`);
            else if (file.file_kind === 'document') {
                const pages = file.document_asset?.page_count;
                notes.push(`文件 ${name}${pages ? ` ${pages} 頁` : ''}`);
            } else notes.push(`檔案 ${name}${file.file_kind ? ` ${file.file_kind}` : ''}`);
        }
        for (const attachment of message.attachments || []) {
            const name = attachment.file_name || attachment.name || '附件';
            const extracted = typeof attachment.extracted_content === 'string'
                ? attachment.extracted_content.trim()
                : '';
            if (!extracted) {
                notes.push(`附件 ${name}`);
                continue;
            }
            const quoted = extracted.split('\n').map(line => line ? `> ${line}` : '>').join('\n');
            inlined.push(`> **附件：${name}**\n>\n${quoted}`);
        }
        const summary = notes.length
            ? `> [非文字內容：${notes.join('；')}；附件本體未嵌入匯出檔]`
            : '';
        return [summary, ...inlined].filter(Boolean).join('\n\n');
    }

    function mapRole(sender, warnings, seen) {
        if (sender === 'human' || sender === 'user') return 'user';
        if (sender === 'assistant') return 'assistant';
        if (['system', 'tool', 'reasoning'].includes(sender)) return '';
        const key = sender == null ? '' : String(sender);
        if (!seen.has(key)) {
            seen.add(key);
            warnings.push(sender == null
                ? '有訊息缺少 sender，無法確認角色；已略過'
                : `未預期的 sender「${sender}」，無法確認角色；已略過`);
        }
        return '';
    }

    function renderBlock(block, artifacts, info, warnings) {
        if (!block || typeof block !== 'object') {
            warnings.push('訊息含無法識別的內容區塊，正文可能不完整');
            return '';
        }
        if (block.type === 'text') {
            if (typeof block.text === 'string') return block.text.trim();
            warnings.push('文字區塊缺少正文，文字解析未完成');
            return '';
        }
        if (block.type === 'image') return '> [非文字內容：訊息內圖片；本體未嵌入匯出檔]';
        if (block.type === 'document') return '> [非文字內容：訊息內文件；本體未嵌入匯出檔]';
        if (['thinking', 'redacted_thinking', 'tool_result'].includes(block.type)) return '';
        if (block.type === 'tool_use') return renderToolUse(block, artifacts, info);
        warnings.push(`訊息含未支援的內容類型「${String(block.type ?? 'unknown')}」，正文可能不完整`);
        return '';
    }

    function renderMessages(ordered, warnings, info) {
        const artifacts = collectArtifacts(ordered.filter(message => ['human', 'user', 'assistant'].includes(message.sender)), warnings);
        const seenSenders = new Set();
        const messages = [];
        let truncated = 0;
        for (const message of ordered) {
            const role = mapRole(message.sender, warnings, seenSenders);
            if (!role) continue;
            const parts = [];
            const comparisonParts = [];
            const process = [];
            const attachment = describeAttachments(message);
            if (attachment) parts.push(attachment);
            const blocks = contentBlocks(message);
            const lastTool = blocks.findLastIndex(block => block.type === 'tool_use' || block.type === 'tool_result');
            const hasFinalText = blocks.slice(lastTool + 1).some(block => block.type === 'text');
            for (const [index, block] of blocks.entries()) {
                const rendered = renderBlock(block, artifacts, info, warnings);
                if (rendered) parts.push(rendered);
                if (rendered && block.type === 'text' && index < lastTool && hasFinalText) process.push(rendered);
                else if (rendered && !['image', 'document'].includes(block.type)) comparisonParts.push(rendered);
            }
            if (!blocks.length && typeof message.text === 'string' && message.text.trim()) {
                parts.push(message.text.trim());
                comparisonParts.push(message.text.trim());
            }
            const text = cleanContent(parts.join('\n\n'));
            if (!text) continue;
            const item = {
                role,
                text,
                comparisonBody: cleanContent(comparisonParts.join('\n\n')),
                process,
                createdAt: message.created_at || '',
                note: '',
                citations: blocks.filter(block => block.type === 'text').flatMap(block => block.citations || []),
                attachments: [...(message.files || []), ...(message.attachments || []),
                    ...blocks.filter(block => block?.type === 'image' || block?.type === 'document')]
            };
            if (message.truncated) {
                truncated++;
                item.note = '> **可能截斷**：來源資料標記為 truncated，正文可能不完整。';
            } else if (message.stop_reason === 'user_canceled') {
                item.note = '> **已中斷**：這則回應在完成前被停止。';
                info.interrupted++;
            }
            messages.push(item);
        }
        if (truncated) {
            warnings.push(`${truncated} 則訊息被標記為 truncated，正文可能不完整`);
        }
        return messages;
    }


    function buildMarkdown(messages, source = 'API') {
        if (!messages?.length) return '';
        let output = `> **匯出來源**：${source}\n\n`;
        let userIndex = 1;
        let modelIndex = 1;
        let previousDay = '';
        for (const message of messages) {
            const day = dayKey(message.createdAt);
            if (day && day !== previousDay) {
                const label = formatChatTime(message.createdAt);
                if (label) output += `> **對話時間**：${label}\n\n`;
                previousDay = day;
            }
            const heading = message.role === 'assistant'
                ? `Model ${modelIndex++}`
                : `User ${userIndex++}`;
            output += `--- [${heading}] ---\n${message.text}`;
            if (message.note) output += `\n\n${message.note}`;
            output += '\n\n';
        }
        return output.trimEnd() + '\n';
    }

    function exportConversation(data) {
        if (!data || typeof data !== 'object' || !Array.isArray(data.chat_messages)) {
            throw new Error('API 回應沒有 chat_messages，端點格式可能已變');
        }
        const warnings = [];
        const info = { interrupted: 0, skippedTools: [] };
        if (data.has_more || data.next_cursor) {
            warnings.push('API 回應帶有後續分頁標記，這次匯出可能不是全部訊息');
        }
        const reported = data.message_count ?? data.chat_messages_count;
        if (Number.isInteger(reported) && reported > data.chat_messages.length) {
            warnings.push(`API 回報 ${reported} 則，這次回應只有 ${data.chat_messages.length} 則`);
        }
        const messages = renderMessages(orderCurrentBranch(data, warnings), warnings, info);
        const unique = [...new Set(warnings)];
        let markdown = buildMarkdown(messages);
        if (unique.length) {
            markdown += `\n\n> **匯出不完整**\n>\n${unique.map(text => `> ${text}`).join('\n')}\n`;
        }
        return { messages, warnings: unique, info, markdown };
    }

    const api = {
        compareTranscripts,
        prepareComparisonMessage,
        integrateTranscripts,
        buildIntegratedMarkdown,
        mergeDomSnapshot,
        readCookie,
        conversationIdFromPath,
        exportConversation,
        sanitizeFileName,
        buildDownloadName,
        buildMarkdown,
        nextPageUrl,
        mergeConversationPages
    };

    if (typeof module !== 'undefined' && module.exports && !root.document) {
        module.exports = api;
    }
    if (!root.document) return;


    function determineTitle(apiName) {
        const fromApi = sanitizeFileName(apiName);
        if (fromApi) return fromApi;
        try {
            const title = root.document.title.replace(/\s*[-–—|]?\s*Claude\s*$/i, '').trim();
            const cleaned = sanitizeFileName(title);
            if (cleaned && !/^claude$/i.test(cleaned)) return cleaned;
        } catch (error) {
            console.error('[Claude Exporter] 擷取標題失敗', error);
        }
        return 'Claude-Chat';
    }

    function showNotification(message, isError = false, duration = 3500) {
        root.document.getElementById('claude-export-toast')?.remove();
        const toast = root.document.createElement('div');
        toast.id = 'claude-export-toast';
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
        root.document.body.appendChild(toast);
        setTimeout(() => toast.remove(), duration);
    }

    function showSaveModal(defaultTitle, textContent, report, onSave) {
        root.document.getElementById('claude-export-save-overlay')?.remove();
        const overlay = root.document.createElement('div');
        overlay.id = 'claude-export-save-overlay';
        Object.assign(overlay.style, {
            position: 'fixed',
            inset: '0',
            background: 'rgba(0,0,0,.6)',
            zIndex: '2147483646',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        });

        const modal = root.document.createElement('div');
        Object.assign(modal.style, {
            background: 'linear-gradient(180deg, #151515 0%, #0d0d0d 100%)',
            padding: '24px',
            borderRadius: '12px',
            width: '430px',
            maxWidth: 'calc(100vw - 40px)',
            border: '1px solid rgba(255,255,255,.14)',
            boxShadow: '0 24px 70px rgba(0,0,0,.68), inset 0 1px 0 rgba(255,255,255,.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            color: '#f5f5f5',
            fontFamily: 'system-ui, sans-serif'
        });

        const heading = root.document.createElement('h3');
        heading.textContent = `掃描完成：${report.messageCount} 則訊息／${textContent.length} 字`;
        Object.assign(heading.style, { margin: '0', color: '#f5f5f5', fontSize: '18px' });

        const status = root.document.createElement('div');
        status.textContent = report.warning || report.status || '未發現未解析的訊息空殼';
        Object.assign(status.style, {
            padding: '9px 11px',
            borderRadius: '6px',
            fontSize: '13px',
            background: report.warning ? 'rgba(245,158,11,.13)' : 'rgba(255,255,255,.055)',
            color: report.warning ? '#fbbf24' : '#c8c8c8',
            border: report.warning
                ? '1px solid rgba(245,158,11,.3)'
                : '1px solid rgba(255,255,255,.09)',
            whiteSpace: 'pre-line'
        });

        const label = root.document.createElement('label');
        label.textContent = '請確認檔名（無需副檔名）：';
        Object.assign(label.style, { fontSize: '14px', color: '#c8c8c8' });

        const input = root.document.createElement('input');
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

        const buttons = root.document.createElement('div');
        Object.assign(buttons.style, {
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px'
        });
        const cancel = root.document.createElement('button');
        cancel.textContent = '取消';
        const save = root.document.createElement('button');
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
        root.document.body.appendChild(overlay);
        input.focus();
        input.select();
    }

    function openSave(title, markdown, report) {
        const finalOutput = markdown.trimEnd() + '\n';
        showSaveModal(title, finalOutput, report, finalTitle => {
            const blob = new Blob(['\uFEFF' + finalOutput], { type: 'text/markdown;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const anchor = root.document.createElement('a');
            anchor.href = url;
            anchor.download = buildDownloadName(finalTitle, getTimestamp());
            root.document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        });
    }

    function statusFromInfo(info) {
        const bits = ['API 目前分支已讀取'];
        if (info.interrupted) bits.push(`${info.interrupted} 則回應在完成前被停止`);
        return bits.join('。');
    }

    async function resolveOrgId() {
        const fromCookie = readCookie(root.document.cookie, 'lastActiveOrg');
        if (fromCookie) return fromCookie;
        try {
            const response = await fetch('/api/organizations', { credentials: 'include', signal: AbortSignal.timeout(30000) });
            if (!response.ok) return '';
            const data = await response.json();
            const list = Array.isArray(data) ? data : (data.organizations || []);
            for (const item of list) {
                const id = item && (item.uuid || item.id);
                if (id) return String(id);
            }
        } catch (error) {
            console.warn('[Claude Exporter] 無法列出 organizations', error);
        }
        return '';
    }

    function nextPageUrl(cursor) {
        if (typeof cursor !== 'string' || !cursor) return '';
        if (/^https?:\/\//i.test(cursor) || cursor.startsWith('/')) return cursor;
        return '';
    }

    function mergeConversationPages(pages) {
        const base = { ...(pages[0] || {}) };
        const seen = new Set();
        const messages = [];
        for (const page of pages) {
            for (const message of page.chat_messages || []) {
                const key = message && message.uuid;
                if (key && seen.has(key)) continue;
                if (key) seen.add(key);
                messages.push(message);
            }
        }
        const last = pages[pages.length - 1] || {};
        base.chat_messages = messages;
        base.has_more = Boolean(last.has_more || last.next_cursor);
        base.next_cursor = last.next_cursor || '';
        return base;
    }

    async function readConversationPage(url) {
        let response;
        try {
            response = await fetch(url, {
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                signal: AbortSignal.timeout(30000)
            });
        } catch (error) {
            throw new Error(`連不到 Claude：${error.message}。請確認網路後重試`);
        }
        if (!response.ok) {
            const hint = response.status === 401 || response.status === 403
                ? '。請重新整理並確認已登入'
                : response.status === 404
                    ? '。若這是專案頁而不是對話頁，請先打開對話'
                    : '';
            throw new Error(`Claude API 失敗（HTTP ${response.status}）${hint}`);
        }
        try {
            return await response.json();
        } catch (error) {
            throw new Error(`Claude API 回應無法解析：${error.message}`);
        }
    }

    async function fetchConversation() {
        const conversationId = conversationIdFromPath(root.location.pathname);
        if (!conversationId) {
            throw new Error('請先開啟一篇 Claude 對話（目前網址沒有對話 ID）');
        }
        const orgId = await resolveOrgId();
        if (!orgId) {
            throw new Error('讀不到登入組織（lastActiveOrg）。請重新登入後再試');
        }
        // @grant none keeps this in the page context so the session cookie is sent.
        let url = `/api/organizations/${encodeURIComponent(orgId)}/chat_conversations/` +
            `${encodeURIComponent(conversationId)}?tree=true&rendering_mode=messages&render_all_tools=true`;
        const pages = [];
        const seen = new Set();
        for (let page = 0; page < 20 && url && !seen.has(url); page++) {
            seen.add(url);
            const data = await readConversationPage(url);
            pages.push(data);
            url = nextPageUrl(data.next_cursor);
        }
        return mergeConversationPages(pages);
    }


    async function runExclusive(button, fn) {
        if (!button || button.disabled) return;
        const originalText = button.textContent;
        button.disabled = true;
        try {
            await fn(button);
        } catch (error) {
            console.error('[Claude Exporter] 失敗', error);
            showNotification(`❌ ${error.message}`, true, 6000);
        } finally {
            button.disabled = false;
            button.textContent = originalText;
        }
    }

    function processApiExport(button) {
        return runExclusive(button, async btn => {
            btn.textContent = '讀取對話…';
            const data = await fetchConversation();
            const result = exportConversation(data);
            if (!result.messages.length) throw new Error('這篇對話沒有可匯出的內容');
            if (result.info.skippedTools.length) {
                console.debug('[Claude Exporter] 已略過工具', result.info.skippedTools.join(', '));
            }
            console.info('[Claude Exporter] 讀取報告', {
                messages: result.messages.length,
                warnings: result.warnings,
                interrupted: result.info.interrupted
            });
            const warning = result.warnings.join('\n');
            let title = determineTitle(data.name);
            if (warning) title += '_INCOMPLETE';
            openSave(title, result.markdown, {
                heading: '讀取完成',
                messageCount: result.messages.length,
                warning: warning ? `⚠️ ${warning}` : '',
                status: statusFromInfo(result.info)
            });
        });
    }


    const USER_SELECTOR = '[data-testid="user-message"], [data-testid="user-human-turn"], [class~="group/message-row"].items-end';
    const ASSISTANT_SELECTOR = '.font-claude-response, .font-claude-message, [data-testid="assistant-message"]';
    const MESSAGE_SELECTOR = `${USER_SELECTOR}, ${ASSISTANT_SELECTOR}`;
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

    function findConversationScroller() {
        const nodes = [...root.document.querySelectorAll(MESSAGE_SELECTOR)];
        const candidates = [...root.document.querySelectorAll('[data-autoscroll-container], main, div')]
            .filter(element => {
                const style = root.getComputedStyle(element);
                return element.clientHeight >= 100 && element.scrollHeight > element.clientHeight + 10 &&
                    (style.overflowY === 'auto' || style.overflowY === 'scroll');
            })
            .map(element => ({ element, count: nodes.filter(node => element.contains(node)).length }))
            .filter(item => item.count || item.element.hasAttribute('data-autoscroll-container'))
            .sort((a, b) => b.count - a.count || a.element.clientHeight - b.element.clientHeight);
        if (candidates.length) return candidates[0].element;
        if (nodes.length && root.document.scrollingElement) return root.document.scrollingElement;
        throw new Error('DOM 找不到對話訊息或捲動容器');
    }

    function getScrollBounds(scroller) {
        const size = Math.max(0, scroller.scrollHeight - scroller.clientHeight);
        return root.getComputedStyle(scroller).flexDirection === 'column-reverse'
            ? { top: -size, bottom: 0 } : { top: 0, bottom: size };
    }

    function domSnapshot(scroller) {
        const nodes = [...scroller.querySelectorAll(MESSAGE_SELECTOR)]
            .filter(node => !node.parentElement?.closest(MESSAGE_SELECTOR) &&
                node.getClientRects().length && root.getComputedStyle(node).visibility !== 'hidden')
            .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
        return nodes.map(node => {
            const role = node.matches(USER_SELECTOR) ? 'user' : 'assistant';
            const envelope = node.closest('[data-index], [data-message-id], [aria-posinset]') || node;
            const index = envelope.getAttribute('data-index') ?? envelope.getAttribute('aria-posinset');
            const id = envelope.getAttribute('data-message-id');
            const process = [...node.querySelectorAll('[data-cds="TurnStatus"]')].map(item => item.innerText.trim()).filter(Boolean);
            const citations = [...node.querySelectorAll('a[class~="group/tag"]')].map(item => ({ label: item.innerText, url: item.href }));
            const clone = node.cloneNode(true);
            clone.querySelectorAll('a[class~="group/tag"], [data-cds="MessageActions"], [data-cds-icon-only], [data-cds="TurnStatus"], [data-testid="thinking"], [data-testid="thinking-block"], [data-testid="tool-use"], [data-testid="tool-result"], [data-testid="user-message-actions"], [data-testid="file-thumbnail"], .sr-only, [hidden], [aria-hidden="true"]').forEach(item => item.remove());
            Object.assign(clone.style, { position: 'fixed', left: '-10000px', top: '0',
                width: `${node.getBoundingClientRect().width}px`, opacity: '0', pointerEvents: 'none' });
            node.parentElement.appendChild(clone);
            let text;
            let comparisonBody;
            let prefix = 'GYC_DOM_CODE_';
            while ((node.textContent || '').includes(prefix)) prefix += '_';
            const values = [];
            const outputCode = [];
            try {
                if (role === 'assistant') {
                    const elements = [...clone.querySelectorAll('pre, code')]
                        .filter(element => element.tagName !== 'CODE' || !element.closest('pre'));
                    for (const element of elements) {
                        const code = element.tagName === 'PRE' ? element.querySelector('code') : element;
                        if (!code) continue;
                        const value = (code.textContent || '').replace(/\r\n?/g, '\n');
                        values.push(element.tagName === 'PRE' ? value.replace(/\n$/, '') : value);
                        const fence = fenceFor(value);
                        outputCode.push(element.tagName === 'PRE' ? `${fence}\n${value.replace(/\n$/, '')}\n${fence}` :
                            `${'`'.repeat(fence.length)}${value}${'`'.repeat(fence.length)}`);
                        element.textContent = `${prefix}${values.length - 1}_END`;
                    }
                }
                comparisonBody = cleanContent(clone.innerText);
                text = comparisonBody.replace(new RegExp(`${prefix}(\\d+)_END`, 'g'), (_, index) => outputCode[Number(index)]);
            } finally { clone.remove(); }
            const attachments = [...node.querySelectorAll('img, [data-testid*="attachment"], a[download]')]
                .map(item => ({ type: item.tagName === 'IMG' ? 'image' : 'file',
                    name: item.getAttribute('alt') || item.getAttribute('download') || item.getAttribute('aria-label') || '' }));
            if (!text && attachments.length) text = '> [非文字內容：附件本體未嵌入匯出檔]';
            return { role, text, comparisonBody, comparisonCode: { prefix, values }, process,
                createdAt: node.querySelector('[data-cds="MessageActions"] time[datetime]')?.getAttribute('datetime') || '',
                key: id ? `id:${id}` : index !== null ? `index:${index}:${role}` : '',
                index: index !== null && /^\d+$/.test(index) ? Number(index) : null,
                setsize: Number(envelope.getAttribute('aria-setsize')) || null, citations, attachments };
        });
    }

    // Snapshots overlap while moving from oldest to newest. Stable ids/indexes
    // win; otherwise retain the longest matching overlap, not a text set.
    function mergeDomSnapshot(messages, snapshot) {
        const same = (a, b) => a.key && b.key ? a.key === b.key : a.role === b.role && a.text === b.text;
        let overlap = 0;
        for (let n = Math.min(messages.length, snapshot.length); n > 0; n--) {
            if (snapshot.slice(0, n).every((item, i) => same(messages[messages.length - n + i], item))) {
                overlap = n;
                break;
            }
        }
        for (let i = 0; i < overlap; i++) {
            const old = messages[messages.length - overlap + i];
            if (snapshot[i].text.length > old.text.length) Object.assign(old, snapshot[i]);
        }
        for (const item of snapshot.slice(overlap)) {
            const existing = item.key && messages.find(message => message.key === item.key);
            if (existing) {
                if (item.text.length > existing.text.length) Object.assign(existing, item);
            } else messages.push(item);
        }
    }

    async function scanDom(button, checkScope) {
        const scroller = findConversationScroller();
        const original = scroller.scrollTop;
        const messages = [];
        const warnings = new Set();
        let empty = false;
        try {
            let settled = 0;
            for (let steps = 0; steps < 3000 && settled < 3; steps++) {
                checkScope();
                const top = getScrollBounds(scroller).top;
                const current = scroller.scrollTop;
                scroller.scrollTop = Math.max(top, current - Math.max(100, scroller.clientHeight * 0.6));
                await delay(300);
                if (scroller.scrollTop <= getScrollBounds(scroller).top + 2) settled++;
                else settled = 0;
                if (steps === 2999) warnings.add('DOM 向上掃描達到步數上限');
            }
            for (let steps = 0; steps < 3000; steps++) {
                checkScope();
                let snapshot = domSnapshot(scroller);
                if (snapshot.some(item => !item.text)) {
                    await delay(600);
                    checkScope();
                    snapshot = domSnapshot(scroller);
                }
                if (snapshot.some(item => !item.text)) empty = true;
                mergeDomSnapshot(messages, snapshot.filter(item => item.text));
                button.textContent = `掃描 DOM：${messages.length} 則…`;
                const bounds = getScrollBounds(scroller);
                const current = scroller.scrollTop;
                if (current >= bounds.bottom - 2) break;
                scroller.scrollTop = Math.min(bounds.bottom, current + Math.max(100, scroller.clientHeight * 0.6));
                await delay(300);
                if (Math.abs(scroller.scrollTop - current) < 1) {
                    warnings.add('DOM 捲動未到達底端');
                    break;
                }
                if (steps === 2999) warnings.add('DOM 掃描達到步數上限');
            }
        } finally {
            scroller.scrollTop = original;
        }
        checkScope();
        if (!messages.length) throw new Error('DOM 未讀到可匯出的訊息（可能尚未載入或頁面結構已變）');
        if (empty) warnings.add('DOM 曾出現無法解析的空訊息殼，歷史可能不完整');
        const total = Math.max(0, ...messages.map(item => item.setsize || 0));
        if (total > messages.length) warnings.add(`DOM 標示 ${total} 則，掃描取得 ${messages.length} 則`);
        if (messages.some(item => !item.key)) warnings.add('部分 DOM 訊息沒有穩定識別碼，重複訊息與分支無法獨立確認');
        warnings.add('DOM 讀取畫面選取的分支；歷史與分支完整性未由 DOM 獨立確認');
        const list = [...warnings];
        const markdown = buildMarkdown(messages, 'DOM') +
            (list.length ? `\n> **DOM 提示**：${list.join('；')}\n` : '');
        return { messages, warnings: list, markdown };
    }

    function downloadResult(name, content) {
        const url = URL.createObjectURL(new Blob(['\uFEFF' + content], { type: 'text/markdown;charset=utf-8' }));
        const anchor = root.document.createElement('a');
        anchor.href = url;
        anchor.download = name + '.md';
        root.document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    function showCombinedResults(title, apiResult, domResult, errors) {
        const comparison = apiResult && domResult ? compareTranscripts(apiResult.messages, domResult.messages) : null;
        const first = comparison?.differences[0];
        const metadata = [
            ...((apiResult?.messages || []).map((message, i) => ({ source: 'API', index: i + 1, ...prepareComparisonMessage(message, 'api'), process: message.process }))),
            ...((domResult?.messages || []).map((message, i) => ({ source: 'DOM', index: i + 1, ...prepareComparisonMessage(message, 'dom'), process: message.process })))
        ];
        const count = (result, source, field) => {
            if (!result) return '未知';
            const values = result.messages.map(message => prepareComparisonMessage(message, source)[field]);
            return values.some(value => value === null) ? '未知' : values.reduce((sum, value) => sum + value.length, 0);
        };
        const formatDifference = difference => {
            const labels = { text: '文字不同', role: '角色不同', 'api-only': '僅 API 有此訊息', 'dom-only': '僅 DOM 有此訊息' };
            const side = (label, index, message) => message
                ? `${label} #${index} (${message.role})：\n${prepareComparisonMessage(message, label === 'API' ? 'api' : 'dom').body}`
                : `${label}：無`;
            return `${labels[difference.kind]}\n${side('API', difference.apiIndex, difference.api)}\n\n${side('DOM', difference.domIndex, difference.dom)}`;
        };
        const summary = [
            `API：${apiResult ? apiResult.messages.length + ' 則' : '失敗：' + errors.api}`,
            `DOM：${domResult ? domResult.messages.length + ' 則' : '失敗：' + errors.dom}`,
            comparison ? (comparison.match ? '角色、順序與呈現正文相符' :
                `正文差異：${comparison.differences.length} 筆\n\n第一筆差異：\n${formatDifference(first)}`) : '未進行比對',
            `引用：API ${count(apiResult, 'api', 'citations')} 項／DOM ${count(domResult, 'dom', 'citations')} 項；附件：API ${count(apiResult, 'api', 'attachments')} 項／DOM ${count(domResult, 'dom', 'attachments')} 項（另列報告）`,
            `工具前進度／處理狀態：API ${(apiResult?.messages || []).reduce((n, message) => n + (message.process?.length || 0), 0)} 項／DOM ${(domResult?.messages || []).reduce((n, message) => n + (message.process?.length || 0), 0)} 項（另列報告）`,
            ...(apiResult?.warnings || []).map(warning => `API：${warning}`),
            ...(domResult?.warnings || []).map(warning => `DOM：${warning}`)
        ].filter(Boolean).join('\n');
        const report = summary + '\n\n' + (comparison?.differences || []).map((item, index) =>
            `正文差異 ${index + 1}\n${formatDifference(item)}`).join('\n\n--------------------\n\n') +
            '\n\n引用／附件／處理狀態\n' + metadata.filter(item => item.citations?.length || item.attachments?.length || item.process?.length).map(item => {
                const fields = [];
                if (item.citations?.length) fields.push(`引用 ${JSON.stringify(item.citations)}`);
                if (item.attachments?.length) fields.push(`附件 ${JSON.stringify(item.attachments)}`);
                if (item.process?.length) fields.push(`處理狀態 ${JSON.stringify(item.process)}`);
                return `${item.source} #${item.index}：${fields.join('；')}`;
            }).join('\n') + '\n';
        const notes = [
            ...(apiResult?.warnings || []).map(warning => `API：${warning}`),
            ...(domResult?.warnings || []).map(warning => `DOM：${warning}`)
        ];
        const integration = buildIntegratedMarkdown(apiResult?.messages || [], domResult?.messages || [], {
            apiAvailable: Boolean(apiResult), domAvailable: Boolean(domResult), notes
        });
        const base = `CLD_${sanitizeFileName(title) || 'Claude-Chat'}_${getTimestamp()}`;
        showIntegratedDialog({
            id: 'claude-export-save-overlay', site: 'Claude', title,
            apiCount: apiResult ? apiResult.messages.length : null,
            domCount: domResult ? domResult.messages.length : null,
            integration, errors, notes, report,
            onDownload: () => downloadResult(`${base}_COMBINED`, integration.content),
            onApi: apiResult ? () => downloadResult(`${base}_API`, apiResult.markdown) : null,
            onDom: domResult ? () => downloadResult(`${base}_DOM`, domResult.markdown) : null,
            onReport: () => downloadResult(`${base}_DIFFERENCES`, report)
        });
    }

    function processDomExport(button) {
        return runExclusive(button, async btn => {
            const scope = root.location.href;
            const checkScope = () => {
                if (root.location.href !== scope) throw new Error('收集期間對話網址已變更');
            };
            const result = await scanDom(btn, checkScope);
            showSaveModal(determineTitle(), result.markdown, { messageCount: result.messages.length,
                warning: result.warnings.join('\n') }, title =>
                downloadResult(`CLD_DOM_${sanitizeFileName(title)}_${getTimestamp()}`, result.markdown));
        });
    }

    function processCombinedExport(button) {
        return runExclusive(button, async btn => {
            const scope = root.location.href;
            let changed = false;
            const monitor = setInterval(() => { if (root.location.href !== scope) changed = true; }, 100);
            const checkScope = () => {
                if (changed || root.location.href !== scope) throw new Error('收集期間對話網址已變更，無法比對不同對話');
            };
            let apiResult = null;
            let domResult = null;
            let title = determineTitle();
            const errors = {};
            try {
                try {
                    btn.textContent = '取得 API 對話…';
                    const data = await fetchConversation();
                    checkScope();
                    title = determineTitle(data.name);
                    apiResult = exportConversation(data);
                    if (!apiResult.messages.length) {
                        apiResult = null;
                        throw new Error('API 沒有可匯出的可見訊息');
                    }
                } catch (error) { errors.api = error.message || String(error); }
                try {
                    checkScope();
                    domResult = await scanDom(btn, checkScope);
                    checkScope();
                } catch (error) { domResult = null; errors.dom = error.message || String(error); }
                if (changed || root.location.href !== scope) {
                    domResult = null;
                    errors.dom = '收集期間對話網址已變更，無法比對不同對話';
                }
                showCombinedResults(title, apiResult, domResult, errors);
            } finally { clearInterval(monitor); }
        });
    }

    function createButton() {
        if (!root.document.body || root.document.getElementById('claude-export-fab-container')) return;

        const container = root.document.createElement('div');
        container.id = 'claude-export-fab-container';
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

        const menu = root.document.createElement('div');
        Object.assign(menu.style, {
            display: 'flex',
            flexDirection: 'column',
            gap: '7px',
            padding: '8px',
            background: 'rgba(8,8,8,.88)',
            border: '1px solid rgba(255,255,255,.1)',
            borderRadius: '18px',
            boxShadow: '0 16px 40px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.04)',
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
            boxShadow: '0 4px 12px rgba(0,0,0,.28), inset 0 1px 0 rgba(255,255,255,.04)',
            whiteSpace: 'nowrap',
            fontSize: '14px',
            transition:
                'background .16s ease, border-color .16s ease, ' +
                'transform .16s ease, box-shadow .16s ease'
        };
        const makeButton = (text, handler) => {
            const button = root.document.createElement('button');
            button.textContent = text;
            Object.assign(button.style, commonStyle);
            button.addEventListener('mouseenter', () => {
                button.style.background = 'linear-gradient(180deg, #292929 0%, #202020 100%)';
                button.style.borderColor = 'rgba(255,255,255,.24)';
                button.style.transform = 'translateY(-1px)';
                button.style.boxShadow =
                    '0 7px 18px rgba(0,0,0,.38), inset 0 1px 0 rgba(255,255,255,.07)';
            });
            button.addEventListener('mouseleave', () => {
                button.style.background = 'linear-gradient(180deg, #1d1d1d 0%, #151515 100%)';
                button.style.borderColor = 'rgba(255,255,255,.12)';
                button.style.transform = 'translateY(0)';
                button.style.boxShadow =
                    '0 4px 12px rgba(0,0,0,.28), inset 0 1px 0 rgba(255,255,255,.04)';
            });
            button.addEventListener('mousedown', () => {
                button.style.background = '#0b0b0b';
                button.style.transform = 'translateY(0)';
            });
            button.addEventListener('mouseup', () => {
                button.style.background = 'linear-gradient(180deg, #292929 0%, #202020 100%)';
                button.style.transform = 'translateY(-1px)';
            });
            button.addEventListener('click', handler);
            return button;
        };

        const combinedButton = makeButton('綜合匯出', event => processCombinedExport(event.currentTarget));
        combinedButton.style.background = '#10a37f';
        const exportButton = makeButton('API匯出', event => processApiExport(event.currentTarget));
        exportButton.title = 'API匯出：讀目前分支，不靠捲動';
        const domButton = makeButton('正常匯出', event => processDomExport(event.currentTarget));
        const topButton = makeButton('到頂端', event => runExclusive(event.currentTarget, async () => {
            const scroller = findConversationScroller();
            scroller.scrollTop = getScrollBounds(scroller).top;
        }));
        menu.append(combinedButton, exportButton, domButton, topButton);

        const fab = root.document.createElement('button');
        fab.textContent = '✳';
        fab.title = "GYC - Claude - v1.4.3";
        fab.setAttribute('aria-label', '開啟 Grab Your Chat - Claude 工具');
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
            fontSize: '28px',
            lineHeight: '1',
            boxShadow: '0 8px 22px rgba(0,0,0,.48), inset 0 1px 0 rgba(255,255,255,.08)',
            transition: 'transform .25s ease, border-color .16s ease, box-shadow .16s ease'
        });
        fab.addEventListener('mouseenter', () => {
            fab.style.borderColor = 'rgba(255,255,255,.38)';
            fab.style.boxShadow =
                '0 10px 28px rgba(0,0,0,.58), inset 0 1px 0 rgba(255,255,255,.12)';
        });
        fab.addEventListener('mouseleave', () => {
            fab.style.borderColor = 'rgba(255,255,255,.18)';
            fab.style.boxShadow =
                '0 8px 22px rgba(0,0,0,.48), inset 0 1px 0 rgba(255,255,255,.08)';
        });

        let open = false;
        fab.addEventListener('click', () => {
            open = !open;
            fab.style.transform = open ? 'rotate(45deg)' : 'rotate(0deg)';
            menu.style.opacity = open ? '1' : '0';
            menu.style.transform = open ? 'translateY(0) scale(1)' : 'translateY(20px) scale(.9)';
            menu.style.pointerEvents = open ? 'auto' : 'none';
        });

        container.append(menu, fab);
        root.document.body.appendChild(container);
        styleExportTools(container);
    }

    const observer = new MutationObserver(createButton);
    observer.observe(root.document.documentElement, { childList: true, subtree: true });
    createButton();
})(typeof globalThis !== 'undefined' ? globalThis : this);
