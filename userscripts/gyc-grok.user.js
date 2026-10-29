// ==UserScript==
// @name        GYC - Grok
// @namespace   https://github.com/ReaperTw/AZA-Agent-Chat-Archive
// @version      1.4.2
// @description Grab Your Chat - Grok 端對話匯出器；最後更新於 20261029
// @updateURL   https://raw.githubusercontent.com/ReaperTw/AZA-Agent-Chat-Archive/main/userscripts/gyc-grok.user.js
// @downloadURL https://raw.githubusercontent.com/ReaperTw/AZA-Agent-Chat-Archive/main/userscripts/gyc-grok.user.js
// @match       https://grok.com/*
// @match       https://x.com/i/grok/*
// @run-at      document-idle
// @grant       none
// ==/UserScript==

(function() {
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



    function prepareComparisonMessage(message, source) {
        const citations = message.citations ?? null;
        const attachments = message.attachments == null ? null : message.attachments.slice();
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
                if (attachments) attachments.push({ type: 'image', alt: decode(token.text), url: token.href });
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
        return { match: differences.length === 0, differences };
    }

    function toComparisonTurn(message) {
        return { ...message, role: message.type === 'ai' ? 'assistant' : message.type };
    }


    // --- 核心參數 ---
    const CONFIG = {
        CONTENT_NODES: '[data-testid="user-message"], [data-testid="assistant-message"], .message-bubble',
        NOISE_NODES: 'button, .sr-only, nav, header, .tiptap, .ProseMirror, [contenteditable="true"], a, [role="button"], [role="navigation"], svg, img',
        NOISE_WORDS: ['Copy text', 'Share', 'Edit', 'Regenerate', 'Search', 'New chat', 'Home', 'Profile', 'Grok'],
        MAX_UPWARD_LOOPS: 40,
        MAX_CONTENT_WAIT: 15,
        MAX_RETRIES: 5,
        MAX_END_CHECK: 2,
        FAST_UPWARD_WAIT: 500,
        FAST_SCROLL_STEP: 2000,
        FAST_BASE_WAIT: 500
    };

    const NORMAL_SCAN = {
        label: 'Normal',
        upwardWait: CONFIG.FAST_UPWARD_WAIT,
        scrollStep: CONFIG.FAST_SCROLL_STEP,
        baseWait: CONFIG.FAST_BASE_WAIT,
        maxEndCheck: CONFIG.MAX_END_CHECK
    };

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

    function findScrollContainer() {
        const msg = document.querySelector(CONFIG.CONTENT_NODES);
        if (msg) {
            let curr = msg.parentElement;
            while (curr && curr !== document.body && curr !== document.documentElement) {
                const style = window.getComputedStyle(curr);
                if (['auto', 'scroll', 'overlay'].includes(style.overflowY) && curr.scrollHeight > curr.clientHeight) return curr;
                curr = curr.parentElement;
            }
        }
        let bestDiv = document.documentElement;
        let maxDiff = 0;
        document.querySelectorAll('div').forEach(el => {
            const diff = el.scrollHeight - el.clientHeight;
            if (diff > 50 && ['auto', 'scroll', 'overlay'].includes(window.getComputedStyle(el).overflowY)) {
                if (diff > maxDiff) { maxDiff = diff; bestDiv = el; }
            }
        });
        return bestDiv;
    }

    function isLastMessageLoaded(scroller) {
        const elements = scroller.querySelectorAll(CONFIG.CONTENT_NODES);
        return elements.length > 0 && Array.from(elements).every(element => element.innerText.trim().length > 0);
    }

    function cleanContent(text) {
        return String(text ?? '').trim();
    }

    function determineTitle() {
        try {
            const title = document.title
                .replace(/\s*[-–—|]?\s*Grok\s*$/i, '')
                .replace(/\s*\/\s*X\s*$/i, '')
                .trim();
            if (title) return sanitizeFileName(title);
        } catch (error) {
            console.error('[Grok Exporter] 擷取標題失敗', error);
        }
        return 'Grok-Chat';
    }

    function showNotification(message, isError = false, duration = 3500) {
        document.getElementById('grok-export-toast')?.remove();
        const toast = document.createElement('div');
        toast.id = 'grok-export-toast';
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
        document.getElementById('grok-export-save-overlay')?.remove();

        const overlay = document.createElement('div');
        overlay.id = 'grok-export-save-overlay';
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
        heading.textContent =
            `掃描完成：${report.messageCount} 則訊息／${textContent.length} 字`;
        Object.assign(heading.style, {
            margin: '0',
            color: '#f5f5f5',
            fontSize: '18px'
        });

        const status = document.createElement('div');
        status.textContent = report.warning || '未發現掃描斷層';
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

    function getVisibleTimeline(scroller) {
        // querySelectorAll 會讀取容器內所有已掛載節點，不只螢幕可見區域。
        const allCandidates = Array.from(scroller.querySelectorAll(CONFIG.CONTENT_NODES));
        let validNodes = allCandidates.filter(node => {
            if (allCandidates.some(parent => parent !== node && parent.contains(node))) return false;
            if (node.closest(CONFIG.NOISE_NODES)) return false;
            const text = node.innerText.trim();
            if (!text) return false;
            return true;
        });

        let timeline = [];
        validNodes.forEach(node => {
            const isUser =
                node.matches('[data-testid="user-message"]') ||
                node.closest('.items-end');
            const contentNode =
                node.querySelector('.response-content-markdown') || node;
            timeline.push({
                type: isUser ? 'user' : 'ai',
                text: contentNode.innerText.trim()
            });
        });
        return timeline;
    }


    function buildTimelineMarkdown(timeline, scanWarnings = [], method = 'DOM') {
        let nonTextWarn = false;
        const exportTimeline = timeline
            .map(message => {
                const txt = cleanContent(message.text || '');
                if (!txt && message.text !== undefined) nonTextWarn = true;
                return {
                    type: message.type,
                    text: txt,
                    timestamp: message.timestamp || message.createTime
                };
            })
            .filter(message => message.text || message.timestamp);

        if (!exportTimeline.length) {
            throw new Error('沒有取得任何有效對話');
        }

        let warnings = scanWarnings.slice();
        if (nonTextWarn) warnings.push('nontext missing body');
        let userIndex = 1;
        let modelIndex = 1;
        let output = `> **匯出來源**：${method}\n\n`;
        for (const message of exportTimeline) {
            if (message.type === 'gap') {
                output += `${message.text}\n\n`;
                continue;
            }
            const heading = message.type === 'user'
                ? `User ${userIndex++}`
                : `Model ${modelIndex++}`;
            let dateStr = '';
            const ts = message.timestamp;
            if (ts) {
                // source only actual createTime field if semantically supported (ISO or seconds)
                let d;
                if (typeof ts === 'string') d = new Date(ts);
                else if (ts.seconds) d = new Date(ts.seconds * 1000 + ((ts.nanos||0)/1e6));
                else if (ts > 0) d = new Date(ts);
                if (d && !isNaN(d)) dateStr = ` (${d.toLocaleString()})`;
            }
            if (dateStr) output += `> **對話時間**：${dateStr.slice(2, -1)}\n\n`;
            output += `--- [${heading}] ---\n${message.text}\n\n`;
        }

        const warning = warnings.length
            ? `⚠️ ${warnings.join('\n')}`
            : '';
        const content = output.trimEnd() + (warning ? `\n\n> **匯出不完整**\n${warnings.map(text => '> ' + text).join('\n')}` : '') + '\n';
        return { content, warning, messageCount: exportTimeline.length };
    }

    function openTimelineSaveModal(timeline, scanWarnings = [], method = 'DOM') {
        const { content: finalOutput, warning, messageCount } = buildTimelineMarkdown(timeline, scanWarnings, method);
        let title = determineTitle();
        if (warning) title += '_INCOMPLETE';
        showSaveModal(title, finalOutput, {
            messageCount,
            warning
        }, finalTitle => {
            const blob = new Blob(['\uFEFF' + finalOutput], {
                type: 'text/markdown;charset=utf-8'
            });
            const url = URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            anchor.href = url;
            anchor.download =
                `Grok_${method}_${sanitizeFileName(finalTitle)}_${getTimestamp()}.md`;
            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        });

        return {
            candidateCount: timeline.length,
            messageCount,
            filteredCount: timeline.length - messageCount,
            warning
        };
    }

    function sameTurn(a, b, allowGrow) {
        if (a.type !== b.type) return false;
        if (a.text === b.text) return true;
        // ponytail: contains only on the touching last turn; whole-book includes() ate short "好"
        return allowGrow && (a.text.includes(b.text) || b.text.includes(a.text));
    }

    function mergeTimelines(master, fragment) {
        if (master.length === 0) return { merged: fragment, hasGap: false };
        if (fragment.length === 0) return { merged: master, hasGap: false };

        for (let overlapLength = Math.min(master.length, fragment.length); overlapLength > 0; overlapLength--) {
            let isMatch = true;
            for (let i = 0; i < overlapLength; i++) {
                const mItem = master[master.length - overlapLength + i];
                const fItem = fragment[i];
                if (!sameTurn(mItem, fItem, i === overlapLength - 1)) {
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

    // --- 主流程 ---
    async function moveToTop(btn) {
        if (!btn || btn.disabled) return;
        const originalText = btn.innerText;
        btn.disabled = true;

        try {
            const scroller = findScrollContainer();
            const isWindow = (scroller === document.documentElement || scroller === document.body);
            let lastHeight = -1;
            let stable = 0;

            for (let i = 0; i < CONFIG.MAX_UPWARD_LOOPS && stable < 2; i++) {
                if (isWindow) window.scrollTo({ top: 0, behavior: 'auto' });
                else scroller.scrollTo({ top: 0, behavior: 'auto' });

                await new Promise(r => setTimeout(r, CONFIG.FAST_UPWARD_WAIT));
                const currentScroll = isWindow ? window.scrollY : scroller.scrollTop;
                const currentHeight = isWindow
                    ? document.documentElement.scrollHeight
                    : scroller.scrollHeight;
                stable = currentScroll <= 1 && currentHeight === lastHeight
                    ? stable + 1
                    : 0;
                lastHeight = currentHeight;
                btn.innerText = `定位頂端 ${i + 1}/${CONFIG.MAX_UPWARD_LOOPS}`;
            }
            if (stable < 2) {
                throw new Error('頂端內容仍在載入，請稍後再試');
            }
            showNotification('✅ 已到頂端', false, 3500);
        } catch (error) {
            console.error('[Grok Exporter] 到頂端失敗', error);
            showNotification(`❌ 到頂端失敗：${error.message}`, true, 6000);
        } finally {
            btn.disabled = false;
            btn.innerText = originalText;
        }
    }

    async function processApiExport(btn) {
        if (!btn || btn.disabled) return;
        const originalText = btn.innerText;
        btn.disabled = true;
        try {
            const convId = conversationIdFromPath(location.pathname);
            if (location.hostname !== 'grok.com' || !convId) {
                throw new Error('API匯出僅支援 grok.com 已保存的對話；請用正常匯出');
            }
            btn.innerText = 'API 讀取中…';
            const data = await fetchConversationViaApi(convId);
            const branch = buildActiveBranchTimeline(data.responses, convId);
            if (!branch.timeline.length) throw new Error('API 沒有可匯出的訊息；請用正常匯出');
            openTimelineSaveModal(branch.timeline, [data.warning, branch.warning].filter(Boolean), 'API');
        } catch (error) {
            showNotification(`❌ API匯出失敗：${error.message}`, true, 6000);
        } finally {
            btn.disabled = false;
            btn.innerText = originalText;
        }
    }

    // ChatGPT 匯出流程的 Grok adapter：僅保留 Grok 容器、節點與角色辨識。
    async function processAndExport(btn, captureOnly = false, checkScope = () => {}) {
        if (!btn || (btn.disabled && !captureOnly)) return;
        const scan = NORMAL_SCAN;
        const originalText = btn.innerText;
        btn.disabled = true;
        try {
            const scroller = findScrollContainer();
            if (!scroller.querySelector(CONFIG.CONTENT_NODES)) {
                throw new Error('目前滾動容器內找不到 Grok 訊息節點');
            }

            const isWindow =
                scroller === document.documentElement ||
                scroller === document.body;
            const getScrollTop = () => isWindow ? window.scrollY : scroller.scrollTop;
            const getScrollHeight = () => isWindow
                ? document.documentElement.scrollHeight
                : scroller.scrollHeight;
            const getClientHeight = () => isWindow
                ? window.innerHeight
                : scroller.clientHeight;
            const setScrollTop = value => {
                if (isWindow) window.scrollTo(0, value);
                else {
                    scroller.scrollTop = value;
                    scroller.dispatchEvent(new Event('scroll', { bubbles: true }));
                }
            };

            let globalTimeline = [];
            const scanWarnings = [];

            async function waitIfHidden() {
                checkScope();
                while (document.hidden) {
                    checkScope();
                    btn.innerText = `⏸️ 暫停｜已存 ${globalTimeline.length} 則`;
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }

            {
                let lastHeight = -1;
                let stable = 0;
                for (
                    let index = 0;
                    index < CONFIG.MAX_UPWARD_LOOPS && stable < 2;
                    index++
                ) {
                    await waitIfHidden();
                    setScrollTop(0);
                    await new Promise(resolve =>
                        setTimeout(resolve, scan.upwardWait)
                    );

                    const currentHeight = getScrollHeight();
                    stable = getScrollTop() <= 1 && currentHeight === lastHeight
                        ? stable + 1
                        : 0;
                    lastHeight = currentHeight;
                    btn.innerText =
                        `定位起點 ${index + 1}/${CONFIG.MAX_UPWARD_LOOPS}`;
                }
                if (getScrollTop() > 1 || stable < 2) {
                    throw new Error('無法穩定回到對話最頂端');
                }
                setScrollTop(0);
                await new Promise(resolve =>
                    setTimeout(resolve, Math.max(scan.upwardWait, 1000))
                );
            }

            globalTimeline = getVisibleTimeline(scroller);
            const viewport = Math.max(getClientHeight(), 400);
            const effectiveStep = Math.max(
                200,
                Math.min(scan.scrollStep, Math.floor(viewport * 0.6))
            );
            const estimatedPasses = Math.ceil(getScrollHeight() / effectiveStep);
            const maxPasses = Math.min(
                5000,
                Math.max(100, estimatedPasses * 4 + 50)
            );
            let bottomStable = 0;
            let retryCount = 0;

            for (let pass = 0; pass < maxPasses; pass++) {
                await waitIfHidden();

                const beforeTop = getScrollTop();
                const beforeHeight = getScrollHeight();
                const clientHeight = getClientHeight();
                const maxTop = Math.max(0, beforeHeight - clientHeight);
                const progress = maxTop > 0
                    ? Math.min(100, Math.round(beforeTop / maxTop * 100))
                    : 100;
                btn.innerText =
                    `掃描 ${progress}%｜已存 ${globalTimeline.length} 則`;

                let contentWaitTimer = 0;
                while (
                    !isLastMessageLoaded(scroller) &&
                    contentWaitTimer < CONFIG.MAX_CONTENT_WAIT
                ) {
                    await waitIfHidden();
                    contentWaitTimer++;
                    btn.innerText =
                        `等待內容 ${contentWaitTimer}s` +
                        `｜已存 ${globalTimeline.length} 則`;
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
                if (!isLastMessageLoaded(scroller)) {
                    const warning = '部分訊息節點持續為空，可能有內容未載入';
                    if (!scanWarnings.includes(warning)) scanWarnings.push(warning);
                }
                const beforeFragment = getVisibleTimeline(scroller);
                if (!globalTimeline.length) globalTimeline = beforeFragment;

                setScrollTop(Math.min(maxTop, beforeTop + effectiveStep));
                await new Promise(resolve =>
                    setTimeout(resolve, scan.baseWait)
                );
                await waitIfHidden();

                const fragment = getVisibleTimeline(scroller);
                const mergeResult = mergeTimelines(globalTimeline, fragment);
                if (
                    mergeResult.hasGap &&
                    fragment.length > 0 &&
                    globalTimeline.length > 0
                ) {
                    retryCount++;
                    if (retryCount <= CONFIG.MAX_RETRIES) {
                        btn.innerText =
                            `回訪缺口 ${retryCount}/${CONFIG.MAX_RETRIES}` +
                            `｜已存 ${globalTimeline.length} 則`;
                        setScrollTop(Math.max(
                            0,
                            getScrollTop() - effectiveStep * 0.5
                        ));
                        await new Promise(resolve => setTimeout(
                            resolve,
                            Math.max(1000, scan.baseWait * 2)
                        ));
                        continue;
                    }

                    scanWarnings.push(
                        `掃描位置 ${Math.round(getScrollTop())} 的內容斷層` +
                        '經回訪後仍無法安全銜接'
                    );
                    globalTimeline = globalTimeline.concat(
                        [{ type: 'gap', text: '⚠️ 此處掃描斷層，前後訊息可能不連續' }],
                        fragment
                    );
                    retryCount = 0;
                } else {
                    globalTimeline = mergeResult.merged;
                    retryCount = 0;
                }

                const afterTop = getScrollTop();
                const afterHeight = getScrollHeight();
                const atBottom =
                    afterHeight - getClientHeight() - afterTop <= 5;
                const didNotMove = Math.abs(afterTop - beforeTop) < 5;
                if (atBottom && didNotMove) bottomStable++;
                else bottomStable = 0;

                const afterMaxTop = Math.max(
                    0,
                    afterHeight - getClientHeight()
                );
                const afterProgress = afterMaxTop > 0
                    ? Math.min(100, Math.round(afterTop / afterMaxTop * 100))
                    : 100;
                btn.innerText =
                    `掃描 ${afterProgress}%｜已存 ${globalTimeline.length} 則`;

                if (bottomStable >= scan.maxEndCheck) break;
                if (pass === maxPasses - 1) {
                    scanWarnings.push(`掃描達到安全上限 ${maxPasses} 步`);
                }
            }

            checkScope();
            if (!globalTimeline.length) throw new Error('DOM 沒有取得任何有效對話');
            if (captureOnly) return { messages: globalTimeline.map(toComparisonTurn), warning: scanWarnings.join('；') };
            const report = openTimelineSaveModal(globalTimeline, scanWarnings);
            btn.innerText = `整理內容｜有效 ${report.messageCount} 則`;

            console.info('[Grok Exporter] 掃描報告', {
                mode: scan.label,
                candidates: report.candidateCount,
                messages: report.messageCount,
                filtered: report.filteredCount,
                effectiveStep,
                scanWarnings
            });
        } catch (error) {
            if (captureOnly) throw error;
            console.error('[Grok Exporter] 匯出失敗', error);
            showNotification(`❌ 匯出失敗：${error.message}`, true, 6000);
        } finally {
            if (!captureOnly) {
                btn.disabled = false;
                btn.innerText = originalText;
            }
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
        const apiMessages = api?.messages || [], domMessages = dom?.messages || [];
        const warnings = [api?.warning && `API：${api.warning}`, api?.notice && `API：${api.notice}`, dom?.warning && `DOM：${dom.warning}`].filter(Boolean);
        const integration = buildIntegratedMarkdown(apiMessages, domMessages, { apiAvailable: Boolean(api), domAvailable: Boolean(dom), notes: warnings });
        const comparison = integration.comparison;
        const formatDifference = difference => {
            const labels = { text: '文字不同', role: '角色不同', 'api-only': '僅 API 有此訊息', 'dom-only': '僅 DOM 有此訊息' };
            const source = (label, index, message) => message ? `${label} #${index} (${message.role})：\n${prepareComparisonMessage(message, label === 'API' ? 'api' : 'dom').body}` : `${label}：無`;
            return `${labels[difference.kind]}\n${source('API', difference.apiIndex, difference.api)}\n\n${source('DOM', difference.domIndex, difference.dom)}`;
        };
        const metadata = api && dom ? [
            ...apiMessages.map((message, index) => ({ source: 'API', index: index + 1, ...prepareComparisonMessage(message, 'api') })),
            ...domMessages.map((message, index) => ({ source: 'DOM', index: index + 1, ...prepareComparisonMessage(message, 'dom') }))
        ].filter(item => item.citations === null || item.attachments === null || item.citations.length || item.attachments.length) : [];
        const metadataNotice = '引用與附件為獨立診斷，未驗證兩來源是否相同；API 引用 ID 不可直接推定 DOM 標籤或網域。';
        const metadataCount = (source, field) => {
            const items = metadata.filter(item => item.source === source);
            return items.some(item => item[field] === null) ? '未知' : items.reduce((sum, item) => sum + item[field].length, 0);
        };
        const summary = [
            `API：${api ? `${apiMessages.length} 則` : `失敗：${errors.api}`}`,
            `DOM：${dom ? `${domMessages.length} 則` : `失敗：${errors.dom}`}`,
            api && dom ? (comparison.match ? '角色、順序與呈現正文相符' : `正文差異：${comparison.differences.length} 筆\n\n第一筆差異：\n${formatDifference(comparison.differences[0])}`) : '未進行比對',
            ...(api && dom && comparison.progress?.length ? [`API 額外前進度：${comparison.progress.length} 則（另列報告，原始匯出保留）`] : []),
            ...(api && dom ? [`引用：API ${metadataCount('API', 'citations')} 項／DOM ${metadataCount('DOM', 'citations')} 項；附件：API ${metadataCount('API', 'attachments')} 項／DOM ${metadataCount('DOM', 'attachments')} 項（另列報告）`] : []),
            ...warnings
        ].join('\n');
        const report = api && dom
            ? `API ${apiMessages.length} 則，DOM ${domMessages.length} 則，正文差異 ${comparison.differences.length} 筆\n\n` +
                comparison.differences.map((difference, index) => `正文差異 ${index + 1}\n${formatDifference(difference)}`).join('\n\n--------------------\n\n') +
                (comparison.progress?.length ? '\n\nAPI 額外前進度\n' + comparison.progress.map(item => `API #${item.apiIndex}：\n${item.api.text}`).join('\n\n') : '') +
                `\n\n${metadataNotice}\n` + metadata.map(item => `${item.source} #${item.index}：引用 ${JSON.stringify(item.citations)}；附件 ${JSON.stringify(item.attachments)}`).join('\n') + '\n'
            : `${summary}\n\n${metadataNotice}\n`;
        const base = `Grok_${sanitizeFileName(title) || 'Grok-Chat'}_${getTimestamp()}`;
        showIntegratedDialog({
            id: 'grok-export-save-overlay', site: 'Grok', title, apiCount: api ? apiMessages.length : null, domCount: dom ? domMessages.length : null,
            integration, errors, report,
            onDownload: () => downloadCombinedFile(`${base}_COMBINED`, integration.content),
            onApi: api && (() => downloadCombinedFile(`${base}_API`, buildTimelineMarkdown(apiMessages, api.warning ? [api.warning] : [], 'API').content)),
            onDom: dom && (() => downloadCombinedFile(`${base}_DOM`, buildTimelineMarkdown(domMessages, dom.warning ? [dom.warning] : [], 'DOM').content)),
            onReport: () => downloadCombinedFile(`${base}_DIFFERENCES`, report)
        });
    }

    async function processCombinedExport(button) {
        if (!button || button.disabled) return;
        const originalText = button.innerText;
        const scope = location.href;
        const title = determineTitle();
        let changed = false;
        const monitor = setInterval(() => { if (location.href !== scope) changed = true; }, 100);
        const checkScope = () => {
            if (changed || location.href !== scope) throw new Error('收集期間對話網址已變更，無法比對不同對話');
        };
        let api = null, dom = null;
        const errors = {};
        button.disabled = true;
        try {
            try {
                const id = conversationIdFromPath(location.pathname);
                if (location.hostname !== 'grok.com' || !id) throw new Error('API 僅支援 grok.com 已保存的對話');
                button.innerText = '取得 API 對話…';
                const data = await fetchConversationViaApi(id);
                checkScope();
                const branch = buildActiveBranchTimeline(data.responses, id);
                if (!branch.timeline.length) throw new Error('API 沒有可匯出的訊息');
                api = { messages: branch.timeline.map(toComparisonTurn), warning: [data.warning, branch.warning].filter(Boolean).join('；') };
            } catch (error) { errors.api = error.message || String(error); }
            checkScope();
            try {
                dom = await processAndExport(button, true, checkScope);
                checkScope();
            } catch (error) { dom = null; errors.dom = error.message || String(error); }
            checkScope();
            showCombinedResults(title, api, dom, errors);
        } catch (error) {
            showNotification(`綜合匯出失敗：${error.message || String(error)}`, true, 6000);
        } finally {
            clearInterval(monitor);
            button.disabled = false;
            button.innerText = originalText;
        }
    }

    function createButton() {
        if (document.getElementById('grok-export-container')) return;
        const container = document.createElement('div');
        container.id = 'grok-export-container';
        Object.assign(container.style, {
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            zIndex: 2147483645,
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
        const makeButton = (text, action) => {
            const button = document.createElement('button');
            button.innerText = text;
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
            button.addEventListener('click', () => action(button));
            return button;
        };

        const btnTop = makeButton(
            '↑  到頂端',
            button => moveToTop(button)
        );
        const combinedButton = makeButton('綜合匯出', button => processCombinedExport(button));
        combinedButton.style.background = '#087d62';
        combinedButton.style.borderColor = '#10a37f';
        const apiButton = makeButton('API匯出', button => processApiExport(button));
        const normalButton = makeButton('正常匯出', button => processAndExport(button));
        btnTop.title = '載入並回到對話最頂端';
        combinedButton.title = '分別取得 API 與正常掃描結果並比較';
        apiButton.title = '讀取 grok.com API；X 版請用正常匯出';
        normalButton.title = '從頂端捲動掃描畫面，不使用 API';
        menu.append(btnTop, combinedButton, apiButton, normalButton);

        const fab = document.createElement('button');
        fab.innerText = '𝕏';
        fab.title = "GYC - Grok - v1.4.2";
        fab.setAttribute('aria-label', '開啟 Grab Your Chat - Grok 工具');
        Object.assign(fab.style, {
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,.18)',
            background: 'linear-gradient(180deg, #111 0%, #030303 100%)',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '24px',
            fontWeight: 'bold',
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
            menu.style.transform = open
                ? 'translateY(0) scale(1)'
                : 'translateY(20px) scale(.9)';
            menu.style.pointerEvents = open ? 'auto' : 'none';
        });

        container.append(menu, fab);
        document.body.appendChild(container);
        styleExportTools(container);
    }
    // Grok fields: responseId, parentResponseId, sender ('human'|'assistant'), message (string body), createTime (ISO or {seconds,nanos})
    function conversationIdFromPath(pathname) {
        const parts = String(pathname || '').split('/').filter(Boolean);
        for (let i = parts.length - 1; i >= 0; i--) {
            const p = parts[i];
            if (/^[0-9a-f-]{10,}$/i.test(p) && (parts[i-1] === 'c' || parts[i-1] === 'chat')) {
                return p;
            }
        }
        return null;
    }

    function chunkIds(ids, size = 50) {
        const chunks = [];
        for (let i = 0; i < ids.length; i += size) chunks.push(ids.slice(i, i + size));
        return chunks;
    }

    function parseLoadResponses(rawResponses, requestedIds) {
        if (!Array.isArray(rawResponses)) return {items: [], missing: requestedIds.slice()};
        const byId = new Map();
        for (const r of rawResponses) {
            const id = r.responseId || r.id;
            if (id && !byId.has(id)) byId.set(id, r);
        }
        const items = [];
        const missing = [];
        for (const id of requestedIds) {
            if (byId.has(id)) items.push(byId.get(id));
            else missing.push(id);
        }
        return {items, missing};
    }

    async function fetchConversationViaApi(conversationId) {
        const base = '/rest/app-chat/conversations/' + encodeURIComponent(conversationId);
        const request = async (url, options = {}) => {
            const response = await fetch(url, { ...options, credentials: 'include', signal: AbortSignal.timeout(30000) });
            if (!response.ok) throw new Error(`Grok API HTTP ${response.status}；可改用正常匯出`);
            return response.json();
        };
        const tree = await request(base + '/response-node?includeThreads=true');
        if (!Array.isArray(tree?.responseNodes)) throw new Error('Grok 訊息樹格式已改變；可改用正常匯出');
        const allIds = [...new Set(tree.responseNodes.map(node => node?.responseId).filter(id => typeof id === 'string' && id))];
        const ids = allIds.slice(0, 10000);
        const warnings = [];
        if (allIds.length > ids.length) warnings.push('訊息超過 10000 則安全上限，未取得全部內容');
        if (tree.inflightResponses?.length) warnings.push('對話仍有生成中的訊息');
        const responses = [];
        let missingCount = 0;
        for (const chunk of chunkIds(ids, 50)) {
            const data = await request(base + '/load-responses', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ responseIds: chunk })
            });
            if (!Array.isArray(data?.responses)) throw new Error('Grok 訊息正文格式已改變；可改用正常匯出');
            const parsed = parseLoadResponses(data.responses, chunk);
            responses.push(...parsed.items);
            missingCount += parsed.missing.length;
        }
        if (missingCount) warnings.push(`${missingCount} 則訊息正文未回傳`);
        return { ids, responses, warning: warnings.join('；') || null };
    }

    function buildActiveBranchTimeline(responses, rootId) {
        const byId = new Map();
        for (const response of responses) {
            if (response && (response.responseId || response.id)) byId.set(response.responseId || response.id, response);
        }
        const children = new Map();
        const roots = [];
        const warnings = new Set();
        for (const [id, response] of byId) {
            const parent = response.parentResponseId;
            if (parent && byId.has(parent)) {
                if (!children.has(parent)) children.set(parent, []);
                children.get(parent).push(id);
            } else {
                roots.push(id);
                if (parent && parent !== rootId) warnings.add('部分父訊息不在回應中，無法確認上游完整性');
            }
        }
        const branched = [...children.values()].some(ids => ids.length > 1) || roots.length > 1;
        if (branched) warnings.add('API 含多條分支，無法確認目前分支；以下逐則保留並標記，並非單一連續對話');
        const timeline = [];
        const seen = new Set();
        const pending = roots.slice().reverse();
        while (seen.size < byId.size) {
            if (!pending.length) {
                warnings.add('訊息鏈含循環或無法連回根節點');
                pending.push([...byId.keys()].find(id => !seen.has(id)));
            }
            const id = pending.pop();
            if (seen.has(id)) continue;
            seen.add(id);
            const response = byId.get(id);
            const role = response.sender || response.role;
            if (role === 'human' || role === 'user' || role === 'assistant') {
                let body = typeof response.message === 'string' ? response.message.trim() : '';
                if (!body) {
                    body = '> [空白或無法解析的訊息正文]';
                    warnings.add('部分訊息正文為空或格式無法解析');
                }
                if (branched) body = '> [分支未確認的訊息，勿視為單一連續對話]\n\n' + body;
                timeline.push({ type: role === 'assistant' ? 'ai' : 'user', text: body, timestamp: response.createTime });
            } else if (!['tool', 'system', 'reasoning'].includes(role)) {
                warnings.add('已略過角色無法識別的訊息');
            }
            const next = children.get(id) || [];
            if (next.some(child => seen.has(child))) warnings.add('訊息鏈含循環');
            pending.push(...next.slice().reverse());
        }
        return { timeline, warning: [...warnings].join('；') || null };
    }

    if (typeof module !== 'undefined' && module.exports && typeof document === 'undefined') {
        module.exports = { mergeTimelines, conversationIdFromPath, chunkIds, parseLoadResponses, fetchConversationViaApi, buildActiveBranchTimeline, compareTranscripts, prepareComparisonMessage, integrateTranscripts, buildIntegratedMarkdown };
        return;
    }

    const observer = new MutationObserver(() => createButton());
    observer.observe(document.body, { childList: true, subtree: true });
    createButton();
})();
