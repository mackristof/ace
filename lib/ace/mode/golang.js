define(function(require, exports, module) {

var oop = require("../lib/oop");
var net = require("../lib/net");
var TextMode = require("./text").Mode;
var GolangHighlightRules = require("./golang_highlight_rules").GolangHighlightRules;
var MatchingBraceOutdent = require("./matching_brace_outdent").MatchingBraceOutdent;
var CstyleBehaviour = require("./behaviour/cstyle").CstyleBehaviour;
var CStyleFoldMode = require("./folding/cstyle").FoldMode;

var Mode = function() {
    this.HighlightRules = GolangHighlightRules;
    this.$outdent = new MatchingBraceOutdent();
    this.foldingRules = new CStyleFoldMode();
};
oop.inherits(Mode, TextMode);

(function() {

    this.lineCommentStart = "//";
    this.blockComment = {start: "/*", end: "*/"};

    this.getNextLineIndent = function(state, line, tab) {
        var indent = this.$getIndent(line);

        var tokenizedLine = this.getTokenizer().getLineTokens(line, state);
        var tokens = tokenizedLine.tokens;
        var endState = tokenizedLine.state;

        if (tokens.length && tokens[tokens.length-1].type == "comment") {
            return indent;
        }

        if (state == "start") {
            var match = line.match(/^.*[\{\(\[]\s*$/);
            if (match) {
                indent += tab;
            }
        }

        return indent;
    };//end getNextLineIndent

    this.checkOutdent = function(state, line, input) {
        return this.$outdent.checkOutdent(line, input);
    };

    this.autoOutdent = function(state, doc, row) {
        this.$outdent.autoOutdent(doc, row);
    };

    /**
     * Override completions
     */
    this.getCompletions = function(state, session, pos, prefix) {
        var countLine = function(line){
          return line.length + 1;
        }
        var lines = session.getValue().split(/\n/);
        var count = 0;
        for (i = 0; i < pos.row; i++) {
            count += countLine(lines[i]);
        }
        count += pos.column;
        request = net.post('http://localhost:7524/', 'cursor='+count ,session.getValue());
        if (request.status === 200) {
          console.log(request.responseText);
          return JSON.parse(request.responseText)
        }

    };

    this.$id = "ace/mode/golang";
}).call(Mode.prototype);

exports.Mode = Mode;
});
