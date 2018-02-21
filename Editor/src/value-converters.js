import {escapeHtml} from "./utility";
//import * as SimpleMarkdown from 'simple-markdown';

/**
 * An Aurelia converter, taking a string and converting all newlines to <br/>
 */
export class NewlinesToBrValueConverter {
    toView(value) {
        return value && value.split('\n').join('<br/>');
    }
}

/**
 * An Aurelia converted, taking a string and escaping the usual HTML symbols.
 */
export class EscapeHtmlValueConverter {
    toView(value) {
        return value && escapeHtml(value);
    }
}

// export class MarkdownValueConverter {
//     toView(value) {
//         if (!value) {
//             return value;
//         }
//
//         value = this.replaceWith(value, "**", "strong");
//         value = this.replaceWith(value, "*", "em");
//         value = replaceAll(value, "\n", "<br/>");
//
//         return value;
//     }
//
//     replaceWith(str, search, replacement) {
//         let replacementOpen = `<${replacement}>`;
//         let replacementClose = `</${replacement}>`;
//         let closed = true;
//
//         while (str.indexOf(search) !== -1) {
//             str = str.replace(search, closed ? replacementOpen : replacementClose);
//             closed = !closed;
//         }
//
//         if (!closed) {
//             str += replacementClose;
//         }
//
//         return str;
//     }
// }

// export class MarkdownValueConverter {
//     constructor() {
//         //var rules = SimpleMarkdown.defaultRules; // for example
//         //console.log(SimpleMarkdown.defaultRules.br);
//
//         /*
//         var parseInline = function(parse, content, state) {
//             var isCurrentlyInline = state.inline || false;
//             state.inline = true;
//             var result = parse(content, state);
//             state.inline = isCurrentlyInline;
//             return result;
//         };
//         var parseBlock = function(parse, content, state) {
//             var isCurrentlyInline = state.inline || false;
//             state.inline = false;
//             var result = parse(content + "\n\n", state);
//             state.inline = isCurrentlyInline;
//             return result;
//         };
//         var parseCaptureInline = function(capture, parse, state) {
//             return {content: parseInline(parse, capture[1], state)};
//         };
//         */
//
//         let rules = {};
//         //rules.paragraph = SimpleMarkdown.defaultRules.paragraph;
//         rules.em = SimpleMarkdown.defaultRules.em;
//         rules.strong = SimpleMarkdown.defaultRules.strong;
//         rules.text = SimpleMarkdown.defaultRules.text;
//         rules.paragraph2 = {
//             match: SimpleMarkdown.blockRegex(/^((?:[^\n]|\n(?! *\n))+)(?:\n *)+\n/),
//             parse: SimpleMarkdown.defaultRules.paragraph.parse,
//             html: function(node, output, state) {
//                 return output(node.content, state) + "<br/><br/>";
//             },
//             order: SimpleMarkdown.defaultRules.paragraph.order + 1
//         };
//         /*
//         rules.easyBr = {
//             match: SimpleMarkdown.anyScopeRegex(/^\n/),
//             parse: SimpleMarkdown.parseBlock,
//             html: function(node, output, state) {
//                 return "<br>";
//             },
//             order: SimpleMarkdown.defaultRules.br.order
//         };
//         */
//         //rules.br = SimpleMarkdown.defaultRules.br;
//
//         let parser = SimpleMarkdown.parserFor(rules);
//         let htmlOutput = SimpleMarkdown.htmlFor(SimpleMarkdown.ruleOutput(rules, 'html'));
//
//         this.blockParseAndOutput = function(source) {
//             // Many rules require content to end in \n\n to be interpreted
//             // as a block.
//             var blockSource = source + "\n\n";
//             var parseTree = parser(blockSource, {inline: false});
//             var outputResult = htmlOutput(parseTree);
//             // Or for react output, use:
//             // var outputResult = reactOutput(parseTree);
//             return outputResult;
//         };
//     }
//
//     toView(value) {
//         return value && replaceAll(this.blockParseAndOutput(value), "\n", "<br/>");
//     }
// }

/**
 * An Aurelia converter, taking an array of elements and sorting them by a property ascending or descending.
 */
export class SortValueConverter {
    toView(array, property, direction) {
        if (!array)
            return array;

        let pname = property;
        let factor = direction.match(/^desc*/i) ? 1 : -1;
        var retvalue = array.slice().sort((a, b) => {
            var textA = a.toUpperCase ? a[property].toUpperCase() : a[property];
            var textB = b.toUpperCase ? b[property].toUpperCase() : b[property];
            return (textA < textB) ? factor : (textA > textB) ? -factor : 0;
        });
        return retvalue;
    }
}